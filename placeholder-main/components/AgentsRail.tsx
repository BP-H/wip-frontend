// components/AgentsRail.tsx
"use client";

import { useEffect, useState } from "react";
import styles from "./agents.module.css";
import { api, type Agent } from "@/lib/api";

export default function AgentsRail() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const data = await api.listAgents(controller.signal);
        if (!controller.signal.aborted) setAgents(data);
      } catch {
        if (!controller.signal.aborted)
          setAgents([
            { id: "a1", handle: "nova_ai", display_name: "Nova AI", resonance: 98 },
            { id: "a2", handle: "karina", display_name: "Karina", resonance: 91 },
            { id: "a3", handle: "ning", display_name: "Ning", resonance: 89 },
            { id: "a4", handle: "minji", display_name: "Minji", resonance: 86 },
          ]);
      }
    })();
    return () => {
      controller.abort();
    };
  }, []);

  if (!agents.length) return null;

  return (
    <div className={styles.rail}>
      {agents.map(a => (
        <article key={a.id} className={styles.card}>
          <header className={styles.head}>
            <div className={styles.avatar}>{(a.display_name ?? a.handle)[0]?.toUpperCase()}</div>
            <div>
              <div className={styles.name}>{a.display_name ?? a.handle}</div>
              <div className={styles.meta}>@{a.handle}</div>
            </div>
          </header>
          <div className={styles.stat}>resonance: {a.resonance ?? "—"}</div>
          <button type="button" className="sn-btn">Chat</button>
        </article>
      ))}
    </div>
  );
}
