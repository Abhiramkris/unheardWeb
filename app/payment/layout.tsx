/**
 * app/payment/layout.tsx
 * Marks /payment as noindex, nofollow.
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title:  'Payment | unHeard',
};

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
