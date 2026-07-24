import React from 'react';
import LegalLayout from './LegalLayout';

const SECTIONS = [
  {
    heading: '1. What Are Cookies?',
    body: [
      'Cookies are small text files stored on your device when you visit a website. They help the site remember your actions and preferences over time, such as keeping you signed in.',
    ],
  },
  {
    heading: '2. How We Use Cookies',
    body: [
      'Essential cookies: required for the platform to function — for example, to authenticate you, maintain your session, and protect against cross-site request forgery. These cannot be disabled.',
      'Preference cookies: remember choices you make, such as filters and display settings, to give you a more personalised experience.',
      'Analytics cookies: help us understand how ResourceFlow is used so we can improve performance and features. These are only set if you accept non-essential cookies.',
    ],
  },
  {
    heading: '3. Managing Your Preferences',
    body: [
      'When you first visit ResourceFlow, you can choose to accept all cookies or reject non-essential ones. Your choice is saved on your device and remembered on future visits.',
      'You can also control cookies through your browser settings, including deleting existing cookies or blocking new ones. Note that blocking essential cookies may prevent parts of the platform from working correctly.',
    ],
  },
  {
    heading: '4. Third-Party Cookies',
    body: [
      'Some cookies may be set by trusted third-party services we use for hosting, error monitoring, and notifications. These providers process data only on our behalf and in line with our Privacy Policy.',
    ],
  },
  {
    heading: '5. Changes to This Policy',
    body: [
      'We may update this Cookie Policy from time to time to reflect changes in technology or regulation. Any updates will be posted on this page.',
    ],
  },
  {
    heading: '6. Contact Us',
    body: [
      'If you have questions about our use of cookies, please contact us through your organisation administrator.',
    ],
  },
];

const CookiePolicy = () => (
  <LegalLayout
    title="Cookie Policy"
    lastUpdated="February 2026"
    intro="This Cookie Policy explains how ResourceFlow uses cookies and similar technologies, and how you can manage your preferences."
    sections={SECTIONS}
  />
);

export default CookiePolicy;
