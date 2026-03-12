import { MarketplaceItem, Report, User } from "@/lib/api/apiModel";
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

/* -------------------- Cart Functions -------------------- */
export const addToCart = async (userId: string, itemId: string) => {
  const { error } = await supabase.from("cart").insert({
    user_id: userId,
    item_id: itemId,
    quantity: 1,
  });

  if (error) throw error;
};

export const removeFromCart = async (itemId: string) => {
  const { error } = await supabase.from("cart").delete().eq("id", itemId);
  return { error };
};

export const getCartItems = async (userId: string) => {
  const { data, error } = await supabase
    .from("cart")
    .select(
      `
      id,
      quantity,
      item:item_id (
        id,
        title,
        price,
        description,
        images,
        location,
        category,
        is_free,
        user:user_id (
          id,
          first_name,
          last_name,
          avatar_url
        )
      )
    `,
    )
    .eq("user_id", userId);

  if (error) throw error;

  return data;
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
  query = query.eq("status", "Active");

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

export const insertItem = async (item: any) => {
  const { error } = await supabase.from("item").insert(item);
  if (error) throw error;
};

export const deleteItem = async (itemId: string) => {
  // Fetch item to get images
  const { data: item } = await supabase
    .from("item")
    .select("images")
    .eq("id", itemId)
    .single();

  if (item?.images && Array.isArray(item.images)) {
    const imagePaths = item.images.map((url: string) => {
      // Extract filename from URL
      return url.substring(url.lastIndexOf("/") + 1);
    });

    if (imagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("item-images")
        .remove(imagePaths);

      if (storageError) console.error("Error deleting images:", storageError);
    }
  }

  const { error } = await supabase.from("item").delete().eq("id", itemId);
  if (error) throw error;
};

export const updateItem = async (itemId: string, updates: any) => {
  const { error } = await supabase
    .from("item")
    .update(updates)
    .eq("id", itemId);
  if (error) throw error;
};

// -------------------- Report Functions --------------------

export const uploadReportImage = async (
  userId: string,
  imageUri: string,
): Promise<string> => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();
    const fileExt = imageUri.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("report-images")
      .upload(filePath, arrayBuffer, {
        contentType: blob.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("report-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error("Error uploading report image:", err);
    throw err;
  }
};

export const submitReport = async (
  reportData: Omit<Report, "id" | "status" | "created_at">,
) => {
  const { error } = await supabase.from("reports").insert([
    {
      ...reportData,
      status: "Pending",
    },
  ]);

  if (error) {
    console.error("Error submitting report:", error);
    throw error;
  }
};

export const fetchUserReports = async (userId: string): Promise<Report[]> => {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user reports:", error);
    return [];
  }

  return data as Report[];
};

export const updateLastViewedCategory = async (
  userId: string,
  category: string,
  currentCategories: string[],
) => {
  const newCategories = [...(currentCategories || [])];
  if (newCategories.includes(category)) {
    return currentCategories;
  }
  newCategories.push(category);
  if (newCategories.length > 3) {
    newCategories.shift();
  }

  const { error } = await supabase
    .from("user")
    .update({ last_categories_viewed: newCategories })
    .eq("id", userId);

  if (error) {
    console.error("Update categories error:", error);
    return currentCategories;
  }

  return newCategories;
};

/* -------------------- Transaction/Reservation Functions -------------------- */

export const createReservationRequest = async (
  buyerId: string,
  sellerId: string,
  itemId: string,
) => {
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      buyer_id: buyerId,
      seller_id: sellerId,
      item_id: itemId,
      status: "pending",
    })
    .select()
    .single();

  console.log("error:", error);
  if (error) throw error;
  return data;
};

export const getSellerRequests = async (sellerId: string) => {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      *,
      item:item_id (*),
      buyer:buyer_id (*)
    `,
    )
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const updateRequestStatus = async (
  requestId: string,
  status: "approved" | "rejected",
  itemId: string,
) => {
  if (status === "approved") {
    // 1. Update transaction status
    const { error: updateTransError } = await supabase
      .from("transactions")
      .update({ status: "approved" })
      .eq("id", requestId);

    if (updateTransError) throw updateTransError;

    // 2. Update item status to Reserved
    const { error: updateItemError } = await supabase
      .from("item")
      .update({ status: "Reserved" })
      .eq("id", itemId);

    if (updateItemError) throw updateItemError;
  } else {
    const { error } = await supabase
      .from("transactions")
      .update({ status: "rejected" })
      .eq("id", requestId);

    if (error) throw error;
  }
};

export const getBuyerRequests = async (buyerId: string) => {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      *,
      item:item_id (*),
      seller:seller_id (*)
    `,
    )
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};
