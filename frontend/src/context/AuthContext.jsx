// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";

const AuthContext = createContext(null);

const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();

  const map = {
    student: "student",
    etudiant: "student",
    "étudiant": "student",

    teacher: "teacher",
    enseignant: "teacher",
    formateur: "teacher",

    admin: "admin",
    superadmin: "superadmin",
    super_admin: "superadmin",
  };

  return map[value] || "student";
};

const getDashboardPath = (role) => {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "superadmin") return "/superadmin";
  if (normalizedRole === "admin") return "/admin/dashboard";
  if (normalizedRole === "teacher") return "/dashboard/teacher";
  if (normalizedRole === "student") return "/dashboard/student";

  return "/dashboard";
};

export function AuthProvider({ children }) {
  const nav = useNavigate();
  const isMounted = useRef(false);

  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const fetchMe = async (signal) => {
    try {
      const res = await api.get("/auth/me", {
        signal,
        skipAuthRefresh: true,
      });

      const currentUser = res.data?.user
        ? { ...res.data.user, role: normalizeRole(res.data.user.role) }
        : null;

      if (!isMounted.current) return null;
      setUser(currentUser);
      return currentUser;
    } catch (err) {
      if (!isMounted.current) return null;

      if (err?.response?.status === 401) {
        try {
          await api.post("/auth/refresh", {}, { skipAuthRefresh: true });

          const retry = await api.get("/auth/me", {
            signal,
            skipAuthRefresh: true,
          });

          const currentUser = retry.data?.user
            ? { ...retry.data.user, role: normalizeRole(retry.data.user.role) }
            : null;

          if (!isMounted.current) return null;
          setUser(currentUser);
          return currentUser;
        } catch {
          setUser(null);
          return null;
        }
      }

      if (err?.response?.status === 403) {
        setUser(null);
        return null;
      }

      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
        return null;
      }

      setUser(null);
      return null;
    } finally {
      if (isMounted.current) {
        setBooting(false);
      }
    }
  };

  const login = async (email, password) => {
    if (!email?.trim() || !password?.trim()) {
      throw new Error("Email et mot de passe requis");
    }

    await api.post("/auth/login", {
      email: email.trim(),
      password,
    });

    const loggedUser = await fetchMe();

    if (!loggedUser) {
      throw new Error("Session invalide");
    }

    return loggedUser;
  };

  const register = async ({
    first_name,
    last_name,
    email,
    password,
    role = "student",
  }) => {
    const res = await api.post("/auth/register", {
      first_name,
      last_name,
      email,
      password,
      role: normalizeRole(role),
    });

    return res.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Logout warning:", err);
    } finally {
      if (isMounted.current) {
        setUser(null);
      }
    }
  };

  const gotoByRole = (u, navigate = nav) => {
    if (!u) {
      return navigate("/account?tab=login", { replace: true });
    }

    const role = String(u.role || "").toLowerCase().trim();

    if (role.includes("superadmin")) {
      return navigate("/superadmin", { replace: true });
    }

    if (role.includes("admin")) {
      return navigate("/admin", { replace: true });
    }

    if (["teacher", "formateur"].some((r) => role.includes(r))) {
      return navigate("/dashboard/teacher", { replace: true });
    }

    if (["student", "etudiant"].some((r) => role.includes(r))) {
      return navigate("/dashboard/student", { replace: true });
    }

    return navigate("/unauthorized", { replace: true });
  };

  useEffect(() => {
    isMounted.current = true;

    const controller = new AbortController();

    const init = async () => {
      await fetchMe(controller.signal);
    };

    init();

    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        booting,
        login,
        register,
        logout,
        fetchMe,
        gotoByRole,
        setUser,
        normalizeRole,
        getDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}