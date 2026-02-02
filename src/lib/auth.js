import { apiFetch } from "./api";

export async function getMe() {
  return apiFetch("/auth/me", { method: "GET" });
}

export async function login(email, password) {
  // apiFetch should stringify objects safely
  return apiFetch("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function logout() {
  try {
    return await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    return apiFetch("/auth/logout", { method: "GET" });
  }
}
