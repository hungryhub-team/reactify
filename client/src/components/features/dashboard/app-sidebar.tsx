import { LayoutDashboard, ClipboardList, Users } from "lucide-react";

import { NavMain } from "@/components/features/dashboard/nav-main";
import { NavUser } from "@/components/features/dashboard/nav-user";
import { useSession } from "@/lib/auth-client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: ClipboardList,
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
  },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const user = session?.user;
  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const userImage = user?.image || "";

  return (
    <Sidebar collapsible="icon" {...props} variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg font-bold text-sm">
                  R
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-xs uppercase">Admin Panel</span>
                  <span className="truncate font-bold text-md">Reactify</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="dark:bg-gray-800/50">
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{ name: userName, email: userEmail, image: userImage }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
