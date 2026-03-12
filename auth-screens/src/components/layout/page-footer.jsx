import { cn } from "@/lib/utils";

export default function PageFooter() {
  return (
    <footer className={cn("py-2 text-center text-white/60 bg-sky-950/60")}>
      <span className={cn("inline-block pr-1 text-sm font-semibold")}>
        © 2025 MyApp Inc. All Rights Reserved
      </span>
      |
      <span className={cn("inline-block pl-1 text-sm font-semibold")}>
        Photo by&nbsp;
        <a
          className="underline"
          href="https://unsplash.com/@adigold1?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
        >
          Adi Goldstein
        </a>
        &nbsp;on&nbsp;
        <a
          className="underline"
          href="https://unsplash.com/photos/teal-led-panel-EUsVwEOsblE?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
        >
          Unsplash
        </a>
      </span>
    </footer>
  );
}
