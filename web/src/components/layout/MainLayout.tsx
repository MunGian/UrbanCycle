"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Loader2 } from "lucide-react";
import { useUserStore } from "@/lib/zustand/useUserStore";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const [sessionChecked, setSessionChecked] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        if (pathname !== "/login") {
          router.replace("/login");
        } else {
          setSessionChecked(true);
        }
        return;
      }

      // Verify user role
      const { data: userProfile, error } = await supabase
        .from("user")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error || userProfile?.role !== "admin") {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      setUser(userProfile);
      if (pathname === "/login") {
        router.replace("/");
      } else {
        setSessionChecked(true);
      }
    };

    checkAuth();
  }, [pathname, router, supabase]);

  if (!sessionChecked) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
