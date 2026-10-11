import Link from "next/link";
import { t } from "@/locales";
import type { Category } from "@/lib/api/types";
import styles from "./Footer.module.css";

export function Footer({ categories }: { categories: Category[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div id="about">
          <p className={styles.brand}>MALANKA.clo</p>
          <p className={styles.heading} style={{ marginTop: "1.5rem" }}>
            {t.footer.aboutTitle}
          </p>
          <p className={styles.about}>{t.footer.aboutText}</p>
        </div>

        <div>
          <p className={styles.heading}>{t.footer.navTitle}</p>
          <div className={styles.list}>
            <Link href="/catalog" className={styles.link}>
              {t.nav.catalog}
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/catalog?category=${encodeURIComponent(category.slug)}`}
                className={styles.link}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        <div id="contacts">
          <p className={styles.heading}>{t.footer.contactsTitle}</p>
          <div className={styles.list}>
            <a href={`tel:${t.footer.phone.replace(/[^+\d]/g, "")}`} className={styles.link}>
              {t.footer.phone}
            </a>
            <a href={`mailto:${t.footer.email}`} className={styles.link}>
              {t.footer.email}
            </a>
            <a
              href="https://instagram.com"
              className={styles.link}
              target="_blank"
              rel="noreferrer noopener"
            >
              {t.footer.instagram}
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>
          © {year} MALANKA.clo. {t.footer.rights}
        </span>
      </div>
    </footer>
  );
}
