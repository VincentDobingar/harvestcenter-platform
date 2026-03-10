export default function HomeCTA() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold">Prêt·e à démarrer ?</h2>
            <p className="mt-1 text-white/90">
              Rejoignez nos programmes et progressez rapidement.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/contact"
              className="inline-flex items-center rounded-xl bg-white text-blue-700 px-6 py-3 font-semibold shadow hover:bg-white/90"
            >
              S’inscrire
            </a>
            <a
              href="/courses"
              className="inline-flex items-center rounded-xl border border-white/60 px-6 py-3 font-semibold hover:bg-white/10"
            >
              Voir les formations
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
