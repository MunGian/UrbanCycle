export type Category =
  | "All"
  | "Clothing"
  | "Electronics"
  | "Furniture"
  | "Books"
  | "Home & Garden"
  | "Sports";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  location?: string;
  bio?: string;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  price: number;
  seller: string;
  avatar: string;
  image: string;
  condition: string;
  category: Category;
  location?: string;
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
}

export interface ListedItem {
  id: string;
  title: string;
  category: string;
  condition: string;
  status: "Active" | "Pending" | "Donated";
  date: string;
  image?: string;
  views: number;
}

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  status?: "sent" | "delivered" | "read";
}

export interface Report {
  id: string;
  location: string;
  description: string;
  type: string;
  status: "Pending" | "In Progress" | "Resolved";
  date: string;
  image?: string;
}

export default {};