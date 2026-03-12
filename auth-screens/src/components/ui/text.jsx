import { cn } from "@/lib/utils";

export function Text({ children, className }) {
  return (
    <p className={cn("relative text-gray-800 leading-tight mt-4", className)}>
      {children}
    </p>
  );
}
