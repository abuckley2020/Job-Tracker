const SEGMENT_COLORS = [
  "#f87171",
  "#fb923c",
  "#fbbf24",
  "#facc15",
  "#d9f99d",
  "#a3e635",
  "#4ade80",
  "#22c55e",
  "#16a34a",
  "#15803d",
];

interface RatingSliderProps {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  disabled?: boolean;
  testId?: string;
  compact?: boolean;
}

export function RatingSlider({
  label,
  value,
  onChange,
  disabled,
  testId,
  compact = false,
}: RatingSliderProps) {
  if (compact) {
    return (
      <div
        className="space-y-[3px]"
        onClick={(e) => e.stopPropagation()}
        data-testid={testId}
      >
        <span className="block text-[9px] font-semibold text-muted-foreground leading-tight break-words">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-[2px]">
            {SEGMENT_COLORS.map((color, i) => {
              const segVal = i + 1;
              const isSelected = value === segVal;
              const isFilled = value !== null && segVal <= value;
              return (
                <button
                  key={segVal}
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(isSelected ? null : segVal);
                  }}
                  className="rounded-[3px] transition-transform duration-75 hover:scale-125 focus:outline-none disabled:cursor-not-allowed"
                  style={{
                    width: 13,
                    height: 18,
                    backgroundColor: color,
                    opacity: isFilled ? 1 : 0.15,
                    boxShadow: isSelected
                      ? `0 0 0 2px white, 0 0 0 3px ${color}`
                      : "none",
                  }}
                  title={`${segVal}/10`}
                />
              );
            })}
          </div>
          <span className="text-[9px] font-bold text-muted-foreground w-4 text-right tabular-nums">
            {value !== null ? value : "–"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1" data-testid={testId}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-xs font-bold text-muted-foreground tabular-nums">
          {value !== null ? `${value} / 10` : "Not rated"}
        </span>
      </div>
      <div className="flex gap-[3px]">
        {SEGMENT_COLORS.map((color, i) => {
          const segVal = i + 1;
          const isSelected = value === segVal;
          const isFilled = value !== null && segVal <= value;
          return (
            <button
              key={segVal}
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                onChange(isSelected ? null : segVal);
              }}
              className="flex-1 rounded-[4px] transition-transform duration-75 hover:scale-y-125 focus:outline-none disabled:cursor-not-allowed"
              style={{
                height: 28,
                backgroundColor: color,
                opacity: isFilled ? 1 : 0.15,
                boxShadow: isSelected
                  ? `0 0 0 2px white, 0 0 0 3.5px ${color}`
                  : "none",
              }}
              title={`${segVal}/10`}
            />
          );
        })}
      </div>
    </div>
  );
}
