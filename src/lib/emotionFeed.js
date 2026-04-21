export const EMOTIONS = {
  happy: { label: "Happy", emoji: "😊", color: "#facc15", value: 1 },
  neutral: { label: "Neutral", emoji: "◦", color: "#22d3ee", value: 2 },
  sad: { label: "Sad", emoji: "🌧", color: "#60a5fa", value: 3 },
  angry: { label: "Angry", emoji: "🔥", color: "#ef4444", value: 4 },
  surprised: { label: "Surprised", emoji: "⚡", color: "#a855f7", value: 5 },
};

const API_HEADERS = {
  Accept: "application/json",
};

const DEFAULT_API_BASE_URL = "/api";

function normalizeBaseUrl(baseUrl) {
  return String(baseUrl ?? DEFAULT_API_BASE_URL).replace(/\/$/, "");
}

function buildApiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

  if (/^https?:\/\//i.test(baseUrl)) {
    return `${baseUrl}${normalizedPath}`;
  }

  return `${baseUrl}${normalizedPath}`;
}

export function getEmotionMeta(emotion) {
  return (
    EMOTIONS[emotion] ?? {
      label: emotion ? String(emotion) : "Unknown",
      emoji: "◦",
      color: "#94a3b8",
      value: 2,
    }
  );
}

export function formatTimeLabel(timestamp) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(timestamp));
}

export function formatDateTime(timestamp) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(timestamp));
}

export function formatDuration(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remaining = safeSeconds % 60;

  return [hours, minutes, remaining]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

async function requestJson(path, sessionId) {
  if (!sessionId) {
    throw new Error("sessionId is required");
  }

  const url = new URL(buildApiUrl(path), window.location.origin);
  url.searchParams.set("sessionId", sessionId);

  const response = await fetch(url, {
    headers: API_HEADERS,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export function fetchEmotionTimeline(sessionId) {
  return requestJson("/emotions", sessionId);
}

export function fetchSnapshots(sessionId) {
  return requestJson("/snapshots", sessionId);
}

export function fetchSummary(sessionId) {
  return requestJson("/summary", sessionId);
}

export function mergeByTimestamp(
  previousItems,
  incomingItems,
  limit = 30,
  order = "asc",
) {
  const map = new Map();

  for (const item of previousItems) {
    map.set(item.timestamp, item);
  }

  for (const item of incomingItems) {
    map.set(item.timestamp, item);
  }

  const merged = [...map.values()].sort((left, right) => {
    if (order === "desc") {
      return right.timestamp - left.timestamp;
    }

    return left.timestamp - right.timestamp;
  });

  return merged.slice(
    order === "desc" ? 0 : Math.max(0, merged.length - limit),
    order === "desc" ? limit : merged.length,
  );
}

export function calculateDistribution(timeline) {
  const counts = Object.keys(EMOTIONS).reduce((accumulator, emotion) => {
    accumulator[emotion] = 0;
    return accumulator;
  }, {});

  timeline.forEach((point) => {
    if (counts[point.emotion] != null) {
      counts[point.emotion] += 1;
    }
  });

  const total = Math.max(1, timeline.length);

  return Object.entries(counts).map(([emotion, count]) => ({
    emotion,
    ...getEmotionMeta(emotion),
    count,
    percentage: Math.round((count / total) * 100),
  }));
}

export function calculateStabilityScore(
  timeline,
  transitionsCount,
  avgConfidence,
) {
  if (!timeline.length) {
    return 0;
  }

  const volatility = timeline.reduce((total, point, index) => {
    if (index === 0) {
      return total;
    }

    return total + Math.abs(point.value - timeline[index - 1].value);
  }, 0);

  const transitionRate = transitionsCount / Math.max(1, timeline.length);
  const confidencePenalty = (1 - avgConfidence) * 36;
  const volatilityPenalty =
    (volatility / Math.max(1, timeline.length - 1)) * 10;

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 - transitionRate * 52 - confidencePenalty - volatilityPenalty,
      ),
    ),
  );
}

export function buildInsights({
  stabilityScore,
  transitionsCount,
  avgConfidence,
  dominantEmotion,
  snapshotsCount,
  latestSnapshotAgeSeconds,
}) {
  const insights = [];

  insights.push(
    stabilityScore >= 75 ? "User is emotionally stable."
    : stabilityScore >= 50 ? "Moderate fluctuation detected."
    : "High fluctuation detected.",
  );

  if (transitionsCount >= 4) {
    insights.push("Frequent emotion changes suggest active behavioral shifts.");
  }

  insights.push(
    avgConfidence >= 0.88 ?
      "Confidence is consistently high across the live stream."
    : "Confidence variance remains within the monitored operating envelope.",
  );

  insights.push(
    dominantEmotion === "happy" || dominantEmotion === "surprised" ?
      "Positive trend observed across recent emotion telemetry."
    : dominantEmotion === "angry" || dominantEmotion === "sad" ?
      "High fluctuation detected in the current emotional band."
    : "Neutral and reactive states remain balanced without drift.",
  );

  if (snapshotsCount > 0 && latestSnapshotAgeSeconds != null) {
    insights.push(
      latestSnapshotAgeSeconds <= 4 ?
        "Snapshot capture is synchronized with the emotion stream."
      : "Snapshot capture cadence is lagging behind the live stream.",
    );
  }

  return insights.slice(0, 3);
}

export function normalizeEmotionTimeline(rawTimeline) {
  if (!Array.isArray(rawTimeline)) {
    return [];
  }

  return rawTimeline
    .filter((point) => point && point.timestamp != null)
    .map((point) => {
      const emotionMeta = getEmotionMeta(point.emotion);

      return {
        timestamp: point.timestamp,
        timeLabel: formatTimeLabel(point.timestamp),
        emotion: point.emotion,
        label: emotionMeta.label,
        emoji: emotionMeta.emoji,
        color: emotionMeta.color,
        value: emotionMeta.value,
        confidence: Number(point.confidence) || 0,
      };
    });
}

export function normalizeSnapshots(rawSnapshots) {
  if (!Array.isArray(rawSnapshots)) {
    return [];
  }

  return rawSnapshots
    .filter(
      (snapshot) => snapshot && snapshot.timestamp != null && snapshot.imageUrl,
    )
    .map((snapshot) => ({
      imageUrl: snapshot.imageUrl,
      emotion: snapshot.emotion,
      ...getEmotionMeta(snapshot.emotion),
      confidence: Number(snapshot.confidence) || 0,
      timestamp: snapshot.timestamp,
      timeLabel: formatDateTime(snapshot.timestamp),
    }))
    .sort((left, right) => right.timestamp - left.timestamp);
}

export function findClosestSnapshot(snapshots, timestamp) {
  if (
    !Array.isArray(snapshots) ||
    snapshots.length === 0 ||
    timestamp == null
  ) {
    return null;
  }

  return snapshots.reduce((winner, snapshot) => {
    if (!winner) {
      return snapshot;
    }

    const currentDistance = Math.abs(snapshot.timestamp - timestamp);
    const winnerDistance = Math.abs(winner.timestamp - timestamp);
    return currentDistance < winnerDistance ? snapshot : winner;
  }, null);
}

export function calculateSessionDuration(timeline) {
  if (!Array.isArray(timeline) || timeline.length < 2) {
    return 0;
  }

  const start = timeline[0]?.timestamp ?? 0;
  const end = timeline.at(-1)?.timestamp ?? 0;
  return Math.max(0, Math.round((end - start) / 1000));
}
