import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "../libs/auth";
import { userService, type CurrentUser } from "../services/user-service";

export const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;

interface AuthContextValue {
  user: CurrentUser | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Re-reads the session from storage and syncs the `/me` query with it. Call this right after
   * `setTokens`/`clearTokens` so login/logout reflect in the UI without needing a hard navigation
   * to force a remount. */
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [hasSession, setHasSession] = useState(() => Boolean(getAccessToken()));

  const userQuery = useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => userService.getCurrentUser(),
    enabled: hasSession,
    retry: false,
  });

  const refetch = useCallback(async () => {
    const sessionPresent = Boolean(getAccessToken());
    setHasSession(sessionPresent);
    if (sessionPresent) {
      await queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    } else {
      queryClient.removeQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    }
  }, [queryClient]);

  const value: AuthContextValue = {
    user: userQuery.data,
    isAuthenticated: hasSession && userQuery.isSuccess,
    isLoading: hasSession && userQuery.isPending,
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
