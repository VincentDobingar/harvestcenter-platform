// src/config/navigation.js
// Menu des espaces connectés, par rôle. Un seul endroit à modifier
// pour ajouter une page : la barre latérale et le titre de la page
// en haut de l'écran en dépendent.
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  GraduationCap,
  CalendarDays,
  Wallet,
  FilePen,
  UserRound,
  FileText,
  Users,
  School,
  Image as ImageIcon,
  UserPlus,
  Newspaper,
  Megaphone,
  ShieldCheck,
} from "lucide-react";

export const ROLE_LABELS = {
  student: "Espace étudiant",
  teacher: "Espace formateur",
  admin: "Administration",
  superadmin: "Direction",
};

const student = [
  {
    title: null,
    items: [
      { to: "/dashboard/student", label: "Accueil", icon: LayoutDashboard, end: true },
      { to: "/dashboard/my-courses", label: "Mes cours", icon: BookOpen },
      { to: "/dashboard/student/assignments", label: "Devoirs", icon: ClipboardList },
      { to: "/dashboard/notes", label: "Notes", icon: GraduationCap },
      { to: "/dashboard/timetable", label: "Emploi du temps", icon: CalendarDays },
    ],
  },
  {
    title: "Mon dossier",
    items: [
      { to: "/dashboard/student/inscription", label: "Demande d’inscription", icon: FilePen },
      { to: "/dashboard/student/payments", label: "Paiements", icon: Wallet },
      { to: "/dashboard/profile", label: "Profil", icon: UserRound },
    ],
  },
];

const teacher = [
  {
    title: null,
    items: [
      { to: "/dashboard/teacher", label: "Accueil", icon: LayoutDashboard, end: true },
      { to: "/dashboard/my-courses", label: "Mes cours", icon: BookOpen },
      { to: "/dashboard/assignments", label: "Devoirs", icon: ClipboardList },
      { to: "/dashboard/notes", label: "Notes", icon: GraduationCap },
      { to: "/dashboard/timetable", label: "Emploi du temps", icon: CalendarDays },
    ],
  },
  {
    title: "Mon compte",
    items: [{ to: "/dashboard/profile", label: "Profil", icon: UserRound }],
  },
];

const adminSections = [
  {
    title: null,
    items: [{ to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, end: true }],
  },
  {
    title: "Scolarité",
    items: [
      { to: "/admin/inscriptions/demandes", label: "Demandes d’inscription", icon: FileText },
      { to: "/admin/students", label: "Étudiants", icon: GraduationCap },
      { to: "/admin/teachers", label: "Formateurs", icon: Users },
      { to: "/admin/classes", label: "Classes", icon: School },
      { to: "/admin/courses", label: "Cours", icon: BookOpen },
      { to: "/admin/timetables", label: "Emplois du temps", icon: CalendarDays },
    ],
  },
  {
    title: "Site et comptes",
    items: [
      { to: "/admin/media", label: "Médias", icon: ImageIcon },
      { to: "/admin/utilisateurs/ajouter", label: "Ajouter un utilisateur", icon: UserPlus },
    ],
  },
];

const superadmin = [
  {
    title: null,
    items: [{ to: "/superadmin", label: "Vue d’ensemble", icon: ShieldCheck, end: true }],
  },
  {
    title: "Publication",
    items: [
      { to: "/superadmin/news", label: "Actualités", icon: Newspaper },
      { to: "/superadmin/opportunities", label: "Opportunités", icon: Megaphone },
      { to: "/superadmin/media", label: "Médiathèque", icon: ImageIcon },
    ],
  },
  {
    title: "Comptes",
    items: [{ to: "/superadmin/users", label: "Utilisateurs", icon: Users }],
  },
  // La direction a aussi accès à toute l'administration.
  ...adminSections.map((s) =>
    s.title ? s : { title: "Administration", items: s.items.map((i) => ({ ...i, label: "Tableau de bord admin" })) }
  ),
];

export const NAV_BY_ROLE = {
  student,
  teacher,
  admin: adminSections,
  superadmin,
};

export function navForRole(role) {
  return NAV_BY_ROLE[role] || NAV_BY_ROLE.student;
}

/** Trouve l'entrée de menu qui correspond le mieux à l'URL (pour le titre). */
export function findNavItem(role, pathname) {
  const items = navForRole(role).flatMap((s) => s.items);
  return (
    items
      .filter((i) => (i.end ? pathname === i.to : pathname === i.to || pathname.startsWith(`${i.to}/`)))
      .sort((a, b) => b.to.length - a.to.length)[0] || null
  );
}
