import { Link, useRouterState, useNavigate, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CalendarDays,
  ClipboardCheck, FileText, DollarSign, BarChart3, Settings, User,
  LogOut, Menu, Bell, Search, Sun, Moon, ChevronDown, Home as FileCheck, Layers, Clock, Award, Mail, ClipboardList
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { notifications, type Role } from "@/lib/mock-data";

interface NavItem { label: string; to: string; icon: typeof LayoutDashboard; }

const navByRole: Record<Role, NavItem[]> = {
  admin: [
    { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Students", to: "/admin/students", icon: Users },
    { label: "Teachers", to: "/admin/teachers", icon: GraduationCap },
    { label: "Classes", to: "/admin/classes", icon: Layers },
    { label: "Attendance", to: "/admin/attendance", icon: ClipboardCheck },
    { label: "Examinations", to: "/admin/exams", icon: FileText },
    { label: "Fees & Finance", to: "/admin/fees", icon: DollarSign },
    { label: "Events", to: "/admin/events", icon: CalendarDays },
    { label: "Contact Submissions", to: "/admin/contacts", icon: Mail },
    { label: "Admission Forms", to: "/admin/admissions", icon: ClipboardList },
    { label: "Reports", to: "/admin/reports", icon: BarChart3 },
    { label: "Settings", to: "/admin/settings", icon: Settings },
    { label: "Profile", to: "/admin/profile", icon: User },
  ],
  teacher: [
    { label: "Dashboard", to: "/teacher/dashboard", icon: LayoutDashboard },
    { label: "My Classes", to: "/teacher/classes", icon: Layers },
    { label: "My Subjects", to: "/teacher/subjects", icon: BookOpen },
    { label: "Assignments", to: "/teacher/assignments", icon: FileCheck },
    { label: "Attendance", to: "/teacher/attendance", icon: ClipboardCheck },
    { label: "Exams", to: "/teacher/exams", icon: FileText },
    { label: "Timetable", to: "/teacher/timetable", icon: Clock },
    { label: "Profile", to: "/teacher/profile", icon: User },
  ],
  student: [
    { label: "Dashboard", to: "/student/dashboard", icon: LayoutDashboard },
    { label: "Subjects", to: "/student/subjects", icon: BookOpen },
    { label: "Assignments", to: "/student/assignments", icon: FileCheck },
    { label: "Attendance", to: "/student/attendance", icon: ClipboardCheck },
    { label: "Exam Schedule", to: "/student/exams", icon: FileText },
    { label: "Results", to: "/student/results", icon: Award },
    { label: "Fees", to: "/student/fees", icon: DollarSign },
    { label: "Timetable", to: "/student/timetable", icon: Clock },
    { label: "Profile", to: "/student/profile", icon: User },
  ],
};

export function  DashboardLayout({ role }: { role: Role }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const items = navByRole[role];

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const roleLabels = { admin: "Administrator", teacher: "Teacher", student: "Student" };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-sidebar transition-transform lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link to="/"><Logo /></Link>
        </div>
        <nav className="flex flex-col gap-1 p-3 overflow-y-auto h-[calc(100vh-4rem)]">
          <p className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">{roleLabels[role]}</p>
          {items.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-card"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="mt-auto pt-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </nav>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 backdrop-blur px-4 sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search students, subjects, events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/50 border-0"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center bg-brand text-brand-foreground">
                    {notifications.filter(n => n.unread).length}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map(n => (
                  <DropdownMenuItem key={n.id} className="flex-col items-start gap-1 py-2">
                    <div className="flex w-full items-center justify-between">
                      <span className="font-medium text-sm">{n.title}</span>
                      {n.unread && <span className="h-2 w-2 rounded-full bg-brand" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                    <p className="text-xs text-muted-foreground/70">{n.time}</p>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 pl-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-gradient-brand text-white text-xs">{user ? (user.first_name?.[0]?.toUpperCase() || '') + (user.last_name?.[0]?.toUpperCase() || '') || user.email[0].toUpperCase() : "U"}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium">{user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : ''}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : ''}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem asChild><Link to={`/${role}/profile`}><User className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive"><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
