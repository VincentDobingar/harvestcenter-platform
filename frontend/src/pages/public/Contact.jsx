// src/pages/public/Contact.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "@/utils/api";
import {
  Loader2,
  SendHorizonal,
  Mail,
  MapPin,
  Phone,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

const RECAPTCHA_SRC = "https://www.google.com/recaptcha/api.js?render=";
const MAPS_LINK = "https://maps.google.com/?q=12.1000,15.0000";
const WHATSAPP_LINK =
  "https://wa.me/23566680200?text=Bonjour%20Harvest%20Center,%20je%20souhaite%20avoir%20plus%20d'informations.";

const Contact = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    sujet: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!siteKey) {
      console.warn(
        t("contactPage.dev.recaptchaMissing", {
          defaultValue:
            "VITE_RECAPTCHA_SITE_KEY manquant. Le formulaire s’enverra sans token.",
        })
      );
      return;
    }

    if (window.grecaptcha) return;

    const s = document.createElement("script");
    s.src = `${RECAPTCHA_SRC}${siteKey}`;
    s.async = true;
    s.defer = true;
    s.onerror = () =>
      console.error(
        t("contactPage.dev.recaptchaLoadFailed", {
          defaultValue: "Échec de chargement de reCAPTCHA",
        })
      );
    document.body.appendChild(s);
  }, [siteKey, t]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const getRecaptchaToken = async () => {
    if (!siteKey || !window.grecaptcha) return null;

    return new Promise((resolve) => {
      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(siteKey, {
            action: "submit",
          });
          resolve(token);
        } catch {
          resolve(null);
        }
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nom || !formData.email || !formData.sujet || !formData.message) {
      toast.error(t("contactPage.validation.fillAll"));
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const token = await getRecaptchaToken();
      await api.post("/contact", { ...formData, token });

      setSuccess(true);
      toast.success(t("contactPage.toast.success"));
      setFormData({ nom: "", email: "", sujet: "", message: "" });
    } catch (err) {
      console.error("Erreur envoi message:", err);
      const msg = err?.response?.data?.message || t("contactPage.toast.error");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const infoCards = [
    {
      key: "address",
      icon: MapPin,
      value: <span>{t("site.address")}</span>,
    },
    {
      key: "phone",
      icon: Phone,
      value: (
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 font-medium hover:underline"
        >
          {t("site.phone")}
        </a>
      ),
    },
    {
      key: "email",
      icon: Mail,
      value: (
        <a
          href="mailto:contact@harvestcentertd.org"
          className="text-blue-700 font-medium hover:underline"
        >
          contact@harvestcentertd.org
        </a>
      ),
    },
  ];

  return (
    <main className="bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_35%)]" />

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-white/10 border border-white/10 px-4 py-2 text-sm font-semibold">
              {t("contactPage.badge", { defaultValue: "Harvest Center" })}
            </span>

            <h1 className="mt-5 text-4xl md:text-5xl font-extrabold leading-tight">
              {t("contactPage.title")}
            </h1>

            <p className="mt-5 text-white/80 text-lg leading-8">
              {t("contactPage.subtitle", {
                defaultValue:
                  "Une question, une demande d’information ou un besoin de collaboration ? Écrivez-nous.",
              })}
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-14 md:py-16">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-8">
            {success && (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-700 text-sm">
                {t("contactPage.successBanner")}
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {t("contactPage.formTitle", { defaultValue: "Envoyer un message" })}
              </h2>

              <p className="mt-2 text-slate-600 leading-7">
                {t("contactPage.formDescription", {
                  defaultValue:
                    "Remplissez ce formulaire et notre équipe vous répondra dans les meilleurs délais.",
                })}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("contactPage.fields.name")}
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("contactPage.fields.email")}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("contactPage.fields.subject")}
                </label>
                <input
                  type="text"
                  name="sujet"
                  value={formData.sujet}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("contactPage.fields.message")}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 text-white px-6 py-3 font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <SendHorizonal className="w-4 h-4" />
                )}
                {t("contactPage.fields.send")}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4">
              {infoCards.map(({ key, icon: Icon, value }) => (
                <div
                  key={key}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-blue-700" />
                  </div>
                  <div className="text-slate-700 text-xl leading-8">{value}</div>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-slate-200 shadow-sm bg-white">
              <iframe
                title={t("contactPage.mapTitle")}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62813.926434637826!2d15.0000!3d12.1000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDA2JzAwLjAiTiAxNcKwMDAnMDAuMCJF!5e0!3m2!1sfr!2std!4v1234567890"
                width="100%"
                height="360"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-white text-blue-700 px-5 py-3 font-semibold hover:bg-blue-50 transition"
              >
                <ExternalLink className="w-4 h-4" />
                {t("contactPage.openInMaps", {
                  defaultValue: "Ouvrir dans Maps",
                })}
              </a>

              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-green-600 text-white px-5 py-3 font-semibold hover:bg-green-700 transition"
              >
                <Phone className="w-4 h-4" />
                {t("contactPage.openWhatsapp", {
                  defaultValue: "Écrire sur WhatsApp",
                })}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;