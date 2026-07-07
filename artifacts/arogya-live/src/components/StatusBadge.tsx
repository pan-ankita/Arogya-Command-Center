import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

export type StatusColor = "success" | "warning" | "critical" | "default";

export function StatusBadge({ status, text }: { status: StatusColor; text: string }) {
  if (status === "success") {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 pl-1.5 font-medium" data-testid={`status-${text}`}>
        <CheckCircle2 className="h-3.5 w-3.5" />
        {text}
      </Badge>
    );
  }
  
  if (status === "warning") {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 pl-1.5 font-medium" data-testid={`status-${text}`}>
        <AlertTriangle className="h-3.5 w-3.5" />
        {text}
      </Badge>
    );
  }
  
  if (status === "critical") {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 pl-1.5 font-medium" data-testid={`status-${text}`}>
        <AlertCircle className="h-3.5 w-3.5" />
        {text}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-background text-muted-foreground border-border font-medium" data-testid={`status-${text}`}>
      {text}
    </Badge>
  );
}
