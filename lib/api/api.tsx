import { User } from "@/lib/api/apiModel";
import { supabase } from "@/lib/utils/supabase";

export const fetchUserProfile = async (uid: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .eq("id", uid)
    .single();

  if (error) {
    console.error("Fetch user profile error:", error);
    return null;
  }

  return data as User | null;
};
