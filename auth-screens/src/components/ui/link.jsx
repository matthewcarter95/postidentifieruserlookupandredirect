import { cn } from "@/lib/utils";

export function Link({ children, className, ...attributes }) {
  return (
    <a
      className={cn("text-inherit underline inline-block", className)}
      {...attributes}
    >
      {children}
    </a>
  );
}
