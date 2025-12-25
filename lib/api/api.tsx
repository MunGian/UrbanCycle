import { User } from "@/lib/api/apiModel";
import { supabase } from "@/lib/utils/supabase";
import { Alert } from "react-native";

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

export const insertUserName = async (firstName: string, lastName: string) => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  console.log("Current user:", user, authError);
  if (!user) {
    Alert.alert("Error", "User not authenticated");
    return;
  }

  const { error } = await supabase.from("user").upsert({
    id: user.id,
    email: user.email,
    first_name: firstName,
    last_name: lastName,
  });

  if (error) {
    console.error("Profile upsert error:", error);
    Alert.alert("Error", "Failed to save profile");
    return;
  }

  return await fetchUserProfile(user.id);
};

/* -------------------- Upload avatar -------------------- */
export const upsertAvatar = async (userId: string, avatarUri: string) => {
  const response = await fetch(avatarUri);
  const arrayBuffer = await response.arrayBuffer();
  const filePath = `${userId}.jpg`;

  const { error } = await supabase.storage
    .from("user-avatars")
    .upload(filePath, arrayBuffer, {
      upsert: true,
      contentType: "image/jpeg",
    });

  if (error) throw error;

  const { data } = supabase.storage.from("user-avatars").getPublicUrl(filePath);

  return data.publicUrl;
};
