import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSnapshots } from "../lib/apiClient.js";
import { formatDateTime, getEmotionMeta } from "../lib/emotionFeed.js";

function normalizeSnapshots(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      const timestamp = new Date(item.timestamp);
      if (Number.isNaN(timestamp.getTime())) {
        return null;
      }

      return {
        ...item,
        timestampMs: timestamp.getTime(),
        timestampLabel: formatDateTime(item.timestamp),
        emotionMeta: getEmotionMeta(item.emotion),
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.timestampMs - left.timestampMs);
}

export function SnapshotGalleryPage() {
  const [sessionId, setSessionId] = useState("");
  const trimmedSessionId = sessionId.trim();

  const query = useQuery({
    queryKey: ["snapshot-gallery", trimmedSessionId],
    queryFn: () => fetchSnapshots(trimmedSessionId || undefined, "all"),
    refetchInterval: 4000,
    refetchOnWindowFocus: false,
    staleTime: 2000,
    placeholderData: (previousData) => previousData,
  });

  const snapshots = normalizeSnapshots(query.data);

  return (
    <main className="snapshot-gallery-page">
      <header className="snapshot-gallery-page__hero">
        <div>
          <span className="snapshot-gallery-page__eyebrow">Archive</span>
          <h1>Snapshot vault</h1>
          <p>
            Full visual history from MongoDB with high-visibility cards and live
            refresh.
          </p>
        </div>
        <div className="snapshot-gallery-page__actions">
          <label>
            Session ID
            <input
              value={sessionId}
              onChange={(event) => setSessionId(event.target.value)}
              placeholder="optional"
              type="text"
            />
          </label>
          <button type="button" onClick={() => query.refetch()}>
            Refresh gallery
          </button>
        </div>
      </header>

      {query.isError ?
        <section className="snapshot-gallery-page__error">
          Failed to load snapshots. Try refresh.
        </section>
      : null}

      <section className="snapshot-gallery-grid">
        {snapshots.map((snapshot) => (
          <article
            className="snapshot-gallery-card"
            key={`${snapshot.timestamp}-${snapshot.sessionId}-${snapshot.blobName || "snapshot"}`}>
            {snapshot.imageUrl ?
              <a href={snapshot.imageUrl} target="_blank" rel="noreferrer">
                <img
                  className="snapshot-gallery-card__image"
                  src={snapshot.imageUrl}
                  alt={`${snapshot.emotionMeta.label} snapshot`}
                  loading="lazy"
                />
              </a>
            : <div className="snapshot-gallery-card__placeholder">
                No preview
              </div>
            }
            <div className="snapshot-gallery-card__meta">
              <h3>
                {snapshot.emotionMeta.emoji} {snapshot.emotionMeta.label}
              </h3>
              <p>{snapshot.timestampLabel}</p>
              <span>
                {Number(snapshot.confidence || 0).toFixed(3)} confidence ·{" "}
                {snapshot.sessionId}
              </span>
            </div>
          </article>
        ))}
      </section>

      {!query.isLoading && snapshots.length === 0 ?
        <div className="snapshot-gallery-page__empty">No snapshots found.</div>
      : null}
    </main>
  );
}
