import { SectionCard } from "./SectionCard.jsx";

const EMOJI = {
  neutral: "◦",
  happy: "😊",
  sad: "🌧",
  angry: "🔥",
  surprised: "⚡",
};

function deriveTransitions(timeline) {
  if (!Array.isArray(timeline) || timeline.length < 2) {
    return [];
  }

  const transitions = [];

  for (let index = 1; index < timeline.length; index += 1) {
    const previousPoint = timeline[index - 1];
    const currentPoint = timeline[index];

    if (previousPoint.emotion === currentPoint.emotion) {
      continue;
    }

    transitions.unshift({
      id: `${previousPoint.timestamp}-${currentPoint.timestamp}`,
      from: previousPoint.emotion,
      to: currentPoint.emotion,
      timeLabel: currentPoint.timeLabel,
      reason:
        currentPoint.confidence >= 0.8 ? "High-confidence transition confirmed"
        : currentPoint.value > previousPoint.value ?
          "Escalation detected by live model"
        : "Behavioral correction detected",
    });
  }

  return transitions.slice(0, 10);
}

export function TransitionLog({ timeline }) {
  const derivedTransitions = deriveTransitions(timeline);

  return (
    <SectionCard
      title="Emotion transition log"
      subtitle="Recent changes are retained as a compact evidence trail so the operator can see exactly when the session shifted state.">
      <div className="transition-list">
        {derivedTransitions.length ?
          derivedTransitions.map((transition) => (
            <article className="transition-item" key={transition.id}>
              <div className="transition-item__row">
                <div className="transition-item__label">
                  <span>{EMOJI[transition.from]}</span>
                  <span>
                    {transition.from.charAt(0).toUpperCase() +
                      transition.from.slice(1)}{" "}
                    →{" "}
                    {transition.to.charAt(0).toUpperCase() +
                      transition.to.slice(1)}
                  </span>
                </div>
                <span className="transition-item__meta">
                  {transition.timeLabel}
                </span>
              </div>
              <p className="transition-item__reason">{transition.reason}</p>
            </article>
          ))
        : <div className="empty-state">
            Waiting for the first emotion shift.
          </div>
        }
      </div>
    </SectionCard>
  );
}
