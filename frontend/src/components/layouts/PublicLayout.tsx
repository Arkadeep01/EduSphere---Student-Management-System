import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const nav: any[] = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/admissions", label: "Admissions" },
  { to: "/courses", label: "Courses" },
  { to: "/teachers", label: "Faculty" },
  { to: "/gallery", label: "Gallery" },
  { to: "/events", label: "Events" },
  { to: "/contact", label: "Contact" },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 ">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
          <Link to="/"><Logo /></Link>
          <nav className="hidden lg:flex items-center gap-1">
            {nav.map(n => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  pathname === n.to ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link to={"/login" as any}>Sign in</Link></Button>
            <Button asChild size="sm" className="bg-gradient-brand hover:opacity-90 border-0"><Link to={"/admissions" as any}>Apply Now</Link></Button>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {open && (
          <div className="lg:hidden border-t bg-background">
            <nav className="container mx-auto flex flex-col p-4 gap-1 max-w-7xl">
              {nav.map(n => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                  className={cn("px-3 py-2 rounded-md text-sm font-medium",
                    pathname === n.to ? "bg-primary/10 text-primary" : "hover:bg-muted")}>
                  {n.label}
                </Link>
              ))}
              <Link to={"/login" as any} onClick={() => setOpen(false)} className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-md">Sign in</Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-muted/30 mt-20">
        <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-4 max-w-7xl">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              A modern student management platform empowering schools, teachers, and students.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to={"/about" as any} className="hover:text-foreground">About Us</Link></li>
              <li><Link to={"/courses" as any} className="hover:text-foreground">Courses</Link></li>
              <li><Link to={"/teachers" as any} className="hover:text-foreground">Faculty</Link></li>
              <li><Link to={"/events" as any} className="hover:text-foreground">Events</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to={"/faq" as any} className="hover:text-foreground">FAQ</Link></li>
              <li><Link to={"/contact" as any} className="hover:text-foreground">Contact</Link></li>
              <li><Link to={"/admissions" as any} className="hover:text-foreground">Admissions</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Stay in touch</h4>
            <p className="text-sm text-muted-foreground">123 Education Blvd, Knowledge City</p>
            <p className="text-sm text-muted-foreground">hello@edusphere.edu</p>
            <p className="text-sm text-muted-foreground">+1 (555) 010-2025</p>
          </div>
        </div>
        <div className="border-t py-4 text-center text-xs text-muted-foreground">
          © 2026 EduSphere. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
