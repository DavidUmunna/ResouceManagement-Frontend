import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Shared presentational wrapper for legal/policy pages.
 *
 * @param {string}  title       Page heading (e.g. "Privacy Policy")
 * @param {string}  lastUpdated Human-readable date shown under the title
 * @param {string}  intro       Optional lead paragraph
 * @param {Array<{heading: string, body: string[]}>} sections
 */
const LegalLayout = ({ title, lastUpdated, intro, sections = [] }) => (
  <div className="min-h-screen bg-gray-50">
    <section className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{title}</h1>
          {lastUpdated && (
            <p className="mt-2 text-sm text-gray-500">Last updated: {lastUpdated}</p>
          )}
          {intro && (
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">{intro}</p>
          )}
        </motion.div>

        <div className="mt-10 space-y-10">
          {sections.map((section, i) => (
            <motion.div
              key={section.heading}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              viewport={{ once: true }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">{section.heading}</h2>
              <div className="space-y-3">
                {section.body.map((para, j) => (
                  <p key={j} className="text-gray-600 leading-relaxed">{para}</p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
          <Link to="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link>
          <Link to="/cookies" className="text-indigo-600 hover:underline">Cookie Policy</Link>
          <Link to="/" className="text-gray-500 hover:underline ml-auto">← Back to home</Link>
        </div>
      </div>
    </section>
  </div>
);

export default LegalLayout;
