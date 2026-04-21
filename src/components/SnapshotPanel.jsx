export function SnapshotPanel({ snapshots, isConnected }) {
  const latestSnapshot = snapshots[0] ?? null;
  const topSnapshots = snapshots.slice(0, 20);

  return (
    <div className="snapshot-panel-wrapper">
      <div className="snapshot-panel-header">
        <h2>Snapshots</h2>
        <span>{snapshots.length} captured total</span>
      </div>

      {snapshots.length ?
        <div className="snapshot-showcase">
          <div className="snapshot-showcase__head">
            <p>Showing top 20 newest snapshots</p>
            <a
              className="snapshot-showcase__expand"
              href="/snapshots"
              target="_blank"
              rel="noreferrer">
              Expand full gallery
            </a>
          </div>

          <div className="snapshot-showcase__grid">
            {topSnapshots.map((snapshot) => (
              <article
                className="snapshot-card"
                key={`${snapshot.timestamp}-${snapshot.sessionId}-${snapshot.blobName || "snapshot"}`}>
                <div className="snapshot-card__media">
                  {snapshot.imageUrl ?
                    <a
                      href={snapshot.imageUrl}
                      target="_blank"
                      rel="noreferrer">
                      <img
                        className="snapshot-card__image"
                        src={snapshot.imageUrl}
                        alt={`${snapshot.emotionMeta.label} snapshot`}
                        loading="lazy"
                      />
                    </a>
                  : <div className="snapshot-card__placeholder">No preview</div>
                  }
                </div>

                <div className="snapshot-card__meta">
                  <strong>
                    {snapshot.emotionMeta.emoji} {snapshot.emotionMeta.label}
                  </strong>
                  <span>{snapshot.timestampLabel}</span>
                  <p>
                    {snapshot.confidencePercent}% · {snapshot.sizeKbLabel} KB ·{" "}
                    {snapshot.sessionId.slice(0, 12)}
                  </p>
                </div>
              </article>
            ))}
          </div>
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
