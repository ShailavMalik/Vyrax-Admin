export function LiveIndicator({ isFetching }) {
  return (
    <div
      className={`live-indicator ${isFetching ? "is-active" : ""}`}
      aria-live="polite">
      <span className="live-indicator__dot" />
      <span className="live-indicator__text">
        <strong className="live-indicator__label">LIVE AI STREAM</strong>
        <span className="live-indicator__subtext">Polling every 2 seconds</span>
      </span>
    </div>
  );
}
