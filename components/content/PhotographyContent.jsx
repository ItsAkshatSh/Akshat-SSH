import React from 'react';
import StaggerItem from '../utilities/StaggerItem';
import { PHOTOS } from './photographyPhotos';

const PhotographyContent = ({ onSelectImg }) => (
  <>
    <div className="mb-8 pb-6 border-b border-white/[0.06]">
      <p className="text-sm text-neutral-400 leading-relaxed max-w-lg">
        A collection of moments — street, travel, and everyday scenes.
      </p>
      <p className="text-[11px] text-neutral-600 font-mono mt-2">{PHOTOS.length} photos</p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[140px] md:auto-rows-[180px] pb-8">
      {PHOTOS.map(({ file, span }, i) => (
        <StaggerItem
          key={file}
          index={i}
          className={`h-full ${span || ''} ${span ? 'min-h-[280px] md:min-h-[380px]' : ''}`}
        >
          <button
            type="button"
            className="interactive group relative w-full h-full overflow-hidden rounded-xl border border-white/[0.06] bg-neutral-900/40 hover:border-white/15 transition-all duration-300"
            onClick={() => onSelectImg?.(file)}
            aria-label={`View photo ${i + 1} of ${PHOTOS.length}`}
          >
            <img
              src={`/images/photography/${file}`}
              alt={`Photography ${i + 1}`}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-premium group-hover:scale-[1.03]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-[11px] font-mono text-white/80">
                {String(i + 1).padStart(2, '0')} / {String(PHOTOS.length).padStart(2, '0')}
              </span>
            </div>
          </button>
        </StaggerItem>
      ))}
    </div>
  </>
);

export default PhotographyContent;
