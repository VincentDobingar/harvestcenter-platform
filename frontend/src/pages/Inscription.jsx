// src/pages/Inscription.jsx
// Demande d'inscription à une formation. Utilisée sur le site public
// (/inscription) et dans l'espace étudiant (/dashboard/student/inscription).
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  GraduationCap,
  Loader2,
  LogIn,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import api from "@/utils/api";
import { useAuth } from "@/context/AuthContext";

function splitFullName(full) {
  if (!full) return ["", ""];
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return ["", parts[0]];
  const prenom = parts.pop();
  return [parts.join(" "), prenom];
}

const cleanPhone = (v) => String(v || "").replace(/[\s.-]/g, "");
const PHONE_RE = /^\+?\d{8,15}$/;

const LEVELS_FR = ["Débutant", "Intermédiaire", "Avancé", "Je ne sais pas (test de niveau)"];
const LEVELS_EN = ["Beginner", "Intermediate", "Advanced", "Not sure (placement test)"];
const SLOTS_FR = ["Matin", "Après-midi", "Soir", "Week-end"];
const SLOTS_EN = ["Morning", "Afternoon", "Evening", "Weekend"];

const EMPTY = {
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
};

/* ——— Petites briques de formulaire ——— */

function FieldShell({ id, label, required, hint, error, children, className = "" }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-bad" aria-hidden="true">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] text-bad">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-mist">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function inputCls(error) {
  return `w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-ink placeholder:text-mist/70 transition focus:outline-none focus:ring-4 ${
    error ? "border-bad focus:border-bad focus:ring-bad/15" : "border-line focus:border-brand focus:ring-brand/15"
  }`;
}

