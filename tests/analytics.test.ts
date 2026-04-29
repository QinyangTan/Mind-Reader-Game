import { afterEach, describe, expect, it, vi } from "vitest";

import {
  resetAnalyticsServiceForTests,
  sanitizeAnalyticsPayload,
  trackAnalytics,
} from "@/lib/game/analytics";

describe("analytics", () => {
  const previousMode = process.env.NEXT_PUBLIC_MIND_READER_ANALYTICS_MODE;
  const previousEndpoint = process.env.NEXT_PUBLIC_MIND_READER_ANALYTICS_ENDPOINT;

  afterEach(() => {
    process.env.NEXT_PUBLIC_MIND_READER_ANALYTICS_MODE = previousMode;
    process.env.NEXT_PUBLIC_MIND_READER_ANALYTICS_ENDPOINT = previousEndpoint;
    resetAnalyticsServiceForTests();
    vi.restoreAllMocks();
  });

  it("drops private answer/entity/free-text fields from outgoing payloads", () => {
    expect(
      sanitizeAnalyticsPayload({
        mode: "read-my-mind",
        category: "foods",
        answer: "yes",
        entityName: "Secret sandwich",
        prompt: "Was it spicy?",
        note: "private correction",
        scoreBucket: "150-249",
      }),
    ).toEqual({
      mode: "read-my-mind",
      category: "foods",
      scoreBucket: "150-249",
    });
  });

  it("no-op mode can be called without browser globals", () => {
    process.env.NEXT_PUBLIC_MIND_READER_ANALYTICS_MODE = "";
    process.env.NEXT_PUBLIC_MIND_READER_ANALYTICS_ENDPOINT = "";
    resetAnalyticsServiceForTests();

    expect(() =>
      trackAnalytics("result_reached", {
        mode: "guess-my-mind",
        category: "objects",
      }),
    ).not.toThrow();
  });

  it("console mode emits only sanitized metadata in development", () => {
    process.env.NEXT_PUBLIC_MIND_READER_ANALYTICS_MODE = "console";
    process.env.NEXT_PUBLIC_MIND_READER_ANALYTICS_ENDPOINT = "";
    resetAnalyticsServiceForTests();
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);

    trackAnalytics("question_answered", {
      mode: "read-my-mind",
      answer: "no",
      questionNumber: 3,
    });

    expect(info).toHaveBeenCalledWith("[mind-reader analytics]", "question_answered", {
      mode: "read-my-mind",
      questionNumber: 3,
    });
  });
});
