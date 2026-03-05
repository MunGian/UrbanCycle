"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, LogOut, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Map View", href: "/map-view", icon: Map },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  const onSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-gray-100 bg-white h-screen sticky top-0 left-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-emerald-100 flex items-center justify-center">
          <Image src="/logo.png" alt="Logo" fill className="object-cover" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          UrbanCycle
        </span>
      </div>

      <div className="px-3 py-2">
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Menu
        </p>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                  active
                    ? "bg-emerald-50 text-emerald-700 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    active
                      ? "text-emerald-600"
                      : "text-gray-400 group-hover:text-gray-600",
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-gray-100 mb-4 mx-3">
        <div
          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-500 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all group hover:shadow-sm cursor-pointer"
          onClick={onSignOut}
        >
          <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
          Sign Out
        </div>
      </div>
    </aside>
  );
}
