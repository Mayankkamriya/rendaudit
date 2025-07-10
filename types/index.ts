export interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  carModel: string;
  carYear: number;
  mileage: number;
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'automatic' | 'manual';
  features: string[];
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  _id: string;
  action: 'approve' | 'reject' | 'edit';
  listingId: string;
  listingTitle: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  previousStatus?: string;
  newStatus?: string;
  changes?: Record<string, any>;
  timestamp: Date;
}

export interface Admin {
  _id: string;
  email: string;
  name: string;
  password: string;
  role: 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
} 