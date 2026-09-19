import type { Metadata } from 'next';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { LegalPage, type LegalSection } from '@/features/legal/components/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of service - FoodCal',
};

const SECTIONS: LegalSection[] = [
  {
    id: 'acceptance',
    title: 'Acceptance of terms',
    body: (
      <p>
        By accessing and using FoodCal, you agree to be bound by these Terms of Service. If you do
        not agree to these terms, please do not use our services.
      </p>
    ),
  },
  {
    id: 'service',
    title: 'Description of service',
    body: (
      <p>
        FoodCal provides an AI-powered platform for nutritional analysis and health coaching. Our
        services include meal scanning, nutritional logging, progress tracking, and AI-generated
        coaching advice.
      </p>
    ),
  },
  {
    id: 'responsibilities',
    title: 'User responsibilities',
    body: (
      <>
        <p>As a user of FoodCal, you are responsible for:</p>
        <ul>
          <li>Providing accurate information</li>
          <li>Maintaining the security of your account</li>
          <li>
            Ensuring that the content you upload does not violate any laws or third-party rights
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'health-disclaimer',
    title: 'Health disclaimer',
    body: (
      <div role="note" className="flex gap-3 rounded-2xl border border-warn/35 bg-warn/10 p-4">
        <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-warn" />
        <p>
          <strong className="font-bold text-fg">Important: </strong>
          FoodCal and its AI Coach provide information for educational purposes only. We are not
          medical professionals. The AI-generated advice should not be taken as medical prescription
          or professional health advice. Always consult with a qualified physician before making
          significant changes to your diet or exercise routine.
        </p>
      </div>
    ),
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual property',
    body: (
      <p>
        The content, features, and functionality of FoodCal, including the AI models and coaching
        algorithms, are the exclusive property of KRIXEN-ORG and its licensors.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    body: (
      <p>
        KRIXEN-ORG shall not be liable for any indirect, incidental, special, or consequential
        damages resulting from the use or inability to use our services or for any nutritional data
        inaccuracies.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to terms',
    body: (
      <p>
        We reserve the right to modify these terms at any time. We will provide notice of any
        significant changes. Your continued use of the platform after such changes constitutes
        acceptance of the new terms.
      </p>
    ),
  },
];

export default function TermsOfServicePage() {
  return (
    <LegalPage
      kind="terms"
      title="Terms of service"
      lastUpdated="January 22, 2026"
      sections={SECTIONS}
    />
  );
}
