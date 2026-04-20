import mongoose from "mongoose";

const emotionEventSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Number,
      required: true,
      index: true,
    },
    emotion: {
      type: String,
      required: true,
      index: true,
    },
    confidence: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      default: "backend-ingest",
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

emotionEventSchema.index({ sessionId: 1, timestamp: 1 }, { unique: true });

export const EmotionEvent = mongoose.model("EmotionEvent", emotionEventSchema);
