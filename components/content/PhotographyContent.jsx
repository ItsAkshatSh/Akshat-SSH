import React, { useState } from 'react';
import { X, Maximize2 } from 'lucide-react';
import StaggerItem from '../utilities/StaggerItem';

const PhotographyContent = () => {
  const [selectedImg, setSelectedImg] = useState(null);

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
              className="interactive relative group overflow-hidden cursor-none"
              onClick={() => setSelectedImg(file)}
            >
              <div className="w-full aspect-[3/4] bg-neutral-900 border border-neutral-800 group-hover:border-white/50 transition-colors duration-500 flex items-center justify-center relative overflow-hidden">
                 <img
                   src={`/images/photography/${file}`}
                   alt={file}
                   className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105 brightness-110"
                 />

                 <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none p-4 flex flex-col justify-between">
                    <div className="flex justify-between text-[10px] text-white font-mono">
                       <span>[ RAW ]</span>
                       <span className="text-xs">{file}</span>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/30 flex items-center justify-center">
                       <div className="w-1 h-1 bg-white/50"></div>
                    </div>
                    <div className="flex justify-between items-end text-[10px] text-white font-mono">
                       <span className="text-xs">Click to expand</span>
                       <Maximize2 size={14} />
                    </div>
                 </div>
              </div>
            </div>
          </StaggerItem>
        ))}
      </div>

      {selectedImg && (
        <div 
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-6"
          onClick={() => setSelectedImg(null)}
        >
          <div className="max-w-[90vw] max-h-[90vh]">
            <img src={`/images/photography/${selectedImg}`} alt={selectedImg} className="w-full h-full object-contain rounded shadow-xl" />
            <div className="mt-3 text-center text-neutral-300 text-sm">{selectedImg}</div>
          </div>
          <button className="absolute top-6 right-6 text-neutral-400 hover:text-white cursor-none" aria-label="Close" onClick={() => setSelectedImg(null)}>
            <X size={22} />
          </button>
        </div>
      )}
    </>
  );
};

export default PhotographyContent;
