import React from 'react';
import { X, Maximize2 } from 'lucide-react';
import StaggerItem from '../utilities/StaggerItem';

const PhotographyContent = ({ selectedImg, onCloseImg, onSelectImg }) => {
  const photos = [
    'imag1.JPG',
    'IMG_4793.JPG',
    'IMG_5043.JPG',
    'IMG_5058.JPG',
    'IMG_5135.JPG',
    'IMG_5175.JPG',
    'IMG_5220.JPG',
    'IMG_5227.JPG',
    'IMG_5395.JPG'
  ];

  return (
    <>
      <div className="columns-1 md:columns-2 gap-4 space-y-4">
        {photos.map((file, i) => (
          <StaggerItem key={file} index={i} className="break-inside-avoid">
            <div 
              className="interactive relative group overflow-hidden cursor-none rounded-lg"
              onClick={() => onSelectImg?.(file)}
            >
              <div className="w-full aspect-[3/4] bg-neutral-900/80 border border-white/[0.06] group-hover:border-white/20 rounded-lg transition-all duration-500 flex items-center justify-center relative overflow-hidden shadow-card group-hover:shadow-card-hover">
                 <img
                   src={`/images/photography/${file}`}
                   alt={file}
                   className="w-full h-full object-cover transform transition-transform duration-700 ease-premium group-hover:scale-[1.03] brightness-[1.05]"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

                 <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none p-4 flex flex-col justify-between">
                    <div className="flex justify-between text-[10px] text-white/90 font-mono tracking-wider">
                       <span>[ RAW ]</span>
                       <span className="text-xs truncate max-w-[60%]">{file}</span>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm bg-white/5">
                       <Maximize2 size={18} className="text-white/80" />
                    </div>
                    <div className="flex justify-between items-end text-[10px] text-white/80 font-mono">
                       <span className="text-xs">View full size</span>
                       <Maximize2 size={12} />
                    </div>
                 </div>
              </div>
            </div>
          </StaggerItem>
        ))}
      </div>

      {selectedImg && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8 animate-fade-in"
          onClick={() => onCloseImg?.()}
        >
          <div className="max-w-[90vw] max-h-[85vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img src={`/images/photography/${selectedImg}`} alt={selectedImg} className="w-full h-full object-contain rounded-lg shadow-2xl ring-1 ring-white/5" />
            <p className="mt-4 text-center text-neutral-500 text-xs font-mono tracking-wider">{selectedImg}</p>
          </div>
          <button className="absolute top-6 right-6 p-2.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all duration-300 cursor-none" aria-label="Close" onClick={() => onCloseImg?.()}>
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </>
  );
};

export default PhotographyContent;
