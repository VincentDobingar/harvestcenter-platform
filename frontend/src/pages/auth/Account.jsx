// src/pages/auth/Account.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function Account() {
  const { t } = useTranslation();
  const { login, register, gotoByRole } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get("tab");
  const [isLogin, setIsLogin] = useState(initialTab !== "register");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "student",
  });

  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    setIsLogin(tab !== "register");
  }, [searchParams]);

  function switchTab(loginMode) {
    setIsLogin(loginMode);
    setSearchParams(loginMode ? { tab: "login" } : { tab: "register" });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (isLogin) {
        if (!form.email.trim() || !form.password.trim()) {
          toast.error(t("accountPage.errors.required"));
          return;
        }

        setLoading(true);

        const user = await login(form.email.trim(), form.password);

        if (user?.role) {
          toast.success(t("accountPage.success.login"));

          const next = location.state?.next || location.state?.from?.pathname;

          if (next) {
            nav(next, { replace: true });
          } else {
            gotoByRole(user, nav);
          }
        } else {
          toast.error(t("accountPage.errors.invalidSession"));
        }
      } else {
        if (
          !form.email.trim() ||
          !form.password.trim() ||
          !form.first_name.trim() ||
          !form.last_name.trim()
        ) {
          toast.error(t("accountPage.errors.required"));
          return;
        }

        setLoading(true);

        const payload = {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role || "student",
        };

        await register(payload);

        toast.success(t("accountPage.success.register"));
        switchTab(true);
      }
    } catch (err) {
      console.error("Account auth error:", err);

      const message =
        err?.response?.data?.message ||
        (err?.code === "ERR_NETWORK"
          ? t("accountPage.errors.network")
          : err?.message) ||
        t("accountPage.errors.auth");

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] grid place-items-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">
          {isLogin
            ? t("accountPage.titleLogin")
            : t("accountPage.titleRegister")}
        </h1>

        {!isLogin && (
          <>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
              placeholder={t("accountPage.fields.firstName")}
              required
            />
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
              placeholder={t("accountPage.fields.lastName")}
              required
            />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            >
              <option value="student">{t("accountPage.roles.student")}</option>
              <option value="teacher">{t("accountPage.roles.teacher")}</option>
              <option value="admin">{t("accountPage.roles.admin")}</option>
            </select>
          </>
        )}

        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
          placeholder={t("accountPage.fields.email")}
          required
        />

        <div className="relative">
          <input
            name="password"
            type={showPwd ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded-xl p-3 pr-12"
            placeholder={t("accountPage.fields.password")}
            required
          />
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm"
          >
            {showPwd
              ? t("accountPage.fields.hide")
              : t("accountPage.fields.show")}
          </button>
        </div>

        <button type="submit" disabled={loading} className="w-full btn-brand">
          {loading
            ? isLogin
              ? t("accountPage.actions.loggingIn")
              : t("accountPage.actions.creating")
            : isLogin
            ? t("accountPage.actions.login")
            : t("accountPage.actions.createAccount")}
        </button>

        <p className="text-center text-sm">
          {isLogin ? (
            <>
              {t("accountPage.switch.noAccount")}{" "}
              <button
                type="button"
                onClick={() => switchTab(false)}
                className="text-blue-600 underline"
              >
                {t("accountPage.switch.create")}
              </button>
            </>
          ) : (
            <>
              {t("accountPage.switch.alreadyRegistered")}{" "}
              <button
                type="button"
                onClick={() => switchTab(true)}
                className="text-blue-600 underline"
              >
                {t("accountPage.switch.login")}
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}