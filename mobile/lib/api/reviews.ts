import { supabase } from "@/lib/utils/supabase";
import { Review } from "./apiModel";

export const submitReview = async (review: Review) => {
  const { error } = await supabase.from("reviews").insert(review);
  if (error) throw error;
};

export const fetchUserReviews = async (userId: string) => {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      transaction:transaction_id(
        item:item_id(title, images)
      ),
      reviewer:reviewer_id(first_name, last_name, avatar_url)
    `)
    .eq("reviewee_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getTransactionReview = async (transactionId: string, reviewerId: string) => {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("transaction_id", transactionId)
    .eq("reviewer_id", reviewerId)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 is "no rows found"
  return data;
};
