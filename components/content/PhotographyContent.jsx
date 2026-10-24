/**
 * PhotographyContent
 * Photoyoshi-style infinite horizontal scroll of photographs. Wheel /
 * trackpad / drag drive the strip; click a frame to open the lightbox.
 */
import { useState } from 'react';
import { PHOTOS } from './photographyPhotos';
import PhotoScrollGallery from './PhotoScrollGallery';
import PhotographyLightbox from './PhotographyLightbox';

const PhotographyContent = () => {
  const [selectedImg, setSelectedImg] = useState(null);

  return (
    <div className="relative h-full w-full">
      <PhotoScrollGallery photos={PHOTOS} onSelect={setSelectedImg} />
      <PhotographyLightbox
        selectedImg={selectedImg}
        onClose={() => setSelectedImg(null)}
        onSelect={setSelectedImg}
      />
    </div>
  );
};

export default PhotographyContent;
