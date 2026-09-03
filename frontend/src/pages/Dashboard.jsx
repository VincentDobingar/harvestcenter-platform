// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";
import { format } from "date-fns";

/* Helpers */
function safeJoin(val, sep = ",") {
  if (Array.isArray(val)) return val.join(sep);
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    try {
      return Object.values(val).join(sep);
    } catch {
      return String(val);
    }
  }
  try {
    if (typeof val[Symbol.iterator] === "function") {
      return Array.from(val).join(sep);
    }
  } catch {}
  return String(val);
}

function csvEscape(value) {
  if (value == null) return "";
  const s = String(value);
  return s.includes(",") || s.includes('"')
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function asArray(v) {
  if (Array.isArray(v)) return v;
  if (v && Array.isArray(v.rows)) return v.rows;
  return [];
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, booting } = useAuth();
  const nav = useNavigate();

  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [q, setQ] = useState("");
  const [filterPaid, setFilterPaid] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 12;

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [attLoading, setAttLoading] = useState(false);

  useEffect(() => {
    if (booting) return;

    const role = String(user?.role || "").toLowerCase();
    if (
      ["admin", "administrateur", "administrator", "superadmin"].includes(role)
    ) {
      nav("/admin/dashboard", { replace: true });
    }
  }, [user, booting, nav]);

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, filterPaid, page]);

  async function fetchStudents() {
    setLoading(true);
    setErr(null);

    try {
      const offset = (page - 1) * perPage;
      const params = { limit: perPage, offset };

      if (q) params.q = q;
      if (filterPaid === "paid") params.paid = "true";
      if (filterPaid === "unpaid") params.paid = "false";

      let res;
      try {
        res = await api.get("/students", { params });
      } catch (e) {
        if (
          e?.response?.status === 404 &&
          user &&
          String(user.role || "").toLowerCase().includes("admin")
        ) {
          res = await api.get("/admin/students", { params });
        } else {
          throw e;
        }
      }

      const data = res?.data ?? {};
      let rows = [];
      let count = 0;

      if (Array.isArray(data)) {
        rows = data;
        count = data.length;
      } else if (data.rows || data.students || data.items) {
        rows = data.rows ?? data.students ?? data.items;
        count = Number(data.total ?? rows.length);
      } else if (data.ok && (data.rows || data.students)) {
        rows = data.rows ?? data.students ?? [];
        count = Number(data.total ?? rows.length);
      } else {
        rows = data ? (Array.isArray(data) ? data : [data]) : [];
        count = rows.length;
      }

      setStudents(rows || []);
      setTotal(count);
    } catch (e) {
      console.error("Dashboard.fetchStudents error:", e);
      const message =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.response?.statusText ||
        e?.message ||
        t("adminStudentsPage.errors.load");

      setErr(message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAttendancesFor(student) {
    if (!student) return;

    setSelectedStudent(student);
    setAttLoading(true);
    setAttendances([]);

    try {
      const res = await api.get(`/students/${student.id}/attendances`);
      const rows = asArray(res.data);
      setAttendances(rows);
    } catch (e) {
      console.error("Dashboard.fetchAttendances error:", e);
      setErr(
        e?.response?.data?.error ||
          e?.message ||
          t("adminStudentsPage.errors.attendance")
      );
    } finally {
      setAttLoading(false);
    }
  }

  const pageCount = Math.max(1, Math.ceil(total / perPage));

  function gotoPage(p) {
    if (p < 1 || p > pageCount) return;
    setPage(p);
  }

  const visible = useMemo(() => {
    let arr = Array.isArray(students) ? students.slice() : [];

    if (q) {
      const qq = q.toLowerCase();
      arr = arr.filter(
        (s) =>
          (s.full_name || s.nom || "").toLowerCase().includes(qq) ||
          (s.email || "").toLowerCase().includes(qq) ||
          (s.username || "").toLowerCase().includes(qq)
      );
    }

    if (filterPaid === "paid") {
      arr = arr.filter((s) => s.paid === true || s.payment_status === "paid");
    }

    if (filterPaid === "unpaid") {
      arr = arr.filter(
        (s) => s.paid === false || s.payment_status === "unpaid"
      );
    }

    return arr;
  }, [students, q, filterPaid]);

  function exportCSV() {
    const headers = [
      "ID",
      t("adminStudentsPage.table.name"),
      "Email",
      "Username",
      t("adminStudentsPage.table.role"),
      t("adminStudentsPage.table.paid"),
      "Montant payé",
      t("adminStudentsPage.table.courses"),
      t("adminStudentsPage.table.attendance"),
    ];

    const lines = [headers.join(",")];

    (visible || []).forEach((s) => {
      const coursesArr = Array.isArray(s.courses)
        ? s.courses.map((c) => c?.title ?? c?.name ?? "")
        : [];

      const courses = safeJoin(coursesArr, " | ");

      const pres = Array.isArray(s.attendance_summary)
        ? s.attendance_summary.join("/")
        : s.attendance_summary ||
          (s.present_count != null && s.total_sessions != null
            ? `${s.present_count}/${s.total_sessions}`
            : "");

      const row = [
        s.id ?? "",
        s.full_name ?? s.nom ?? "",
        s.email ?? "",
        s.username ?? "",
        s.role ?? "",
        s.paid || s.payment_status === "paid"
          ? t("common.yes")
          : t("common.no"),
        s.amount_paid ?? "",
        courses,
        pres,
      ];

      lines.push(row.map(csvEscape).join(","));
    });

    const csv = lines.join("\n");
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students_export_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DashboardLayout title={t("adminStudentsPage.title")}>
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder={t("adminStudentsPage.search")}
              className="border rounded px-3 py-2 w-72"
            />

            <select
              value={filterPaid}
              onChange={(e) => {
                setFilterPaid(e.target.value);
                setPage(1);
              }}
              className="border rounded px-3 py-2"
            >
              <option value="all">
                {t("adminStudentsPage.filters.all")}
              </option>
              <option value="paid">
                {t("adminStudentsPage.filters.paid")}
              </option>
              <option value="unpaid">
                {t("adminStudentsPage.filters.unpaid")}
              </option>
            </select>

            <button
              onClick={() => {
                setQ("");
                setFilterPaid("all");
                setPage(1);
              }}
              className="px-3 py-2 border rounded"
            >
              {t("adminStudentsPage.reset")}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStudents}
              disabled={loading}
              className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
            >
              {t("adminStudentsPage.refresh")}
            </button>

            <button
              onClick={exportCSV}
              className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {t("adminStudentsPage.exportCsv")}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow">
          {err && <div className="mb-3 text-red-600">{err}</div>}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 px-2">ID</th>
                  <th className="py-2 px-2">
                    {t("adminStudentsPage.table.name")}
                  </th>
                  <th className="py-2 px-2">Email</th>
                  <th className="py-2 px-2">
                    {t("adminStudentsPage.table.role")}
                  </th>
                  <th className="py-2 px-2">
                    {t("adminStudentsPage.table.paid")}
                  </th>
                  <th className="py-2 px-2">
                    {t("adminStudentsPage.table.courses")}
                  </th>
                  <th className="py-2 px-2">
                    {t("adminStudentsPage.table.attendance")}
                  </th>
                  <th className="py-2 px-2">
                    {t("adminStudentsPage.table.actions")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center">
                      {t("common.loading")}
                    </td>
                  </tr>
                ) : visible.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-gray-500">
                      {t("adminStudentsPage.noStudents")}
                    </td>
                  </tr>
                ) : (
                  visible.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">{s.id}</td>
                      <td className="py-2 px-2">
                        {s.full_name || s.nom || "—"}
                      </td>
                      <td className="py-2 px-2">{s.email}</td>
                      <td className="py-2 px-2">{s.role || "student"}</td>
                      <td className="py-2 px-2">
                        {s.paid || s.payment_status === "paid"
                          ? t("common.yes")
                          : t("common.no")}
                      </td>
                      <td className="py-2 px-2">
                        {(Array.isArray(s.courses)
                          ? s.courses
                              .map((c) => c.title || c.name)
                              .slice(0, 3)
                              .join(", ")
                          : "—") || "—"}
                      </td>
                      <td className="py-2 px-2">
                        {s.present_count != null
                          ? `${s.present_count}/${s.total_sessions || 0}`
                          : s.attendance_summary || "—"}
                      </td>
                      <td className="py-2 px-2">
                        <button
                          onClick={() => fetchAttendancesFor(s)}
                          className="text-sm px-2 py-1 border rounded"
                        >
                          {t("adminStudentsPage.details")}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {t("adminStudentsPage.showing")} {((page - 1) * perPage) + 1} -{" "}
              {Math.min(page * perPage, total)} {t("adminStudentsPage.of")}{" "}
              {total}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => gotoPage(page - 1)}
                disabled={page <= 1}
                className="px-2 py-1 border rounded"
              >
                ←
              </button>
              <span className="px-2">
                {page} / {pageCount}
              </span>
              <button
                onClick={() => gotoPage(page + 1)}
                disabled={page >= pageCount}
                className="px-2 py-1 border rounded"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {selectedStudent && (
          <div className="bg-white rounded-2xl p-4 shadow">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {selectedStudent.full_name || selectedStudent.email} —{" "}
                {t("adminStudentsPage.attendanceTitle")}
              </h3>
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setAttendances([]);
                }}
                className="text-sm px-2 py-1 border rounded"
              >
                {t("common.close")}
              </button>
            </div>

            {attLoading ? (
              <div className="py-6 text-center">{t("common.loading")}</div>
            ) : asArray(attendances).length === 0 ? (
              <div className="py-4 text-sm text-gray-500">
                {t("adminStudentsPage.noAttendance")}
              </div>
            ) : (
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 px-2">
                        {t("adminStudentsPage.attendance.date")}
                      </th>
                      <th className="py-2 px-2">
                        {t("adminStudentsPage.attendance.course")}
                      </th>
                      <th className="py-2 px-2">
                        {t("adminStudentsPage.attendance.present")}
                      </th>
                      <th className="py-2 px-2">
                        {t("adminStudentsPage.attendance.notes")}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {asArray(attendances).map((a) => (
                      <tr key={a.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">
                          {a.date
                            ? format(new Date(a.date), "yyyy-MM-dd")
                            : a.date}
                        </td>
                        <td className="py-2 px-2">
                          {a.course_title || a.course_name || "—"}
                        </td>
                        <td className="py-2 px-2">
                          {a.present ? t("common.yes") : t("common.no")}
                        </td>
                        <td className="py-2 px-2">{a.note || ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}