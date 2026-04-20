import { useState } from "react";
import { useEmotionDashboard } from "../hooks/useEmotionDashboard.js";
import { CloudflarePanel } from "./CloudflarePanel.jsx";
import { EmotionTimeline } from "./EmotionTimeline.jsx";
import { LiveIndicator } from "./LiveIndicator.jsx";
import { RefreshButton } from "./RefreshButton.jsx";
import { SnapshotPanel } from "./SnapshotPanel.jsx";

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
    system: null,
    cloudflare: null,
    hasData: false,
  };

  const session = liveSession.summary;
  const activeSnapshotTimestamp =
    selectedSnapshotTimestamp ?? liveSession.snapshots[0]?.timestamp ?? null;

  return (
    <div className="neural-console">
      <div className="soft-grid" aria-hidden="true" />
      
      {/* TOP HEADER */}
      <header className="console-header">
        <div className="console-header__left">
          <h1 className="console-title">Vyra-X Neural Console</h1>
          <p className="console-subtitle">AI Emotion Monitoring System</p>
        </div>
        
        <div className="console-header__right">
          <LiveIndicator isFetching={isFetching} />
          <RefreshButton onClick={() => refetch()} isFetching={isFetching} />
        </div>
      </header>

      {/* MAIN CONTENT - NO SCROLL ABOVE FOLD */}
      <div className="console-viewport">
        {/* LEFT: GRAPH (65%) */}
        <section className="console-graph-section">
          <div className="graph-container">
            <EmotionTimeline
              timeline={liveSession.timeline}
              selectedSnapshotTimestamp={activeSnapshotTimestamp}
              onSnapshotSelect={setSelectedSnapshotTimestamp}
              isConnected={liveSession.hasData}
            />
          </div>
        </section>

        {/* RIGHT: SNAPSHOT PANEL (35%) */}
        <section className="console-snapshot-section">
          <SnapshotPanel
            snapshots={liveSession.snapshots}
            selectedSnapshotTimestamp={activeSnapshotTimestamp}
            onSelectSnapshot={setSelectedSnapshotTimestamp}
            isConnected={liveSession.hasData}
          />
        </section>
      </div>

      {/* BOTTOM: COMPACT CARDS */}
      <div className="console-footer">
        <div className="compact-metrics">
          <div className="metric-compact">
            <span className="metric-label">Current</span>
            <strong className="metric-value">{session.currentEmotion ? `${session.currentEmotion} ${session.currentConfidence ? `${Math.round(session.currentConfidence * 100)}%` : ''}` : '—'}</strong>
          </div>
          
          <div className="metric-compact">
            <span className="metric-label">Dominant</span>
            <strong className="metric-value">{session.dominantEmotionEmoji} {session.dominantEmotionLabel}</strong>
          </div>
          
          <div className="metric-compact">
            <span className="metric-label">Duration</span>
            <strong className="metric-value">{session.sessionDurationLabel}</strong>
          </div>
          
          <div className="metric-compact">
            <span className="metric-label">Transitions</span>
            <strong className="metric-value">{session.transitions}</strong>
          </div>
          
          <div className="metric-compact">
            <span className="metric-label">Stability</span>
            <strong className="metric-value">{session.stabilityLabel}</strong>
          </div>

          <div className="metric-compact">
            <span className="metric-label">System</span>
            <strong className="metric-value">{liveSession.system?.status ?? 'Offline'}</strong>
          </div>
        </div>

        {/* CLOUDFLARE STATS */}
        <div className="cloudflare-stats">
          <CloudflarePanel cloudflare={liveSession.cloudflare} />
        </div>
      </div>

      {/* LOADING STATE */}
      {isLoading || !liveSession.hasData ?
        <div className="console-connecting">
          <div className="connecting-dot"></div>
          <p>Connecting to AI stream...</p>
        </div>
      : null}
    </div>
  );
}
