import { ButtonLink } from "@/components/ui/Button";
import { t } from "@/locales";
import styles from "./not-found.module.css";

export default function StoreNotFound() {
  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>{t.product.notFound}</h1>
      <p className={styles.text}>404</p>
      <ButtonLink href="/catalog" variant="primary">
        {t.product.backToCatalog}
      </ButtonLink>
    </div>
  );
}
