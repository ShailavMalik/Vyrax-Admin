import { SectionCard } from "./SectionCard.jsx";

export function SystemStatus({ system }) {
  return (
    <SectionCard
      title="System status"
      subtitle="Compact technical health readout for the emotion detection pipeline.">
      <div className="status-grid">
        <div className="status-row">
          <div className="status-row__left">
            <span>FPS</span>
            <strong>{system?.fps ?? "—"}</strong>
          </div>
          <div className="status-row__right">
            <small>Stable</small>
          </div>
        </div>

        <div className="status-row">
          <div className="status-row__left">
            <span>Model status</span>
            <strong>{system?.modelStatus ?? "Awaiting backend"}</strong>
          </div>
          <div className="status-row__right">
            <small>FER + CNN</small>
          </div>
        </div>

        <div className="status-row">
          <div className="status-row__left">
            <span>Detection status</span>
            <strong>{system?.detectionStatus ?? "Idle"}</strong>
          </div>
          <div className="status-row__right">
            <small>Live inference</small>
          </div>
        </div>

        <div className="status-row">
          <div className="status-row__left">
            <span>API latency</span>
            <strong>
              {system?.apiLatency != null ? `${system.apiLatency} ms` : "—"}
            </strong>
          </div>
          <div className="status-row__right">
            <small>Optimized path</small>
          </div>
        </div>

        <div className="status-row">
          <div className="status-row__left">
            <span>Upload status</span>
            <strong>{system?.uploadStatus ?? "Awaiting media pipeline"}</strong>
          </div>
          <div className="status-row__right">
            <small>Snapshot URLs only</small>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
