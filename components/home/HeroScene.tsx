export function HeroScene() {
  return (
    <section className="px-6 pb-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border-subtle shadow-2xl">
          <iframe
            src="/hero-scene.html"
            title="Vos notifications chronophages, absorbées par Herakia — démonstration animée"
            loading="lazy"
            className="absolute inset-0 h-full w-full"
            style={{ border: 0 }}
          />
        </div>
      </div>
    </section>
  );
}
