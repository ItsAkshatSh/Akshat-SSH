/**
 * PhotographyContent
 * 3D dome of photographs (React Bits' DomeGallery). Drag to rotate the
 * dome, tap any tile to enlarge it with a shared-element transition.
 */
import { useMemo } from 'react';
import DomeGallery from '../ui/DomeGallery';
import { PHOTOS } from './photographyPhotos';

const PhotographyContent = () => {
  const images = useMemo(
    () =>
      PHOTOS.map((p) => ({
        src: `/images/photography/${p.file}`,
        alt: `${p.date} · ${p.place}`,
      })),
    []
  );

  return (
    <div className="relative h-full w-full">
      <DomeGallery
        images={images}
        fit={0.9}
        minRadius={680}
        dragDampening={1.2}
        grayscale={false}
        overlayBlurColor="#060a10"
        imageBorderRadius="14px"
        openedImageBorderRadius="14px"
        openedImageWidth="min(560px, 82vw)"
        openedImageHeight="min(680px, 80vh)"
        segments={35}
      />
    </div>
  );
};

export default PhotographyContent;
