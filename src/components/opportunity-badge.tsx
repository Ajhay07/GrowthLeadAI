interface OpportunityBadgeProps {
  score: number;
}

export function OpportunityBadge({ score }: OpportunityBadgeProps) {
  const getColor = () => {
    if (score >= 75) return { ring: "#D4A24E", text: "#D4A24E", bg: "rgba(212,162,78,0.12)" };
    if (score >= 50) return { ring: "#8A8F98", text: "#8A8F98", bg: "rgba(138,143,152,0.10)" };
    return { ring: "#5C6066", text: "#5C6066", bg: "rgba(92,96,102,0.08)" };
  };

  const { ring, text, bg } = getColor();
  const circumference = 2 * Math.PI * 16;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-9 w-9 shrink-0">
        <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="16"
            fill={bg}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeWidth="2.5"
          />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke={ring}
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold"
          style={{ color: text }}
        >
          {score}
        </span>
      </div>
    </div>
  );
}