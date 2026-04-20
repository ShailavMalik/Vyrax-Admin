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

  const point = payload[0].payload;

  return (
    <div className="tooltip-card">
      <p className="tooltip-card__title">
        {point.emoji} {point.label}
      </p>
      <p className="tooltip-card__line">
        Confidence: {Math.round(point.confidence * 100)}%
      </p>
      <p className="tooltip-card__line">Timestamp: {point.timeLabel}</p>
      <p className="tooltip-card__line">
        Snapshot: {point.snapshotAvailable ? "Available" : "Not stored"}
      </p>
    </div>
  );
}

function TimelineDot({
  cx,
  cy,
  payload,
  onSnapshotSelect,
  selectedSnapshotTimestamp,
}) {
  if (cx == null || cy == null || !payload) {
    return null;
  }

  const emotion = EMOTIONS[payload.emotion] ?? EMOTIONS.neutral;
  const isSelected = payload.snapshotTimestamp === selectedSnapshotTimestamp;
  const isHot = payload.isPeak || isSelected;

  return (
    <g
      style={{ cursor: payload.snapshotTimestamp ? "pointer" : "default" }}
      onClick={() =>
        payload.snapshotTimestamp && onSnapshotSelect(payload.snapshotTimestamp)
      }>
      <circle
        cx={cx}
        cy={cy}
        r={isHot ? 8 : 5}
        fill={emotion.color}
        opacity="0.95"
      />
      <circle
        cx={cx}
        cy={cy}
        r={isHot ? 13 : 9}
        fill={emotion.color}
        opacity="0.16"
      />
      {payload.isPeak ?
        <circle
          cx={cx}
          cy={cy}
          r={17}
          fill="none"
          stroke={emotion.color}
          strokeWidth="1.5"
          opacity="0.5"
        />
      : null}
    </g>
  );
}

export function EmotionTimeline({
  timeline,
  selectedSnapshotTimestamp,
  onSnapshotSelect,
  isConnected,
}) {
  const chartData = useMemo(
    () =>
      timeline.map((point) => ({
        ...point,
        lineValue: point.value,
      })),
    [timeline],
  );

  const peakPoint = chartData.reduce(
    (winner, point) => {
      const score = point.value * point.confidence;
      return score > winner.score ? { score, point } : winner;
    },
    { score: 0, point: chartData[chartData.length - 1] ?? null },
  ).point;

  const chartLegend = [
    { label: "Emotion state", color: "#22d3ee" },
    { label: "Peak moments", color: "#c084fc" },
    { label: "Stored snapshots", color: "#facc15" },
  ];

  if (!chartData.length) {
    return (
      <div className="timeline-empty">
        <div className="timeline-empty__dot"></div>
        <p>Connecting to AI stream...</p>
        <span>Live data stream active</span>
      </div>
    );
  }

  return (
    <div className="timeline-chart-wrapper">
      <div className="chart-topline">
        <div className="chart-legend">
          {chartLegend.map((entry) => (
            <span className="mini-chip" key={entry.label}>
              <span
                className="mini-chip__dot"
                style={{ background: entry.color }}
              />
              {entry.label}
            </span>
          ))}
        </div>
        <span className="chart-meta">
          Peak signal:{" "}
          <strong>
            {peakPoint ? `${peakPoint.emoji} ${peakPoint.label}` : "—"}
          </strong>
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
              dataKey="timeLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={14}
              minTickGap={20}
              stroke="rgba(148, 163, 184, 0.82)"
              style={{ fontSize: "0.85rem" }}
            />
            <YAxis
              dataKey="lineValue"
              tickLine={false}
              axisLine={false}
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tickFormatter={(value) => {
                const emotion = Object.values(EMOTIONS).find(
                  (entry) => entry.value === value,
                );
                return emotion ? emotion.emoji : value;
              }}
              stroke="rgba(148, 163, 184, 0.82)"
              style={{ fontSize: "0.85rem" }}
            />
            <Tooltip content={<TimelineTooltip />} />
            <Line
              type="monotone"
              dataKey="lineValue"
              stroke="url(#emotionStroke)"
              strokeWidth={3.5}
              filter="url(#glowEffect)"
              isAnimationActive={true}
              animationDuration={800}
              dot={(props) => (
                <TimelineDot
                  {...props}
                  onSnapshotSelect={onSnapshotSelect}
                  selectedSnapshotTimestamp={selectedSnapshotTimestamp}
                />
              )}
              activeDot={(props) => (
                <TimelineDot
                  {...props}
                  onSnapshotSelect={onSnapshotSelect}
                  selectedSnapshotTimestamp={selectedSnapshotTimestamp}
                />
              )}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="timeline-stats">
        <div className="timeline-stat">
          <span>Now</span>
          <strong>
            {timeline.length ? timeline[timeline.length - 1].label : "—"}
          </strong>
        </div>
        <div className="timeline-stat">
          <span>Snapshots</span>
          <strong>
            {timeline.filter((point) => point.snapshotAvailable).length}
          </strong>
        </div>
        <div className="timeline-stat">
          <span>Peak</span>
          <strong>
            {peakPoint ? `${peakPoint.emoji}` : "—"}
          </strong>
        </div>
      </div>
    </div>
  );
}
