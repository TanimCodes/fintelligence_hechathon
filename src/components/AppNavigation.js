
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  ChartNoAxesCombined,
  Target,
  BrainCircuit,
  Settings,
} from "lucide-react";

const links = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Analytics", href: "/analytics", icon: ChartNoAxesCombined },
  { name: "Budgets", href: "/budgets", icon: Target },
  { name: "AI Assistant", href: "/ai-assistant", icon: BrainCircuit },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap gap-2">
      {links.map(({ name, href, icon: Icon }) => {
        const active = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
              active
                ? "bg-teal-400 text-slate-950"
                : "border border-slate-700 bg-slate-900 text-slate-300 hover:border-teal-400 hover:text-teal-300"
            }`}
          >
            <Icon size={18} />
            {name}
          </Link>
        );
      })}
    </nav>
  );
}
