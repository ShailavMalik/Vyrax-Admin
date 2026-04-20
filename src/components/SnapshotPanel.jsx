export function SnapshotPanel({
  snapshots,
  selectedSnapshotTimestamp,
  onSelectSnapshot,
  isConnected,
}) {
  const selectedSnapshot =
    snapshots.find(
      (snapshot) => snapshot.timestamp === selectedSnapshotTimestamp,
    ) ??
    snapshots[0] ??
    null;

  return (
    <div className="snapshot-panel-wrapper">
      <div className="snapshot-panel-header">
        <h2>Live Snapshots</h2>
        <span>{snapshots.length} captured</span>
      </div>

      {snapshots.length ?
        <div className="snapshot-feed">
          {snapshots.map((snapshot) => (
            <div
              className={`snapshot-item ${snapshot.timestamp === selectedSnapshotTimestamp ? "snapshot-item--selected" : ""}`}
              key={`${snapshot.timestamp}-${snapshot.emotion}`}
              onClick={() => onSelectSnapshot(snapshot.timestamp)}>
              <img
                className="snapshot-item-image"
                src={snapshot.imageUrl}
                alt={`${snapshot.label} snapshot`}
                loading="lazy"
              />
              <div className="snapshot-item-info">
                <div className="snapshot-item-emotion">
                  <span className="snapshot-item-label">
                    {snapshot.emoji} {snapshot.label}
                  </span>
                  <span className="snapshot-item-time">{snapshot.timeLabel}</span>
                </div>
                <div className="snapshot-item-confidence">
                  {Math.round(snapshot.confidence * 100)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      : <div className="snapshot-panel-empty">
          <div className="snapshot-panel-empty__dot"></div>
          <p>Waiting for emotion events...</p>
          <span style={{ fontSize: "0.7rem" }}>Snapshots will appear here</span>
        </div>
      }

      <div className="snapshot-panel-status">
        {isConnected ? "🟢 Live stream active" : "🟡 Connecting..."}
      </div>
    </div>
  );
}
