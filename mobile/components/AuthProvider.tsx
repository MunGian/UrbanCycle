import FillUpDetailsBottomSheet from "@/app/auth/components/FillUpDetailsBottomSheet";
import { fetchUserProfile } from "@/lib/api/api";
import { supabase } from "@/lib/utils/supabase";
import { useUserStore } from "@/lib/zustand/useUserStore";
import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef } from "react";
import { SooBottomSheet } from "./SooBottomSheetController";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const setUser = useUserStore((s) => s.setUser);
  const clearUser = useUserStore((s) => s.clearUser);
  const userDetailsPromptTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const clearUserDetailsPromptTimeout = useCallback(() => {
    if (userDetailsPromptTimeoutRef.current) {
      clearTimeout(userDetailsPromptTimeoutRef.current);
      userDetailsPromptTimeoutRef.current = null;
    }
  }, []);

  const onUserNameEmpty = useCallback(() => {
    clearUserDetailsPromptTimeout();
    userDetailsPromptTimeoutRef.current = setTimeout(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;
      SooBottomSheet.push({
        title: "Enter your details",
        needPadding: true,
        needCloseButton: false,
        isDismissible: false,
        child: <FillUpDetailsBottomSheet />,
      });
    }, 2000);
  }, [clearUserDetailsPromptTimeout]);

  useEffect(() => {
    let isMounted = true;
    let authSyncRequestId = 0;

    const syncSessionUser = async (session: Session | null) => {
      const requestId = ++authSyncRequestId;

      if (!session?.user) {
        clearUserDetailsPromptTimeout();
        if (isMounted && requestId === authSyncRequestId) {
          clearUser();
        }
        return;
      }

      if (!session.user.email_confirmed_at) {
        console.log("Auth session exists but email is not verified yet", {
          userId: session.user.id,
        });
        clearUserDetailsPromptTimeout();
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
        console.log("Failed to sync authenticated user", error);
        clearUserDetailsPromptTimeout();
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
        console.log("Failed to get initial auth session", error);
        clearUserDetailsPromptTimeout();
        if (isMounted) {
          clearUser();
        }
      });

    return () => {
      clearUserDetailsPromptTimeout();
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [clearUser, clearUserDetailsPromptTimeout, onUserNameEmpty, setUser]);

  return <>{children}</>;
};
