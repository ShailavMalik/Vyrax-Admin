export function RefreshButton({ onClick, isFetching }) {
  return (
    <button
      className="refresh-button"
      type="button"
      onClick={onClick}
      disabled={isFetching}>
      {isFetching ? "Refreshing..." : "Manual refresh"}
    </button>
  );
}
