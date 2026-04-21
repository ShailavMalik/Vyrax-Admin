export function RefreshButton({ onClick, isFetching }) {
  return (
    <button
      className="refresh-button"
      type="button"
      onClick={onClick}
      disabled={isFetching}>
      {isFetching ? "Syncing..." : "Manual refresh"}
    </button>
  );
}
