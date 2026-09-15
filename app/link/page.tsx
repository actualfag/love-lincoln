"use client";

import { useState } from "react";
import HeartV2 from "../heart-v2/HeartV2";
import styles from "./Link.module.css";

export default function LinkPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: wire this up to whatever sends the unique info link.
    setSubmitted(true);
  };

  return (
    <main className={styles.page}>
      <div className={styles.heartWrap}>
        <HeartV2 showControls={false} embedded scale={0.84} />
      </div>
      <div className={styles.info}>
        <img className={styles.dateImg} src="/heart/january-15-18.png" alt="January 15–18, Poconos, PA" />
      </div>
      {submitted ? (
        <p className={styles.confirm}>Check your email for your link.</p>
      ) : (
        <div className={styles.emailBlock}>
          <p className={styles.formLabel}>Get your link</p>
          <form className={styles.form} onSubmit={submit}>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit">Submit</button>
          </form>
        </div>
      )}
    </main>
  );
}
