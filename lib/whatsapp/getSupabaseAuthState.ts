import { proto, initAuthCreds, BufferJSON, AuthenticationState } from '@whiskeysockets/baileys';
import { createAdminClient } from '../supabase/admin';

// In-memory cache to reduce repeated disk reads
const memoryCache = new Map<string, any>();

export const getSupabaseAuthState = async (): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void> }> => {
  const supabase = await createAdminClient();

  // Helper to read data from memory cache or DB
  const readData = async (id: string) => {
    if (memoryCache.has(id)) {
      return memoryCache.get(id);
    }
    try {
      const { data, error } = await supabase
        .from('whatsapp_auth')
        .select('data')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) return null;
      const parsed = JSON.parse(JSON.stringify(data.data), BufferJSON.reviver);
      memoryCache.set(id, parsed);
      return parsed;
    } catch {
      return null;
    }
  };

  // Helper to write data
  const writeData = async (data: any, id: string) => {
    try {
      memoryCache.set(id, data);
      await supabase.from('whatsapp_auth').upsert({
        id,
        data: JSON.parse(JSON.stringify(data, BufferJSON.replacer)),
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Baileys Supabase Write Error:', err);
    }
  };

  // Initialize standard creds or grab from DB
  const credsData = await readData('creds');
  const creds = credsData || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data: { [_: string]: any } = {};
          const missingIds: string[] = [];

          // 1. Check in-memory cache first
          for (const id of ids) {
            const key = `${type}-${id}`;
            if (memoryCache.has(key)) {
              let val = memoryCache.get(key);
              if (type === 'app-state-sync-key' && val) {
                val = proto.Message.AppStateSyncKeyData.fromObject(val);
              }
              data[id] = val;
            } else {
              missingIds.push(id);
            }
          }

          // 2. Fetch all missing keys in a SINGLE batch query
          if (missingIds.length > 0) {
            const fullKeys = missingIds.map(id => `${type}-${id}`);
            try {
              const { data: rows, error } = await supabase
                .from('whatsapp_auth')
                .select('id, data')
                .in('id', fullKeys);

              if (!error && rows) {
                const foundMap = new Map(rows.map(r => [r.id, r.data]));
                for (const id of missingIds) {
                  const key = `${type}-${id}`;
                  let val = foundMap.get(key) || null;
                  if (val) {
                    val = JSON.parse(JSON.stringify(val), BufferJSON.reviver);
                    memoryCache.set(key, val);
                    if (type === 'app-state-sync-key') {
                      val = proto.Message.AppStateSyncKeyData.fromObject(val);
                    }
                  }
                  data[id] = val;
                }
              }
            } catch (err) {
              console.warn('Batch key fetch error:', err);
            }
          }

          return data;
        },
        set: async (dataset) => {
          const toUpsert: { id: string; data: any; updated_at: string }[] = [];
          const toDelete: string[] = [];

          for (const category in dataset) {
            for (const id in dataset[category as keyof typeof dataset]) {
              const value = dataset[category as keyof typeof dataset]![id];
              const key = `${category}-${id}`;
              if (value) {
                memoryCache.set(key, value);
                toUpsert.push({
                  id: key,
                  data: JSON.parse(JSON.stringify(value, BufferJSON.replacer)),
                  updated_at: new Date().toISOString()
                });
              } else {
                memoryCache.delete(key);
                toDelete.push(key);
              }
            }
          }

          // Execute single batch upsert and single batch delete
          try {
            if (toUpsert.length > 0) {
              await supabase.from('whatsapp_auth').upsert(toUpsert);
            }
            if (toDelete.length > 0) {
              await supabase.from('whatsapp_auth').delete().in('id', toDelete);
            }
          } catch (err) {
            console.error('Baileys batch write error:', err);
          }
        }
      }
    },
    saveCreds: () => {
      return writeData(creds, 'creds');
    }
  };
};