function ChoiceGroup({ name, label, options, value, onChange, error, required, columns = "sm:grid-cols-2" }) {
  return (
    <fieldset>
      <legend className="mb-2 block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-bad" aria-hidden="true">*</span>}
      </legend>
      <div className={`grid gap-2 ${columns}`} id={`${name}-group`}>
        {options.map((o) => {
          const active = value === o.value;
          return (
            <label
              key={o.value}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-[15px] transition focus-within:ring-4 focus-within:ring-millet/40 ${
                active ? "border-ink bg-ink text-white" : error ? "border-bad/60 bg-white text-ink" : "border-line bg-white text-ink hover:border-ink/30"
              }`}
            >
              <input type="radio" name={name} value={o.value} checked={active} onChange={onChange} className="sr-only" />
              <span
                aria-hidden="true"
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${active ? "border-millet bg-millet text-ink" : "border-line"}`}
              >
                {active && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              <span className="min-w-0">
                <span className="block font-medium leading-snug">{o.label}</span>
                {o.desc && <span className={`block text-[13px] ${active ? "text-white/70" : "text-mist"}`}>{o.desc}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-[13px] text-bad">{error}</p>}
    </fieldset>
  );
}

function FormSection({ step, title, intro, children }) {
  return (
    <section className="border-t border-line pt-8 first:border-t-0 first:pt-0">
      <div className="mb-6 flex items-start gap-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-millet font-display text-[15px] font-semibold text-ink">{step}</span>
        <div>
          <h2 className="font-display text-[1.35rem] font-semibold leading-tight !text-ink">{title}</h2>
          {intro && <p className="mt-1 text-[14.5px] text-mist">{intro}</p>}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

/* ——— Page ——— */

export default function Inscription() {
  const { t, i18n } = useTranslation();
  const en = (i18n.resolvedLanguage || "fr").startsWith("en");
  const navigate = useNavigate();
  const location = useLocation();
  const embedded = location.pathname.startsWith("/dashboard");
  const { user, booting } = useAuth();

  const [loadingFormations, setLoadingFormations] = useState(true);
  const [formations, setFormations] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(EMPTY);
  const formRef = useRef(null);

  const isStudent = String(user?.role || "").toLowerCase() === "student";

  const [nomFromUser, prenomFromUser] = useMemo(
    () => splitFullName([user?.last_name, user?.first_name].filter(Boolean).join(" ").trim()),
    [user]
  );

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      email: user.email || prev.email,
      nom: nomFromUser || prev.nom,
      prenom: prenomFromUser || prev.prenom,
    }));
  }, [user, nomFromUser, prenomFromUser]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await api.get("/inscription/options/formations", { skipAuthRefresh: true });
        if (!ignore) setFormations(res.data?.formations || []);
      } catch (err) {
        console.error(err);
        if (!ignore)
          toast.error(t("inscriptionPage.errors.loadFormations", { defaultValue: "Impossible de charger les formations." }));
      } finally {
        if (!ignore) setLoadingFormations(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [t]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate() {
    const req = en ? "Required" : "Obligatoire";
    const e = {};
    [
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
    ].forEach((k) => {
      if (!String(form[k] || "").trim()) e[k] = req;
    });

    if (form.dateNaissance) {
      const birth = new Date(form.dateNaissance);
      if (Number.isNaN(birth.getTime())) e.dateNaissance = t("inscriptionPage.errors.invalidBirthDate", { defaultValue: "La date de naissance est invalide." });
      else {
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
        if (age < 10) e.dateNaissance = t("inscriptionPage.errors.minAge", { defaultValue: "L’âge minimum requis est de 10 ans." });
      }
    }
    if (form.telephone && !PHONE_RE.test(cleanPhone(form.telephone)))
      e.telephone = t("inscriptionPage.errors.invalidPhone", { defaultValue: "Le numéro de téléphone est invalide." });
    if (form.whatsapp && !PHONE_RE.test(cleanPhone(form.whatsapp)))
      e.whatsapp = t("inscriptionPage.errors.invalidWhatsapp", { defaultValue: "Le numéro WhatsApp est invalide." });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = en ? "Invalid email address" : "Adresse email invalide";
    if (!form.acceptFees) e.acceptFees = t("inscriptionPage.errors.acceptFees", { defaultValue: "Vous devez accepter les frais d’inscription." });
    return e;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    if (!user) {
      navigate("/account?tab=login", { state: { next: "/dashboard/student/inscription" } });
      return;
    }
    if (!isStudent) return;

    const e = validate();
    setErrors(e);
    const firstKey = Object.keys(e)[0];
    if (firstKey) {
      toast.error(t("inscriptionPage.errors.required", { defaultValue: "Veuillez vérifier les champs signalés." }));
      const el =
        formRef.current?.querySelector(`[name="${firstKey}"]`) || formRef.current?.querySelector(`#${firstKey}-group`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (el?.focus) setTimeout(() => el.focus({ preventScroll: true }), 300);
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/inscription/request", {
        ...form,
        telephone: cleanPhone(form.telephone),
        whatsapp: cleanPhone(form.whatsapp),
        email: form.email.trim(),
        session_id: Number(form.session_id || 1),
        module_id: Number(form.module_id),
        date_naissance: form.dateNaissance,
      });
      toast.success(t("inscriptionPage.success", { defaultValue: "Votre demande d’inscription a bien été envoyée." }));
      navigate("/dashboard/student", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || t("inscriptionPage.errors.submit", { defaultValue: "Une erreur est survenue lors de l’envoi." }));
    } finally {
      setSubmitting(false);
    }
  }

  const formationOptions = formations.map((f) => ({
    value: String(f.id),
    label: f.label || f.title || f.name,
    desc: f.description ? String(f.description).slice(0, 70) : null,
  }));
  const levels = (en ? LEVELS_EN : LEVELS_FR).map((l) => ({ value: l, label: l }));
  const slots = (en ? SLOTS_EN : SLOTS_FR).map((l) => ({ value: l, label: l }));

  const steps = [
    { icon: UserPlus, title: en ? "Create your account" : "Créez votre compte", text: en ? "Free, in one minute." : "Gratuit, en une minute." },
    { icon: ClipboardCheck, title: en ? "Send your request" : "Envoyez votre demande", text: en ? "Course, level and preferred time." : "Formation, niveau et horaire souhaité." },
    { icon: GraduationCap, title: en ? "Join your class" : "Rejoignez votre classe", text: en ? "We confirm and assign your class." : "Nous validons et vous affectons à une classe." },
  ];

  /* ——— Colonne latérale ——— */
  const aside = (
    <aside className="space-y-5 lg:sticky lg:top-28">
      <div className="rounded-[22px] bg-ink p-6 text-white">
        <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-millet">{en ? "How it works" : "Comment ça se passe"}</p>
        <ol className="mt-5 space-y-5">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-millet">
                <s.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold">
                  {i + 1}. {s.title}
                </span>
                <span className="block text-sm text-white/70">{s.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-[22px] border border-line bg-white p-6">
        <p className="flex items-center gap-2 font-semibold text-ink">
          <ShieldCheck className="h-5 w-5 text-ok" /> {en ? "Your data stays with us" : "Vos données restent chez nous"}
        </p>
        <p className="mt-2 text-sm leading-6 text-mist">
          {en
            ? "Used only to process your registration and contact you about your course."
            : "Elles servent uniquement à traiter votre inscription et à vous contacter au sujet de votre formation."}
        </p>
      </div>
      <div className="rounded-[22px] border border-line bg-paper p-6">
        <p className="font-semibold text-ink">{en ? "A question?" : "Une question ?"}</p>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <a href="tel:+23566680200" className="inline-flex items-center gap-2 text-ink hover:text-brand">
              <Phone className="h-4 w-4 text-mist" /> +235 66 68 02 00
            </a>
          </li>
          <li>
            <a href="https://wa.me/23566680200" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-ink hover:text-brand">
              <MessageCircle className="h-4 w-4 text-mist" /> WhatsApp
            </a>
          </li>
          <li>
            <a href="mailto:contact@harvestcentertd.org" className="inline-flex items-center gap-2 text-ink hover:text-brand">
              <Mail className="h-4 w-4 text-mist" /> contact@harvestcentertd.org
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );

  /* ——— Contenu principal selon la situation ——— */
  let main;
  if (booting || loadingFormations) {
    main = (
      <div className="flex items-center gap-3 rounded-[22px] border border-line bg-white p-8 text-mist" aria-busy="true">
        <Loader2 className="h-5 w-5 animate-spin" /> {t("common.loading", { defaultValue: "Chargement…" })}
      </div>
    );
  } else if (!user) {
    main = (
      <div className="rounded-[22px] border border-line bg-white p-7 md:p-10">
        <h2 className="font-display text-[1.7rem] font-semibold leading-tight !text-ink">
          {en ? "First, create your student account" : "Commencez par créer votre compte étudiant"}
        </h2>
        <p className="mt-3 max-w-xl leading-7 text-mist">
          {en
            ? "Your request is linked to your account so you can follow its progress, then find your class, courses and assignments in your student space."
            : "Votre demande est liée à votre compte : vous suivez son traitement, puis retrouvez votre classe, vos cours et vos devoirs dans votre espace étudiant."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/account?tab=register"
            state={{ next: "/dashboard/student/inscription" }}
            className="inline-flex items-center gap-2 rounded-full bg-millet px-6 py-3 font-semibold text-ink transition hover:bg-[#f0b743] focus-ring"
          >
            <UserPlus className="h-4 w-4" /> {en ? "Create my account" : "Créer mon compte"}
          </Link>
          <Link
            to="/account?tab=login"
            state={{ next: "/dashboard/student/inscription" }}
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 font-semibold text-ink transition hover:border-ink/40 hover:bg-paper focus-ring"
          >
            <LogIn className="h-4 w-4" /> {en ? "I already have an account" : "J’ai déjà un compte"}
          </Link>
        </div>
        {formationOptions.length > 0 && (
          <div className="mt-10 border-t border-line pt-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mist">{en ? "Courses open for registration" : "Formations ouvertes aux inscriptions"}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {formationOptions.map((f) => (
                <li key={f.value} className="rounded-full bg-paper px-4 py-2 text-sm font-medium text-ink">
                  {f.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  } else if (!isStudent) {
    main = (
      <div className="rounded-[22px] border border-millet/50 bg-millet-soft p-7">
        <h2 className="font-display text-xl font-semibold !text-ink">{en ? "This form is for students" : "Ce formulaire est réservé aux étudiants"}</h2>
        <p className="mt-2 text-ink/80">
          {en
            ? "You are signed in with a staff account. Sign in with a student account to send a request."
            : "Vous êtes connecté avec un compte de l’équipe. Connectez-vous avec un compte étudiant pour envoyer une demande."}
        </p>
      </div>
    );
  } else {
    main = (
      <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-10 rounded-[22px] border border-line bg-white p-6 md:p-10">
        <FormSection step="1" title={en ? "Your course" : "Votre formation"} intro={en ? "Choose a course, your current level and when you can attend." : "Choisissez la formation, votre niveau actuel et le moment où vous êtes disponible."}>
          {formationOptions.length ? (
            <ChoiceGroup
              name="module_id"
              label={en ? "Course" : "Formation"}
              required
              options={formationOptions}
              value={form.module_id}
              onChange={handleChange}
              error={errors.module_id}
            />
          ) : (
            <p className="rounded-xl bg-paper px-4 py-3 text-sm text-mist">
              {en ? "No course is open for registration right now. Contact us to be told about the next session." : "Aucune formation n’est ouverte pour le moment. Contactez-nous pour être prévenu de la prochaine session."}
            </p>
          )}
          <ChoiceGroup
            name="niveau_langue"
            label={en ? "Current level" : "Niveau actuel"}
            required
            options={levels}
            value={form.niveau_langue}
            onChange={handleChange}
            error={errors.niveau_langue}
          />
          <ChoiceGroup
            name="horaire_prefere"
            label={en ? "Preferred time" : "Horaire souhaité"}
            required
            columns="grid-cols-2 sm:grid-cols-4"
            options={slots}
            value={form.horaire_prefere}
            onChange={handleChange}
            error={errors.horaire_prefere}
          />
        </FormSection>

        <FormSection step="2" title={en ? "About you" : "Votre identité"} intro={en ? "As written on your ID." : "Comme sur votre pièce d’identité."}>
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldShell id="nom" label={en ? "Last name" : "Nom"} required error={errors.nom}>
              <input id="nom" name="nom" value={form.nom} onChange={handleChange} autoComplete="family-name" className={inputCls(errors.nom)} aria-invalid={!!errors.nom} />
            </FieldShell>
            <FieldShell id="prenom" label={en ? "First name" : "Prénom"} required error={errors.prenom}>
              <input id="prenom" name="prenom" value={form.prenom} onChange={handleChange} autoComplete="given-name" className={inputCls(errors.prenom)} aria-invalid={!!errors.prenom} />
            </FieldShell>
          </div>
          <ChoiceGroup
            name="sexe"
            label={en ? "Sex" : "Sexe"}
            required
            columns="grid-cols-2"
            options={[
              { value: "F", label: t("inscriptionPage.fields.female", { defaultValue: "Féminin" }) },
              { value: "M", label: t("inscriptionPage.fields.male", { defaultValue: "Masculin" }) },
            ]}
            value={form.sexe}
            onChange={handleChange}
            error={errors.sexe}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldShell id="dateNaissance" label={en ? "Date of birth" : "Date de naissance"} required error={errors.dateNaissance} hint={en ? "Minimum age: 10" : "Âge minimum : 10 ans"}>
              <input id="dateNaissance" name="dateNaissance" type="date" value={form.dateNaissance} onChange={handleChange} className={inputCls(errors.dateNaissance)} aria-invalid={!!errors.dateNaissance} />
            </FieldShell>
            <FieldShell id="lieuNaissance" label={en ? "Place of birth" : "Lieu de naissance"} required error={errors.lieuNaissance}>
              <input id="lieuNaissance" name="lieuNaissance" value={form.lieuNaissance} onChange={handleChange} className={inputCls(errors.lieuNaissance)} aria-invalid={!!errors.lieuNaissance} />
            </FieldShell>
          </div>
        </FormSection>

        <FormSection step="3" title={en ? "How to reach you" : "Vos coordonnées"} intro={en ? "We use these to confirm your registration and send your class details." : "Pour confirmer votre inscription et vous envoyer les informations de votre classe."}>
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldShell id="telephone" label={en ? "Phone" : "Téléphone"} required error={errors.telephone} hint={en ? "e.g. +235 66 68 02 00" : "Ex. +235 66 68 02 00"}>
              <input id="telephone" name="telephone" type="tel" inputMode="tel" value={form.telephone} onChange={handleChange} autoComplete="tel" className={inputCls(errors.telephone)} aria-invalid={!!errors.telephone} />
            </FieldShell>
            <FieldShell id="whatsapp" label="WhatsApp" error={errors.whatsapp} hint={en ? "Optional, if different" : "Facultatif, s’il est différent"}>
              <input id="whatsapp" name="whatsapp" type="tel" inputMode="tel" value={form.whatsapp} onChange={handleChange} className={inputCls(errors.whatsapp)} aria-invalid={!!errors.whatsapp} />
            </FieldShell>
          </div>
          <FieldShell id="email" label="Email" required error={errors.email}>
            <input id="email" name="email" type="email" inputMode="email" value={form.email} onChange={handleChange} autoComplete="email" className={inputCls(errors.email)} aria-invalid={!!errors.email} />
          </FieldShell>
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldShell id="quartier" label={en ? "Neighbourhood" : "Quartier"} required error={errors.quartier}>
              <input id="quartier" name="quartier" value={form.quartier} onChange={handleChange} className={inputCls(errors.quartier)} aria-invalid={!!errors.quartier} />
            </FieldShell>
            <FieldShell id="arrondissement" label={en ? "District" : "Arrondissement"} required error={errors.arrondissement}>
              <input id="arrondissement" name="arrondissement" value={form.arrondissement} onChange={handleChange} className={inputCls(errors.arrondissement)} aria-invalid={!!errors.arrondissement} />
            </FieldShell>
          </div>
        </FormSection>

        <div className="border-t border-line pt-8">
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-4 transition ${
              errors.acceptFees ? "border-bad/60 bg-bad/5" : form.acceptFees ? "border-ok/40 bg-ok/5" : "border-line bg-paper/60"
            }`}
          >
            <input type="checkbox" name="acceptFees" checked={form.acceptFees} onChange={handleChange} className="mt-1 h-4 w-4 accent-[#0E2A47]" />
            <span className="text-[15px] text-ink">
              {t("inscriptionPage.fields.acceptFees", { defaultValue: "J’accepte les frais liés à l’inscription." })}
              <span className="mt-0.5 block text-[13px] text-mist">
                {en ? "The amount depends on the course and is confirmed by the centre." : "Le montant dépend de la formation et vous est confirmé par le centre."}
              </span>
            </span>
          </label>
          {errors.acceptFees && <p className="mt-1.5 text-[13px] text-bad">{errors.acceptFees}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-8 py-4 text-[16px] font-semibold text-white transition hover:bg-ink-2 disabled:opacity-60 focus-ring sm:w-auto"
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
            {submitting
              ? t("inscriptionPage.fields.submitting", { defaultValue: "Envoi en cours…" })
              : en
              ? "Send my request"
              : "Envoyer ma demande"}
          </button>
          <p className="mt-3 text-[13px] text-mist">
            {en ? "You can follow your request from your student space." : "Vous suivrez votre demande depuis votre espace étudiant."}
          </p>
        </div>
      </form>
    );
  }

  /* ——— Mise en page : dans l'espace étudiant, pas de grand bandeau ——— */
  if (embedded) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-[1.75rem] font-semibold leading-tight !text-ink sm:text-[2rem]">
            {t("inscriptionPage.title", { defaultValue: "Demande d’inscription" })}
          </h1>
          <p className="mt-1.5 max-w-2xl text-[15px] text-mist">
            {en ? "Tell us which course you want to follow. The centre confirms your request and assigns your class." : "Indiquez la formation que vous souhaitez suivre. Le centre valide votre demande et vous affecte à une classe."}
          </p>
        </div>
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          {main}
          <div className="hidden xl:block">{aside}</div>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-paper">
      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden="true" className="woven absolute inset-y-0 left-0 w-2.5 md:w-3" />
        <div aria-hidden="true" className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-16 md:pb-28 md:pt-20">
          <p className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.18em] text-millet">
            <span aria-hidden="true" className="h-px w-8 bg-millet" />
            {en ? "Registration" : "Inscription"}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-[2.4rem] font-semibold leading-[1.05] !text-white md:text-[3.6rem]">
            {en ? "Join Harvest Center" : "Rejoignez Harvest Center"}
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-8 text-white/75">
            {en
              ? "English, Chinese, Spanish, French or German: send your request in a few minutes. We confirm it and assign you to a class matching your level."
              : "Anglais, chinois, espagnol, français ou allemand : envoyez votre demande en quelques minutes. Nous la validons et vous affectons à une classe adaptée à votre niveau."}
          </p>
          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-white/85">
            {[en ? "Small groups" : "Groupes réduits", en ? "Flexible hours" : "Horaires flexibles", en ? "N’Djamena and Sarh" : "N’Djamena et Sarh"].map((b) => (
              <li key={b} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-millet" strokeWidth={3} /> {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="relative mx-auto -mt-14 max-w-7xl px-4 pb-20">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          {main}
          {aside}
        </div>
      </div>
    </main>
  );
}
