import { SectionCard } from "./SectionCard.jsx";

const KNOWN_REASONS = new Set([
  "first_snapshot",
  "emotion_change",
  "cooldown_emotion_change",
  "periodic_high_confidence",
  "cooldown_high_confidence",
  "periodic_keepalive",
  "gated",
  "dark_frame",
  "no_face_detected",
  "camera_disabled_ui",
]);

function normalizeReason(value) {
  if (!value) {
    return "not_available";
  }

  return String(value).trim();
}

export function TransitionLog({ latestReason, logs }) {
  const normalizedLatestReason = normalizeReason(latestReason);

  return (
    <SectionCard
      title="Snapshot gating logs"
      subtitle="Latest snapshot gating reason and recent reason events from backend snapshots.">
      <div className="transition-log__latest">
        <span>Latest reason</span>
        <strong>{normalizedLatestReason}</strong>
      </div>

      <div className="transition-list">
        {logs.length ?
          logs.map((entry) => (
            <article
              className="transition-item"
              key={`${entry.timestamp}-${entry.sessionId}-${entry.reason}`}>
              <div className="transition-item__row">
                <div className="transition-item__label">
                  <span>{entry.sessionId.slice(0, 12)}</span>
                  <span>{normalizeReason(entry.reason)}</span>
                </div>
                <span className="transition-item__meta">
                  {entry.timestampLabel}
                </span>
              </div>
              <p className="transition-item__reason">
                {KNOWN_REASONS.has(normalizeReason(entry.reason)) ?
                  "Known gating reason"
                : "Custom reason from backend"}
              </p>
            </article>
          ))
        : <div className="empty-state">
            Waiting for snapshot gating reasons.
          </div>
        }
      </div>
    </SectionCard>
  );
}
