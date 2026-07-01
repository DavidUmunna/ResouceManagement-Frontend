import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'cookie_consent';

/**
 * Persisted cookie decision shape:
 *   { status: 'accepted' | 'rejected', at: <ISO timestamp> }
 * Other parts of the app can read the current decision with getCookieConsent().
 */
export function getCookieConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only prompt when the user has not made a choice yet
    if (!getCookieConsent()) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const decide = (status) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ status, at: new Date().toISOString() }));
    } catch {
      /* storage unavailable — still dismiss the banner */
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 z-[60]
                     sm:max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200
                     p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-xl" aria-hidden="true">🍪</span>
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-gray-900">We value your privacy</h2>
              <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                We use cookies to keep you signed in, remember your preferences, and understand how
                ResourceFlow is used so we can improve it. You can accept all cookies or reject
                non‑essential ones. Read our{' '}
                <Link to="/cookies" className="text-indigo-600 font-medium hover:underline">
                  cookie policy
                </Link>{' '}
                for details.
              </p>

              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => decide('accepted')}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold
                             hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition"
                >
                  Accept all
                </button>
                <button
                  onClick={() => decide('rejected')}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold
                             hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 transition"
                >
                  Reject non‑essential
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
