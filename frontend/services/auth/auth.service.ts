import api, { clearSession, saveAccessToken, unwrap } from "@/lib/api";
import type { CustomerRegisterPayload } from "@/lib/auth/auth.schema";

export type AuthUser = {
  id?: number | string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  city_id?: number | string | null;
  subcity_id?: number | string | null;
  woreda_id?: number | string | null;
  city?: { id?: number | string; name?: string | null } | null;
  subcity?: { id?: number | string; name?: string | null } | null;
  woreda?: { id?: number | string; name?: string | null } | null;
  profile_image?: string | null;
  profile_image_url?: string | null;
  photo_url?: string | null;
  role?: string;
  roles?: string[];
  permissions?: string[];
};

type LoginResponse = {
  token?: string;
  access_token?: string;
  user?: AuthUser;
  roles?: string[];
  permissions?: string[];
  data?: LoginResponse;
};


function normalizeUserResponse(response: any): AuthUser {
  const body = response?.data ?? response;

  return (
    body?.data ??
    body?.user ??
    body?.data?.user ??
    body
  ) as AuthUser;
}


function normalizeLoginResponse(response: unknown): LoginResponse {
  const value = response as { data?: LoginResponse } | LoginResponse;
  return "data" in value && value.data ? value.data : (value as LoginResponse);
}

let currentUser: AuthUser | null = null;
let currentRoles: string[] = [];
let currentPermissions: string[] = [];

export const authService = {
  async login(credentials: { email: string; password: string }) {
    const response = await api.post("/auth/login", credentials);
    return normalizeLoginResponse(unwrap<LoginResponse>(response));
  },

  async registerCustomer(payload: CustomerRegisterPayload) {
    const response = await api.post("/auth/register", payload);
    return normalizeLoginResponse(unwrap<LoginResponse>(response));
  },

  async me() {
    const response = await api.get("/auth/me");
    return normalizeUserResponse(response);
  },

  async profile() {
    try {
      const response = await api.get("/profile");
      return normalizeUserResponse(response);
    } catch {
      const response = await api.get("/auth/me");
      return normalizeUserResponse(response);
    }
  },
  async faydaLogin(code: string) {
  const response = await api.post(
    "/auth/fayda/callback",
    {
      code,
    }
  );

  return response.data;
},
  async updateProfile(payload: FormData) {
    const response = await api.post("/profile/update", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return normalizeUserResponse(response);
  },

  async changeOwnPassword(payload: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }) {
    const response = await api.post("/profile/change-password", payload);
    return unwrap<{ success: boolean; message: string }>(response);
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      clearSession();
    }
  },

  saveSession(response: LoginResponse) {
    const token = response.token ?? response.access_token ?? response.data?.token ?? response.data?.access_token;
    const user = response.user ?? response.data?.user ?? null;
    if (token) {
      saveAccessToken(token);
    }
    currentUser = user;
    currentRoles = response.roles ?? response.data?.roles ?? user?.roles ?? (user?.role ? [user.role] : []);
    currentPermissions = response.permissions ?? response.data?.permissions ?? user?.permissions ?? [];
  },

  getStoredUser(): AuthUser | null { return currentUser; },
  getStoredRoles(): string[] { return currentRoles; },
  getStoredPermissions(): string[] { return currentPermissions; },
};
