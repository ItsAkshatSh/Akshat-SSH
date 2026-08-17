/**
 * PhotographyContent
 * 3D dome of photographs (React Bits' DomeGallery). Drag to rotate the
 * dome, tap any tile to enlarge it with a shared-element transition.
 * Grayscale is off so the photos land in full colour; overlay tuned to
 * blend into the sub-page's transparent backdrop.
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
    <div className="-mx-6 sm:-mx-10 md:-mx-14 -mt-8 md:-mt-10 pb-4">
      <div className="relative h-[78vh] min-h-[520px]">
        <DomeGallery
          images={images}
          fit={0.85}
          minRadius={620}
          dragDampening={1.2}
          grayscale={false}
          overlayBlurColor="#060a10"
          imageBorderRadius="14px"
          openedImageBorderRadius="14px"
          openedImageWidth="min(520px, 78vw)"
          openedImageHeight="min(620px, 74vh)"
        />
      </div>
    </div>
  );
};

export default PhotographyContent;
