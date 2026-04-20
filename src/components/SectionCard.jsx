export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = "",
}) {
  return (
    <section className={`section-card ${className}`.trim()}>
      {(title || subtitle || action) && (
        <div className="section-card__header">
          <div>
            {title ?
              <h2 className="section-card__title">{title}</h2>
            : null}
            {subtitle ?
              <p className="section-card__subtitle">{subtitle}</p>
            : null}
          </div>
          {action ?
            <div>{action}</div>
          : null}
        </div>
      )}
      <div className="section-card__body">{children}</div>
    </section>
  );
}
