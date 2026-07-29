/**
 * ExperienceContent
 * Mirrors the resume: three roles, one school entry, achievements and
 * certifications.
 */
import StaggerItem from '../utilities/StaggerItem';

const ExperienceContent = () => {
  const jobs = [
    {
      role: 'Chair of Innovation and Technology',
      company: 'Indian International School',
      location: 'Dubai, UAE',
      time: 'Dec 2024 → Present',
      type: 'School leadership',
      bullets: [
        'Pioneered school-wide STEM initiatives, designing advanced technical programs to mentor gifted students.',
        'Created hands-on opportunities in software, hardware and engineering for peers across year groups.',
      ],
    },
    {
      role: 'Campfire Host',
      company: 'HackClub',
      location: 'Dubai, UAE',
      time: 'Dec 2024 → Present',
      type: 'Community · Volunteer',
      bullets: [
        'Led technical operations for community game-development projects.',
        'Facilitated hands-on workshops on Git, GitHub, GameMaker and Itch.io for local makers.',
      ],
    },
    {
      role: 'Counterspell Host',
      company: 'HackClub',
      location: 'Dubai, UAE',
      time: 'Oct 2024 → Nov 2024',
      type: 'Community · Volunteer',
      bullets: [
        'Coordinated and hosted a hackathon in the heart of downtown Dubai for the Counterspell global event.',
      ],
    },
  ];

  const education = [
    {
      level: 'School',
      school: 'Indian International School, DSO',
      location: 'Dubai, UAE',
      time: 'Jan 2014 → Jan 2027',
    },
  ];

  const achievements = [
    { title: 'Winner · International Level Hackathon', issuer: 'BrightChamps', date: 'May 2024' },
    { title: 'Winner · National Level Hackathon', issuer: 'ICodeJr', date: 'Jan 2024' },
    { title: 'Winner · State Level Hackathon', issuer: 'ICodeJr', date: 'Feb 2023' },
  ];

  const certifications = [
    { title: 'Python Advanced Certification', issuer: 'BrightChamps', date: 'Jul 2025' },
    { title: 'Web Developer Certification', issuer: 'BrightChamps', date: 'Jul 2025' },
    { title: 'App Developer Certification', issuer: 'BrightChamps', date: 'Sep 2022' },
  ];

  const SectionHeading = ({ children, count }) => (
    <div className="flex items-baseline gap-3 mb-6">
      <h3 className="text-[11px] font-mono uppercase tracking-[0.3em] text-neutral-200">
        {children}
      </h3>
      {count != null && (
        <span className="text-[10px] font-mono text-neutral-500">
          {String(count).padStart(2, '0')}
        </span>
      )}
      <span className="flex-1 h-px bg-white/[0.08]" />
    </div>
  );

  return (
    <div className="relative space-y-12 pb-8">
      <div className="mb-2 pb-6 border-b border-white/[0.06]">
        <p className="text-[15px] text-neutral-200 leading-[1.7] max-w-xl">
          Aspiring Computer Engineer from Dubai. Hardware and software projects ranging from a home-brewed StreamDeck to Flutter apps. Experience in web dev, app dev, embedded systems, PCB design and game dev.
        </p>
        <p className="text-[11px] text-neutral-400 font-mono mt-3 uppercase tracking-[0.22em]">
          Live CV
        </p>
      </div>

      <section>
        <SectionHeading count={jobs.length}>Experience</SectionHeading>
        <div className="space-y-3">
          {jobs.map((job, i) => (
            <StaggerItem key={i} index={i}>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6">
                <div className="flex justify-between items-start mb-1 gap-3 flex-wrap">
                  <div className="min-w-0">
                    <h4 className="text-lg sm:text-xl text-white font-medium tracking-[-0.01em]">{job.role}</h4>
                    <p className="text-neutral-300 text-[15px] mt-1">
                      {job.company} · {job.location}
                    </p>
                  </div>
                  <span className="text-neutral-300 text-[11px] font-mono uppercase tracking-[0.22em] whitespace-nowrap">
                    {job.time}
                  </span>
                </div>
                <p className="text-neutral-400 text-[11px] font-mono uppercase tracking-[0.22em] mb-4">
                  {job.type}
                </p>
                <ul className="text-neutral-200 text-[15px] leading-[1.7] space-y-2.5">
                  {job.bullets.map((bullet, bi) => (
                    <li key={bi} className="flex gap-3">
                      <span className="text-neutral-500 flex-shrink-0 mt-2 text-[10px]">▸</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading count={education.length}>Education</SectionHeading>
        {education.map((edu, i) => (
          <StaggerItem key={i} index={i}>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
              <div className="flex justify-between items-start gap-3 flex-wrap">
                <div className="min-w-0">
                  <h4 className="text-lg sm:text-xl text-white font-medium tracking-[-0.01em]">{edu.level}</h4>
                  <p className="text-neutral-300 text-[15px] mt-1">
                    {edu.school} · {edu.location}
                  </p>
                </div>
                <span className="text-neutral-300 text-[11px] font-mono uppercase tracking-[0.22em] whitespace-nowrap">
                  {edu.time}
                </span>
              </div>
            </div>
          </StaggerItem>
        ))}
      </section>

      <section>
        <SectionHeading count={achievements.length}>Achievements</SectionHeading>
        <ul className="divide-y divide-white/[0.06] border-t border-b border-white/[0.06]">
          {achievements.map((a, i) => (
            <StaggerItem key={i} index={i}>
              <li className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-4">
                <span className="text-neutral-400 text-[11px] font-mono w-12 shrink-0 tracking-[0.22em]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[15px] font-medium tracking-[-0.01em]">{a.title}</p>
                  <p className="text-neutral-300 text-sm mt-1">{a.issuer}</p>
                </div>
                <span className="text-neutral-400 text-[11px] font-mono uppercase tracking-[0.22em] whitespace-nowrap">
                  {a.date}
                </span>
              </li>
            </StaggerItem>
          ))}
        </ul>
      </section>

      <section>
        <SectionHeading count={certifications.length}>Certifications</SectionHeading>
        <ul className="divide-y divide-white/[0.06] border-t border-b border-white/[0.06]">
          {certifications.map((c, i) => (
            <StaggerItem key={i} index={i}>
              <li className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-4">
                <span className="text-neutral-400 text-[11px] font-mono w-12 shrink-0 tracking-[0.22em]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[15px] font-medium tracking-[-0.01em]">{c.title}</p>
                  <p className="text-neutral-300 text-sm mt-1">{c.issuer}</p>
                </div>
                <span className="text-neutral-400 text-[11px] font-mono uppercase tracking-[0.22em] whitespace-nowrap">
                  {c.date}
                </span>
              </li>
            </StaggerItem>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ExperienceContent;
