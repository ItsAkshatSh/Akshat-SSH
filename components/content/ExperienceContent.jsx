import React from 'react';
import StaggerItem from '../utilities/StaggerItem';

const ExperienceContent = () => {
  const education = [
    { level: "Senior Secondary (XII), Science", school: "Indian International School, Dubai", board: "CBSE", year: "2027" }
  ];

  const jobs = [
    {
      role: "Event Organizer – Hackathon/Game Jam",
      company: "Hackclub, Dubai",
      time: "Oct 2024 - Nov 2024 (2 months)",
      type: "Internship",
      bullets: [
        "Hosted a Game Jam/Hackathon in downtown Dubai with 30+ participants.",
        "Coordinated event logistics, participant engagement, and technical support.",
        "Collaborated with HackClub to deliver an impactful community-driven coding event.",
        "Gained hands-on experience in event management, leadership, and community building."
      ]
    }
  ];

  const skills = ["Python", "JavaScript", "React", "Node.js", "Flask", "HTML5", "CSS3", "OpenCV", "TensorFlow", "Game Development", "PCB Design", "Git", "GitHub", "Problem Solving", "Leadership"];

  const accomplishments = [
    "Won an international hackathon by developing an innovative project under time-bound constraints, competing with students from multiple countries",
    "Secured 1st place in a national-level coding competition with my team, outperforming participants from across the country",
    "Won a state-level coding competition, demonstrating advanced problem-solving and programming skills",
    "Attended workshops at the American University of Sharjah, gaining advanced exposure to computer science concepts and practical applications",
    "Completed Harvard's CS50 course, acquiring strong foundational skills in computer science and programming",
    "Represented Sky Sports as an IPC delegate at the F1CC Committee, earning an Honorable Mention for outstanding participation and contributions"
  ];

  const socials = [
    { label: "GitHub", url: "https://github.com/ItsAkshatSh" },
    { label: "Instagram", url: "https://www.instagram.com/akshat.ssh/" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/akshat404/" }
  ];

  const SectionHeading = ({ children }) => (
    <h3 className="text-sm font-mono uppercase tracking-[0.25em] text-neutral-400 mb-5">{children}</h3>
  );

  return (
    <div className="relative space-y-12 pb-8">
      <section>
        <SectionHeading>Education</SectionHeading>
        {education.map((edu, i) => (
          <StaggerItem key={i} index={i} className="mb-6">
            <div className="interactive group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h4 className="text-lg text-white font-medium">{edu.level}</h4>
              <p className="text-neutral-400 text-sm mt-1">{edu.school} · {edu.board}</p>
              <p className="text-neutral-500 text-xs mt-1 font-mono">Expected {edu.year}</p>
            </div>
          </StaggerItem>
        ))}
      </section>

      <section>
        <SectionHeading>Work Experience</SectionHeading>
        {jobs.map((job, i) => (
          <StaggerItem key={i} index={i} className="mb-8">
            <div className="interactive group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6">
              <div className="flex justify-between items-start mb-2 gap-3 flex-wrap">
                <div>
                  <h4 className="text-lg text-white font-medium">{job.role}</h4>
                  <p className="text-neutral-400 text-sm mt-0.5">{job.company} · {job.type}</p>
                </div>
                <span className="text-neutral-500 text-xs font-mono whitespace-nowrap">{job.time}</span>
              </div>
              <ul className="text-neutral-400 text-sm space-y-2.5 mt-4">
                {job.bullets.map((bullet, bi) => (
                  <li key={bi} className="flex gap-3">
                    <span className="text-neutral-500 flex-shrink-0 mt-0.5">·</span>
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>
        ))}
      </section>

      <section>
        <SectionHeading>Skills</SectionHeading>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <span key={i} className="text-xs border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 rounded-md text-neutral-400 font-mono">
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading>Accomplishments</SectionHeading>
        <ul className="space-y-3">
          {accomplishments.map((acc, i) => (
            <StaggerItem key={i} index={i}>
              <li className="flex gap-3 text-neutral-400 text-sm leading-relaxed">
                <span className="text-neutral-500 flex-shrink-0 mt-1">✦</span>
                <span>{acc}</span>
              </li>
            </StaggerItem>
          ))}
        </ul>
      </section>

      <section className="border-t border-white/[0.06] pt-8">
        <SectionHeading>Links</SectionHeading>
        <div className="flex flex-wrap gap-4">
          {socials.map((social, i) => (
            <a
              key={i}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-neutral-300 hover:text-white text-sm transition-colors duration-300 group"
            >
              {social.label} <span className="group-hover:translate-x-0.5 transition-transform">↗</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ExperienceContent;
