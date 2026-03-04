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
}

export interface Report {
  id: string;
  user_id: string;
  user: User;
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
