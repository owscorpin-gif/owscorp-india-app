export type UserRole = 'customer' | 'developer' | 'admin';
export type ServiceStatus = 'draft' | 'published' | 'suspended';
export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';
export type FeedbackType = 'review' | 'complaint';

export interface Profile {
  id: string;
  role: UserRole;
  full_name?: string;
  company_name?: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  aadhar_number?: string;
  pan_number?: string;
  qualification?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  created_at: string;
}

export interface Service {
  id: string;
  developer_id: string;
  title: string;
  description: string;
  platform: string;
  category_id?: string;
  price: number;
  features: string[];
  tags: string[];
  preview_images: string[];
  demo_url?: string;
  download_url?: string;
  status: ServiceStatus;
  views_count: number;
  sales_count: number;
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  service_id: string;
  developer_id: string;
  amount: number;
  commission: number;
  payment_gateway: string;
  payment_id?: string;
  payment_status?: string;
  status: OrderStatus;
  transaction_data?: Record<string, any>;
  created_at: string;
  completed_at?: string;
}

export interface Review {
  id: string;
  service_id: string;
  customer_id: string;
  order_id: string;
  rating: number;
  comment?: string;
  is_verified: boolean;
  created_at: string;
}

export interface Feedback {
  id: string;
  service_id?: string;
  customer_id: string;
  type: FeedbackType;
  rating?: number;
  message: string;
  is_public: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  service_id?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
