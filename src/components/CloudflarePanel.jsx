export function CloudflarePanel({ cloudflare }) {
  const metrics = cloudflare ?? null;

  const statusItems = [
    {
      label: "Storage",
      value: metrics?.storageTarget ?? "R2",
      emoji: "📦",
      isActive: !!metrics,
    },
    {
      label: "CDN",
      value: metrics?.cdn ?? "Edge",
      emoji: "🌍",
      isActive: !!metrics,
    },
    {
      label: "Optimization",
      value: metrics?.imageOptimization ?? "WebP",
      emoji: "🖼️",
      isActive: !!metrics,
    },
    {
      label: "Cache",
      value: metrics?.cacheStatus ?? "Warm",
      emoji: "⚡",
      isActive: !!metrics,
    },
  ];

  return (
    <div className="cloudflare-panel">
      <div className="cloudflare-header">
        <h3>🔗 Cloudflare Delivery</h3>
        <span className={`status-badge ${metrics ? "status-badge--active" : "status-badge--inactive"}`}>
          {metrics ? "Configured" : "Pending"}
        </span>
      </div>

      <div className="cloudflare-metrics">
        {statusItems.map((item) => (
          <div key={item.label} className="cloudflare-metric">
            <span className="metric-emoji">{item.emoji}</span>
            <div className="metric-text">
              <span className="metric-label">{item.label}</span>
              <strong className="metric-val">{item.value}</strong>
            </div>
            {item.isActive && <span className="metric-check">✓</span>}
          </div>
        ))}
      </div>

      {metrics && (
        <>
          <div className="cloudflare-stats">
            <div className="stat">
              <span>Success Rate</span>
              <strong>{metrics.uploadSuccessRate?.toFixed(1) ?? "—"}%</strong>
            </div>
            <div className="stat">
              <span>Latency</span>
              <strong>{metrics.deliveryLatency ?? "—"} ms</strong>
            </div>
          </div>

          <div className="progress-bar" style={{ marginTop: "8px" }}>
            <div
              className="progress-bar__fill"
              style={{ width: `${metrics.uploadSuccessRate ?? 0}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
}
