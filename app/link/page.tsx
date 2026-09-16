import HeartV2 from "../heart-v2/HeartV2";
import styles from "./Link.module.css";

export default function LinkPage() {
  return (
    <main className={styles.page}>
      <div className={styles.heartWrap}>
        <HeartV2 showControls={false} embedded scale={0.84} />
      </div>
      <div className={styles.info}>
        <img className={styles.dateImg} src="/heart/january-15-18.png" alt="January 15–18, Poconos, PA" />
      </div>
    </main>
  );
}
