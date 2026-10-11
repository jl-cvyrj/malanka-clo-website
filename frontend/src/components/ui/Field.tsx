import { type ReactNode } from "react";
import styles from "./Field.module.css";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string | null;
  hint?: string | null;
  required?: boolean;
  children: ReactNode;
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: FieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
        {required ? <span className={styles.required}> *</span> : null}
      </label>
      {children}
      {hint ? <span className={styles.hint}>{hint}</span> : null}
      {error ? <span className={styles.error}>{error}</span> : null}
    </div>
  );
}

export const controlClass = styles.control;
export const rowClass = styles.row;
export const row2Class = `${styles.row} ${styles.row2}`;
