import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/components/deck/cx";

type Props = {
  id: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export default function Chapter({ id, className, style, children }: Props) {
  return (
    <section id={id} data-chapter className={cx("deck-chapter", className)} style={style}>
      {children}
    </section>
  );
}
