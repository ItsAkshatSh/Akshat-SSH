/**
 * HeroShell
 * Server-rendered hero content for crawlers and no-JS visitors. Hidden
 * once the client app mounts and takes over the page.
 */
import { HERO, SOCIALS } from '../lib/siteContent';

export default function HeroShell() {
  return (
    <div
      id="hero-shell"
      className="min-h-screen bg-[#060a10] text-slate-200"
      aria-label="Akshat Sharma portfolio"
    >
      <main className="w-full min-h-screen flex items-center justify-center px-6 md:px-10 py-20 md:py-24">
        <div className="w-full max-w-6xl grid lg:grid-cols-[minmax(260px,320px)_1fr] gap-10 lg:gap-16 xl:gap-20 items-center">
          <div className="relative mx-auto lg:mx-0 w-full max-w-[280px] lg:max-w-none">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0a0f16]">
              <img
                src="/images/ascii/real_pfp.jpg"
                alt={`Portrait of ${HERO.name}`}
                className="absolute inset-0 w-full h-full object-cover"
                width={320}
                height={427}
              />
            </div>
          </div>

          <div className="flex flex-col gap-9 lg:gap-11">
            <header className="max-w-xl">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.02] font-medium text-white tracking-[-0.02em] mb-6">
                {HERO.nameLines[0]}
                <br />
                {HERO.nameLines[1]}
              </h1>
              <p className="text-neutral-200 text-[15px] sm:text-base leading-[1.75] max-w-md">
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
                  className="flex items-center justify-center w-11 h-11 rounded-full border border-white/[0.1] text-neutral-200 hover:text-white hover:border-white/30"
                >
                  <span className="text-[10px] tracking-[0.2em] uppercase">{label.slice(0, 2)}</span>
                </a>
              ))}
            </nav>

            <nav aria-label="Site sections" className="flex flex-wrap gap-3 text-sm text-neutral-300">
              <a href="/#projects" className="hover:text-white transition-colors">
                Projects
              </a>
              <span aria-hidden="true">·</span>
              <a href="/#photography" className="hover:text-white transition-colors">
                Photography
              </a>
              <span aria-hidden="true">·</span>
              <a href="/#experience" className="hover:text-white transition-colors">
                Experience
              </a>
              <span aria-hidden="true">·</span>
              <a href="/blog" className="hover:text-white transition-colors">
                Blog
              </a>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
}
