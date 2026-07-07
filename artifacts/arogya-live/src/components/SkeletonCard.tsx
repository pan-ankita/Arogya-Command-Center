import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SkeletonCard() {
  return (
    <Card className="rounded-2xl shadow-sm border-border" data-testid="skeleton-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-3 w-4/5" />
      </CardContent>
    </Card>
  );
}

export function SkeletonList() {
  return (
    <div className="space-y-3" data-testid="skeleton-list">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center space-x-4 border rounded-xl p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-3 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
