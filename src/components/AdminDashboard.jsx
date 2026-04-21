import { useMemo } from "react";
import { useEmotionDashboard } from "../hooks/useEmotionDashboard.js";
import { EmotionTimeline } from "./EmotionTimeline.jsx";
import { LiveIndicator } from "./LiveIndicator.jsx";
import { RefreshButton } from "./RefreshButton.jsx";
import { SummaryPanel } from "./SummaryPanel.jsx";
import { SnapshotPanel } from "./SnapshotPanel.jsx";
import { TransitionLog } from "./TransitionLog.jsx";

export function AdminDashboard() {
  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
    sessionId,
    setSessionId,
    limit,
    setLimit,
  } = useEmotionDashboard();

  const liveSession = data ?? {
    sessionId: null,
    emotions: [],
    snapshots: [],
    summaries: [],
    latestSnapshotReason: null,
    latestSnapshotLogs: [],
    hasData: false,
  };
  const summaryHeadline = useMemo(() => {
    if (!liveSession.summaries.length) {
      return "No summary available";
    }

    if (liveSession.sessionId) {
      return "Session scoped summary";
    }

    return "Latest session summaries";
  }, [liveSession.summaries.length, liveSession.sessionId]);

  return (
    <div className="command-center">
      <div className="command-center__grid" aria-hidden="true">
        <span className="command-center__spark command-center__spark--left" />
        <span className="command-center__spark command-center__spark--right" />
        <span className="command-center__particle command-center__particle--1" />
        <span className="command-center__particle command-center__particle--2" />
        <span className="command-center__particle command-center__particle--3" />
      </div>

      <header className="command-center__header section-card">
        <div className="command-center__heading">
          <span className="command-center__eyebrow">
            Vyra-X AI Command Center
          </span>
          <h1 className="command-center__title">
            Real-time emotional intelligence
          </h1>
          <p className="command-center__copy">
            Streaming MongoDB telemetry and Azure Blob snapshots through the
            backend API with live polling and synchronized selection.
          </p>
        </div>

        <div className="command-center__controls">
          <LiveIndicator isFetching={isFetching} />
          <RefreshButton onClick={refetch} isFetching={isFetching} />
          <label className="command-center__filter">
            Session ID
            <input
              value={sessionId}
              onChange={(event) => setSessionId(event.target.value)}
              placeholder="optional"
              type="text"
            />
          </label>
          <label className="command-center__filter">
            Limit
            <select
              value={String(limit)}
              onChange={(event) => setLimit(event.target.value)}>
              <option value="all">All</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="250">250</option>
              <option value="500">500</option>
              <option value="1000">1000</option>
            </select>
          </label>
          <div className="command-center__session-chip">
            Session{" "}
            {liveSession.sessionId ? liveSession.sessionId.slice(0, 12) : "All"}
          </div>
        </div>
      </header>

      {error ?
        <section className="command-center__error section-card">
          <h3>{error.title}</h3>
          <p>{error.message}</p>
          <button type="button" onClick={refetch}>
            Retry
          </button>
        </section>
      : null}

      <SummaryPanel
        summaries={liveSession.summaries}
        headline={summaryHeadline}
        isFetching={isFetching}
      />

      <div className="command-center__body">
        <section className="command-center__panel command-center__panel--main section-card">
          <EmotionTimeline
            emotions={liveSession.emotions}
            isConnected={liveSession.hasData}
            isFetching={isFetching}
            hasData={liveSession.hasData}
          />
        </section>

        <aside className="command-center__panel command-center__panel--side section-card">
          <SnapshotPanel
            snapshots={liveSession.snapshots}
            isConnected={liveSession.hasData}
          />
        </aside>
      </div>

      <TransitionLog
        latestReason={liveSession.latestSnapshotReason}
        logs={liveSession.latestSnapshotLogs}
      />

      {isLoading || !liveSession.hasData ?
        <div className="command-center__connecting">
          <span className="command-center__connecting-dot" />
          <p>Connecting to AI stream...</p>
        </div>
      : null}
    </div>
  );
}
