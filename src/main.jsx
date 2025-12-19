// === src/main.jsx ===
import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Initialize Sentry for error tracking, monitoring and log collection
Sentry.init({
  dsn: "https://1402906bd9ab213a055359f5e7ca5782@o4510556389376000.ingest.us.sentry.io/4510560375668736",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  // Set environment (development, staging, production)
  environment: import.meta.env.MODE || "development",
  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false, // Set to true in production to mask sensitive data
      blockAllMedia: false,
    }),
  ],
  // Tracing - Capture 100% of the transactions (adjust for production)
  tracesSampleRate: 1.0,
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/api\.goyalhariyanacrm\.in\/api/,
    /^http:\/\/localhost:5000\/api/,
  ],
  // Session Replay
  replaysSessionSampleRate: 0.1, // Sample 10% of sessions. Use 1.0 (100%) in development
  replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions where errors occur
  // Enable logs to be sent to Sentry
  enableLogs: true,
});

// Optional: log that Sentry initialized successfully (can be disabled in production)
// Sentry.logger.info('Sentry initialized', { 
//   log_source: 'sentry_init',
//   environment: import.meta.env.MODE || "development"
// });

const clientId = "540190260459-2n51r2ta6eki7bsgu87kk4mcp1icdbu4.apps.googleusercontent.com";

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);

root.render(
  <GoogleOAuthProvider clientId={clientId}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </GoogleOAuthProvider>
);
