// 📁 src/pages/public/Contact.jsx
import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import { Loader2, SendHorizonal } from "lucide-react";
import toast from "react-hot-toast";

const RECAPTCHA_SRC = "https://www.google.com/recaptcha/api.js?render=";

const Contact = () => {
  const [formData, setFormData] = useState({ nom: "", email: "", sujet: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  // charge reCAPTCHA si nécessaire
  useEffect(() => {
    if (!siteKey) {
      console.warn("VITE_RECAPTCHA_SITE_KEY manquant. Le formulaire s’enverra sans token.");
      return;
    }
    if (window.grecaptcha) return; // déjà chargé

    const s = document.createElement("script");
    s.src = `${RECAPTCHA_SRC}${siteKey}`;
    s.async = true;
    s.defer = true;
    s.onerror = () => console.error("Échec de chargement de reCAPTCHA");
    document.body.appendChild(s);
  }, [siteKey]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const getRecaptchaToken = async () => {
    if (!siteKey || !window.grecaptcha) return null;
    return new Promise((resolve) => {
      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(siteKey, { action: "submit" });
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
      toast.error("Merci de remplir tous les champs.");
      return;
    }
    setLoading(true);
    setSuccess(false);

    try {
      const token = await getRecaptchaToken();
      await api.post("/contact", { ...formData, token });
      setSuccess(true);
      toast.success("Message envoyé avec succès ✉️");
      setFormData({ nom: "", email: "", sujet: "", message: "" });
    } catch (err) {
      console.error("Erreur envoi message:", err);
      const msg =
        err?.response?.data?.message ||
        "Impossible d'envoyer le message. Veuillez vérifier votre connexion ou réessayer plus tard.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-4 py-16 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-brand mb-8">Contactez-nous</h1>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 text-center">
          ✅ Merci pour votre message. Nous vous répondrons bientôt !
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded-xl">
        <div>
          <label className="block font-medium">Nom complet</label>
          <input type="text" name="nom" value={formData.nom} onChange={handleChange} required className="w-full border px-4 py-2 rounded" />
        </div>
        <div>
          <label className="block font-medium">Adresse e-mail</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border px-4 py-2 rounded" />
        </div>
        <div>
          <label className="block font-medium">Sujet</label>
          <input type="text" name="sujet" value={formData.sujet} onChange={handleChange} required className="w-full border px-4 py-2 rounded" />
        </div>
        <div>
          <label className="block font-medium">Message</label>
          <textarea name="message" value={formData.message} onChange={handleChange} required rows="5" className="w-full border px-4 py-2 rounded" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#1F75BB] text-white px-6 py-2 rounded hover:bg-[#1863a1] flex items-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <SendHorizonal className="w-4 h-4" />} Envoyer
        </button>
      </form>

      <div className="mt-10 space-y-4 text-center text-gray-700">
        <p><strong>📍 Adresse :</strong> Quartier Abena, N'Djamena, Tchad</p>
        <p><strong>📞 Téléphone :</strong> +235 66 68 02 00 / 99 40 20 89</p>
        <p><strong>✉️ Email :</strong> contact@harvestcentertd.org</p>
      </div>

      <div className="mt-8">
        <iframe
          title="Localisation Harvest Center"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62813.926434637826!2d15.0000!3d12.1000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDA2JzAwLjAiTiAxNcKwMDAnMDAuMCJF!5e0!3m2!1sfr!2std!4v1234567890"
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="rounded shadow"
        />
      </div>
    </section>
  );
};

export default Contact;
