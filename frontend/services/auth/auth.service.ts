import api, { clearSession, unwrap } from "@/lib/api";
import type { CustomerRegisterPayload } from "@/lib/auth/auth.schema";

export type AuthUser = {
  id?: number | string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  profile_image_url?: string | null;
  city_id?: number | string | null;
  subcity_id?: number | string | null;
  woreda_id?: number | string | null;
  location_level?: string | null;
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

function normalizeLoginResponse(response: unknown): LoginResponse {
  const value = response as { data?: LoginResponse } | LoginResponse;
  return "data" in value && value.data ? value.data : (value as LoginResponse);
}

function dataFrom<T>(response: unknown): T {
  const value = unwrap<any>(response);
  return (value?.data ?? value) as T;
}

function setCookie(name: string, value: unknown, maxAgeSeconds = 60 * 60 * 24 * 7) {
  if (typeof document === "undefined") return;

  const encoded = encodeURIComponent(
    typeof value === "string" ? value : JSON.stringify(value)
  );

  document.cookie = `${name}=${encoded}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function clearAuthCookies() {
  deleteCookie("token");
  deleteCookie("roles");
  deleteCookie("permissions");
  deleteCookie("user");
}

function saveUserToStorage(user: AuthUser) {
  if (typeof window === "undefined") return;

  localStorage.setItem("user", JSON.stringify(user));
  setCookie("user", user);
}

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
    return dataFrom<AuthUser>(response);
  },

  /*
  |--------------------------------------------------------------------------
  | AUTHENTICATED PROFILE
  |--------------------------------------------------------------------------
  | Used by /dashboard/profile.
  */
  async profile() {
    const response = await api.get("/auth/profile");
    return dataFrom<AuthUser>(response);
  },

  async updateProfile(payload: FormData) {
    const response = await api.post("/auth/profile", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const user = dataFrom<AuthUser>(response);
    saveUserToStorage(user);

    return user;
  },

  async changeOwnPassword(payload: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }) {
    const response = await api.post("/auth/profile/password", payload);
    return unwrap(response);
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      clearSession();
      clearAuthCookies();
    }
  },

  saveSession(response: LoginResponse) {
    if (typeof window === "undefined") return;

    const token =
      response.token ??
      response.access_token ??
      response.data?.token ??
      response.data?.access_token;

    const user = response.user ?? response.data?.user ?? null;

    const roles =
      response.roles ??
      response.data?.roles ??
      user?.roles ??
      (user?.role ? [user.role] : []);

    const permissions =
      response.permissions ??
      response.data?.permissions ??
      user?.permissions ??
      [];

    if (token) {
      localStorage.setItem("token", token);
      setCookie("token", token);
    }

    if (user) {
      saveUserToStorage(user);
    }

    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("permissions", JSON.stringify(permissions));

    setCookie("roles", roles);
    setCookie("permissions", permissions);
  },

  getStoredUser(): AuthUser | null {
    if (typeof window === "undefined") return null;

    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  },

  getStoredRoles(): string[] {
    if (typeof window === "undefined") return [];

    try {
      return JSON.parse(localStorage.getItem("roles") || "[]");
    } catch {
      return [];
    }
  },

  getStoredPermissions(): string[] {
    if (typeof window === "undefined") return [];

    try {
      return JSON.parse(localStorage.getItem("permissions") || "[]");
    } catch {
      return [];
    }
  },
};
