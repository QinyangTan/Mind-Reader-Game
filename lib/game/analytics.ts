export type AnalyticsEventName =
  | "profile_created"
  | "mode_selected"
  | "category_selected"
  | "game_started"
  | "question_answered"
  | "guess_submitted"
  | "result_reached"
  | "teach_flow_opened"
  | "chamber_memory_opened"
  | "world_rank_opened"
  | "ad_closed";

export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

export interface AnalyticsService {
  track(event: AnalyticsEventName, payload?: AnalyticsPayload): void;
}

class NoopAnalyticsService implements AnalyticsService {
  track() {
    return;
  }
}

class ConsoleAnalyticsService implements AnalyticsService {
  track(event: AnalyticsEventName, payload: AnalyticsPayload = {}) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[mind-reader analytics]", event, payload);
    }
  }
}

class HttpAnalyticsService implements AnalyticsService {
  constructor(private readonly endpoint: string) {}

  track(event: AnalyticsEventName, payload: AnalyticsPayload = {}) {
    if (typeof navigator === "undefined") {
      return;
    }

    const body = JSON.stringify({
      event,
      payload,
      at: new Date().toISOString(),
    });

    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(this.endpoint, new Blob([body], { type: "application/json" }));
      return;
    }

    void fetch(this.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  }
}

let analytics: AnalyticsService | null = null;

export function getAnalyticsService(): AnalyticsService {
  if (analytics) {
    return analytics;
  }

  const mode = process.env.NEXT_PUBLIC_MIND_READER_ANALYTICS_MODE;
  const endpoint = process.env.NEXT_PUBLIC_MIND_READER_ANALYTICS_ENDPOINT;

  if (mode === "http" && endpoint) {
    analytics = new HttpAnalyticsService(endpoint);
  } else if (mode === "console") {
    analytics = new ConsoleAnalyticsService();
  } else {
    analytics = new NoopAnalyticsService();
  }

  return analytics;
}

export function trackAnalytics(event: AnalyticsEventName, payload?: AnalyticsPayload) {
  getAnalyticsService().track(event, payload);
}
