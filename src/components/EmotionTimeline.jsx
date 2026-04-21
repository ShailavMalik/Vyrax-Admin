import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EMOTIONS } from "../lib/emotionFeed.js";

function TimelineTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;
  if (!point) {
    return null;
  }

  const emotionRows = Object.keys(EMOTIONS)
    .map((emotion) => ({ emotion, confidence: point[emotion] }))
    .filter((row) => typeof row.confidence === "number");

  return (
    <div className="tooltip-card">
      <p className="tooltip-card__title">{point.timestampLabel}</p>
      {emotionRows.map((row) => (
        <p className="tooltip-card__line" key={row.emotion}>
          {EMOTIONS[row.emotion].emoji} {EMOTIONS[row.emotion].label}:{" "}
          {(row.confidence * 100).toFixed(1)}%
        </p>
      ))}
    </div>
  );
}

export function EmotionTimeline({
  emotions,
  isConnected,
  isFetching,
  hasData,
}) {
  const chartData = useMemo(
    () =>
      emotions.map((point) => ({
        timestampLabel: point.timestampLabel,
        [point.emotion]: Number(point.confidence || 0),
      })),
    [emotions],
  );

  if (!chartData.length) {
    return (
      <div className="timeline-empty">
        <div
          className={`timeline-empty__dot ${isFetching ? "timeline-empty__dot--active" : ""}`}
        />
        <p>
          {hasData ?
            "Waiting for the next emotion frame..."
          : "Connecting to AI stream..."}
        </p>
        <span>Polling every 2 seconds from the backend API</span>
      </div>
    );
  }

  const chartLegend = Object.entries(EMOTIONS).map(([emotion, meta]) => ({
    emotion,
    label: `${meta.emoji} ${meta.label}`,
    color: meta.color,
  }));

  return (
    <div className="timeline-chart-wrapper">
      <div className="chart-topline">
        <div className="chart-legend">
          {chartLegend.map((entry) => (
            <span className="mini-chip" key={entry.emotion}>
              <span
                className="mini-chip__dot"
                style={{ background: entry.color }}
              />
              {entry.label}
            </span>
          ))}
        </div>
        <span className="chart-meta">
          {isConnected ? "Connected" : "Searching"} · Confidence by emotion over
          time
        </span>
      </div>

      <div className="timeline-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 18, right: 20, bottom: 20, left: -12 }}>
            <defs>
              <linearGradient id="emotionStroke" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
              <filter id="glowEffect">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid
              stroke="rgba(148, 163, 184, 0.16)"
              strokeDasharray="6 10"
              vertical={false}
            />
            <XAxis
              dataKey="timestampLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={14}
              minTickGap={20}
              stroke="rgba(148, 163, 184, 0.82)"
              style={{ fontSize: "0.85rem" }}
            />
            <YAxis
              type="number"
              tickLine={false}
              axisLine={false}
              domain={[0, 1]}
              ticks={[0, 0.25, 0.5, 0.75, 1]}
              tickFormatter={(value) => `${Math.round(value * 100)}%`}
              stroke="rgba(148, 163, 184, 0.82)"
              style={{ fontSize: "0.85rem" }}
            />
            <Tooltip content={<TimelineTooltip />} />
            {Object.entries(EMOTIONS).map(([emotion, meta]) => (
              <Line
                key={emotion}
                type="monotone"
                dataKey={emotion}
                stroke={meta.color}
                strokeWidth={2.6}
                connectNulls={false}
                dot={false}
                isAnimationActive={true}
                animationDuration={600}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="timeline-stats">
        <div className="timeline-stat">
          <span>Now</span>
          <strong>
            {emotions.length ?
              `${emotions.at(-1).emotionMeta.emoji} ${emotions.at(-1).emotionMeta.label}`
            : "—"}
          </strong>
        </div>
        <div className="timeline-stat">
          <span>Points</span>
          <strong>{emotions.length}</strong>
        </div>
        <div className="timeline-stat">
          <span>Live</span>
          <strong>{isFetching ? "Syncing" : "Ready"}</strong>
        </div>
      </div>
    </div>
  );
}
