
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  // Suppress browser extension errors that don't affect functionality
  window.addEventListener('error', (event) => {
    // Suppress the common browser extension error about message channels
    const errorMessage = event.message || event.error?.message || '';
    const errorString = errorMessage.toString().toLowerCase();
    
    if (
      errorString.includes('message channel closed') ||
      errorString.includes('asynchronous response') ||
      errorString.includes('listener indicated an asynchronous response') ||
      errorString.includes('message channel closed before a response was received') ||
      errorString.includes('extension') ||
      errorString.includes('chrome-extension://') ||
      errorString.includes('moz-extension://')
    ) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true); // Use capture phase to catch errors earlier

  // Also handle unhandled promise rejections from browser extensions
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    let errorMessage = '';
    
    if (reason?.message) {
      errorMessage = reason.message.toString().toLowerCase();
    } else if (typeof reason === 'string') {
      errorMessage = reason.toLowerCase();
    } else if (reason?.toString) {
      errorMessage = reason.toString().toLowerCase();
    } else if (reason instanceof Error) {
      errorMessage = reason.message.toLowerCase();
    }
    
    if (
      errorMessage.includes('message channel closed') ||
      errorMessage.includes('asynchronous response') ||
      errorMessage.includes('listener indicated an asynchronous response') ||
      errorMessage.includes('message channel closed before a response was received') ||
      errorMessage.includes('extension') ||
      errorMessage.includes('chrome-extension://') ||
      errorMessage.includes('moz-extension://')
    ) {
      event.preventDefault();
      // Don't log these extension errors
      return;
    }
  });

  createRoot(document.getElementById("root")!).render(<App />);
  