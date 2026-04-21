import { EmotionEvent } from "../models/EmotionEvent.js";

const EMOTION_VALUE = {
  happy: 1,
  neutral: 2,
  sad: 3,
  angry: 4,
  surprised: 5,
};

export function calculateTransitions(events) {
  let transitions = 0;
  let previousEmotion = null;

  for (const event of events) {
    if (previousEmotion && previousEmotion !== event.emotion) {
      transitions += 1;
    }

    previousEmotion = event.emotion;
  }

  return transitions;
}

export function calculateDominantEmotion(events) {
  const totals = new Map();

  for (const event of events) {
    totals.set(event.emotion, (totals.get(event.emotion) ?? 0) + 1);
  }

  let dominantEmotion = null;
  let dominantCount = -1;

  for (const [emotion, count] of totals.entries()) {
    if (count > dominantCount) {
      dominantEmotion = emotion;
      dominantCount = count;
    }
  }

  return dominantEmotion;
}

export function calculateAverageConfidence(events) {
  if (!events.length) {
    return 0;
  }

  const sum = events.reduce(
    (total, event) => total + Number(event.confidence || 0),
    0,
  );
  return sum / events.length;
}

export function calculateStabilityScore(events, transitions, avgConfidence) {
  if (!events.length) {
    return 0;
  }

  const volatility = events.reduce((total, event, index) => {
    if (index === 0) {
      return total;
    }

    const previousValue = EMOTION_VALUE[events[index - 1].emotion] ?? 2;
    const currentValue = EMOTION_VALUE[event.emotion] ?? 2;
    return total + Math.abs(currentValue - previousValue);
  }, 0);

  const transitionRate = transitions / Math.max(1, events.length);
  const confidencePenalty = (1 - avgConfidence) * 36;
  const volatilityPenalty = (volatility / Math.max(1, events.length - 1)) * 10;

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

export async function buildSessionSummary(sessionId) {
  const events = await EmotionEvent.find({ sessionId })
    .sort({ timestamp: 1 })
    .lean();
  const firstTimestamp = events[0]?.timestamp ?? null;
  const lastTimestamp = events.at(-1)?.timestamp ?? null;
  const totalEvents = events.length;
  const avgConfidence = calculateAverageConfidence(events);
  const dominantEmotion = calculateDominantEmotion(events);
  const transitions = calculateTransitions(events);
  const stabilityScore = calculateStabilityScore(
    events,
    transitions,
    avgConfidence,
  );

  return {
    sessionId,
    startTime:
      firstTimestamp ? new Date(Number(firstTimestamp)).toISOString() : null,
    endTime:
      lastTimestamp ? new Date(Number(lastTimestamp)).toISOString() : null,
    dominantEmotion,
    avgConfidence,
    totalEvents,
    transitions,
    stabilityScore,
    mostFrequentEmotion: dominantEmotion,
    updatedAt: new Date().toISOString(),
  };
}
