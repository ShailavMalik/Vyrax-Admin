const SESSION_KEY = "vryrax-session-id";

export function getSessionId() {
  if (typeof window === "undefined") {
    return null;
  }

  const existingSessionId = window.localStorage.getItem(SESSION_KEY);
  if (existingSessionId) {
    return existingSessionId;
  }

  const generatedSessionId = crypto.randomUUID();
  window.localStorage.setItem(SESSION_KEY, generatedSessionId);
  return generatedSessionId;
}
