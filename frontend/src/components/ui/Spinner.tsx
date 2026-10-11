import styles from "./Spinner.module.css";

export function Spinner({ full = false }: { full?: boolean }) {
  return (
    <div className={styles.center} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      {full ? <span className="srOnly">Загрузка</span> : null}
    </div>
  );
}
