import api, { unwrap } from "@/lib/api";

import {
  Window,
  WindowPayload,
  PaginatedWindowResponse,
} from "@/types/windows/window";

export const windowService = {
  async getAll(
    page = 1,
    params?: {
      search?: string;
      level?: string;
    }
  ): Promise<PaginatedWindowResponse> {
    const response = await api.get("/windows", {
      params: {
        page,
        ...params,
      },
    });

    return unwrap<PaginatedWindowResponse>(response);
  },

  async create(payload: WindowPayload): Promise<Window> {
    const response = await api.post("/windows", payload);

    const data = unwrap<{
      success: boolean;
      message: string;
      data: Window;
    }>(response);

    return data.data;
  },

  async update(id: number, payload: Partial<WindowPayload>): Promise<Window> {
    const response = await api.put(`/windows/${id}`, payload);

    const data = unwrap<{
      success: boolean;
      message: string;
      data: Window;
    }>(response);

    return data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/windows/${id}`);
  },
};
