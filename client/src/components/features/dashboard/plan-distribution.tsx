import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { restaurants } from "@/lib/data";

export function RestaurantsByPlan() {
  const plans = [
    { name: "Enterprise", count: restaurants.filter((r) => r.plan === "enterprise").length, color: "bg-amber-500" },
    { name: "Growth", count: restaurants.filter((r) => r.plan === "growth").length, color: "bg-violet-500" },
    { name: "Starter", count: restaurants.filter((r) => r.plan === "starter").length, color: "bg-sky-500" },
  ];

  const total = plans.reduce((sum, p) => sum + p.count, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Plan Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">Restaurants by subscription plan</p>
      </CardHeader>
      <CardContent className="pt-2 space-y-4">
        {/* Stacked bar */}
        <div className="flex h-3 overflow-hidden rounded-full bg-muted">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`${plan.color} transition-all`}
              style={{ width: `${(plan.count / total) * 100}%` }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="space-y-2.5">
          {plans.map((plan) => (
            <div key={plan.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`size-2.5 rounded-full ${plan.color}`} />
                <span className="text-sm text-muted-foreground">{plan.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{plan.count}</span>
                <span className="text-xs text-muted-foreground">
                  ({Math.round((plan.count / total) * 100)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RestaurantsByCuisine() {
  const cuisineCount = restaurants.reduce<Record<string, number>>((acc, r) => {
    acc[r.cuisine] = (acc[r.cuisine] || 0) + 1;
    return acc;
  }, {});

  const sorted = Object.entries(cuisineCount)
    .sort(([, a], [, b]) => b - a);

  const maxCount = Math.max(...sorted.map(([, c]) => c));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Cuisine Types</CardTitle>
        <p className="text-sm text-muted-foreground">Restaurant distribution by cuisine</p>
      </CardHeader>
      <CardContent className="pt-2 space-y-3">
        {sorted.map(([cuisine, count]) => (
          <div key={cuisine} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{cuisine}</span>
              <span className="font-medium">{count}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary/60 transition-all"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
