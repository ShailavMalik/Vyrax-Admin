import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  buildInsights,
  calculateDistribution,
  calculateStabilityScore,
  fetchEmotionTimeline,
  fetchSnapshots,
  fetchSummary,
  fetchSystemStatus,
  formatDuration,
  getEmotionMeta,
  mergeByTimestamp,
  normalizeEmotionTimeline,
  normalizeSnapshots,
} from "../lib/emotionFeed.js";
import { getSessionId } from "../lib/session.js";

function enrichTimeline(timeline, snapshots) {
  const snapshotMap = new Map(
    snapshots.map((snapshot) => [snapshot.timestamp, snapshot]),
  );

  const peakPoint = timeline.reduce(
    (winner, point) => {
      const score = point.confidence * point.value;
      return score > winner.score ? { score, point } : winner;
    },
    { score: 0, point: timeline.at(-1) ?? null },
  ).point;

  return timeline.map((point) => {
    const snapshot = snapshotMap.get(point.timestamp) ?? null;

    return {
      ...point,
      snapshotTimestamp: snapshot?.timestamp ?? null,
      snapshotImageUrl: snapshot?.imageUrl ?? null,
      snapshotAvailable: Boolean(snapshot),
      isPeak: peakPoint ? peakPoint.timestamp === point.timestamp : false,
    };
  });
}

function deriveSummary(timeline, summaryPayload) {
  const totalEvents = summaryPayload?.totalEvents ?? timeline.length;
  const dominantEmotion =
    summaryPayload?.dominantEmotion ??
    (timeline.length ?
      (calculateDistribution(timeline).reduce((winner, entry) => {
        return entry.count > (winner?.count ?? -1) ? entry : winner;
      }, null)?.emotion ?? null)
    : null);

  const avgConfidence =
    typeof summaryPayload?.avgConfidence === "number" ?
      summaryPayload.avgConfidence
    : timeline.length ?
      timeline.reduce((total, point) => total + point.confidence, 0) /
      timeline.length
    : 0;

  const transitions = summaryPayload?.transitions ?? 0;
  const firstTimestamp = timeline[0]?.timestamp ?? null;
  const lastTimestamp = timeline.at(-1)?.timestamp ?? null;
  const sessionDurationSeconds =
    firstTimestamp && lastTimestamp ?
      Math.max(0, Math.round((lastTimestamp - firstTimestamp) / 1000))
    : 0;
  const stabilityScore = calculateStabilityScore(
    timeline,
    transitions,
    avgConfidence,
  );
  const stabilityLabel =
    stabilityScore >= 75 ? "High"
    : stabilityScore >= 50 ? "Medium"
    : "Low";
  const peakPoint = timeline.reduce(
    (winner, point) => {
      const score = point.confidence * point.value;
      return score > winner.score ? { score, point } : winner;
    },
    { score: 0, point: null },
  ).point;

  return {
    dominantEmotion,
    avgConfidence,
    totalEvents,
    transitions,
    sessionDurationSeconds,
    sessionDurationLabel: formatDuration(sessionDurationSeconds),
    currentEmotion: timeline.at(-1)?.emotion ?? null,
    currentConfidence: timeline.at(-1)?.confidence ?? null,
    dominantEmotionLabel:
      dominantEmotion ? getEmotionMeta(dominantEmotion).label : "—",
    dominantEmotionEmoji:
      dominantEmotion ? getEmotionMeta(dominantEmotion).emoji : "—",
    averageConfidenceLabel: `${Math.round(avgConfidence * 100)}%`,
    transitionsLabel: String(transitions),
    peakMoment:
      peakPoint ?
        `${getEmotionMeta(peakPoint.emotion).emoji} ${getEmotionMeta(peakPoint.emotion).label}`
      : "—",
    peakConfidenceTime: peakPoint ? peakPoint.timeLabel : "—",
    mostFrequentEmotion:
      timeline.length ?
        (calculateDistribution(timeline).reduce((winner, entry) => {
          return entry.count > (winner?.count ?? -1) ? entry : winner;
        }, null)?.label ?? "—")
      : "—",
    stabilityScore,
    stabilityLabel,
  };
}

