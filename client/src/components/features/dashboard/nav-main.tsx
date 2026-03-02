import { Link, useMatches } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.fullPath ?? "";
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarGroup>
    <SidebarGroupLabel className="tracking-widest">MENU</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive =
            currentPath === item.url ||
            (item.url !== "/" && currentPath.startsWith(item.url));

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive} tooltip={item.title} >
                <Link to={item.url} onClick={() => setOpenMobile(false)}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
