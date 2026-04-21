export function SnapshotPanel({
  snapshots,
  selectedSnapshotTimestamp,
  onSelectSnapshot,
  isConnected,
  activeSnapshot,
}) {
  const latestSnapshot = snapshots[0] ?? null;
  const selectedSnapshot =
    activeSnapshot ??
    snapshots.find(
      (snapshot) => snapshot.timestamp === selectedSnapshotTimestamp,
    ) ??
    latestSnapshot ??
    null;

  return (
    <div className="snapshot-panel-wrapper">
      <div className="snapshot-panel-header">
        <h2>Snapshot intelligence</h2>
        <span>{snapshots.length} captured</span>
      </div>

      {selectedSnapshot ?
        <div className="snapshot-panel-hero">
          <img
            className="snapshot-panel-hero__image"
            src={selectedSnapshot.imageUrl}
            alt={`${selectedSnapshot.label} snapshot`}
            loading="lazy"
          />
          <div className="snapshot-panel-hero__meta">
            <div>
              <span className="snapshot-panel-hero__label">
                {selectedSnapshot.emoji} {selectedSnapshot.label}
              </span>
              <p>{selectedSnapshot.timeLabel}</p>
            </div>
            <strong>{Math.round(selectedSnapshot.confidence * 100)}%</strong>
          </div>
        </div>
      : null}

      {snapshots.length ?
        <div className="snapshot-feed">
          {snapshots.map((snapshot) => (
            <button
              className={`snapshot-item ${snapshot.timestamp === selectedSnapshotTimestamp ? "snapshot-item--selected" : ""} ${snapshot.timestamp === latestSnapshot?.timestamp ? "snapshot-item--latest" : ""}`}
              key={`${snapshot.timestamp}-${snapshot.emotion}`}
              type="button"
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
                  <span className="snapshot-item-time">
                    {snapshot.timeLabel}
                  </span>
                </div>
                <div className="snapshot-item-confidence">
                  {Math.round(snapshot.confidence * 100)}%
                </div>
              </div>
              {snapshot.timestamp === latestSnapshot?.timestamp ?
                <span className="snapshot-item-badge">Latest</span>
              : null}
            </button>
          ))}
        </div>
      : <div className="snapshot-panel-empty">
          <div className="snapshot-panel-empty__dot"></div>
          <p>Waiting for emotion events...</p>
          <span style={{ fontSize: "0.7rem" }}>Snapshots will appear here</span>
        </div>
      }

      <div className="snapshot-panel-status">
        {isConnected ? "LIVE AI STREAM" : "CONNECTING"}
      </div>
    </div>
  );
}
