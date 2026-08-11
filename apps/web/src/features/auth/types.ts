export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: "ORGANIZER" | "CLIENT" | "GATE";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};
