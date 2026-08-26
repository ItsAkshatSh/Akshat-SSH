/**
 * PhotographyContent
 * 3D dome of photographs (React Bits' DomeGallery). Drag to rotate the
 * dome, tap any tile to enlarge it with a shared-element transition.
 * Segment count and dampening are lowered on weaker devices so the whole
 * ring stays interactive.
 */
import { useMemo } from 'react';
import DomeGallery from '../ui/DomeGallery';
import { PHOTOS } from './photographyPhotos';
import usePerformanceTier from '../utilities/usePerformanceTier';

const PhotographyContent = () => {
  const tier = usePerformanceTier();

  const images = useMemo(
    () =>
      PHOTOS.map((p) => ({
        src: `/images/photography/${p.file}`,
        alt: `${p.date} · ${p.place}`,
      })),
    []
  );

  // Segment count is the single biggest cost knob: 35² tiles at 'high',
  // dropped to 20² at 'low' — five times fewer DOM nodes and paints.
  const segments = tier === 'low' ? 20 : tier === 'medium' ? 28 : 35;

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
        segments={segments}
      />
    </div>
  );
};

export default PhotographyContent;
