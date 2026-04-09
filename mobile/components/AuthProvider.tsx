import FillUpDetailsBottomSheet from "@/app/auth/components/FillUpDetailsBottomSheet";
import { fetchUserProfile } from "@/lib/api/api";
import { supabase } from "@/lib/utils/supabase";
import { useUserStore } from "@/lib/zustand/useUserStore";
import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect } from "react";
import { SooBottomSheet } from "./SooBottomSheetController";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const setUser = useUserStore((s) => s.setUser);
  const clearUser = useUserStore((s) => s.clearUser);

  const onUserNameEmpty = useCallback(() => {
    setTimeout(() => {
      SooBottomSheet.push({
        title: "Enter your details",
        needPadding: true,
        needCloseButton: false,
        isDismissible: false,
        child: <FillUpDetailsBottomSheet />,
      });
    }, 4500);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let authSyncRequestId = 0;

    const syncSessionUser = async (session: Session | null) => {
      const requestId = ++authSyncRequestId;

      if (!session?.user) {
        if (isMounted && requestId === authSyncRequestId) {
          clearUser();
        }
        return;
      }

      try {
        const profile = await fetchUserProfile(session.user.id);
        if (!isMounted || requestId !== authSyncRequestId) return;

        setUser(profile);
        if (profile && !profile.first_name) {
          onUserNameEmpty();
        }
      } catch (error) {
        console.error("Failed to sync authenticated user", error);
        if (isMounted && requestId === authSyncRequestId) {
          clearUser();
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;
      console.log("Auth state changed:", event);
      void syncSessionUser(session);
    });

    void supabase.auth
      .getSession()
      .then(({ data }) => syncSessionUser(data.session))
      .catch((error) => {
        console.error("Failed to get initial auth session", error);
        if (isMounted) {
          clearUser();
        }
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [clearUser, onUserNameEmpty, setUser]);

  return <>{children}</>;
};
