import mongoose from "mongoose";

const snapshotSchema = new mongoose.Schema(
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
    imageUrl: {
      type: String,
      required: true,
    },
    storageProvider: {
      type: String,
      default: "r2",
    },
    storageKey: {
      type: String,
      default: null,
    },
    blobName: {
      type: String,
      default: null,
    },
    contentType: {
      type: String,
      default: "image/webp",
    },
    sizeBytes: {
      type: Number,
      default: 0,
    },
    reason: {
      type: String,
      default: "emotion-change",
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

snapshotSchema.index({ sessionId: 1, timestamp: -1 });

export const Snapshot = mongoose.model("Snapshot", snapshotSchema, "snapshots");
