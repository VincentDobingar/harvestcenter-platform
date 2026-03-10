import db from "../config/db.js";

export const requireActiveStudent = async (req, res, next) => {
  try {
    const [[student]] = await db.query(
      "SELECT status FROM students WHERE user_id=?",
      [req.user.id]
    );

    if (!student || student.status !== "active") {
      return res.status(403).json({
        message: "Paiement requis pour accéder à la formation"
      });
    }

    next();

  } catch (err) {
    res.status(500).json({ message: "Erreur vérification statut" });
  }
};
