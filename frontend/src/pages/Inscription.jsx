// src/pages/Inscription.jsx
import React, { useEffect, useMemo, useState } from "react";
import Section from "@/components/ui/Section";
import toast from "react-hot-toast";
import api from "@/utils/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function splitFullName(full) {
  if (!full) return ["", ""];
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return ["", parts[0]];
  const prenom = parts.pop();
  const nom = parts.join(" ");
  return [nom, prenom];
}

export default function Inscription() {
  const navigate = useNavigate();
  const { user, booting } = useAuth();

  const [loadingFormations, setLoadingFormations] = useState(true);
  const [loadingNiveaux, setLoadingNiveaux] = useState(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formations, setFormations] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  const [nomFromUser, prenomFromUser] = useMemo(() => {
    const fullName = [user?.last_name, user?.first_name].filter(Boolean).join(" ").trim();
    return splitFullName(fullName);
  }, [user]);

  const [form, setForm] = useState({
    session_id: "1", // à ajuster selon ton modèle réel
    module_id: "",
    niveau_id: "",
    time_slot_id: "",
    quartier: "",
    arrondissement: "",
    telephone: "",
    whatsapp: "",
    email: "",
    nom: "",
    prenom: "",
    sexe: "",
    dateNaissance: "",
    lieuNaissance: "",
    acceptFees: false,
  });

  useEffect(() => {
    if (!user) return;

    setForm((prev) => ({
      ...prev,
      email: user.email || prev.email || "",
      nom: nomFromUser || prev.nom || "",
      prenom: prenomFromUser || prev.prenom || "",
    }));
  }, [user, nomFromUser, prenomFromUser]);

  useEffect(() => {
    let ignore = false;

    async function loadFormations() {
      try {
        setLoadingFormations(true);
        const res = await api.get("/inscription/options/formations", {
          skipAuthRefresh: true,
        });

        if (ignore) return;
        setFormations(res.data?.formations || []);
      } catch (err) {
        console.error(err);
        toast.error("Impossible de charger les formations.");
      } finally {
        if (!ignore) setLoadingFormations(false);
      }
    }

    loadFormations();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!form.module_id) {
      setNiveaux([]);
      setTimeSlots([]);
      setForm((prev) => ({
        ...prev,
        niveau_id: "",
        time_slot_id: "",
      }));
      return;
    }

    let ignore = false;

    async function loadNiveaux() {
      try {
        setLoadingNiveaux(true);

        const res = await api.get(`/inscription/options/niveaux/${form.module_id}`, {
          skipAuthRefresh: true,
        });

        if (ignore) return;

        setNiveaux(res.data?.niveaux || []);
        setTimeSlots([]);
        setForm((prev) => ({
          ...prev,
          niveau_id: "",
          time_slot_id: "",
        }));
      } catch (err) {
        console.error(err);
        toast.error("Impossible de charger les niveaux.");
      } finally {
        if (!ignore) setLoadingNiveaux(false);
      }
    }

    loadNiveaux();

    return () => {
      ignore = true;
    };
  }, [form.module_id]);

  useEffect(() => {
    if (!form.niveau_id) {
      setTimeSlots([]);
      setForm((prev) => ({
        ...prev,
        time_slot_id: "",
      }));
      return;
    }

    let ignore = false;

    async function loadTimeSlots() {
      try {
        setLoadingTimeSlots(true);

        const res = await api.get(`/inscription/options/timeslots/${form.niveau_id}`, {
          skipAuthRefresh: true,
        });

        if (ignore) return;

        setTimeSlots(res.data?.timeSlots || []);
        setForm((prev) => ({
          ...prev,
          time_slot_id: "",
        }));
      } catch (err) {
        console.error(err);
        toast.error("Impossible de charger les créneaux horaires.");
      } finally {
        if (!ignore) setLoadingTimeSlots(false);
      }
    }

    loadTimeSlots();

    return () => {
      ignore = true;
    };
  }, [form.niveau_id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  const validate = () => {
    const required = [
      "module_id",
      "niveau_id",
      "time_slot_id",
      "nom",
      "prenom",
      "sexe",
      "dateNaissance",
      "lieuNaissance",
      "quartier",
      "arrondissement",
      "telephone",
      "email",
    ];

    for (const key of required) {
      if (!String(form[key] || "").trim()) {
        toast.error("Tous les champs obligatoires doivent être remplis.");
        return false;
      }
    }

    const birthDate = new Date(form.dateNaissance);
    const now = new Date();

    if (Number.isNaN(birthDate.getTime())) {
      toast.error("Date de naissance invalide.");
      return false;
    }

    let age = now.getFullYear() - birthDate.getFullYear();
    const monthDiff = now.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && now.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 10) {
      toast.error("Âge minimum requis : 10 ans.");
      return false;
    }

    const phoneRegex = /^\+?\d{8,15}$/;

    if (!phoneRegex.test(form.telephone)) {
      toast.error("Numéro de téléphone invalide.");
      return false;
    }

    if (form.whatsapp && !phoneRegex.test(form.whatsapp)) {
      toast.error("Numéro WhatsApp invalide.");
      return false;
    }

    if (!form.acceptFees) {
      toast.error("Vous devez accepter les frais d'inscription.");
      return false;
    }

    return true;
  };

  async function onSubmit(e) {
    e.preventDefault();

    if (!user) {
      toast.error("Veuillez vous connecter.");
      navigate("/account", {
        replace: true,
        state: { next: "/dashboard/student/inscription" },
      });
      return;
    }

    if (String(user.role || "").toLowerCase() !== "student") {
      toast.error("Cette page est réservée aux étudiants.");
      navigate("/dashboard", { replace: true });
      return;
    }

    if (!validate()) return;
    if (!window.confirm("Confirmez-vous votre inscription ?")) return;

    try {
      setSubmitting(true);

      await api.post("/inscription/request", {
        ...form,
        session_id: Number(form.session_id || 1),
        module_id: Number(form.module_id),
        niveau_id: Number(form.niveau_id),
        time_slot_id: Number(form.time_slot_id),
        date_naissance: form.dateNaissance,
      });

      toast.success("Demande envoyée. En attente de validation admin.");
      navigate("/dashboard/student", { replace: true });
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.message || "Erreur lors de l'envoi de la demande.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (booting || loadingFormations) {
    return (
      <Section title="Demande d'inscription">
        <div className="text-center py-10">Chargement...</div>
      </Section>
    );
  }

  return (
    <Section title="Demande d'inscription">
      <form onSubmit={onSubmit} className="space-y-6 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-4">
          <select
            name="module_id"
            value={form.module_id}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          >
            <option value="">Choisir une formation</option>
            {formations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            name="niveau_id"
            value={form.niveau_id}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
            disabled={!form.module_id || loadingNiveaux}
          >
            <option value="">
              {loadingNiveaux ? "Chargement des niveaux..." : "Choisir un niveau"}
            </option>
            {niveaux.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <select
            name="time_slot_id"
            value={form.time_slot_id}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
            disabled={!form.niveau_id || loadingTimeSlots}
          >
            <option value="">
              {loadingTimeSlots ? "Chargement des créneaux..." : "Choisir un créneau horaire"}
            </option>
            {timeSlots.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            name="sexe"
            value={form.sexe}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          >
            <option value="">Sélectionner le sexe</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="nom"
            value={form.nom}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
            placeholder="Nom"
          />
          <input
            name="prenom"
            value={form.prenom}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
            placeholder="Prénom"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
            placeholder="Email"
          />
          <input
            name="telephone"
            value={form.telephone}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
            placeholder="Téléphone"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="whatsapp"
            value={form.whatsapp}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
            placeholder="WhatsApp"
          />
          <input
            name="dateNaissance"
            type="date"
            value={form.dateNaissance}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="lieuNaissance"
            value={form.lieuNaissance}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
            placeholder="Lieu de naissance"
          />
          <input
            name="quartier"
            value={form.quartier}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
            placeholder="Quartier"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="arrondissement"
            value={form.arrondissement}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
            placeholder="Arrondissement"
          />
        </div>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="acceptFees"
            checked={form.acceptFees}
            onChange={handleChange}
            className="mt-1"
          />
          <span>J’accepte les frais d’inscription non remboursables.</span>
        </label>

        <button
          disabled={submitting}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          {submitting ? "Envoi..." : "Envoyer la demande"}
        </button>
      </form>
    </Section>
  );
}