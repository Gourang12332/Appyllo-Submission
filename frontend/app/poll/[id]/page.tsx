"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Poll() {
  const params = useParams();
  const pollId = params.id as string;

  const [poll, setPoll] = useState<any>(null);
  const [results, setResults] = useState<number[]>([]);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    fetch(`https://appyllo-submission.onrender.com/poll/${pollId}`)
      .then(res => res.json())
      .then(data => {
        setPoll(data);
        setResults(data.votes);
      });

    if (localStorage.getItem(`voted_${pollId}`)) {
      setVoted(true);
    }

    const ws = new WebSocket(`ws://appyllo-submission.onrender.com/ws/poll/${pollId}`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setResults(data.results);
    };
  }, []);

  const vote = async (idx: number) => {
    await fetch("https://appyllo-submission.onrender.com/poll/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ poll_id: pollId, option_id: idx })
    });
    localStorage.setItem(`voted_${pollId}`, "true");
    setVoted(true);
  };

  if (!poll) return null;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>{poll.question}</h1>
        <p style={styles.subtitle}>
          {voted ? "You have already voted" : "Click an option to vote"}
        </p>

        {poll.options.map((opt: string, i: number) => (
          <div key={i} style={styles.optionRow}>
            <button
              style={{
                ...styles.optionBtn,
                background: voted ? "#e5e7eb" : "#4f46e5",
                cursor: voted ? "not-allowed" : "pointer"
              }}
              disabled={voted}
              onClick={() => vote(i)}
            >
              {opt}
            </button>
            <span style={styles.count}>{results[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f7fb",
    color : "black"
  },
  card: {
    width: "400px",
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
  },
  title: {
    textAlign: "center",
    marginBottom: "5px"
  },
  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: "20px"
  },
  optionRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px"
  },
  optionBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    color: "white",
    fontSize: "14px"
  },
  count: {
    width: "30px",
    textAlign: "center",
    fontWeight: "bold"
  }
};
