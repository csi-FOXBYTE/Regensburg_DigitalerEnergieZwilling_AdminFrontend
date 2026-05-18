import { jwtDecode } from "jwt-decode";

export interface JwtClaims {
  sub: string;
  preferred_username: string;
  email: string;
  realm_access?: { roles: string[] };
  resource_access?: { [client: string]: { roles: string[] } };
  exp: number;
  iat: number;
}

export function useCurrentUser(): JwtClaims | null {
  if (!import.meta.env.DEV) return null;

  const token = import.meta.env.VITE_DEV_ACCESS_TOKEN;
  if (!token) return null;

  try {
    return jwtDecode<JwtClaims>(token);
  } catch {
    return null;
  }
}
