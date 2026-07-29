/**
 * ProjectsContent
 * Selected projects from the resume, ordered newest-first.
 */
import StaggerItem from '../utilities/StaggerItem';

const ProjectsContent = () => {
  const projects = [
    {
      id: 'glyph',
      title: 'Glyph',
      subtitle: 'NFC business card · e-ink display · mechanical switches',
      date: 'Jul 2026',
      link: 'https://github.com/ItsAkshatSh/Glyph',
      stack: ['Hardware', 'PCB Design', 'MicroPython', 'E-Ink', 'NFC'],
      desc: 'A programmable business card that pairs an NFC chip with an e-ink display and three Cherry MX switches. Custom PCB and low-power firmware turn a piece of plastic into a tactile mini-device: swap what it shows, tap it to share, click a switch to trigger an action.',
    },
    {
      id: 'neko',
      title: 'Neko',
      subtitle: 'Cat-care companion app · #HackTheKitty 2026',
      date: 'Jun 2026 → Jul 2026',
      link: 'https://github.com/ItsAkshatSh/Neko',
      stack: ['Flutter', 'Dart', 'Kotlin', 'Firebase', 'Lottie'],
      desc: 'A comprehensive cat-care app for streamlining pet management: automated feeding schedules, secure veterinary records, and an interactive AI companion. Features a custom Apple-inspired Dynamic Island overlay for seamless real-time notifications. Built for the #HackTheKitty 2026 jam.',
    },
    {
      id: 'the-deck',
      title: 'The Deck!',
      subtitle: 'StreamDeck reimagined · RP2040 + resistive touchscreen',
      date: 'Mar 2026 → Apr 2026',
      link: 'https://github.com/ItsAkshatSh/TheDeck',
      stack: ['CircuitPython', 'PCB Design', 'Embedded Systems'],
      desc: 'A macropad on steroids: a Seeed Studio XIAO RP2040 driving a 2.8" resistive touchscreen, a rotary encoder and two Cherry MX switches, with an MCP23017 for extra I/O. Instead of a fixed grid, the touchscreen surfaces different app "screens" with contextual functions.',
    },
    {
      id: 'bat-hunt',
      title: 'Bat Hunt',
      subtitle: 'Reflex shooter · Ember Game Jam',
      date: 'Mar 2026',
      link: 'https://github.com/ItsAkshatSh/BatHunt',
      stack: ['Godot', 'GDScript', 'Game Design'],
      desc: 'A fast-paced arcade reflex shooter inspired by the NES classic Duck Hunt. Reimagined for a high-intensity, low-visibility cave environment: responsive aiming mechanics, randomised flight behaviours for aerial targets, and tight polish on player-reaction feel. Submitted to the Ember Game Jam.',
    },
    {
      id: 'hisabipocket',
      title: 'HisabiPocket',
      subtitle: 'Next-gen finance tracker · voice-first expense logging',
      date: 'Nov 2025 → Present',
      link: 'https://github.com/ItsAkshatSh/HisabiPocket',
      stack: ['Flutter', 'Dart', 'Kotlin', 'Firebase'],
      desc: 'A hands-free finance tracker: log expenses by voice or receipt scan, with visual analytics, smart spending alerts and weekly summaries. Roadmap includes real-time card-transaction tracking and a personalised AI budgeting companion for a seamless money picture.',
    },
  ];

  return (
    <div className="space-y-4 pb-8">
      <div className="mb-8 pb-6 border-b border-white/[0.06]">
        <p className="text-[15px] text-neutral-200 leading-[1.7] max-w-lg">
          Selected work across hardware, mobile, games and web. Click any card for the source or the live version.
        </p>
        <p className="text-[11px] text-neutral-400 font-mono mt-3 uppercase tracking-[0.22em]">
          {String(projects.length).padStart(2, '0')} · Projects
        </p>
      </div>

      {projects.map((project, i) => (
        <StaggerItem key={project.id} index={i}>
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="interactive group block rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
          >
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl sm:text-2xl text-white font-medium tracking-[-0.01em] leading-tight">
                  {project.title}
                </h3>
                {project.subtitle && (
                  <p className="text-neutral-300 text-[15px] mt-1.5 leading-snug">{project.subtitle}</p>
                )}
                <p className="text-neutral-400 text-[11px] mt-2 font-mono uppercase tracking-[0.22em]">
                  {project.date}
                </p>
              </div>
              <span className="text-neutral-300 group-hover:text-white text-[11px] whitespace-nowrap font-mono uppercase tracking-[0.22em] flex items-center gap-1.5 transition-colors duration-300">
                Open
                <span className="inline-block group-hover:translate-x-0.5 transition-transform">↗</span>
              </span>
            </div>

            <p className="text-neutral-200 leading-[1.7] mb-5 text-[15px]">
              {project.desc}
            </p>

            <div className="flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="text-[11px] border border-white/[0.12] bg-white/[0.04] px-2.5 py-1 rounded-md text-neutral-200 font-mono"
                >
                  {tech}
                </span>
              ))}
            </div>
          </a>
        </StaggerItem>
      ))}
    </div>
  );
};

export default ProjectsContent;
