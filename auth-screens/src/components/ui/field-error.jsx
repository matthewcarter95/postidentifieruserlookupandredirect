import { cn } from "@/lib/utils";

export function FieldError({ error, className, ...attributes }) {
  return (
    <p
      {...attributes}
      className={cn(
        "text-xs text-red-600",
        "flex flex-row items-center",
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-4 h-4 inline-block")}
        fill="currentColor"
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        />
      </svg>
      <span className="inline-block ml-1">{error.message}</span>
    </p>
  );
}
