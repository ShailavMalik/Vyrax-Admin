import { useMemo } from "react";
import { SectionCard } from "./SectionCard.jsx";
import { getEmotionMeta, formatDuration } from "../lib/emotionFeed.js";

function AnimatedNumber({ value, suffix = "" }) {
  const renderedValue = useMemo(() => {
    if (value == null) {
      return "—";
    }

    if (Number.isInteger(value)) {
      return Math.round(value).toLocaleString();
    }

    return Number(value).toFixed(1);
  }, [value]);

  return (
    <strong>
      {renderedValue}
      {suffix}
    </strong>
  );
}

function MetricTile({ label, value, hint, accent }) {
  return (
    <article className="summary-panel__metric">
      <span className="summary-panel__metric-label">{label}</span>
      <AnimatedNumber value={value} suffix={accent} />
      <p>{hint}</p>
    </article>
  );
}

export function SummaryPanel({
  session,
  latestEmotionTimestamp,
  latestSnapshotTimestamp,
  isFetching,
}) {
  const dominantEmotion = session?.dominantEmotion ?? null;
  const emotionMeta = dominantEmotion ? getEmotionMeta(dominantEmotion) : null;
  const currentEmotionMeta =
    session?.currentEmotion ? getEmotionMeta(session.currentEmotion) : null;
  const confidenceValue =
    typeof session?.avgConfidence === "number" ?
      session.avgConfidence * 100
    : null;

  return (
    <SectionCard
      title="Session summary"
      subtitle="Live backend summary with animated counters, synchronized snapshot state, and dominant emotion emphasis."
      className="summary-panel"
      action={
        <span
          className={`summary-panel__live ${isFetching ? "summary-panel__live--active" : ""}`}>
          Live
        </span>
      }>
      <div className="summary-panel__hero">
        <div className="summary-panel__dominant">
          <span className="summary-panel__dominant-label">
            Dominant emotion
          </span>
          <div className="summary-panel__dominant-value">
            <span
              className="summary-panel__dominant-emoji"
              style={{ color: emotionMeta?.color ?? "#00f0ff" }}>
              {emotionMeta?.emoji ?? "◦"}
            </span>
            <div>
              <strong>{emotionMeta?.label ?? "—"}</strong>
              <p>
                {session?.dominantEmotion ?
                  `Model-leading signal from ${session.dominantEmotion}.`
                : "Waiting for the first live sample."}
              </p>
            </div>
          </div>
        </div>

        <div className="summary-panel__metrics">
          <MetricTile
            label="Avg confidence"
            value={confidenceValue}
            hint="Backend summary across the current session."
            accent="%"
          />
          <MetricTile
            label="Total events"
            value={session?.totalEvents ?? 0}
            hint="MongoDB emotion events streamed into the dashboard."
          />
          <MetricTile
            label="Transitions"
            value={session?.transitions ?? 0}
            hint="State changes detected by the analytics pipeline."
          />
          <MetricTile
            label="Session span"
            value={session?.sessionDurationSeconds ?? 0}
            hint={formatDuration(session?.sessionDurationSeconds ?? 0)}
            accent="s"
          />
        </div>
      </div>

      <div className="summary-panel__footer">
        <div className="summary-panel__status-row">
          <span className="summary-panel__status-label">Current signal</span>
          <strong>
            {currentEmotionMeta ?
              `${currentEmotionMeta.emoji} ${currentEmotionMeta.label}`
            : "—"}
          </strong>
          <small>
            {session?.currentConfidence != null ?
              `${Math.round(session.currentConfidence * 100)}% confidence`
            : "No live frame yet"}
          </small>
        </div>
        <div className="summary-panel__status-row">
          <span className="summary-panel__status-label">Latest emotion</span>
          <strong>
            {latestEmotionTimestamp ?
              new Date(latestEmotionTimestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            : "—"}
          </strong>
          <small>
            {latestSnapshotTimestamp ?
              "Snapshot sync available"
            : "Snapshot sync pending"}
          </small>
        </div>
      </div>
    </SectionCard>
  );
}
