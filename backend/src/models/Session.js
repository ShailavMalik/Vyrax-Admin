import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    firstSeenAt: {
      type: Date,
      default: () => new Date(),
    },
    lastSeenAt: {
      type: Date,
      default: () => new Date(),
    },
    lastEmotion: {
      type: String,
      default: null,
    },
    highestConfidence: {
      type: Number,
      default: 0,
    },
    highestConfidenceTimestamp: {
      type: Number,
      default: null,
    },
    totalEvents: {
      type: Number,
      default: 0,
    },
    transitions: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Session = mongoose.model("Session", sessionSchema, "sessions");
