import React, { useState, useEffect } from 'react';
import ScrambleText from './ScrambleText';

const InfoCard = ({ isVisible }) => {
  const [scrambleActive, setScrambleActive] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setScrambleActive(true);
      const timer = setTimeout(() => {
        setScrambleActive(false);
      }, 1000);
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
      className={`absolute left-full top-1/2 -translate-y-1/2 ml-8 z-[150] pointer-events-none transform-gpu transition-all duration-400 ease-premium ${isVisible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-[0.98]'}`}
    >
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 shadow-card backdrop-blur-xl w-max min-w-[260px]">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] mb-1.5">Name</p>
            <p className="text-sm text-neutral-100 font-light tracking-tight">
              <ScrambleText text={info.name} active={scrambleActive} speed={50} />
            </p>
          </div>
          
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] mb-1.5">Email</p>
            <p className="text-xs text-cyan-400/90 font-mono break-all">
              <ScrambleText text={info.email} active={scrambleActive} speed={50} />
            </p>
          </div>
          
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] mb-1.5">Location</p>
            <p className="text-sm text-neutral-100 font-light tracking-tight">
              <ScrambleText text={info.location} active={scrambleActive} speed={50} />
            </p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <p className="text-[10px] text-neutral-600 text-center tracking-widest">dev // creative</p>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
