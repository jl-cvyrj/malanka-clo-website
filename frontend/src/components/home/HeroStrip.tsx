import styles from "./HeroStrip.module.css";

interface HeroStripProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  align?: "left" | "right";
  background?: string;
}

export function HeroStrip({
  imageSrc,
  imageAlt,
  title,
  align = "left",
  background = "#d7d7d7",
}: HeroStripProps) {
  return (
    <section className={styles.strip} style={{ background }}>
      <div className={styles.imageWrap}>
        <img src={imageSrc} alt={imageAlt} className={styles.image} loading="lazy" />
      </div>
      <div className={`${styles.overlay} ${align === "right" ? styles.right : styles.left}`}>
        <h2 className={styles.title}>{title}</h2>
      </div>
    </section>
  );
}
