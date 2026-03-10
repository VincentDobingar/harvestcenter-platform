// 📁 src/components/ui/Section.jsx

export default function Section({ id, title, subtitle, centered = false, children }) {
  return (
    <section id={id} className="px-4 py-12">
      {(title || subtitle) && (
        <header className={`max-w-5xl mx-auto ${centered ? "text-center" : ""} mb-8`}>
          {title && (
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand">
              {title}
            </h2>
          )}
          {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
        </header>
      )}
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}
