/** Small stroke icon set. Decorative by default (aria-hidden). */
const PATHS = {
  home: "M3.5 10.5 12 3.5l8.5 7V20a.5.5 0 0 1-.5.5h-5v-6h-6v6H4a.5.5 0 0 1-.5-.5z",
  check: "M5 12.5l4.5 4.5L19 7.5",
  tube: "M9 3h6M10 3v7L5.4 18.2A2 2 0 0 0 7.2 21h9.6a2 2 0 0 0 1.8-2.8L14 10V3M7.5 15h9",
  chat: "M4.5 5.5h15v10h-10l-5 4z",
  chart: "M4 20h16M6 15.5l4-4.5 3.5 3 4.5-6",
  calendar: "M4 6.5h16v13.5H4zM4 10.5h16M8.5 3.5v4M15.5 3.5v4",
  shield: "M12 3.5l7.5 3v5.5c0 4.6-3.2 7.6-7.5 8.5-4.3-.9-7.5-3.9-7.5-8.5V6.5z",
  pin: "M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11zM12 12.3a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6z",
  sparkle: "M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8zM18.5 16l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}
