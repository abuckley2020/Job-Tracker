import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Prospect } from "@shared/schema";
import { STATUSES, INTEREST_LEVELS } from "@shared/schema";
import { ProspectCard } from "@/components/prospect-card";
import { AddProspectForm } from "@/components/add-prospect-form";
import { Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type InterestFilter = "All" | (typeof INTEREST_LEVELS)[number];

const interestFilterOptions: InterestFilter[] = ["All", ...INTEREST_LEVELS];

const interestFilterColors: Record<string, { active: string; inactive: string }> = {
  All: {
    active: "bg-primary text-primary-foreground",
    inactive: "text-muted-foreground hover:text-foreground",
  },
  High: {
    active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400",
    inactive: "text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400",
  },
  Medium: {
    active: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400",
    inactive: "text-muted-foreground hover:text-amber-700 dark:hover:text-amber-400",
  },
  Low: {
    active: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    inactive: "text-muted-foreground hover:text-slate-600 dark:hover:text-slate-400",
  },
};

const columnColors: Record<string, string> = {
  Bookmarked: "bg-blue-500",
  Applied: "bg-indigo-500",
  "Phone Screen": "bg-violet-500",
  Interviewing: "bg-amber-500",
  Offer: "bg-emerald-500",
  Rejected: "bg-red-500",
  Withdrawn: "bg-gray-500",
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

  const visibleProspects =
    interestFilter === "All"
      ? prospects
      : prospects.filter((p) => p.interestLevel === interestFilter);

  return (
    <div
      className="flex flex-col min-w-[260px] max-w-[320px] w-full bg-muted/40 rounded-md"
      data-testid={`column-${slug}`}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
        <div className={`w-2 h-2 rounded-full shrink-0 ${columnColors[status] || "bg-gray-400"}`} />
        <h3 className="text-sm font-semibold truncate">{status}</h3>
        <Badge
          variant="secondary"
          className="ml-auto text-[10px] px-1.5 py-0 h-5 min-w-[20px] flex items-center justify-center no-default-active-elevate"
          data-testid={`badge-count-${slug}`}
        >
          {visibleProspects.length}
        </Badge>
      </div>

      <div
        className="flex items-center gap-0.5 px-2 pt-2 pb-1"
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
              className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                isActive ? colors.active : colors.inactive
              }`}
            >
              {level}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1.5">
        <div className="space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-28 rounded-md" />
              <Skeleton className="h-20 rounded-md" />
            </>
          ) : visibleProspects.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-8 text-center"
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
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm shrink-0 z-50">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight leading-tight" data-testid="text-app-title">
                  JobTrackr
                </h1>
                <p className="text-xs text-muted-foreground" data-testid="text-prospect-count">
                  {totalCount} prospect{totalCount !== 1 ? "s" : ""} tracked
                </p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-prospect">
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
