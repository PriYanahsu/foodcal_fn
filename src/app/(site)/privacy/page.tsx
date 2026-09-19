import type { Metadata } from 'next';
import { LegalPage, type LegalSection } from '@/features/legal/components/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy policy - FoodCal',
};

const SECTIONS: LegalSection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    body: (
      <p>
        Welcome to FoodCal. We are committed to protecting your personal information and your right
        to privacy. This Privacy Policy explains how we collect, use, and safeguard your data when
        you use our AI-powered nutrition tracking platform.
      </p>
    ),
  },
  {
    id: 'data-collection',
    title: 'Data collection',
    body: (
      <>
        <p>
          We collect information that you provide directly to us, such as when you create an
          account, log meals, or interact with our AI Coach. This includes:
        </p>
        <ul>
          <li>Account information (name, email)</li>
          <li>Health and fitness data (weight, goals, dietary preferences)</li>
          <li>Meal images and nutritional logs</li>
          <li>Usage data and correspondence with our AI systems</li>
        </ul>
      </>
    ),
  },
  {
    id: 'how-we-use-your-data',
    title: 'How we use your data',
    body: (
      <>
        <p>Your data is primarily used to provide and improve our services, including:</p>
        <ul>
          <li>Analyzing meal images using Gemini AI</li>
          <li>Generating personalized coaching advice</li>
          <li>Tracking your progress towards health goals</li>
          <li>Ensuring the security and integrity of our platform</li>
        </ul>
      </>
    ),
  },
  {
    id: 'ai-analysis',
    title: 'AI analysis & processing',
    body: (
      <p>
        Our platform uses advanced AI models to process meal images. While these images are stored
        securely, anonymous data may be used to improve the accuracy of our nutritional analysis. We
        never sell your personal identification to third parties.
      </p>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    body: (
      <p>
        We implement industry-standard security measures to protect your data. However, no method of
        transmission over the internet is 100% secure. We strive to use commercially acceptable
        means to protect your personal information.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact us',
    body: (
      <p>
        If you have any questions about this Privacy Policy, please contact us at{' '}
        <a
          href="mailto:privacy@krixen-org.com"
          className="font-semibold text-brand-ink underline-offset-2 hover:underline"
        >
          privacy@krixen-org.com
        </a>
        .
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      kind="privacy"
      title="Privacy policy"
      lastUpdated="January 22, 2026"
      sections={SECTIONS}
    />
  );
}
