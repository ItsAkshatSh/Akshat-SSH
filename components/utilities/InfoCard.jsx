import React, { useState, useEffect } from 'react';
import ScrambleText from './ScrambleText';

const InfoCard = ({ isVisible, mousePos }) => {
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

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-[150] pointer-events-none"
      style={{
        left: `${mousePos.x + 30}px`,
        top: `${mousePos.y - 50}px`,
        animation: 'slideUpFade 0.3s ease-out forwards',
      }}
    >
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 shadow-2xl backdrop-blur-sm w-max min-w-[240px]">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Name</p>
            <p className="text-sm text-neutral-100 font-light">
              <ScrambleText text={info.name} active={scrambleActive} speed={50} />
            </p>
          </div>
          
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Email</p>
            <p className="text-xs text-cyan-400 font-mono break-all">
              <ScrambleText text={info.email} active={scrambleActive} speed={50} />
            </p>
          </div>
          
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Location</p>
            <p className="text-sm text-neutral-100 font-light">
              <ScrambleText text={info.location} active={scrambleActive} speed={50} />
            </p>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-neutral-800">
          <p className="text-xs text-neutral-600 text-center">dev // creative</p>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
