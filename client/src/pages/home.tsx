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

const interestBadgeColors: Record<string, string> = {
  All: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  High: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
  Medium: "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
  Low: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300",
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
  return (
    <div
      className="flex flex-col min-w-[260px] max-w-[320px] w-full bg-muted/40 rounded-md"
      data-testid={`column-${status.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
        <div className={`w-2 h-2 rounded-full ${columnColors[status] || "bg-gray-400"}`} />
        <h3 className="text-sm font-semibold truncate">{status}</h3>
        <Badge
          variant="secondary"
          className="ml-auto text-[10px] px-1.5 py-0 h-5 min-w-[20px] flex items-center justify-center no-default-active-elevate"
          data-testid={`badge-count-${status.replace(/\s+/g, "-").toLowerCase()}`}
        >
          {prospects.length}
        </Badge>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-28 rounded-md" />
              <Skeleton className="h-20 rounded-md" />
            </>
          ) : prospects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center" data-testid={`empty-${status.replace(/\s+/g, "-").toLowerCase()}`}>
              <p className="text-xs text-muted-foreground">No prospects</p>
            </div>
          ) : (
            prospects.map((prospect) => (
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
  const [interestFilter, setInterestFilter] = useState<InterestFilter>("All");

  const { data: prospects, isLoading } = useQuery<Prospect[]>({
    queryKey: ["/api/prospects"],
  });

  const filteredProspects = (prospects ?? []).filter(
    (p) => interestFilter === "All" || p.interestLevel === interestFilter,
  );

  const groupedByStatus = STATUSES.reduce(
    (acc, status) => {
      acc[status] = filteredProspects.filter((p) => p.status === status);
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
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5" data-testid="interest-filter">
                {interestFilterOptions.map((level) => (
                  <button
                    key={level}
                    onClick={() => setInterestFilter(level)}
                    data-testid={`filter-${level.toLowerCase()}`}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer border ${
                      interestFilter === level
                        ? `${interestBadgeColors[level]} border-transparent ring-2 ring-offset-1 ring-primary/30`
                        : `${interestBadgeColors[level]} border-transparent opacity-60`
                    }`}
                  >
                    {level}
                  </button>
                ))}
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
