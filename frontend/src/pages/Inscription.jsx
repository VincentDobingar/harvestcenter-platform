// src/pages/Inscription.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, booting } = useAuth();

  const [loadingFormations, setLoadingFormations] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formations, setFormations] = useState([]);

  const [nomFromUser, prenomFromUser] = useMemo(() => {
    const fullName = [user?.last_name, user?.first_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    return splitFullName(fullName);
  }, [user]);

  const [form, setForm] = useState({
    session_id: "1",
    module_id: "",
    niveau_langue: "",
    horaire_prefere: "",
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
        toast.error(
          t("inscriptionPage.errors.loadFormations", {
            defaultValue: "Impossible de charger les formations.",
          })
        );
      } finally {
        if (!ignore) setLoadingFormations(false);
      }
    }

    loadFormations();

    return () => {
      ignore = true;
    };
  }, [t]);

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
      "niveau_langue",
      "horaire_prefere",
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
        toast.error(
          t("inscriptionPage.errors.required", {
            defaultValue: "Veuillez remplir tous les champs obligatoires.",
          })
        );
        return false;
      }
    }

    const birthDate = new Date(form.dateNaissance);
    const now = new Date();

    if (Number.isNaN(birthDate.getTime())) {
      toast.error(
        t("inscriptionPage.errors.invalidBirthDate", {
          defaultValue: "La date de naissance est invalide.",
        })
      );
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
      toast.error(
        t("inscriptionPage.errors.minAge", {
          defaultValue: "L’âge minimum requis est de 10 ans.",
        })
      );
      return false;
    }

    const phoneRegex = /^\+?\d{8,15}$/;

    if (!phoneRegex.test(form.telephone)) {
      toast.error(
        t("inscriptionPage.errors.invalidPhone", {
          defaultValue: "Le numéro de téléphone est invalide.",
        })
      );
      return false;
    }

    if (form.whatsapp && !phoneRegex.test(form.whatsapp)) {
      toast.error(
        t("inscriptionPage.errors.invalidWhatsapp", {
          defaultValue: "Le numéro WhatsApp est invalide.",
        })
      );
      return false;
    }

    if (!form.acceptFees) {
      toast.error(
        t("inscriptionPage.errors.acceptFees", {
          defaultValue: "Vous devez accepter les frais d’inscription.",
        })
      );
      return false;
    }

    return true;
  };

  async function onSubmit(e) {
    e.preventDefault();

    if (!user) {
      toast.error(
        t("inscriptionPage.errors.loginRequired", {
          defaultValue: "Vous devez vous connecter avant de continuer.",
        })
      );
      navigate("/account", {
        replace: true,
        state: { next: "/dashboard/student/inscription" },
      });
      return;
    }

    if (String(user.role || "").toLowerCase() !== "student") {
      toast.error(
        t("inscriptionPage.errors.studentsOnly", {
          defaultValue: "Cette page est réservée aux étudiants.",
        })
      );
      navigate("/dashboard", { replace: true });
      return;
    }

    if (!validate()) return;
    if (
      !window.confirm(
        t("inscriptionPage.confirm", {
          defaultValue: "Confirmez-vous l’envoi de votre demande ?",
        })
      )
    ) {
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/inscription/request", {
        ...form,
        session_id: Number(form.session_id || 1),
        module_id: Number(form.module_id),
        date_naissance: form.dateNaissance,
      });

      toast.success(
        t("inscriptionPage.success", {
          defaultValue: "Votre demande d’inscription a bien été envoyée.",
        })
      );
      navigate("/dashboard/student", { replace: true });
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.message ||
        t("inscriptionPage.errors.submit", {
          defaultValue: "Une erreur est survenue lors de l’envoi.",
        });

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (booting || loadingFormations) {
    return (
      <Section
        title={t("inscriptionPage.title", {
          defaultValue: "Inscription",
        })}
      >
        <div className="py-10 text-center">
          {t("common.loading", { defaultValue: "Chargement..." })}
        </div>
      </Section>
    );
  }

  return (
    <Section
      title={t("inscriptionPage.title", {
        defaultValue: "Inscription",
      })}
    >
      <form onSubmit={onSubmit} className="max-w-4xl space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <select
            name="module_id"
            value={form.module_id}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
          >
            <option value="">
              {t("inscriptionPage.fields.chooseFormation", {
                defaultValue: "Choisir une formation",
              })}
            </option>

            {formations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label || item.title || item.name}
              </option>
            ))}
          </select>

          <input
            name="niveau_langue"
            value={form.niveau_langue}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
            placeholder={t("inscriptionPage.fields.languageLevel", {
              defaultValue: "Niveau de langue (ex: Débutant, Intermédiaire, Avancé)",
            })}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="horaire_prefere"
            value={form.horaire_prefere}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
            placeholder={t("inscriptionPage.fields.preferredSchedule", {
              defaultValue: "Horaire préféré",
            })}
          />

          <select
            name="sexe"
            value={form.sexe}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
          >
            <option value="">
              {t("inscriptionPage.fields.chooseGender", {
                defaultValue: "Choisir le sexe",
              })}
            </option>
            <option value="M">
              {t("inscriptionPage.fields.male", { defaultValue: "Masculin" })}
            </option>
            <option value="F">
              {t("inscriptionPage.fields.female", { defaultValue: "Féminin" })}
            </option>
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="nom"
            value={form.nom}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
            placeholder={t("inscriptionPage.fields.lastName", {
              defaultValue: "Nom",
            })}
          />
          <input
            name="prenom"
            value={form.prenom}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
            placeholder={t("inscriptionPage.fields.firstName", {
              defaultValue: "Prénom",
            })}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
            placeholder={t("inscriptionPage.fields.email", {
              defaultValue: "Email",
            })}
          />
          <input
            name="telephone"
            value={form.telephone}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
            placeholder={t("inscriptionPage.fields.phone", {
              defaultValue: "Téléphone",
            })}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="whatsapp"
            value={form.whatsapp}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
            placeholder={t("inscriptionPage.fields.whatsapp", {
              defaultValue: "WhatsApp",
            })}
          />
          <input
            name="dateNaissance"
            type="date"
            value={form.dateNaissance}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="lieuNaissance"
            value={form.lieuNaissance}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
            placeholder={t("inscriptionPage.fields.birthPlace", {
              defaultValue: "Lieu de naissance",
            })}
          />
          <input
            name="quartier"
            value={form.quartier}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
            placeholder={t("inscriptionPage.fields.neighborhood", {
              defaultValue: "Quartier",
            })}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="arrondissement"
            value={form.arrondissement}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
            placeholder={t("inscriptionPage.fields.district", {
              defaultValue: "Arrondissement",
            })}
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
          <span>
            {t("inscriptionPage.fields.acceptFees", {
              defaultValue: "J’accepte les frais liés à l’inscription.",
            })}
          </span>
        </label>

        <button
          disabled={submitting}
          className="rounded bg-blue-600 px-6 py-2 text-white"
        >
          {submitting
            ? t("inscriptionPage.fields.submitting", {
                defaultValue: "Envoi en cours...",
              })
            : t("inscriptionPage.fields.submit", {
                defaultValue: "Soumettre",
              })}
        </button>
      </form>
    </Section>
  );
}