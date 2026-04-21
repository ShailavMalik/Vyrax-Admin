import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ApiError,
  fetchEmotions,
  fetchSnapshots,
  fetchSummary,
} from "../lib/apiClient.js";
import { formatDateTime, getEmotionMeta } from "../lib/emotionFeed.js";

function toTimestampMs(value) {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

function normalizeSnapshots(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      const timestampMs = toTimestampMs(item.timestamp);
      if (timestampMs == null) {
        return null;
      }

      return {
        ...item,
        timestampMs,
        timestampLabel: formatDateTime(item.timestamp),
        emotionMeta: getEmotionMeta(item.emotion),
        confidencePercent: (Number(item.confidence || 0) * 100).toFixed(1),
        sizeKbLabel: (Number(item.sizeBytes || 0) / 1024).toFixed(1),
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.timestampMs - left.timestampMs);
}

function normalizeEmotions(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      const timestampMs = toTimestampMs(item.timestamp);
      if (timestampMs == null) {
        return null;
      }

      return {
        ...item,
        timestampMs,
        timestampLabel: formatDateTime(item.timestamp),
        emotionMeta: getEmotionMeta(item.emotion),
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.timestampMs - right.timestampMs);
}

function normalizeSummary(summaryPayload) {
  if (Array.isArray(summaryPayload)) {
    return summaryPayload;
  }

  if (summaryPayload && typeof summaryPayload === "object") {
    return [summaryPayload];
  }

  return [];
}

function toUiError(error) {
  if (!error) {
    return null;
  }

  const status = error instanceof ApiError ? error.status : null;
  if (status === 503) {
    return {
      title: "Service unavailable",
      message:
        "The backend service is currently unavailable. Please retry in a moment.",
    };
  }

  return {
    title: "Backend request failed",
    message: error.message || "Unexpected backend error",
  };
}

export function useEmotionDashboard() {
  const [sessionId, setSessionId] = useState("");
  const [limit, setLimit] = useState("all");
  const trimmedSessionId = sessionId.trim();

  const emotionsQuery = useQuery({
    queryKey: ["emotion-dashboard", "emotions", trimmedSessionId, limit],
    queryFn: () => fetchEmotions(trimmedSessionId || undefined, limit),
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    staleTime: 1500,
    placeholderData: (previousData) => previousData,
  });

  const snapshotsQuery = useQuery({
    queryKey: ["emotion-dashboard", "snapshots", trimmedSessionId, limit],
    queryFn: () => fetchSnapshots(trimmedSessionId || undefined, limit),
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    staleTime: 1500,
    placeholderData: (previousData) => previousData,
  });

  const summaryQuery = useQuery({
    queryKey: ["emotion-dashboard", "summary", trimmedSessionId],
    queryFn: () => fetchSummary(trimmedSessionId || undefined),
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    staleTime: 1500,
    placeholderData: (previousData) => previousData,
  });

  const normalizedEmotions = useMemo(
    () => normalizeEmotions(emotionsQuery.data),
    [emotionsQuery.data],
  );

  const normalizedSnapshots = useMemo(
    () => normalizeSnapshots(snapshotsQuery.data),
    [snapshotsQuery.data],
  );

  const summaries = useMemo(
    () => normalizeSummary(summaryQuery.data),
    [summaryQuery.data],
  );

  const latestSnapshotReason = useMemo(
    () => normalizedSnapshots[0]?.reason || null,
    [normalizedSnapshots],
  );

  const latestSnapshotLogs = useMemo(
    () =>
      normalizedSnapshots
        .filter((item) => item.reason)
        .slice(0, 10)
        .map((item) => ({
          sessionId: item.sessionId,
          reason: item.reason,
          timestamp: item.timestamp,
          timestampLabel: item.timestampLabel,
        })),
    [normalizedSnapshots],
  );

  const error = toUiError(
    emotionsQuery.error || snapshotsQuery.error || summaryQuery.error,
  );

  const data = useMemo(
    () => ({
      sessionId: trimmedSessionId,
      limit,
      emotions: normalizedEmotions,
      snapshots: normalizedSnapshots,
      summaries,
      latestSnapshotReason,
      latestSnapshotLogs,
      hasData:
        normalizedEmotions.length > 0 ||
        normalizedSnapshots.length > 0 ||
        summaries.length > 0,
    }),
    [
      trimmedSessionId,
      limit,
      normalizedEmotions,
      normalizedSnapshots,
      summaries,
      latestSnapshotReason,
      latestSnapshotLogs,
    ],
  );

  const refetch = useCallback(async () => {
    await Promise.all([
      emotionsQuery.refetch(),
      snapshotsQuery.refetch(),
      summaryQuery.refetch(),
    ]);
  }, [emotionsQuery, snapshotsQuery, summaryQuery]);

  return {
    data,
    error,
    isLoading:
      emotionsQuery.isLoading ||
      snapshotsQuery.isLoading ||
      summaryQuery.isLoading,
    isFetching:
      emotionsQuery.isFetching ||
      snapshotsQuery.isFetching ||
      summaryQuery.isFetching,
    refetch,
    sessionId,
    setSessionId,
    limit,
    setLimit,
  };
}
