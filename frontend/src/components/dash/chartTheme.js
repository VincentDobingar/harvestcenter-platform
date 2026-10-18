// src/components/dash/chartTheme.js
// Réglages communs des graphiques (recharts) des tableaux de bord.
export const CHART = {
  primary: "#1F75BB",   // bleu Harvest : série principale
  secondary: "#E3A72F", // or du mil : seconde série (comparaison)
  muted: "#B8C4D2",     // série neutre (ex. « non payés »)
  grid: "#E6ECF2",
  cursor: "rgba(14, 42, 71, 0.04)",
  tick: { fill: "#5B6B7F", fontSize: 12 },
  tooltip: {
    borderRadius: 10,
    border: "1px solid #DCE4EC",
    boxShadow: "0 8px 24px -12px rgba(14,42,71,0.35)",
    fontSize: 13,
  },
};