export function useEmotionDashboard() {
  const [sessionId, setSessionId] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  const emotionsQuery = useQuery({
    queryKey: ["emotion-dashboard", sessionId, "emotions"],
    queryFn: () => fetchEmotionTimeline(sessionId),
    enabled: Boolean(sessionId),
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    staleTime: 1800,
    placeholderData: (previousData) => previousData,
  });

  const snapshotsQuery = useQuery({
    queryKey: ["emotion-dashboard", sessionId, "snapshots"],
    queryFn: () => fetchSnapshots(sessionId),
    enabled: Boolean(sessionId),
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    staleTime: 1800,
    placeholderData: (previousData) => previousData,
  });

  const summaryQuery = useQuery({
    queryKey: ["emotion-dashboard", sessionId, "summary"],
    queryFn: () => fetchSummary(sessionId),
    enabled: Boolean(sessionId),
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    staleTime: 1800,
    placeholderData: (previousData) => previousData,
  });

  const systemQuery = useQuery({
    queryKey: ["emotion-dashboard", sessionId, "system"],
    queryFn: () => fetchSystemStatus(sessionId),
    enabled: Boolean(sessionId),
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    staleTime: 1800,
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (!emotionsQuery.data) {
      return;
    }

    const normalizedTimeline = normalizeEmotionTimeline(emotionsQuery.data);
    setTimeline((previousTimeline) =>
      mergeByTimestamp(previousTimeline, normalizedTimeline, 30, "asc"),
    );
  }, [emotionsQuery.data]);

  useEffect(() => {
    if (!snapshotsQuery.data) {
      return;
    }

    const normalizedSnapshots = normalizeSnapshots(snapshotsQuery.data);
    setSnapshots((previousSnapshots) =>
      mergeByTimestamp(previousSnapshots, normalizedSnapshots, 8, "desc"),
    );
  }, [snapshotsQuery.data]);

  const enrichedTimeline = useMemo(
    () => enrichTimeline(timeline, snapshots),
    [timeline, snapshots],
  );

  const summary = useMemo(
    () => deriveSummary(enrichedTimeline, summaryQuery.data),
    [enrichedTimeline, summaryQuery.data],
  );

  const distribution = useMemo(
    () => calculateDistribution(enrichedTimeline),
    [enrichedTimeline],
  );

  const insights = useMemo(
    () =>
      buildInsights({
        stabilityScore: summary.stabilityScore,
        transitionsCount: summary.transitions,
        avgConfidence: summary.avgConfidence,
        dominantEmotion: summary.dominantEmotion,
      }),
    [summary],
  );

  const data = useMemo(
    () => ({
      sessionId,
      timeline: enrichedTimeline,
      snapshots,
      summary,
      distribution,
      insights,
      system: systemQuery.data ?? null,
      cloudflare: systemQuery.data?.cloudflare ?? null,
      hasData: enrichedTimeline.length > 0,
    }),
    [
      sessionId,
      enrichedTimeline,
      snapshots,
      summary,
      distribution,
      insights,
      systemQuery.data,
    ],
  );

  const refetch = useCallback(async () => {
    await Promise.all([
      emotionsQuery.refetch(),
      snapshotsQuery.refetch(),
      summaryQuery.refetch(),
      systemQuery.refetch(),
    ]);
  }, [emotionsQuery, snapshotsQuery, summaryQuery, systemQuery]);

  return {
    data,
    isLoading:
      emotionsQuery.isLoading ||
      snapshotsQuery.isLoading ||
      summaryQuery.isLoading ||
      systemQuery.isLoading,
    isFetching:
      emotionsQuery.isFetching ||
      snapshotsQuery.isFetching ||
      summaryQuery.isFetching ||
      systemQuery.isFetching,
    refetch,
  };
}
