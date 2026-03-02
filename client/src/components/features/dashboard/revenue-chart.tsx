import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RevenueDataPoint } from "@/lib/data";
import { formatCurrency } from "@/lib/data";

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
        <p className="text-sm text-muted-foreground">
          Monthly revenue for the last 6 months
        </p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex items-end gap-3 h-52">
          {data.map((point) => {
            const height = (point.revenue / maxRevenue) * 100;
            return (
              <div
                key={point.month}
                className="group relative flex flex-1 flex-col items-center gap-2"
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-14 hidden group-hover:flex flex-col items-center z-10">
                  <div className="rounded-lg bg-foreground px-3 py-1.5 text-xs text-background shadow-lg">
                    <p className="font-semibold">{formatCurrency(point.revenue)}</p>
                    <p className="text-background/70">{point.orders.toLocaleString()} orders</p>
                  </div>
                  <div className="size-2 rotate-45 bg-foreground -mt-1" />
                </div>
                {/* Bar */}
                <div className="relative w-full flex items-end justify-center">
                  <div
                    className="w-full max-w-12 rounded-t-md bg-primary/80 hover:bg-primary transition-colors cursor-pointer"
                    style={{ height: `${height * 2}px` }}
                  />
                </div>
                {/* Label */}
                <span className="text-xs font-medium text-muted-foreground">
                  {point.month}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
