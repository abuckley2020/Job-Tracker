import { useState, useEffect } from "react";
import type { Prospect } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2, Pencil, Flame, ThumbsUp, Minus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditProspectForm } from "./edit-prospect-form";

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

type RatingField = "colleaguesRating" | "workLifeBalanceRating" | "excitementRating";

function RatingSlider({
  label,
  value,
  onChange,
  disabled,
  testId,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  disabled?: boolean;
  testId?: string;
}) {
  return (
    <div
      className="flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
      data-testid={testId}
    >
      <span className="text-[9px] font-semibold text-muted-foreground w-14 shrink-0 leading-tight">
        {label}
      </span>
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
                height: 20,
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
  );
}

function InterestIndicator({ level }: { level: string }) {
  switch (level) {
    case "High":
      return (
        <span
          className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full"
          data-testid="interest-high"
        >
          <Flame className="w-2.5 h-2.5" />
          High
        </span>
      );
    case "Medium":
      return (
        <span
          className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full"
          data-testid="interest-medium"
        >
          <ThumbsUp className="w-2.5 h-2.5" />
          Medium
        </span>
      );
    case "Low":
      return (
        <span
          className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full"
          data-testid="interest-low"
        >
          <Minus className="w-2.5 h-2.5" />
          Low
        </span>
      );
    default:
      return null;
  }
}

const statusAccentColors: Record<string, string> = {
  Bookmarked: "border-l-sky-400",
  Applied: "border-l-violet-400",
  "Phone Screen": "border-l-fuchsia-400",
  Interviewing: "border-l-amber-400",
  Offer: "border-l-emerald-400",
  Rejected: "border-l-rose-400",
  Withdrawn: "border-l-slate-400",
};

export function ProspectCard({ prospect }: { prospect: Prospect }) {
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);

  const [ratings, setRatings] = useState<Record<RatingField, number | null>>({
    colleaguesRating: prospect.colleaguesRating ?? null,
    workLifeBalanceRating: prospect.workLifeBalanceRating ?? null,
    excitementRating: prospect.excitementRating ?? null,
  });

  useEffect(() => {
    setRatings({
      colleaguesRating: prospect.colleaguesRating ?? null,
      workLifeBalanceRating: prospect.workLifeBalanceRating ?? null,
      excitementRating: prospect.excitementRating ?? null,
    });
  }, [prospect.colleaguesRating, prospect.workLifeBalanceRating, prospect.excitementRating]);

  const accentColor = statusAccentColors[prospect.status] ?? "border-l-gray-300";

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/prospects/${prospect.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prospects"] });
      toast({ title: "Prospect deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete prospect", variant: "destructive" });
    },
  });

  const ratingMutation = useMutation({
    mutationFn: async (data: Partial<Record<RatingField, number | null>>) => {
      await apiRequest("PATCH", `/api/prospects/${prospect.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prospects"] });
    },
    onError: () => {
      toast({ title: "Failed to save rating", variant: "destructive" });
      setRatings({
        colleaguesRating: prospect.colleaguesRating ?? null,
        workLifeBalanceRating: prospect.workLifeBalanceRating ?? null,
        excitementRating: prospect.excitementRating ?? null,
      });
    },
  });

  const handleRatingChange = (field: RatingField, value: number | null) => {
    setRatings((prev) => ({ ...prev, [field]: value }));
    ratingMutation.mutate({ [field]: value });
  };

  return (
    <>
      <div
        className={`group bg-white border border-l-4 ${accentColor} border-slate-200/80 rounded-xl p-3 space-y-2 shadow-sm hover:shadow-md hover-elevate cursor-pointer transition-all duration-150`}
        onClick={() => setEditOpen(true)}
        data-testid={`card-prospect-${prospect.id}`}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0 flex-1">
            <h4
              className="font-bold text-sm leading-tight truncate"
              data-testid={`text-company-${prospect.id}`}
            >
              {prospect.companyName}
            </h4>
            <p
              className="text-xs text-muted-foreground truncate mt-0.5"
              data-testid={`text-role-${prospect.id}`}
            >
              {prospect.roleTitle}
            </p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 hover:bg-violet-50 hover:text-violet-600"
              onClick={(e) => {
                e.stopPropagation();
                setEditOpen(true);
              }}
              data-testid={`button-edit-${prospect.id}`}
            >
              <Pencil className="w-3 h-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 hover:bg-rose-50 hover:text-rose-500"
              onClick={(e) => {
                e.stopPropagation();
                deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
              data-testid={`button-delete-${prospect.id}`}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <InterestIndicator level={prospect.interestLevel} />
          {prospect.salary && (
            <span
              className="inline-flex items-center text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full"
              data-testid={`text-salary-${prospect.id}`}
            >
              {prospect.salary}
            </span>
          )}
        </div>

        {prospect.jobUrl && (
          <a
            href={prospect.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 hover:underline font-medium"
            onClick={(e) => e.stopPropagation()}
            data-testid={`link-job-url-${prospect.id}`}
          >
            <ExternalLink className="w-3 h-3" />
            View Posting
          </a>
        )}

        {prospect.notes && (
          <p
            className="text-xs text-muted-foreground line-clamp-2 bg-slate-50 rounded-lg px-2 py-1"
            data-testid={`text-notes-${prospect.id}`}
          >
            {prospect.notes}
          </p>
        )}

        <div
          className="border-t border-slate-100 pt-2 space-y-[5px]"
          onClick={(e) => e.stopPropagation()}
          data-testid={`ratings-${prospect.id}`}
        >
          <RatingSlider
            label="Colleagues"
            value={ratings.colleaguesRating}
            onChange={(v) => handleRatingChange("colleaguesRating", v)}
            disabled={ratingMutation.isPending}
            testId={`slider-colleagues-${prospect.id}`}
          />
          <RatingSlider
            label="Work / Life"
            value={ratings.workLifeBalanceRating}
            onChange={(v) => handleRatingChange("workLifeBalanceRating", v)}
            disabled={ratingMutation.isPending}
            testId={`slider-worklife-${prospect.id}`}
          />
          <RatingSlider
            label="Excitement"
            value={ratings.excitementRating}
            onChange={(v) => handleRatingChange("excitementRating", v)}
            disabled={ratingMutation.isPending}
            testId={`slider-excitement-${prospect.id}`}
          />
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Prospect</DialogTitle>
          </DialogHeader>
          <EditProspectForm prospect={prospect} onSuccess={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
