import { MarketplaceItem, User } from "@/lib/api/apiModel";
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

/* -------------------- Upload item image -------------------- */
export const uploadItemImage = async (userId: string, imageUri: string) => {
  const response = await fetch(imageUri);
  const arrayBuffer = await response.arrayBuffer();
  const fileName = `${userId}_${Date.now()}.jpg`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from("item-images")
    .upload(filePath, arrayBuffer, {
      upsert: true,
      contentType: "image/jpeg",
    });

  if (error) throw error;

  const { data } = supabase.storage.from("item-images").getPublicUrl(filePath);

  return data.publicUrl;
};

export const insertItem = async (item: any) => {
  const { error } = await supabase.from("item").insert(item);
  if (error) throw error;
};

export const fetchUserItems = async (userId: string) => {
  const { data, error } = await supabase
    .from("item")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch user items error:", error);
    return [];
  }

  return data;
};

export const fetchMarketplaceItems = async (): Promise<MarketplaceItem[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase.from("item").select("*, user:user_id (*)");

  if (user) {
    query = query.neq("user_id", user.id);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch marketplace items error:", error);
    return [];
  }

  return data.map((item: any) => ({
    user: item.user,
    listed_item: {
      id: item.id,
      title: item.title,
      category: item.category,
      location: item.location,
      description: item.description,
      is_free: item.is_free,
      price: item.price,
      status: item.status,
      date: item.created_at,
      images: item.images,
      created_at: item.created_at,
      updated_at: item.updated_at,
    },
  }));
};
