import Link from "next/link";
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
} from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost" | "subtle" | "danger";
type Size = "sm" | "md" | "lg";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

function classes(variant: Variant, size: Size, block?: boolean, extra?: string) {
  return [
    styles.base,
    styles[variant],
    styles[size],
    block ? styles.block : "",
    extra ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type LinkProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", block, className, type, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={classes(variant, size, block, className)}
        {...rest}
      />
    );
  },
);

export function ButtonLink({
  variant = "primary",
  size = "md",
  block,
  className,
  href,
  ...rest
}: LinkProps) {
  return (
    <Link href={href} className={classes(variant, size, block, className)} {...rest} />
  );
}
