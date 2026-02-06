import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "ghost" | "outline";
}

export function ThemeToggle({ className, variant = "ghost" }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("light") ? "light" : "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
    localStorage.setItem("lwe-theme", theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem("lwe-theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
    }
  }, []);

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn("h-9 w-9", className)}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
      ) : (
        <Moon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
      )}
    </Button>
  );
}
