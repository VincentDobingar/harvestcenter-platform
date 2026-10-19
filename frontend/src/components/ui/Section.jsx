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
          <span aria-hidden="true" className={`woven-x mb-5 block h-1.5 w-16 rounded-full ${centered ? "mx-auto" : ""}`} />
          {title && (
            <h2 className="font-display text-[2rem] md:text-[2.6rem] font-semibold leading-[1.1] !text-ink">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="mt-4 text-mist text-base md:text-[17px] leading-8">
              {subtitle}
            </p>
          )}
        </header>
      )}

      <div className={`max-w-7xl mx-auto ${contentClassName}`}>{children}</div>
    </section>
  );
}