import { useMemo, useState } from "react";
import { useEmotionDashboard } from "../hooks/useEmotionDashboard.js";
import { EmotionTimeline } from "./EmotionTimeline.jsx";
import { LiveIndicator } from "./LiveIndicator.jsx";
import { RefreshButton } from "./RefreshButton.jsx";
import { SummaryPanel } from "./SummaryPanel.jsx";
import { SnapshotPanel } from "./SnapshotPanel.jsx";
import { InsightsPanel } from "./InsightsPanel.jsx";
import { findClosestSnapshot } from "../lib/emotionFeed.js";

export function AdminDashboard() {
  const { data, isLoading, isFetching, refetch } = useEmotionDashboard();
  const [selectedSnapshotTimestamp, setSelectedSnapshotTimestamp] =
    useState(null);

  const liveSession = data ?? {
    sessionId: null,
    timeline: [],
    snapshots: [],
    summary: {
      dominantEmotion: null,
      avgConfidence: 0,
      totalEvents: 0,
      transitions: 0,
      sessionDurationSeconds: 0,
      sessionDurationLabel: "00:00:00",
      currentEmotion: null,
      currentConfidence: null,
      dominantEmotionLabel: "—",
      dominantEmotionEmoji: "—",
      averageConfidenceLabel: "0%",
      peakMoment: "—",
      peakConfidenceTime: "—",
      mostFrequentEmotion: "—",
      stabilityScore: 0,
      stabilityLabel: "Low",
    },
    distribution: [],
    insights: ["Waiting for backend data."],
    hasData: false,
    latestSnapshotTimestamp: null,
    latestEmotionTimestamp: null,
    latestSnapshotAgeSeconds: null,
  };

  const session = liveSession.summary;
  const activeSnapshotTimestamp =
    selectedSnapshotTimestamp ?? liveSession.snapshots[0]?.timestamp ?? null;

  const activeSnapshot = useMemo(
    () =>
      liveSession.snapshots.find(
        (snapshot) => snapshot.timestamp === activeSnapshotTimestamp,
      ) ??
      liveSession.snapshots[0] ??
      null,
    [activeSnapshotTimestamp, liveSession.snapshots],
  );

  const handleTimelineSelect = (timestamp) => {
    const closestSnapshot = findClosestSnapshot(
      liveSession.snapshots,
      timestamp,
    );
    setSelectedSnapshotTimestamp(
      closestSnapshot?.timestamp ?? activeSnapshotTimestamp,
    );
  };

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
          <div className="command-center__session-chip">
            Session{" "}
            {liveSession.sessionId ? liveSession.sessionId.slice(0, 8) : "—"}
          </div>
        </div>
      </header>

      <SummaryPanel
        session={session}
        latestEmotionTimestamp={liveSession.latestEmotionTimestamp}
        latestSnapshotTimestamp={liveSession.latestSnapshotTimestamp}
        isFetching={isFetching}
      />

      <div className="command-center__body">
        <section className="command-center__panel command-center__panel--main section-card">
          <EmotionTimeline
            timeline={liveSession.timeline}
            selectedSnapshotTimestamp={activeSnapshotTimestamp}
            onPointSelect={handleTimelineSelect}
            isFetching={isFetching}
            hasData={liveSession.hasData}
          />
        </section>

        <aside className="command-center__panel command-center__panel--side section-card">
          <SnapshotPanel
            snapshots={liveSession.snapshots}
            selectedSnapshotTimestamp={activeSnapshotTimestamp}
            onSelectSnapshot={setSelectedSnapshotTimestamp}
            activeSnapshot={activeSnapshot}
            isConnected={liveSession.hasData}
          />
        </aside>
      </div>

      <InsightsPanel session={session} insights={liveSession.insights} />

      {isLoading || !liveSession.hasData ?
        <div className="command-center__connecting">
          <span className="command-center__connecting-dot" />
          <p>Connecting to AI stream...</p>
        </div>
      : null}
    </div>
  );
}
