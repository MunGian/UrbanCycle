export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  location?: string;
  bio?: string;
  last_categories_viewed?: string[];
  created_at?: Date;
  role?: string;
}

export interface ListedItem {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  is_free?: boolean;
  price?: number;
  status: string;
  date: string;
  images: string[] | string;
  created_at?: Date;
  updated_at?: Date;
}

export interface MarketplaceItem {
  user: User;
  listed_item: ListedItem;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  seller: string;
  avatar: string;
  image: string;
  quantity: number;
  location?: string;
  selected?: boolean;
  category: string;
  originalItem?: MarketplaceItem;
}

export interface Report {
  id: string;
  user_id: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  type: string;
  status: "Pending" | "In Progress" | "Resolved";
  created_at: string;
  updated_at?: string;
  images?: string[];
}

export interface MessageRoom {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message: string | null;
  last_message_type: "text" | "image" | null;
  last_message_at: string | null;
  last_message_sender_id?: string | null;
  created_at: string;
  updated_at: string;
  user1_unread_count?: number;
  user2_unread_count?: number;
  user1?: User;
  user2?: User;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  type: "text" | "image";
  content: string;
  created_at: string;
}

export interface Review {
  id?: string;
  transaction_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
}

export interface TransactionRequest {
  id: string;
  buyer_id: string;
  seller_id: string;
  item_id: string;
  status: "pending" | "approved" | "rejected" | "completed";
  created_at: string;
  item?: ListedItem;
  buyer?: User;
  seller?: User;
}
