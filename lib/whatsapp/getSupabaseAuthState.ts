import { proto, initAuthCreds, BufferJSON, AuthenticationState } from '@whiskeysockets/baileys';
import { createAdminClient } from '../supabase/admin';

// In-memory cache for credentials and keys to eliminate redundant DB reads
let memoryCreds: any = null;
const keysCache: Record<string, Record<string, any>> = {};
let saveTimeout: NodeJS.Timeout | null = null;
let isInitialized = false;

/**
 * Flush in-memory keys to the single 'session_keys' row in Supabase.
 */
export const flushKeysToDatabase = async () => {
  try {
    const supabase = await createAdminClient();
    const serialized = JSON.parse(JSON.stringify(keysCache, BufferJSON.replacer));
    await supabase.from('whatsapp_auth').upsert({
      id: 'session_keys',
      data: serialized,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to flush consolidated WhatsApp session keys:', err);
  }
};

/**
 * Clear in-memory cache when session is reset or reconnected.
 */
export const clearAuthStateCache = () => {
  memoryCreds = null;
  for (const key of Object.keys(keysCache)) {
    delete keysCache[key];
  }
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  isInitialized = false;
};

/**
 * Schedule a debounced flush to disk (max once per 2 seconds).
 */
const scheduleKeysFlush = () => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveTimeout = null;
    flushKeysToDatabase();
  }, 2000);
};

export const getSupabaseAuthState = async (): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void> }> => {
  const supabase = await createAdminClient();

  if (!isInitialized) {
    // 1. Fetch credentials
    try {
      const { data: credsRow } = await supabase
        .from('whatsapp_auth')
        .select('data')
        .eq('id', 'creds')
        .maybeSingle();

      if (credsRow?.data) {
        memoryCreds = JSON.parse(JSON.stringify(credsRow.data), BufferJSON.reviver);
      }
    } catch (e) {
      console.warn('Could not read existing creds:', e);
    }

    // 2. Fetch consolidated session keys
    try {
      const { data: keysRow } = await supabase
        .from('whatsapp_auth')
        .select('data')
        .eq('id', 'session_keys')
        .maybeSingle();

      if (keysRow?.data) {
        const parsedKeys = JSON.parse(JSON.stringify(keysRow.data), BufferJSON.reviver);
        Object.assign(keysCache, parsedKeys);
      } else {
        // Migration: check for legacy individual rows and migrate them to single row
        const { data: legacyRows } = await supabase
          .from('whatsapp_auth')
          .select('id, data')
          .neq('id', 'creds')
          .neq('id', 'connection_lock')
          .neq('id', 'qr')
          .limit(500);

        if (legacyRows && legacyRows.length > 0) {
          console.log(`🧹 Migrating ${legacyRows.length} legacy WhatsApp auth rows into a single row...`);
          const legacyIds: string[] = [];
          for (const row of legacyRows) {
            legacyIds.push(row.id);
            const hyphenIdx = row.id.indexOf('-');
            if (hyphenIdx > 0) {
              const category = row.id.substring(0, hyphenIdx);
              const id = row.id.substring(hyphenIdx + 1);
              if (!keysCache[category]) keysCache[category] = {};
              keysCache[category][id] = JSON.parse(JSON.stringify(row.data), BufferJSON.reviver);
            }
          }
          // Save consolidated row and purge all individual legacy rows
          await flushKeysToDatabase();
          await supabase.from('whatsapp_auth').delete().in('id', legacyIds);
          console.log('✅ WhatsApp auth table cleaned. All keys consolidated into 1 row.');
        }
      }
    } catch (e) {
      console.warn('Could not read existing session keys:', e);
    }

    isInitialized = true;
  }

  const creds = memoryCreds || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const result: { [_: string]: any } = {};
          const categoryStore = keysCache[type] || {};

          for (const id of ids) {
            let val = categoryStore[id] || null;
            if (type === 'app-state-sync-key' && val) {
              val = proto.Message.AppStateSyncKeyData.fromObject(val);
            }
            result[id] = val;
          }

          return result;
        },
        set: async (dataset) => {
          for (const category in dataset) {
            if (!keysCache[category]) keysCache[category] = {};
            const items = dataset[category as keyof typeof dataset];
            for (const id in items) {
              const val = items[id];
              if (val) {
                keysCache[category][id] = val;
              } else {
                delete keysCache[category][id];
              }
            }
          }

          // Debounced save to Supabase: saves all keys in ONE single database row
          scheduleKeysFlush();
        }
      }
    },
    saveCreds: async () => {
      memoryCreds = creds;
      try {
        await supabase.from('whatsapp_auth').upsert({
          id: 'creds',
          data: JSON.parse(JSON.stringify(creds, BufferJSON.replacer)),
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.error('Failed to save creds:', err);
      }
    }
  };
};
