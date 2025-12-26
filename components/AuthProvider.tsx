import FillUpDetailsBottomSheet from "@/app/auth/components/FillUpDetailsBottomSheet";
import { fetchUserProfile } from "@/lib/api/api";
import { supabase } from "@/lib/utils/supabase";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { useEffect } from "react";
import { SooBottomSheet } from "./SooBottomSheetController";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const clearUser = useUserStore((s) => s.clearUser);
  const onUserNameEmpty = () => {
    setTimeout(() => {
      SooBottomSheet.push({
        title: "Enter your details",
        needPadding: true,
        needCloseButton: false,
        isDismissible: false,
        child: <FillUpDetailsBottomSheet />,
      });
    }, 1200);
  };

  useEffect(() => {
    // Initial session
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      //   console.log("Initial session:", data);
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUser(profile);
        console.log("Initial session user profile:", profile);
      } else {
        clearUser();
      }
    });

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, session);
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUser(profile);
        if (!profile?.first_name) {
          onUserNameEmpty();
        }
      } else {
        clearUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
};
