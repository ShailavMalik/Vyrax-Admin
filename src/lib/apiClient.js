/**
 * @typedef {Object} SnapshotItem
 * @property {string} sessionId
 * @property {string} imageUrl
 * @property {string} emotion
 * @property {number} confidence
 * @property {string} timestamp
 * @property {string|null} blobName
 * @property {string} contentType
 * @property {number} sizeBytes
 * @property {string|null} [reason]
 */

/**
 * @typedef {Object} EmotionItem
 * @property {string} sessionId
 * @property {string} emotion
 * @property {number} confidence
 * @property {string} timestamp
 */

/**
 * @typedef {Object} SessionSummary
 * @property {string} sessionId
 * @property {string|null} startTime
 * @property {string|null} endTime
 * @property {number} totalEvents
 * @property {string} dominantEmotion
 * @property {number} avgConfidence
 * @property {string} updatedAt
 */

const DEFAULT_BASE_URL = "http://localhost:8000";

function getBaseUrl() {
  return String(import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL).replace(
    /\/$/,
    "",
  );
}

function toApiUrl(path, params = {}) {
  const url = new URL(
    `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`,
  );

  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === "") {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url;
}

function clampLimit(value, fallback, max) {
  if (
    String(value ?? "")
      .trim()
      .toLowerCase() === "all"
  ) {
    return "all";
  }

  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.min(parsed, max);
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function requestJson(path, params) {
  const response = await fetch(toApiUrl(path, params), {
    headers: { Accept: "application/json" },
  });

  const contentType = response.headers.get("content-type") || "";
  const body =
    contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const apiMessage = body?.error || body?.message;
    throw new ApiError(
      apiMessage || `Request failed (${response.status})`,
      response.status,
    );
  }

  if (body?.error) {
    throw new ApiError(String(body.error), response.status);
  }

  return body;
}

/** @returns {Promise<SnapshotItem[]>} */
export async function fetchSnapshots(sessionId, limit) {
  const safeLimit = clampLimit(limit, 100, 1000);
  const payload = await requestJson("/snapshots", {
    sessionId,
    limit: safeLimit,
  });

  return Array.isArray(payload?.items) ? payload.items : [];
}

/** @returns {Promise<EmotionItem[]>} */
export async function fetchEmotions(sessionId, limit) {
  const safeLimit = clampLimit(limit, 500, 5000);
  const payload = await requestJson("/emotions", {
    sessionId,
    limit: safeLimit,
  });

  return Array.isArray(payload?.items) ? payload.items : [];
}

/** @returns {Promise<SessionSummary|SessionSummary[]>} */
export async function fetchSummary(sessionId) {
  const payload = await requestJson("/summary", {
    sessionId,
    limit: "all",
  });
  return payload?.summary ?? (sessionId ? null : []);
}
