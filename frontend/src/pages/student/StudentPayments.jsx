import React from "react";
import MyPayments from "@/pages/MyPayments";

/**
 * StudentPayments — wrapper pour l'espace étudiant.
 * Nomme la fonction StudentPayments pour éviter une collision
 * avec l'import nommé MyPayments.
 */
export default function StudentPayments(props) {
  return <MyPayments {...props} />;
}
