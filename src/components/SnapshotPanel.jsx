export function SnapshotPanel({ snapshots, isConnected }) {
  const latestSnapshot = snapshots[0] ?? null;

  return (
    <div className="snapshot-panel-wrapper">
      <div className="snapshot-panel-header">
        <h2>Snapshots</h2>
        <span>{snapshots.length} captured</span>
      </div>

      {snapshots.length ?
        <div className="snapshot-table-wrap">
          <table className="snapshot-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Session</th>
                <th>Emotion</th>
                <th>Confidence</th>
                <th>Size</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((snapshot) => (
                <tr key={`${snapshot.timestamp}-${snapshot.imageUrl}`}>
                  <td>{snapshot.timestampLabel}</td>
                  <td title={snapshot.sessionId}>
                    {snapshot.sessionId.slice(0, 12)}
                  </td>
                  <td>
                    {snapshot.emotionMeta.emoji} {snapshot.emotionMeta.label}
                  </td>
                  <td>{snapshot.confidencePercent}%</td>
                  <td>{snapshot.sizeKbLabel} KB</td>
                  <td>
                    <a
                      href={snapshot.imageUrl}
                      target="_blank"
                      rel="noreferrer">
                      <img
                        className="snapshot-table__thumb"
                        src={snapshot.imageUrl}
                        alt={`${snapshot.emotionMeta.label} snapshot`}
                        loading="lazy"
                      />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      : <div className="snapshot-panel-empty">
          <div className="snapshot-panel-empty__dot"></div>
          <p>Waiting for emotion events...</p>
          <span style={{ fontSize: "0.7rem" }}>Snapshots will appear here</span>
        </div>
      }

      {latestSnapshot ?
        <div className="snapshot-panel-latest">
          <strong>Latest reason:</strong>{" "}
          {latestSnapshot.reason || "not_available"}
        </div>
      : null}

      <div className="snapshot-panel-status">
        {isConnected ? "LIVE AI STREAM" : "CONNECTING"}
      </div>
    </div>
  );
}
