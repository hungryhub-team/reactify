import {
  Store,
  ArrowUpRight,
  CreditCard,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityItem } from "@/lib/data";

function getActivityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "restaurant_added":
      return <Store className="size-4 text-emerald-500" />;
    case "plan_upgraded":
      return <ArrowUpRight className="size-4 text-violet-500" />;
    case "payment_received":
      return <CreditCard className="size-4 text-sky-500" />;
    case "issue_resolved":
      return <CheckCircle2 className="size-4 text-emerald-500" />;
    case "review_flagged":
      return <AlertCircle className="size-4 text-amber-500" />;
    default:
      return <MessageSquare className="size-4 text-muted-foreground" />;
  }
}

function timeAgo(timestamp: string): string {
  const now = new Date("2026-02-24T12:00:00");
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        <p className="text-sm text-muted-foreground">Latest updates from your restaurants</p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-0">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={`flex items-start gap-3 py-3 ${
                index < activities.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 space-y-0.5 overflow-hidden">
                <p className="text-sm font-medium truncate">
                  {activity.restaurantName}
                </p>
                <p className="text-xs text-muted-foreground">{activity.message}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {timeAgo(activity.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
