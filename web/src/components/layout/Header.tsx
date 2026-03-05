"use client";

import { User, Menu, LogOut, KeyRound, UserCog } from "lucide-react";
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
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ChangePasswordModal } from "@/components/auth/ChangePasswordModal";
import { EditProfileModal } from "@/components/auth/EditProfileModal";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useUserStore } from "@/lib/zustand/useUserStore";

export function Header() {
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const displayName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : "Admin Officer";

  const displayEmail = user?.email || "admin@urbancycle.com";

  return (
    <>
      <ChangePasswordModal
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      />
      <EditProfileModal
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
      />
      <header className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 px-4 sm:px-6 flex items-center justify-between transition-all duration-200">
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Trigger */}
          <div className="md:hidden relative z-200">
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
                <DropdownMenuItem
                  className="w-full flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  <UserCog className="h-4 w-4" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="w-full flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setIsChangePasswordOpen(true)}
                >
                  <KeyRound className="h-4 w-4" />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="w-full flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 pl-2 hover:bg-gray-50 rounded-lg p-1 transition-colors outline-none cursor-pointer">
                <div className="text-right sm:block">
                  <p className="text-sm font-medium text-gray-900 leading-none">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {user?.department
                      ? user.department + " Dept."
                      : "Sanitization Dept."}
                  </p>
                </div>
                <div className="h-10 w-10 relative bg-emerald-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                  {user?.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-emerald-700" />
                  )}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {displayName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {displayEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsEditProfileOpen(true)}>
                <UserCog className="mr-2 h-4 w-4" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
