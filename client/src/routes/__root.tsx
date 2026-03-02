import { createRootRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { DashboardLayout } from "@/components/features/dashboard/dashboard-layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

function RootComponent() {
	const { data: session, isPending } = useSession();
	const navigate = useNavigate();
	const { pathname } = useLocation();

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<Loader2 className="size-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	// Don't require auth for login page
	if (pathname === "/login" || pathname === "/reset-password") {
		return (
			<>
				<Outlet />
				<TanStackRouterDevtools />
			</>
		);
	}

	// Require auth for all other pages
	if (!session?.user) {
		navigate({ to: "/login" });
		return null;
	}

	return (
		<TooltipProvider>
			<DashboardLayout>
				<Outlet />
			</DashboardLayout>
			<TanStackRouterDevtools />
		</TooltipProvider>
	);
}

export const Route = createRootRoute({
	component: RootComponent,
});
