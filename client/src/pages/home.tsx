import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Prospect } from "@shared/schema";
import { STATUSES, INTEREST_LEVELS } from "@shared/schema";
import { ProspectCard } from "@/components/prospect-card";
import { AddProspectForm } from "@/components/add-prospect-form";
import { Plus, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

type InterestFilter = "All" | (typeof INTEREST_LEVELS)[number];

const interestFilterOptions: InterestFilter[] = ["All", ...INTEREST_LEVELS];

const interestFilterColors: Record<string, { active: string; inactive: string }> = {
  All: {
    active: "bg-white/90 text-slate-700 shadow-sm",
    inactive: "text-white/70 hover:text-white hover:bg-white/20",
  },
  High: {
    active: "bg-rose-100 text-rose-700 shadow-sm",
    inactive: "text-white/70 hover:text-white hover:bg-white/20",
  },
  Medium: {
    active: "bg-amber-100 text-amber-700 shadow-sm",
    inactive: "text-white/70 hover:text-white hover:bg-white/20",
  },
  Low: {
    active: "bg-slate-100 text-slate-600 shadow-sm",
    inactive: "text-white/70 hover:text-white hover:bg-white/20",
  },
};

type ColumnConfig = {
  gradient: string;
  headerText: string;
  emoji: string;
  colBg: string;
};

const columnConfig: Record<string, ColumnConfig> = {
  Bookmarked: {
    gradient: "from-sky-400 to-blue-500",
    headerText: "text-white",
    emoji: "🔖",
    colBg: "bg-sky-50/60 border-sky-200/60",
  },
  Applied: {
    gradient: "from-violet-500 to-purple-600",
    headerText: "text-white",
    emoji: "📤",
    colBg: "bg-violet-50/60 border-violet-200/60",
  },
  "Phone Screen": {
    gradient: "from-fuchsia-500 to-pink-500",
    headerText: "text-white",
    emoji: "📞",
    colBg: "bg-fuchsia-50/60 border-fuchsia-200/60",
  },
  Interviewing: {
    gradient: "from-amber-400 to-orange-500",
    headerText: "text-white",
    emoji: "💼",
    colBg: "bg-amber-50/60 border-amber-200/60",
  },
  Offer: {
    gradient: "from-emerald-400 to-green-500",
    headerText: "text-white",
    emoji: "🎉",
    colBg: "bg-emerald-50/60 border-emerald-200/60",
  },
  Rejected: {
    gradient: "from-rose-400 to-red-500",
    headerText: "text-white",
    emoji: "🚫",
    colBg: "bg-rose-50/60 border-rose-200/60",
  },
  Withdrawn: {
    gradient: "from-slate-400 to-slate-500",
    headerText: "text-white",
    emoji: "👋",
    colBg: "bg-slate-50/60 border-slate-200/60",
  },
};

function KanbanColumn({
  status,
  prospects,
  isLoading,
}: {
  status: string;
  prospects: Prospect[];
  isLoading: boolean;
}) {
  const [interestFilter, setInterestFilter] = useState<InterestFilter>("All");
  const slug = status.replace(/\s+/g, "-").toLowerCase();
  const config = columnConfig[status] ?? {
    gradient: "from-gray-400 to-gray-500",
    headerText: "text-white",
    emoji: "📋",
    colBg: "bg-gray-50/60 border-gray-200/60",
  };

  const visibleProspects =
    interestFilter === "All"
      ? prospects
      : prospects.filter((p) => p.interestLevel === interestFilter);

  return (
    <div
      className={`flex flex-col min-w-[270px] max-w-[310px] w-full rounded-2xl border shadow-md overflow-hidden ${config.colBg}`}
      data-testid={`column-${slug}`}
    >
      <div className={`bg-gradient-to-r ${config.gradient} px-3 py-2.5`}>
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">{config.emoji}</span>
          <h3 className={`text-sm font-bold truncate ${config.headerText}`}>{status}</h3>
          <span
            className="ml-auto bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center"
            data-testid={`badge-count-${slug}`}
          >
            {visibleProspects.length}
          </span>
        </div>
        <div
          className="flex items-center gap-1 mt-2"
          data-testid={`interest-filter-${slug}`}
        >
          {interestFilterOptions.map((level) => {
            const colors = interestFilterColors[level];
            const isActive = interestFilter === level;
            return (
              <button
                key={level}
                onClick={() => setInterestFilter(level)}
                data-testid={`filter-${slug}-${level.toLowerCase()}`}
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${
                  isActive ? colors.active : colors.inactive
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </>
          ) : visibleProspects.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-10 text-center"
              data-testid={`empty-${slug}`}
            >
              <p className="text-xs text-muted-foreground">No prospects</p>
            </div>
          ) : (
            visibleProspects.map((prospect) => (
              <ProspectCard key={prospect.id} prospect={prospect} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: prospects, isLoading } = useQuery<Prospect[]>({
    queryKey: ["/api/prospects"],
  });

  const groupedByStatus = STATUSES.reduce(
    (acc, status) => {
      acc[status] = (prospects ?? []).filter((p) => p.status === status);
      return acc;
    },
    {} as Record<string, Prospect[]>,
  );

  const totalCount = prospects?.length ?? 0;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-violet-100 via-indigo-50 to-sky-100">
      <header className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 shrink-0 z-50 shadow-lg">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 text-white backdrop-blur-sm">
                <Rocket className="w-4 h-4" />
              </div>
              <div>
                <h1
                  className="text-lg font-bold tracking-tight leading-tight text-white"
                  data-testid="text-app-title"
                >
                  JobTrackr
                </h1>
                <p className="text-xs text-violet-200" data-testid="text-prospect-count">
                  {totalCount} prospect{totalCount !== 1 ? "s" : ""} tracked
                </p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-white text-violet-700 hover:bg-violet-50 font-semibold shadow-md border-0"
                  data-testid="button-add-prospect"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Prospect
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Prospect</DialogTitle>
                </DialogHeader>
                <AddProspectForm onSuccess={() => setDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-3 p-4 h-full min-w-max">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              prospects={groupedByStatus[status] || []}
              isLoading={isLoading}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
