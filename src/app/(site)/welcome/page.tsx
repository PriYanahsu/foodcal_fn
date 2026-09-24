import { Suspense } from 'react';
import { OnboardingFlow } from '@/features/onboarding';

export default function WelcomePage() {
  // OnboardingFlow reads `?start=`; useSearchParams needs a Suspense boundary.
  return (
    <Suspense>
      <OnboardingFlow />
    </Suspense>
  );
}
