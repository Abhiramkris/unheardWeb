/**
 * app/login/layout.tsx
 * Marks /login as noindex, nofollow.
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title:  'Login | unHeard',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
