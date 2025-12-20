// === src/main.jsx ===
import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Initialize Sentry for error tracking, monitoring and log collection
try {
  // Build integrations array only with available functions
  const integrations = [];
  
  // Try to add console logging integration if available
  if (typeof Sentry?.consoleLoggingIntegration === 'function') {
    try {
      integrations.push(Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }));
    } catch (e) {
      console.warn('Sentry consoleLoggingIntegration error:', e);
    }
  }
  
  // Try to add browser tracing integration if available
  if (typeof Sentry?.browserTracingIntegration === 'function') {
    try {
      integrations.push(Sentry.browserTracingIntegration());
    } catch (e) {
      console.warn('Sentry browserTracingIntegration error:', e);
    }
  }
  
  // Try to add replay integration if available
  if (typeof Sentry?.replayIntegration === 'function') {
    try {
      integrations.push(Sentry.replayIntegration({
        maskAllText: false, // Set to true in production to mask sensitive data
        blockAllMedia: false,
      }));
    } catch (e) {
      console.warn('Sentry replayIntegration error:', e);
    }
  }

  const sentryConfig = {
    dsn: "https://1402906bd9ab213a055359f5e7ca5782@o4510556389376000.ingest.us.sentry.io/4510560375668736",
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
    // Set environment (development, staging, production)
    environment: import.meta.env.MODE || "development",
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
  };

  // Only add integrations if we have any
  if (integrations.length > 0) {
    sentryConfig.integrations = integrations;
  }

  Sentry.init(sentryConfig);
} catch (error) {
  console.error('Failed to initialize Sentry:', error);
  // Continue without Sentry if initialization fails
}

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
