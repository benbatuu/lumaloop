import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline";

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  size?: "md" | "sm";
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<"a">, "href" | "className" | "children">;

export function buttonClass(variant: Variant = "primary", size: "md" | "sm" = "md") {
  return ["btn", variant !== "primary" && `btn--${variant}`, size === "sm" && "btn--sm"]
    .filter(Boolean)
    .join(" ");
}

/** A link styled as a tactile game-UI button. Internal paths use next/link. */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const classes = [buttonClass(variant, size), className].filter(Boolean).join(" ");
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={classes} {...rest}>
      {children}
    </a>
  );
}
