import React from 'react';
import LegalLayout from './LegalLayout';

const SECTIONS = [
  {
    heading: '1. Acceptance of Terms',
    body: [
      'By accessing or using ResourceFlow, you agree to be bound by these Terms of Service. If you are using the platform on behalf of an organisation, you represent that you have the authority to bind that organisation to these terms.',
    ],
  },
  {
    heading: '2. Use of the Service',
    body: [
      'You agree to use ResourceFlow only for lawful purposes and in accordance with these terms. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.',
      'You must not misuse the service, attempt to gain unauthorised access, interfere with its operation, or use it to store or transmit unlawful content.',
    ],
  },
  {
    heading: '3. Accounts and Roles',
    body: [
      'Access to features is governed by the role assigned to your account by your organisation administrator. Administrators are responsible for managing user access and permissions within their organisation.',
    ],
  },
  {
    heading: '4. Your Content',
    body: [
      'You retain ownership of the data you submit to ResourceFlow. You grant us a limited license to process that data solely to provide and improve the service. You are responsible for the accuracy and legality of the content you submit.',
    ],
  },
  {
    heading: '5. Service Availability',
    body: [
      'We strive to keep ResourceFlow available and reliable, but we do not guarantee uninterrupted access. We may modify, suspend, or discontinue features at any time, and will provide reasonable notice of material changes where practical.',
    ],
  },
  {
    heading: '6. Limitation of Liability',
    body: [
      'To the fullest extent permitted by law, ResourceFlow shall not be liable for any indirect, incidental, or consequential damages arising from your use of, or inability to use, the service.',
    ],
  },
  {
    heading: '7. Changes to These Terms',
    body: [
      'We may update these Terms of Service from time to time. Continued use of the platform after changes take effect constitutes acceptance of the revised terms.',
    ],
  },
  {
    heading: '8. Contact Us',
    body: [
      'If you have any questions about these terms, please contact us through your organisation administrator.',
    ],
  },
];

const TermsOfService = () => (
  <LegalLayout
    title="Terms of Service"
    lastUpdated="February 2026"
    intro="These Terms of Service govern your access to and use of the ResourceFlow platform. Please read them carefully before using the service."
    sections={SECTIONS}
  />
);

export default TermsOfService;
