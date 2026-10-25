/**
 * ProjectsContent
 * Weekly-refreshed GitHub projects with curated local content as a fallback.
 */
import { useEffect, useState } from 'react';
import StaggerItem from '../utilities/StaggerItem';

const CURATED_PROJECTS = [
  {
    id: 'glyph',
    title: 'Glyph',
    image: '/images/projects/glyph.png',
    subtitle: 'NFC business card · e-ink display · mechanical switches',
    date: 'Jul 2026',
    link: 'https://github.com/ItsAkshatSh/Glyph',
    stack: ['Hardware', 'PCB Design', 'MicroPython', 'E-Ink', 'NFC'],
    desc: 'A programmable business card that pairs an NFC chip with an e-ink display and three Cherry MX switches.',
  },
  {
    id: 'neko',
    title: 'Neko',
    image: 'https://opengraph.githubassets.com/1/ItsAkshatSh/Neko',
    subtitle: 'Cat-care companion app · #HackTheKitty 2026',
    date: 'Jun 2026 → Jul 2026',
    link: 'https://github.com/ItsAkshatSh/Neko',
    stack: ['Flutter', 'Dart', 'Kotlin', 'Firebase', 'Lottie'],
    desc: 'A comprehensive cat-care app for streamlining pet management with schedules, veterinary records and an AI companion.',
  },
  {
    id: 'the-deck',
    title: 'The Deck!',
    image: '/images/projects/thedeck.jpg',
    subtitle: 'StreamDeck reimagined · RP2040 + resistive touchscreen',
    date: 'Mar 2026 → Apr 2026',
    link: 'https://github.com/ItsAkshatSh/TheDeck',
    stack: ['CircuitPython', 'PCB Design', 'Embedded Systems'],
    desc: 'A macropad with a touchscreen, rotary encoder and contextual app screens.',
  },
  {
    id: 'bat-hunt',
    title: 'Bat Hunt',
    image: '/images/projects/bathunt.png',
    subtitle: 'Reflex shooter · Ember Game Jam',
    date: 'Mar 2026',
    link: 'https://github.com/ItsAkshatSh/BatHunt',
    stack: ['Godot', 'GDScript', 'Game Design'],
    desc: 'A fast-paced arcade reflex shooter inspired by the NES classic Duck Hunt.',
  },
  {
    id: 'hisabipocket',
    title: 'HisabiPocket',
    image: 'https://opengraph.githubassets.com/1/ItsAkshatSh/HisabiPocket',
    subtitle: 'Next-gen finance tracker · voice-first expense logging',
    date: 'Nov 2025 → Present',
    link: 'https://github.com/ItsAkshatSh/HisabiPocket',
    stack: ['Flutter', 'Dart', 'Kotlin', 'Firebase'],
    desc: 'A hands-free finance tracker for voice and receipt-based expense logging.',
  },
];

function ProjectArtwork({ project, index }) {
  if (project.banner || project.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={project.banner || project.image}
        alt=""
        className="h-full w-full object-cover opacity-80 transition duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-100"
        loading={index < 2 ? 'eager' : 'lazy'}
      />
    );
  }

  return (
    <div className={`project-art project-art--${project.accent ?? index % 3}`}>
      <div className="project-art__window">
        <div className="project-art__dots"><i /><i /><i /></div>
        <div className="project-art__line project-art__line--long" />
        <div className="project-art__line" />
        <div className="project-art__line project-art__line--short" />
      </div>
      <div className="relative z-10 flex w-full items-end justify-between">
        <span className="font-display text-6xl leading-none text-white/80">{project.mark}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/45">
          {project.mockup?.language || 'github archive'}
        </span>
      </div>
    </div>
  );
}

const ProjectsContent = () => {
  const [projects, setProjects] = useState(CURATED_PROJECTS);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/github-projects')
      .then((response) => {
        if (!response.ok) throw new Error(`GitHub projects request failed: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (active && Array.isArray(data.projects) && data.projects.length) {
          setProjects(data.projects);
          setIsLive(true);
        }
      })
      .catch((error) => {
        console.warn('Using curated projects fallback:', error);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="pb-8">
      <div className="mb-8 pb-6 border-b border-white/[0.06]">
        <p className="text-[15px] text-neutral-200 leading-[1.7] max-w-lg">
          Selected work across hardware, mobile, games and web. Click any card for the source or the live version.
        </p>
        <p className="text-[11px] text-neutral-400 font-mono mt-3 uppercase tracking-[0.22em]">
          {String(projects.length).padStart(2, '0')} · Projects {isLive ? '· GitHub refreshed weekly' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5">
        {projects.map((project, i) => (
          <StaggerItem key={project.id} index={i} className="h-full">
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="interactive group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05] active:bg-white/[0.08] active:border-white/25 transition-colors duration-300 active:duration-100 md:flex-row"
            >
              <div className="relative h-60 shrink-0 overflow-hidden border-b border-white/[0.08] bg-black sm:h-72 md:h-auto md:min-h-[28rem] md:w-[46%] md:border-b-0 md:border-r">
                <ProjectArtwork project={project} index={i} />
                <span className="absolute left-4 top-4 font-mono text-[9px] uppercase tracking-[0.25em] text-white/65">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5 sm:p-7 md:p-8">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl text-white font-medium tracking-[-0.01em] leading-tight">
                      {project.title}
                    </h3>
                    <p className="text-neutral-300 text-[15px] mt-1.5 leading-snug">{project.subtitle}</p>
                    <p className="text-neutral-400 text-[11px] mt-2 font-mono uppercase tracking-[0.22em]">
                      {project.date}
                    </p>
                  </div>
                  <span className="text-neutral-300 group-hover:text-white text-[11px] whitespace-nowrap font-mono uppercase tracking-[0.22em] flex items-center gap-1.5 transition-colors duration-300">
                    Open <span className="inline-block group-hover:translate-x-0.5 transition-transform">↗</span>
                  </span>
                </div>

                <p className="text-neutral-200 leading-[1.7] mb-5 text-[15px]">{project.desc}</p>

                <div className="mt-auto flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <span key={tech} className="text-[11px] border border-white/[0.12] bg-white/[0.04] px-2.5 py-1 rounded-md text-neutral-200 font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          </StaggerItem>
        ))}
      </div>
    </div>
  );
};

export default ProjectsContent;
