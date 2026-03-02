import { createFileRoute } from "@tanstack/react-router";
import { Store, DollarSign, ShoppingCart, Star } from "lucide-react";
import { StatCard } from "@/components/features/dashboard/stat-card";
import { RevenueChart } from "@/components/features/dashboard/revenue-chart";
import { ActivityFeed } from "@/components/features/dashboard/activity-feed";
import {
  RestaurantsByPlan,
  RestaurantsByCuisine,
} from "@/components/features/dashboard/plan-distribution";
import {
  getDashboardStats,
  formatCurrency,
  formatNumber,
  revenueData,
  recentActivity,
} from "@/lib/data";

export const Route = createFileRoute("/")({
  component: DashboardOverview,
});

function DashboardOverview() {
  const stats = getDashboardStats();

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your restaurant portfolio performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Restaurants"
          value={stats.totalRestaurants.toString()}
          change={`${stats.activeRestaurants} active, ${stats.pendingRestaurants} pending`}
          changeType="neutral"
          icon={Store}
          iconColor="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.totalRevenue)}
          change="+12.5% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="bg-sky-500/10 text-sky-600"
        />
        <StatCard
          title="Total Orders"
          value={formatNumber(stats.totalOrders)}
          change="+8.2% from last month"
          changeType="positive"
          icon={ShoppingCart}
          iconColor="bg-violet-500/10 text-violet-600"
        />
        <StatCard
          title="Avg Rating"
          value={stats.avgRating.toString()}
          change="Across all active restaurants"
          changeType="neutral"
          icon={Star}
          iconColor="bg-amber-500/10 text-amber-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <RevenueChart data={revenueData} />
        <ActivityFeed activities={recentActivity} />
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <RestaurantsByPlan />
        <RestaurantsByCuisine />
      </div>
    </div>
  );
}
