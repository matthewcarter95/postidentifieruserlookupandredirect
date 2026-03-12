import { cn } from "@/lib/utils";

export function Heading({ children, className, level }) {
  return (() => {
    switch (level) {
      case 1:
        return (
          <h1 className={cn("text-center text-3xl font-medium", className)}>
            {children}
          </h1>
        );
      case 2:
        return (
          <h2 className={cn("text-center text-xl font-medium", className)}>
            {children}
          </h2>
        );
      default:
        return (
          <h3 className={cn("relative text-lg text-gray-800", className)}>
            {children}
          </h3>
        );
    }
  })();
}
