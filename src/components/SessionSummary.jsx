import { SectionCard } from "./SectionCard.jsx";

export function SessionSummary({ session }) {
  return (
    <SectionCard
      title="Full session report"
      subtitle="Compact metrics for quick executive review and operator handoff."
      className="summary-report">
      <div className="summary-grid">
        <article className="summary-tile">
          <div className="summary-tile__label">
            <span>Dominant emotion</span>
            <span>{session?.dominantEmotionEmoji ?? "—"}</span>
          </div>
          <div className="summary-tile__value">
            {session?.dominantEmotionLabel ?? "—"}
          </div>
          <div className="summary-tile__subtext">
            Most frequent state across the live session.
          </div>
        </article>

        <article className="summary-tile">
          <div className="summary-tile__label">
            <span>Session duration</span>
            <span>Live</span>
          </div>
          <div className="summary-tile__value">
            {session?.sessionDurationLabel ?? "—"}
          </div>
          <div className="summary-tile__subtext">
            Clock updates continuously during polling.
          </div>
        </article>

        <article className="summary-tile">
          <div className="summary-tile__label">
            <span>Transitions</span>
            <span>{session?.transitions ?? "—"}</span>
          </div>
          <div className="summary-tile__value">Emotion changes</div>
          <div className="summary-tile__subtext">
            Only meaningful transitions are persisted.
          </div>
        </article>

        <article className="summary-tile">
          <div className="summary-tile__label">
            <span>Peak emotional moment</span>
            <span>Snapshot</span>
          </div>
          <div className="summary-tile__value">
            {session?.peakMoment ?? "—"}
          </div>
          <div className="summary-tile__subtext">
            Highest emotional intensity captured in the timeline.
          </div>
        </article>

        <article className="summary-tile">
          <div className="summary-tile__label">
            <span>Average confidence</span>
            <span>{session?.averageConfidenceLabel ?? "—"}</span>
          </div>
          <div className="summary-tile__value">Model certainty</div>
          <div className="summary-tile__subtext">
            Stable and consistent detection confidence.
          </div>
        </article>

        <article className="summary-tile">
          <div className="summary-tile__label">
            <span>Stability score</span>
            <span>{session?.stabilityLabel ?? "—"}</span>
          </div>
          <div className="summary-tile__value">
            {session?.stabilityScore != null ?
              `${session.stabilityScore}/100`
            : "—"}
          </div>
          <div className="summary-tile__subtext">
            High scores indicate steady emotional continuity.
          </div>
        </article>
      </div>
    </SectionCard>
  );
}
