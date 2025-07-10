export interface UserAdmin {
  id: number;
  email: string;
  username: string;
  credits: number;
  subscription_plan: string;
  created_at: string;
  updated_at: string;
}

export interface UserAdminResponse {
  users: UserAdmin[];
  total: number;
}

export interface CreditUpdateRequest {
  userId: number;
  credits: number;
}

export interface SubscriptionUpdateRequest {
  userId: number;
  subscriptionPlan: string;
}
