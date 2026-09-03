export function normalizeRole(role) {
  const value = String(role || "").trim().toLowerCase();

  const map = {
    student: "student",
    etudiant: "student",
    étudiant: "student",
    eleve: "student",
    élève: "student",

    teacher: "teacher",
    enseignant: "teacher",
    formateur: "teacher",

    admin: "admin",
    superadmin: "superadmin",
    super_admin: "superadmin",
  };

  return map[value] || "student";
}