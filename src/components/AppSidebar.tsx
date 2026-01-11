import { 
  Home, 
  FileText, 
  Calendar, 
  ShoppingCart, 
  FolderOpen, 
  Settings,
  FileSpreadsheet
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { 
    title: "Dashboard", 
    url: "/", 
    icon: Home,
    exact: true
  },
  { 
    title: "Mis Requisiciones", 
    url: "/requisiciones", 
    icon: FileText 
  },
  { 
    title: "Formatos FO-CON", 
    url: "/formatos", 
    icon: FileSpreadsheet 
  },
  { 
    title: "PAAAS", 
    url: "/paaas", 
    icon: Calendar 
  },
  { 
    title: "Área Compradora", 
    url: "/area-compradora", 
    icon: ShoppingCart 
  },
  { 
    title: "Catálogos", 
    url: "/catalogos", 
    icon: FolderOpen 
  },
  { 
    title: "Administración", 
    url: "/administracion", 
    icon: Settings 
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-semibold">
            Menú Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const active = isActive(item.url, item.exact);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        {state === "expanded" && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
