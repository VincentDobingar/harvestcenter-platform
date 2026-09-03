// 📁 src/components/ui/Section.jsx
export default function Section({
  id,
  title,
  subtitle,
  centered = false,
  children,
  className = "",
  contentClassName = "",
}) {
  return (
    <section id={id} className={`px-4 py-16 md:py-20 ${className}`}>
      {(title || subtitle) && (
        <header
          className={`max-w-4xl mx-auto mb-10 md:mb-12 ${
            centered ? "text-center" : ""
          }`}
        >
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="mt-4 text-slate-600 text-base md:text-lg leading-8">
              {subtitle}
            </p>
          )}
        </header>
      )}

      <div className={`max-w-7xl mx-auto ${contentClassName}`}>{children}</div>
    </section>
  );
}