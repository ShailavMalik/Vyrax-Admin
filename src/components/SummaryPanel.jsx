import { SectionCard } from "./SectionCard.jsx";

function toDateLabel(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
}

export function SummaryPanel({ summaries, headline, isFetching }) {
  return (
    <SectionCard
      title="Session summary"
      subtitle={headline}
      className="summary-panel"
      action={
        <span
          className={`summary-panel__live ${isFetching ? "summary-panel__live--active" : ""}`}>
          Live
        </span>
      }>
      <div className="summary-panel__cards">
        {summaries.length ?
          summaries.map((summary) => (
            <article
              className="summary-panel__card"
              key={summary.sessionId || summary.updatedAt}>
              <div className="summary-panel__card-header">
                <h3>
                  {summary.sessionId ?
                    summary.sessionId.slice(0, 12)
                  : "Session"}
                </h3>
                <span>{toDateLabel(summary.updatedAt)}</span>
              </div>
              <dl>
                <div>
                  <dt>Dominant</dt>
                  <dd>{summary.dominantEmotion || "—"}</dd>
                </div>
                <div>
                  <dt>Total events</dt>
                  <dd>{Number(summary.totalEvents || 0).toLocaleString()}</dd>
                </div>
                <div>
                  <dt>Avg confidence</dt>
                  <dd>
                    {(Number(summary.avgConfidence || 0) * 100).toFixed(1)}%
                  </dd>
                </div>
                <div>
                  <dt>Start</dt>
                  <dd>{toDateLabel(summary.startTime)}</dd>
                </div>
                <div>
                  <dt>End</dt>
                  <dd>{toDateLabel(summary.endTime)}</dd>
                </div>
              </dl>
            </article>
          ))
        : <div className="empty-state">Waiting for summary data.</div>}
      </div>
    </SectionCard>
  );
}
