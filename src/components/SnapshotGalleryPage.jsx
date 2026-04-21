import { useEffect, useMemo, useState } from "react";
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
  const [activeEmotion, setActiveEmotion] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [lightboxSnapshot, setLightboxSnapshot] = useState(null);
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

  const emotionOptions = useMemo(() => {
    const uniqueEmotions = [...new Set(snapshots.map((snapshot) => snapshot.emotion))];
    return ["all", ...uniqueEmotions];
  }, [snapshots]);

  const filteredSnapshots = useMemo(() => {
    const fromTimestamp = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;
    const toTimestamp = toDate ? new Date(`${toDate}T23:59:59`).getTime() : null;

    return snapshots.filter((snapshot) => {
      if (activeEmotion !== "all" && snapshot.emotion !== activeEmotion) {
        return false;
      }

      if (fromTimestamp != null && snapshot.timestampMs < fromTimestamp) {
        return false;
      }

      if (toTimestamp != null && snapshot.timestampMs > toTimestamp) {
        return false;
      }

      return true;
    });
  }, [snapshots, activeEmotion, fromDate, toDate]);

  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        setLightboxSnapshot(null);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

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
          <div className="snapshot-gallery-page__dates">
            <label>
              From
              <input
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                type="date"
              />
            </label>
            <label>
              To
              <input
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                type="date"
              />
            </label>
          </div>
          <button type="button" onClick={() => query.refetch()}>
            Refresh gallery
          </button>
        </div>
      </header>

      <section className="snapshot-gallery-filters">
        {emotionOptions.map((emotion) => {
          const meta = getEmotionMeta(emotion === "all" ? "neutral" : emotion);
          const isActive = activeEmotion === emotion;

          return (
            <button
              className={`snapshot-gallery-chip ${isActive ? "snapshot-gallery-chip--active" : ""}`}
              key={emotion}
              onClick={() => setActiveEmotion(emotion)}
              style={{ borderColor: meta.color }}
              type="button">
              <span style={{ color: meta.color }}>{emotion === "all" ? "◎" : meta.emoji}</span>
              <span>{emotion === "all" ? "All emotions" : meta.label}</span>
            </button>
          );
        })}
      </section>

      {query.isError ?
        <section className="snapshot-gallery-page__error">
          Failed to load snapshots. Try refresh.
        </section>
      : null}

      <section className="snapshot-gallery-grid snapshot-gallery-grid--masonry">
        {filteredSnapshots.map((snapshot) => (
          <article
            className="snapshot-gallery-card"
            key={`${snapshot.timestamp}-${snapshot.sessionId}-${snapshot.blobName || "snapshot"}`}>
            {snapshot.imageUrl ?
              <button
                className="snapshot-gallery-card__zoom-trigger"
                onClick={() => setLightboxSnapshot(snapshot)}
                type="button">
                <img
                  className="snapshot-gallery-card__image"
                  src={snapshot.imageUrl}
                  alt={`${snapshot.emotionMeta.label} snapshot`}
                  loading="lazy"
                />
              </button>
            : <div className="snapshot-gallery-card__placeholder">No preview</div>
            }
            <div className="snapshot-gallery-card__meta">
              <h3>
                {snapshot.emotionMeta.emoji} {snapshot.emotionMeta.label}
              </h3>
              <p>{snapshot.timestampLabel}</p>
              <span>
                {Number(snapshot.confidence || 0).toFixed(3)} confidence · {snapshot.sessionId}
              </span>
            </div>
          </article>
        ))}
      </section>

      {!query.isLoading && filteredSnapshots.length === 0 ?
        <div className="snapshot-gallery-page__empty">No snapshots found.</div>
      : null}

      {lightboxSnapshot ?
        <div
          className="snapshot-lightbox"
          onClick={() => setLightboxSnapshot(null)}
          role="presentation">
          <div
            className="snapshot-lightbox__content"
            onClick={(event) => event.stopPropagation()}
            role="presentation">
            <button
              className="snapshot-lightbox__close"
              onClick={() => setLightboxSnapshot(null)}
              type="button">
              Close
            </button>
            {lightboxSnapshot.imageUrl ?
              <img
                className="snapshot-lightbox__image"
                src={lightboxSnapshot.imageUrl}
                alt={`${lightboxSnapshot.emotionMeta.label} snapshot`}
              />
            : null}
            <div className="snapshot-lightbox__meta">
              <strong>
                {lightboxSnapshot.emotionMeta.emoji} {lightboxSnapshot.emotionMeta.label}
              </strong>
              <span>{lightboxSnapshot.timestampLabel}</span>
            </div>
          </div>
        </div>
      : null}
    </main>
  );
}
