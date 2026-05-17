import { useEffect, useState } from "react";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export const useAuthBootstrap = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      if (!token) {
        if (isMounted) {
          setChecking(false);
        }
        return;
      }

      if (user) {
        if (isMounted) {
          setChecking(false);
        }
        return;
      }

      if (isMounted) {
        setChecking(true);
      }

      try {
        const data = await authService.me();
        if (isMounted) {
          setUser(data.user);
        }
      } catch (error) {
        if (isMounted) {
          logout();
        }
      } finally {
        if (isMounted) {
          setChecking(false);
        }
      }
    };

    bootstrap();
    return () => {
      isMounted = false;
    };
  }, [token, user, setUser, logout]);

  return { checking };
};
