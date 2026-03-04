import { useQuery } from "@tanstack/react-query";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  basePath: "/api/auth",
  baseURL: "http://localhost:3000",
});

export default function useSession() {
  const { data } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      return await authClient.getSession();
    },
  });

  return data;
}
