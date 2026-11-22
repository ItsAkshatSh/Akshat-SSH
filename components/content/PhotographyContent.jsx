/**
 * PhotographyContent
 * Photoyoshi-style infinite horizontal scroll of photographs. Wheel /
 * trackpad / drag drive the strip; click a frame to morph it open into the
 * lightbox.
 */
import { useState } from 'react';
import { PHOTOS } from './photographyPhotos';
import PhotoScrollGallery from './PhotoScrollGallery';
import PhotographyLightbox from './PhotographyLightbox';

const PhotographyContent = () => {
  // `origin` is the clicked frame's on-screen rect (plain numbers, not a live
  // DOMRect) so the lightbox can fly the photo out of exactly where it sat.
  const [selection, setSelection] = useState(null);

  return (
    <div className="relative h-full w-full">
      <PhotoScrollGallery
        photos={PHOTOS}
        onSelect={(file, origin) => setSelection({ file, origin: origin ?? null })}
      />
      <PhotographyLightbox
        selectedImg={selection?.file ?? null}
        originRect={selection?.origin ?? null}
        onClose={() => setSelection(null)}
        onSelect={(file) => setSelection({ file, origin: null })}
      />
    </div>
  );
};

export default PhotographyContent;
