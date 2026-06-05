import { NavLink } from "react-router-dom"
import { 
  BarChart2, 
  Database, 
  History, 
  Home, 
  Lightbulb, 
  LineChart, 
  Settings, 
  TerminalSquare, 
  Upload
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const mainNavigation = [
  { name: "Dashboard", url: "/", icon: Home },
  { name: "Data Upload", url: "/upload", icon: Upload },
  { name: "Dataset Overview", url: "/overview", icon: Database },
]

const analysisNavigation = [
  { name: "Statistics", url: "/statistics", icon: BarChart2 },
  { name: "Machine Learning", url: "/ml", icon: Settings },
  { name: "Visualizations", url: "/visualizations", icon: LineChart },
  { name: "Advanced Analysis", url: "/advanced", icon: Settings },
]

const systemNavigation = [
  { name: "AI Insights", url: "/insights", icon: Lightbulb },
  { name: "Analysis History", url: "/history", icon: History },
  { name: "CLI Guide", url: "/cli", icon: TerminalSquare },
]

export function AppSidebar() {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <BarChart2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 group-data-[collapsible=icon]:hidden">
            StatToolkit ⭐
          </span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild tooltip={item.name}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => 
                        isActive ? "bg-accent text-accent-foreground font-medium" : ""
                      }
                    >
                      <item.icon />
                      <span>{item.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Analysis</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analysisNavigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild tooltip={item.name}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => 
                        isActive ? "bg-accent text-accent-foreground font-medium" : ""
                      }
                    >
                      <item.icon />
                      <span>{item.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNavigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild tooltip={item.name}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => 
                        isActive ? "bg-accent text-accent-foreground font-medium" : ""
                      }
                    >
                      <item.icon />
                      <span>{item.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          v1.0.0 Alpha
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
