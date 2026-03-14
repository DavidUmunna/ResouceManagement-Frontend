import * as Sentry from '@sentry/react';


Sentry.init({
  dsn: "https://70c4617b75c9227dfdfa5c8222db19d5@o4509425534042112.ingest.de.sentry.io/4509425539416144",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
  environment: "production",

  beforeSend(event, hint) {
  const error = hint.originalException;

  // Ignore specific error messages or error types
  if (error) {
    const ignoredMessages = [
      "Network Error",
      "Request failed with status code 401",
      "Module not found",
    ];
    
    if (
      (error.message && ignoredMessages.some(msg => error.message.includes(msg))) ||
      error.name === "ReferenceError" // <-- catch ReferenceErrors properly
    ) {
      return null; // Drop from Sentry
    }
  }

  // Ignore errors from specific URLs
  if (event.request?.url?.includes("/api/access")) {
    return null;
  }

  return event; // All other errors will be sent
}
})

