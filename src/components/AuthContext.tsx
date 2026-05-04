import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fakeUsers: User[] = [
  { id: "u1", name: "Max Müller", email: "max.mueller@example.com" },
  { id: "u2", name: "Anna Schmidt", email: "anna.schmidt@example.com" },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("currentUser");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const user = fakeUsers.find((u) => u.email === email);
    if (!user || password !== "password") {
      throw new Error("Ungültige E-Mail oder Passwort");
    }
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
