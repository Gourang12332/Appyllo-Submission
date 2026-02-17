"use client";
import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [link, setLink] = useState("");

  const createPoll = async () => {
    const res = await fetch("https://appyllo-submission.onrender.com/poll/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, options })
    });
    const data = await res.json();
    setLink(data.share_link);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create a Poll</h1>

        <input
          style={styles.input}
          placeholder="Enter your question"
          onChange={e => setQuestion(e.target.value)}
        />

        {options.map((o, i) => (
          <input
            key={i}
            style={styles.input}
            placeholder={`Option ${i + 1}`}
            onChange={e => {
              const arr = [...options];
              arr[i] = e.target.value;
              setOptions(arr);
            }}
          />
        ))}

        <button style={styles.secondaryBtn} onClick={() => setOptions([...options, ""])}>
          + Add Option
        </button>

        <button style={styles.primaryBtn} onClick={createPoll}>
          Create Poll
        </button>

        {link && (
          <div style={styles.linkBox}>
            <p>Share this link:</p>
            <a href={link} target="_blank">{link}</a>
          </div>
        )}
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
    background: "#f5f7fb"
  },
  card: {
    width: "400px",
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  title: {
    textAlign: "center",
    marginBottom: "10px"
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px"
  },
  primaryBtn: {
    padding: "10px",
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "10px"
  },
  secondaryBtn: {
    padding: "8px",
    background: "#e5e7eb",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  linkBox: {
    marginTop: "15px",
    padding: "10px",
    background: "#f1f5f9",
    borderRadius: "6px",
    wordBreak: "break-all"
  }
};
