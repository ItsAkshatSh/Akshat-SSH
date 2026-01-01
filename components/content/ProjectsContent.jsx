import React from 'react';
import StaggerItem from '../utilities/StaggerItem';

const ProjectsContent = () => {
  const projects = [
    {
      id: 1,
      title: "Custom Macropad (9-key + Rotary Encoder)",
      date: "Jun 2025",
      link: "https://github.com/ItsAkshatSh/Macropad",
      stack: ["Hardware", "PCB Design", "KMK Firmware"],
      desc: "Designed and built a custom 9-switch macro pad with rotary encoder and 3D printed case. Created PCB schematic and layout, wired components, and developed firmware using KMK."
    },
    {
      id: 2,
      title: "Sylvoria – Adventure Game",
      date: "Jan 2025 - Apr 2025",
      link: "https://github.com/ItsAkshatSh/Sylvoria",
      stack: ["Game Development", "Python", "Networking"],
      desc: "Developed Sylvoria as part of the Juice HackClub event, committing ~100 hours of development time. Earned travel to China (all expenses paid) by meeting the event's development milestone. Built core game mechanics, user interface, networking, and game systems."
    },
    {
      id: 3,
      title: "J.A.R.V.I.S – Desktop Voice Assistant",
      date: "Oct 2024 - Nov 2024",
      link: "https://github.com/ItsAkshatSh/J.A.R.V.I.S",
      stack: ["Python", "Speech Recognition", "NLP"],
      desc: "Built a Python-based desktop voice assistant inspired by Siri. Integrated speech recognition, text-to-speech, and natural language processing to perform tasks like opening apps, fetching information, and playing music."
    },
    {
      id: 4,
      title: "Emotion Recognition",
      date: "Jun 2024",
      link: "https://github.com/ItsAkshatSh/Emotion-recognition",
      stack: ["Python", "OpenCV", "TensorFlow", "Deep Learning"],
      desc: "Built a facial emotion recognition system using deep learning (computer vision). Used face detection with OpenCV to isolate faces and applied CNN models to classify emotions with real-time prediction capabilities."
    }
  ];

  return (
    <div className="space-y-6">
      {projects.map((project, i) => (
        <StaggerItem key={project.id} index={i}>
          <div className="interactive group border-l-2 border-neutral-700 hover:border-green-400 transition-colors px-6 py-6 bg-neutral-900/20 hover:bg-neutral-900/40 transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl text-neutral-200 font-light group-hover:text-white transition-colors">
                  {project.title}
                </h3>
                <p className="text-neutral-600 text-xs">{project.date}</p>
              </div>
              <a 
                href={project.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-400 text-xs hover:text-green-300 whitespace-nowrap ml-4 font-mono"
              >
                github ↗
              </a>
            </div>

            <p className="text-neutral-400 leading-relaxed mb-4 font-light text-sm">
              {project.desc}
            </p>

            <div className="flex flex-wrap gap-2">
              {project.stack.map(tech => (
                <span 
                  key={tech} 
                  className="text-[10px] border border-neutral-700 bg-neutral-900/60 px-2 py-1 text-neutral-300 font-mono uppercase hover:border-neutral-500 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </StaggerItem>
      ))}
    </div>
  );
};

export default ProjectsContent;
