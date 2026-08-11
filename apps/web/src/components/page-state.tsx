import type { ReactNode } from "react";

export function PageState({
  title,
  body,
  children,
}: {
  title: string;
  body?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mt-10 max-w-md">
      <h2 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
      {body ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
      ) : null}
      {children}
    </div>
  );
}
