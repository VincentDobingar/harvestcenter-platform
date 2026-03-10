// 📁 src/hooks/useDashboardData.js
import { useEffect, useState, useCallback } from "react";
import api from "@/utils/api";

/**
 * useDashboardData(role, opts)
 * - role: string ("etudiant" | "formateur" | "admin" | ...)
 * - opts.mockForce: boolean (optionnel) to force mock ignoring env
 *
 * Returns: { data, loading, error, refresh, usingMock }
 *
 * Behavior:
 * - tries several candidate endpoints (fallback list) depending on role
 * - normalizes common response shapes into a friendly `data` object:
 *    { courses: [], assignmentsDue: number, attendance: {present,total}, classes, upcomingSessions, stats, raw }
 * - if VITE_MOCK_DASHBOARD === "true" (or opts.mockForce true), returns a deterministic mock payload
 */
const ENV_USE_MOCK = (import.meta.env?.VITE_MOCK_DASHBOARD ?? "").toString().toLowerCase() === "true";

function normalizeResponse(resData) {
  // resData may be: array, { rows: [...] }, { data: ... }, { user: ... }, { courses: [...] }, etc.
  const out = {
    courses: [],
    assignmentsDue: 0,
    attendance: { present: 0, total: 0 },
    classes: [],
    upcomingSessions: [],
    assignmentsToGrade: 0,
    stats: null,
    raw: resData,
  };

  if (!resData) return out;

  // If array => courses
  if (Array.isArray(resData)) {
    out.courses = resData;
    return out;
  }

  // if wrapper with data or rows
  const payload = resData.data ?? resData.rows ?? resData;

  // normalize courses
  if (payload.courses) out.courses = payload.courses;
  else if (payload.classes) out.courses = payload.classes;
  else if (payload.items && Array.isArray(payload.items)) out.courses = payload.items;
  else if (Array.isArray(payload)) out.courses = payload;

  // assignments
  out.assignmentsDue = payload.assignmentsDue ?? payload.pending_assignments ?? payload.dueAssignments ?? out.assignmentsDue;

  // attendance
  if (payload.attendance) {
    out.attendance = {
      present: payload.attendance.present ?? payload.attendance.present_count ?? out.attendance.present,
      total: payload.attendance.total ?? payload.attendance.total_sessions ?? out.attendance.total,
    };
  } else {
    out.attendance.present = payload.present ?? out.attendance.present;
    out.attendance.total = payload.total_sessions ?? payload.total ?? out.attendance.total;
  }

  // classes / teacher data
  out.classes = payload.classes ?? payload.courses ?? payload.ownedCourses ?? out.classes;

  // upcoming / sessions
  out.upcomingSessions = payload.upcomingSessions ?? payload.upcoming ?? payload.schedules ?? payload.sessions ?? out.upcomingSessions;

  // assignments to grade (teacher)
  out.assignmentsToGrade = payload.assignmentsToGrade ?? payload.pending_reviews ?? payload.toGrade ?? out.assignmentsToGrade;

  // stats
  out.stats = payload.stats ?? payload.meta ?? out.stats;

  // try to extract common nested fields (user.*)
  if (!out.raw && payload.user) out.raw = payload.user;

  return out;
}

function makeMock(role) {
  const roleKey = String(role || "user").toLowerCase();
  if (roleKey.includes("admin")) {
    return {
      courses: [{ id: "adm-1", title: "Admin — rapport mensuel" }],
      stats: { studentsCount: 42, classesCount: 6 },
      raw: { mock: true, role: "admin" },
    };
  }
  if (roleKey.includes("teacher") || roleKey.includes("formateur")) {
    return {
      classes: [
        { id: "c1", title: "Programmation 101" },
        { id: "c2", title: "Bases de données" },
      ],
      assignmentsToGrade: 3,
      upcomingSessions: [
        { id: "s1", title: "TD 1", start: new Date().toISOString() },
        { id: "s2", title: "TD 2", start: new Date(Date.now() + 86400000).toISOString() },
      ],
      raw: { mock: true, role: "teacher" },
    };
  }
  // default student mock
  return {
    courses: [
      { id: "s-c1", title: "Intro JS" },
      { id: "s-c2", title: "HTML & CSS" },
    ],
    assignmentsDue: 2,
    attendance: { present: 8, total: 10 },
    raw: { mock: true, role: "student" },
  };
}

export default function useDashboardData(role, opts = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);
  const usingMock = ENV_USE_MOCK || !!opts.mockForce;

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      // If mock requested, return deterministic mock after tiny delay
      if (usingMock) {
        await new Promise((r) => setTimeout(r, 250)); // small UX delay
        if (!alive) return;
        const m = makeMock(role);
        setData(normalizeResponse(m));
        setLoading(false);
        return;
      }

      // candidate endpoints by role (priority)
      const roleKey = String(role || "").toLowerCase();
      let candidates = [];

      if (roleKey.includes("admin")) {
        candidates = ["/admin/dashboard", "/admin/stats", "/admin/me", "/me"];
      } else if (roleKey.includes("teacher") || roleKey.includes("formateur")) {
        candidates = [
          "/teacher/dashboard",
          "/teachers/me/dashboard",
          "/teacher/me",
          "/instructor/dashboard",
          "/me/teacher",
          "/me",
        ];
      } else if (roleKey.includes("student") || roleKey.includes("etudiant")) {
        candidates = [
          "/student/dashboard",
          "/students/me/dashboard",
          "/students/me",
          "/me/student",
          "/me",
        ];
      } else {
        candidates = ["/me", "/dashboard", "/users/me"];
      }

      let success = false;
      let lastErr = null;
      for (const ep of candidates) {
        if (!alive) break;
        try {
          const res = await api.get(ep, { signal: controller.signal });
          if (!alive) break;
          // prefer res.data, but normalize flexible shapes
          const payload = res.data ?? res;
          const normalized = normalizeResponse(payload);
          setData(normalized);
          success = true;
          break;
        } catch (err) {
          lastErr = err;
          // continue trying other endpoints unless critical
          if (err?.name === "CanceledError" || err?.name === "AbortError") break;
          // ignore 404 / 405 etc - try next
        }
      }

      if (!alive) return;
      if (!success) {
        const msg =
          lastErr?.response?.data?.message ||
          lastErr?.message ||
          "Aucune donnée disponible pour le tableau de bord (vérifier les endpoints).";
        setError(msg);
        setData(null);
      }
      setLoading(false);
    }

    load();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [role, tick, usingMock, opts.mockForce]);

  return { data, loading, error, refresh, usingMock };
}
