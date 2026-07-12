/**
 * app/admin/layout.tsx
 * Marks all /admin routes as noindex, nofollow.
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
