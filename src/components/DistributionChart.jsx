import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { SectionCard } from "./SectionCard.jsx";

function DistributionTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="tooltip-card">
      <p className="tooltip-card__title">
        {point.emoji} {point.label}
      </p>
      <p className="tooltip-card__line">Share: {point.percentage}%</p>
      <p className="tooltip-card__line">Sessions: {point.count}</p>
    </div>
  );
}

export function DistributionChart({ distribution, dominantEmotion }) {
  const dominantLabel =
    distribution.find((entry) => entry.emotion === dominantEmotion)?.label ??
    "—";

  return (
    <SectionCard
      title="Emotion distribution"
      subtitle="A compact chart view of the session mix. The dominant emotion is highlighted in the center badge."
      className="distribution-chart">
      <div className="distribution-grid" style={{ alignItems: "center" }}>
        <div style={{ width: "100%", height: 300 }}>
          {distribution.length ?
            <ResponsiveContainer>
              <PieChart>
                <Tooltip content={<DistributionTooltip />} />
                <Pie
                  data={distribution}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={72}
                  outerRadius={116}
                  paddingAngle={4}
                  stroke="rgba(15, 23, 42, 0.66)"
                  strokeWidth={2}>
                  {distribution.map((entry) => (
                    <Cell
                      key={entry.emotion}
                      fill={entry.color}
                      stroke={
                        entry.emotion === dominantEmotion ?
                          "#f8fafc"
                        : entry.color
                      }
                      strokeWidth={entry.emotion === dominantEmotion ? 3 : 1}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          : <div className="empty-state">
              Waiting for emotion events to populate the chart.
            </div>
          }
        </div>

        <div className="stacked-cards">
          <div className="distribution-legend">
            <div className="distribution-legend__left">
              <strong>Dominant emotion</strong>
              <span>{dominantLabel}</span>
            </div>
            <span className="chip chip--good">Leading signal</span>
          </div>

          <div className="metric-grid">
            {distribution.map((entry) => (
              <div className="metric-tile" key={entry.emotion}>
                <div className="metric-tile__label">
                  <span>
                    {entry.emoji} {entry.label}
                  </span>
                  <span>{entry.percentage}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar__fill"
                    style={{
                      width: `${entry.percentage}%`,
                      background: entry.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
