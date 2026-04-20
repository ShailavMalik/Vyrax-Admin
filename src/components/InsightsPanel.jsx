import { SectionCard } from "./SectionCard.jsx";

export function InsightsPanel({ session, insights }) {
  const stabilityWidth = `${session?.stabilityScore ?? 0}%`;
  const confidenceWidth = `${Math.round((session?.avgConfidence ?? 0) * 100)}%`;
  const insightItems = Array.isArray(insights) ? insights : [];

  return (
    <SectionCard
      title="Advanced analytics"
      subtitle="Session-level behavior analysis and compact intelligence for operators and reviewers."
      className="insights-panel">
      <div className="insight-list">
        <article className="insight-item">
          <div className="insight-item__title">
            <strong>Emotion stability score</strong>
            <span>{session?.stabilityLabel ?? "—"}</span>
          </div>
          <div className="bar-line">
            <div className="bar-line__fill" style={{ width: stabilityWidth }} />
          </div>
          <p className="insight-item__copy">
            {session?.stabilityScore ?? 0}/100 indicates how steady the current
            emotional pattern remains.
          </p>
        </article>

        <article className="insight-item">
          <div className="insight-item__title">
            <strong>Most frequent emotion</strong>
            <span>{session?.mostFrequentEmotion ?? "—"}</span>
          </div>
          <p className="insight-item__copy">
            {session?.dominantEmotionLabel ?? "—"} leads the session and anchors
            the current behavior profile.
          </p>
        </article>

        <article className="insight-item">
          <div className="insight-item__title">
            <strong>Peak confidence time</strong>
            <span>{session?.peakConfidenceTime ?? "—"}</span>
          </div>
          <div className="bar-line">
            <div
              className="bar-line__fill"
              style={{ width: confidenceWidth }}
            />
          </div>
          <p className="insight-item__copy">
            The model was most certain at the listed timestamp.
          </p>
        </article>

        {insightItems.map((item, index) => (
          <article className="insight-item" key={item}>
            <div className="insight-item__title">
              <strong>Insight {index + 1}</strong>
              <span>Analysis</span>
            </div>
            <p className="insight-item__copy">{item}</p>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
