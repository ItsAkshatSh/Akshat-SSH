import React, { useState } from 'react';
import StaggerItem from '../utilities/StaggerItem';

const ExperienceContent = () => {
  const [expanded, setExpanded] = useState({});

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

  const projects = [
    {
      title: "Custom Macropad (9-key + Rotary Encoder)",
      date: "Jun 2025",
      link: "https://github.com/ItsAkshatSh/Macropad",
      desc: "Designed and built a custom 9-switch macro pad with rotary encoder and 3D printed case. Created PCB schematic and layout, wired components, and developed firmware using KMK."
    },
    {
      title: "Sylvoria – Adventure Game",
      date: "Jan 2025 - Apr 2025",
      link: "https://github.com/ItsAkshatSh/Sylvoria",
      desc: "Developed Sylvoria as part of the Juice HackClub event, committing ~100 hours of development time. Earned travel to China (all expenses paid) by meeting the event's development milestone. Built core game mechanics, user interface, networking, and game systems."
    },
    {
      title: "J.A.R.V.I.S – Desktop Voice Assistant",
      date: "Oct 2024 - Nov 2024",
      link: "https://github.com/ItsAkshatSh/J.A.R.V.I.S",
      desc: "Built a Python-based desktop voice assistant inspired by Siri. Integrated speech recognition, text-to-speech, and natural language processing to perform tasks like opening apps, fetching information, and playing music."
    },
    {
      title: "Emotion Recognition",
      date: "Jun 2024",
      link: "https://github.com/ItsAkshatSh/Emotion-recognition",
      desc: "Built a facial emotion recognition system using deep learning (computer vision). Used face detection with OpenCV to isolate faces and applied CNN models to classify emotions with real-time prediction capabilities."
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

  return (
    <div className="relative space-y-12">
      <section>
        <h3 className="text-xl font-light uppercase tracking-[0.2em] text-neutral-100 mb-6 pb-3 border-b border-white/[0.08]">Education</h3>
        {education.map((edu, i) => (
          <StaggerItem key={i} index={i} className="mb-6">
            <div className="interactive group">
              <h4 className="text-xl text-neutral-200 font-light group-hover:text-white transition-colors">{edu.level}</h4>
              <p className="text-neutral-500 text-sm">{edu.school} • {edu.board}</p>
              <p className="text-neutral-600 text-xs">Expected: {edu.year}</p>
            </div>
          </StaggerItem>
        ))}
      </section>

      <section>
        <h3 className="text-xl font-light uppercase tracking-[0.2em] text-neutral-100 mb-6 pb-3 border-b border-white/[0.08]">Work Experience</h3>
        {jobs.map((job, i) => (
          <StaggerItem key={i} index={i} className="mb-8">
            <div className="interactive group">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-xl text-neutral-200 font-light group-hover:text-white transition-colors">{job.role}</h4>
                  <p className="text-neutral-500 text-sm">{job.company} • {job.type}</p>
                </div>
                <span className="text-neutral-600 text-xs whitespace-nowrap ml-4">{job.time}</span>
              </div>
              <ul className="text-neutral-400 text-sm space-y-2.5 mt-3 ml-4">
                {job.bullets.map((bullet, bi) => (
                  <li key={bi} className="flex gap-3">
                    <span className="text-cyan-400/80 flex-shrink-0 mt-0.5">→</span>
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>
        ))}
      </section>

      <section>
        <h3 className="text-xl font-light uppercase tracking-[0.2em] text-neutral-100 mb-6 pb-3 border-b border-white/[0.08]">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <span key={i} className="text-[11px] border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 rounded text-neutral-400 font-mono hover:border-white/[0.15] hover:text-neutral-300 transition-colors duration-300">
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-light uppercase tracking-[0.2em] text-neutral-100 mb-6 pb-3 border-b border-white/[0.08]">Accomplishments</h3>
        <ul className="space-y-4">
          {accomplishments.map((acc, i) => (
            <StaggerItem key={i} index={i}>
              <li className="flex gap-3 text-neutral-400 text-sm leading-relaxed group interactive">
                <span className="text-cyan-400/70 flex-shrink-0 mt-1">✦</span>
                <span className="group-hover:text-neutral-300 transition-colors">{acc}</span>
              </li>
            </StaggerItem>
          ))}
        </ul>
      </section>

      <section className="border-t border-white/[0.06] pt-8">
        <h3 className="text-xl font-light uppercase tracking-[0.2em] text-neutral-100 mb-6">Links</h3>
        <div className="space-y-3">
          {socials.map((social, i) => (
            <a 
              key={i}
              href={social.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-cyan-400/90 hover:text-cyan-300 text-sm transition-colors duration-300 group"
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
