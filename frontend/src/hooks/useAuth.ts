import { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";
import { authStore } from "../stores/authStore";
import { LoginRequest, TokenResponse, User } from "../types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(authStore.getUser());

  useEffect(() => {
    return authStore.subscribe(() => {
      setUser(authStore.getUser());
    });
  }, []);

  useEffect(() => {
    const token = authStore.getToken();
    if (token && !authStore.getUser()) {
      api
        .get<User>("/auth/me")
        .then((u) => authStore.setUser(u))
        .catch(() => authStore.logout());
    }
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const res = await api.post<TokenResponse>("/auth/login", data);
    localStorage.setItem("token", res.access_token);
    const me = await api.get<User>("/auth/me");
    authStore.setAuth(res.access_token, me);
    return me;
  }, []);

  const logout = useCallback(() => {
    authStore.logout();
  }, []);

  return { user, login, logout, isAdmin: user?.is_admin ?? false };
}
