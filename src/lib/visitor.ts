// src/lib/visitor.ts
import { v4 as uuidv4 } from "uuid";

const VISITOR_KEY = "visitor_id";
const SESSION_KEY = "session_id";

function getOrCreateSessionId() {
  let s = localStorage.getItem(SESSION_KEY);
  if (!s) {
    s = "sess-" + uuidv4();
    localStorage.setItem(SESSION_KEY, s);
  }
  return s;
}

export async function identifyVisitor(meta = {}) {
  const session_id = getOrCreateSessionId();

  const res = await fetch("/api/visitors/identify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id, meta }),
  }).then(r => r.json());

  if (res.visitor_id) {
    localStorage.setItem(VISITOR_KEY, res.visitor_id);
  }

  return res.visitor_id;
}

export function getVisitorId() {
  return localStorage.getItem(VISITOR_KEY) || null;
}

export async function postEvent(event_type, event_props = {}) {
  const visitor_id = getVisitorId();
  const session_id = localStorage.getItem(SESSION_KEY);

  await fetch("/api/visitors/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      visitor_id,
      session_id,
      event_type,
      event_props,
    }),
  });
}
