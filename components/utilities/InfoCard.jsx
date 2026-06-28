import React, { useState, useEffect } from 'react';
import ScrambleText from './ScrambleText';

const InfoCard = ({ isVisible }) => {
  const [scrambleActive, setScrambleActive] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setScrambleActive(true);
      const timer = setTimeout(() => setScrambleActive(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const info = {
    name: 'Akshat Sharma',
    email: 'ItsAkshatSh@gmail.com',
    location: 'Dubai, United Arab Emirates',
  };

  return (
    <div
      className={`absolute left-full top-1/2 -translate-y-1/2 ml-6 z-[150] pointer-events-none transition-all duration-400 ease-premium hidden lg:block ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3'
      }`}
    >
      <div className="bg-[#111]/90 border border-white/[0.08] rounded-xl p-5 backdrop-blur-xl w-max min-w-[240px] shadow-card">
        <div className="space-y-3.5">
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] mb-1">Name</p>
            <p className="text-sm text-white font-medium">
              <ScrambleText text={info.name} active={scrambleActive} speed={50} />
            </p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] mb-1">Email</p>
            <p className="text-xs text-neutral-300 font-mono break-all">
              <ScrambleText text={info.email} active={scrambleActive} speed={50} />
            </p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] mb-1">Location</p>
            <p className="text-sm text-neutral-200">
              <ScrambleText text={info.location} active={scrambleActive} speed={50} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
