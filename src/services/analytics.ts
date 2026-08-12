/**
 * CredBridge Level 4 Production Analytics & Error Monitoring Service
 * Compatible with Vercel Analytics & Sentry Error Tracking standards
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: string;
}

export interface TrackedError {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  timestamp: string;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private errors: TrackedError[] = [];

  constructor() {
    this.initGlobalErrorHandler();
  }

  private initGlobalErrorHandler() {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.captureException(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.captureException(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        { type: 'unhandled_promise_rejection' }
      );
    });
  }

  /**
   * Track feature usage and user actions
   */
  trackEvent(name: string, properties: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);
    console.log(`[Analytics Track]: ${name}`, properties);

    // Persist event in local analytics store
    try {
      const stored = JSON.parse(localStorage.getItem('credbridge_analytics') || '[]');
      stored.push(event);
      localStorage.setItem('credbridge_analytics', JSON.stringify(stored.slice(-100)));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Capture and log errors (Sentry compatible signature)
   */
  captureException(error: Error | string, context: Record<string, any> = {}) {
    const errObj: TrackedError = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      context,
      timestamp: new Date().toISOString(),
    };

    this.errors.push(errObj);
    console.error(`[Monitoring Error Captured]:`, errObj);

    try {
      const stored = JSON.parse(localStorage.getItem('credbridge_errors') || '[]');
      stored.push(errObj);
      localStorage.setItem('credbridge_errors', JSON.stringify(stored.slice(-50)));
    } catch {
      // Ignore storage errors
    }
  }

  getEvents(): AnalyticsEvent[] {
    return this.events;
  }

  getErrors(): TrackedError[] {
    return this.errors;
  }
}

export const analytics = new AnalyticsService();
