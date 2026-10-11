import { type ReactNode } from "react";
import styles from "./Alert.module.css";

type Tone = "error" | "success" | "info";

export function Alert({
  tone = "info",
  children,
  role,
}: {
  tone?: Tone;
  children: ReactNode;
  role?: "alert" | "status";
}) {
  return (
    <div
      className={`${styles.alert} ${styles[tone]}`}
      role={role ?? (tone === "error" ? "alert" : "status")}
    >
      {children}
    </div>
  );
}
