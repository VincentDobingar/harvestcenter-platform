// src/pages/student/StudentAssignments.jsx
import React from "react";
// Remplace le chemin ci-dessous si ton composant s'appelle différemment ou est ailleurs
import Assignments from "@/pages/Assignments";

/**
 * Alias pour compatibilité : si le projet utilise <StudentAssignments /> à plusieurs endroits,
 * cet alias réutilise le composant Assignments existant.
 */
export default function StudentAssignments(props) {
  return <Assignments {...props} />;
}
