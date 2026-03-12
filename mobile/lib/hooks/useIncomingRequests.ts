import { useEffect, useState } from "react";
import { supabase } from "@/lib/utils/supabase";
import { useUserStore } from "@/lib/zustand/useUserStore";

export const useIncomingRequests = () => {
  const user = useUserStore((s) => s.user);
  const [requestCount, setRequestCount] = useState<number>(0);

  useEffect(() => {
    if (!user) return;

    const fetchRequestCount = async () => {
      const { count, error } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .eq("status", "pending");

      if (error) {
        console.error("Error fetching request count:", error);
        return;
      }

      setRequestCount(count || 0);
    };

    // Initial fetch
    fetchRequestCount();

    // Subscribe to changes
    const subscription = supabase
      .channel("transactions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `seller_id=eq.${user.id}`,
        },
        () => {
          fetchRequestCount();
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return requestCount;
};
