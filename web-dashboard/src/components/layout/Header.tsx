"use client";

import { Bell, Search, User, Menu, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navigation } from "./Sidebar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 px-4 sm:px-6 flex items-center justify-between transition-all duration-200">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Trigger */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                <Menu className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-56 mt-2 p-2 shadow-xl border-gray-100 bg-white/95 backdrop-blur-sm"
            >
              <DropdownMenuLabel className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-2">
                Menu
              </DropdownMenuLabel>
              <div className="space-y-1">
                {navigation.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                          isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4",
                            isActive ? "text-emerald-600" : "text-gray-400",
                          )}
                        />
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </div>
              <DropdownMenuSeparator className="my-2 bg-gray-100" />
              <DropdownMenuItem asChild>
                <Link
                  href="/login"
                  className="w-full flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        <div className="h-8 w-[1px] bg-gray-200 mx-1 hidden sm:block" />

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-none">
              Admin Officer
            </p>
            <p className="text-xs text-gray-500 mt-1">Sanitation Dept.</p>
          </div>
          <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            <User className="h-5 w-5 text-emerald-700" />
          </div>
        </div>
      </div>
    </header>
  );
}
