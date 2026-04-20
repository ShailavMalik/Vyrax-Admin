import { useEffect, useMemo, useRef, useState } from "react";
import { getEmotionMeta } from "../lib/emotionFeed.js";

function AnimatedNumber({ value, suffix = "" }) {
  const [displayValue, setDisplayValue] = useState(value);
  const startValueRef = useRef(value);
  const hasValue = value != null;

  useEffect(() => {
    if (!hasValue) {
      return undefined;
    }

    let frame = 0;
    const start = performance.now();
    const initialValue = startValueRef.current;

    const animate = (timestamp) => {
      const progress = Math.min(1, (timestamp - start) / 420);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = initialValue + (value - initialValue) * eased;
      setDisplayValue(nextValue);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        startValueRef.current = value;
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [hasValue, value]);

  const formatted = useMemo(() => {
    if (!hasValue) {
      return "—";
    }

    if (Number.isInteger(value)) {
      return Math.round(displayValue).toLocaleString();
    }

    return displayValue.toFixed(1);
  }, [displayValue, hasValue, value]);

  return (
    <strong>
      {formatted}
      {suffix}
    </strong>
  );
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;
  return [hours, minutes, remaining]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function OverviewCards({
  session,
  currentEmotion,
  currentConfidence,
  isFetching,
}) {
  const emotionMeta = currentEmotion ? getEmotionMeta(currentEmotion) : null;
  const confidenceLabel =
    currentConfidence != null ? `${Math.round(currentConfidence * 100)}%` : "—";

  return (
    <div className="overview-grid">
      <article className="overview-card overview-card--status glow-neutral">
        <span className="overview-card__label">System status</span>
        <div className="overview-card__value">
          <strong>
            {session?.currentEmotion ?
              "Active / Running"
            : "Waiting for backend"}
          </strong>
          <span className="emotion-emoji">◍</span>
        </div>
        <p className="overview-card__hint">
          Real-time inference is live with no interruptions and optimized media
          delivery.
        </p>
      </article>

      <article
        className={`overview-card overview-card--emotion glow-${currentEmotion ?? "neutral"}`}>
        <span className="overview-card__label">Current emotion</span>
        <div className="overview-card__value">
          <strong>{emotionMeta?.label ?? "—"}</strong>
          <span className="emotion-emoji">{emotionMeta?.emoji ?? "◦"}</span>
        </div>
        <p className="overview-card__hint">
          Confidence {confidenceLabel}{" "}
          {currentConfidence != null ?
            "and rising."
          : "while the first live frame arrives."}
        </p>
      </article>

      <article className="overview-card glow-neutral">
        <span className="overview-card__label">Session duration</span>
        <div className="overview-card__value">
          <AnimatedNumber value={session?.sessionDurationSeconds} suffix="s" />
          <span className="emotion-emoji">⟡</span>
        </div>
        <p className="overview-card__hint">
          Live timer:{" "}
          {session ? formatDuration(session.sessionDurationSeconds) : "—"}
        </p>
      </article>

      <article className="overview-card glow-surprised">
        <span className="overview-card__label">Total emotion events</span>
        <div className="overview-card__value">
          <AnimatedNumber value={session?.totalEvents} />
          <span className="emotion-emoji">{isFetching ? "◌" : "▣"}</span>
        </div>
        <p className="overview-card__hint">
          Streaming evidence and snapshot scoring are synchronized.
        </p>
      </article>
    </div>
  );
}
