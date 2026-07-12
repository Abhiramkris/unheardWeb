/**
 * app/onboarding/layout.tsx
 * Marks /onboarding as noindex, nofollow.
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title:  'Onboarding | unHeard',
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
