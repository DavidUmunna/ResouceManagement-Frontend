import React from 'react';
import LegalLayout from './LegalLayout';

const SECTIONS = [
  {
    heading: '1. Information We Collect',
    body: [
      'Account information: when you register your organisation or are added as a user, we collect your name, email address, role, and department.',
      'Usage data: we collect information about how you interact with ResourceFlow, including requests you create, approvals you make, and pages you visit.',
      'Technical data: we automatically collect your IP address, browser type, device information, and session identifiers to keep the service secure and reliable.',
    ],
  },
  {
    heading: '2. How We Use Your Information',
    body: [
      'To provide and operate the platform, including authenticating you, routing requests to the right approvers, and displaying your data.',
      'To improve and maintain the service, diagnose issues, and develop new features.',
      'To communicate with you about your account, security notices, and important service updates.',
    ],
  },
  {
    heading: '3. How We Share Information',
    body: [
      'Within your organisation: your requests, approvals, and activity are visible to authorised colleagues based on their role and permissions.',
      'Service providers: we use trusted third parties for hosting, error monitoring, and notifications who process data only on our behalf.',
      'We never sell your personal information.',
    ],
  },
  {
    heading: '4. Data Security',
    body: [
      'We use role-based access control, encrypted sessions, and industry-standard safeguards to protect your data. No method of transmission or storage is completely secure, but we work continuously to protect your information.',
    ],
  },
  {
    heading: '5. Data Retention',
    body: [
      'We retain your information for as long as your account is active or as needed to provide the service, comply with legal obligations, resolve disputes, and enforce our agreements.',
    ],
  },
  {
    heading: '6. Your Rights',
    body: [
      'Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data, or to object to certain processing. To exercise these rights, contact your organisation administrator or reach us through the details below.',
    ],
  },
  {
    heading: '7. Contact Us',
    body: [
      'If you have questions about this Privacy Policy or how your data is handled, please contact us through your organisation administrator.',
    ],
  },
];

const PrivacyPolicy = () => (
  <LegalLayout
    title="Privacy Policy"
    lastUpdated="February 2026"
    intro="This Privacy Policy explains how ResourceFlow collects, uses, and protects your information when you use our platform. By using ResourceFlow, you agree to the practices described below."
    sections={SECTIONS}
  />
);

export default PrivacyPolicy;
