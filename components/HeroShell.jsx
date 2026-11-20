/**
 * HeroShell
 * Server-rendered hero content for crawlers and no-JS visitors. Hidden
 * once the client app mounts and takes over the page.
 *
 * Contract: this is the no-JS twin of the hero in AppClient. Any change to
 * the hero's copy, spacing, portrait frame or social row must land in both
 * files: the shell is what a visitor without JavaScript sees, and it is also
 * the first paint before hydration. Keep the markup identical in structure;
 * only the real media differ (an <img> here, the ASCII canvas there).
 */
import { HERO, SOCIALS } from '../lib/siteContent';

export default function HeroShell() {
  return (
    <div
      id="hero-shell"
      className="min-h-dvh bg-ink text-bone"
      aria-label="Akshat Sharma portfolio"
    >
      <main className="w-full min-h-dvh flex items-center justify-center px-6 md:px-10 pt-16 md:pt-24 pb-28 md:pb-24">
        <div className="w-full max-w-6xl grid lg:grid-cols-[minmax(260px,320px)_1fr] gap-8 lg:gap-16 xl:gap-20 items-center">
          <div className="relative mx-auto lg:mx-0 w-full max-w-[210px] sm:max-w-[250px] md:max-w-[280px] lg:max-w-none">
            <div className="relative aspect-[3/4] rounded-[1.75rem] overflow-hidden border border-hair bg-surface">
              <img
                src="/images/ascii/real_pfp.jpg"
                alt={`Portrait of ${HERO.name}`}
                className="absolute inset-0 w-full h-full object-cover"
                width={320}
                height={427}
              />
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:gap-11">
            <header className="max-w-xl">
              <h1 className="font-display text-balance text-5xl sm:text-6xl lg:text-[4.4rem] leading-[1.02] text-bone tracking-[-0.01em] mb-5 md:mb-6">
                {HERO.nameLines[0]}
                <br />
                {HERO.nameLines[1]}
              </h1>
              <p className="text-pretty text-muted-warm text-[16px] sm:text-[17px] leading-[1.8] max-w-md">
                {HERO.bio}
              </p>
            </header>

            <nav aria-label="Social links" className="flex items-center gap-3 pt-1">
              {SOCIALS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="press flex items-center justify-center size-11 rounded-full border border-hair text-muted-warm hover:text-accent hover:border-[color:var(--border-hover)]"
                >
                  <span className="text-[10px] tracking-[0.2em] uppercase">{label.slice(0, 2)}</span>
                </a>
              ))}
            </nav>

            <nav aria-label="Site sections" className="flex flex-wrap gap-3 text-sm text-muted-warm">
              <a href="/#projects" className="hover:text-accent transition-colors">
                Projects
              </a>
              <span aria-hidden="true">·</span>
              <a href="/#photography" className="hover:text-accent transition-colors">
                Photography
              </a>
              <span aria-hidden="true">·</span>
              <a href="/#experience" className="hover:text-accent transition-colors">
                Experience
              </a>
              <span aria-hidden="true">·</span>
              <a href="/blog" className="hover:text-accent transition-colors">
                Blog
              </a>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
}
