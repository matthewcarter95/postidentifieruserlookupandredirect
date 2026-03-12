import { cn } from "@/lib/utils";

export function ScreenErrors({ className, errors }) {
  const screenErrors = errors?.filter((error) => !error.field);
  if (!screenErrors?.length) {
    return <></>;
  }

  return (
    <ul className={cn(
      "px-4 py-2",
      "rounded-sm bg-red-700",
      "text-white",
      className
    )}>
      {screenErrors?.map((error) => (
        <li className="leading-loose" key={error.code}>
          {error.message}
          {error.field && ` - Field: ${error.field}`}
        </li>
      ))}
    </ul>
  );
}
