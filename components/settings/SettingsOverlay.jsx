/**
 * SettingsOverlay
 * Restraint-lens panel for the two user preferences that exist: background
 * mode (Orbit / Ocean) and scene motion (full / reduced). Instant toggles,
 * no expressive motion — this surface must never get between the user and
 * their task. Closes on Esc; focus is trapped while open.
 */
import { motion } from 'framer-motion';
import SectionOverlay, { OverlayButton } from '../ui/SectionOverlay';
import ScrambleText from '../utilities/ScrambleText';
import {
  useSettings,
  setBgMode,
  setMotionLevel,
  resetSettings,
  BG_MODES,
  MOTION_LEVELS,
} from '../../lib/settingsStore';

const ROW_LABEL =
  'flex items-center justify-between gap-4 py-5 border-b border-hair';
const OPTION_CLASS = (active) =>
  `interactive press h-11 min-w-[92px] px-4 rounded-full border text-[11px] tracking-[0.22em] uppercase transition-colors ${
    active
      ? 'border-[color:var(--accent)] text-accent bg-[color:var(--accent-soft)]'
      : 'border-hair text-muted-warm hover:text-bone'
  }`;

export default function SettingsOverlay({ onClose }) {
  // Focus trapping is SectionOverlay's job — it owns the dialog semantics.
  const settings = useSettings();

  return (
    <SectionOverlay
        ariaLabel="Settings"
        onClose={onClose}
        zIndex={60}
        contentKey="settings"
        title={<ScrambleText text="Settings" active duration={800} />}
      >
        <div className="max-w-xl mx-auto pb-10">
          {/* Background world */}
          <div className={ROW_LABEL} role="group" aria-label="Background world">
            <div>
              <p className="text-bone text-sm">Background world</p>
              <p className="text-muted-warm text-xs mt-1">
                Living scene behind the page
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              {[BG_MODES.void, BG_MODES.ocean].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={OPTION_CLASS(settings.bgMode === mode)}
                  aria-pressed={settings.bgMode === mode}
                  onClick={() => setBgMode(mode)}
                >
                  {mode === BG_MODES.void ? 'Orbit' : 'Ocean'}
                </button>
              ))}
            </div>
          </div>

          {/* Scene motion */}
          <div className={ROW_LABEL} role="group" aria-label="Scene motion">
            <div>
              <p className="text-bone text-sm">Scene motion</p>
              <p className="text-muted-warm text-xs mt-1">
                Reduced slows the world to a calm drift. Your system&apos;s
                reduced-motion setting always wins over this.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              {[MOTION_LEVELS.full, MOTION_LEVELS.reduced].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={OPTION_CLASS(settings.motionLevel === level)}
                  aria-pressed={settings.motionLevel === level}
                  onClick={() => setMotionLevel(level)}
                >
                  {level === MOTION_LEVELS.full ? 'Full' : 'Reduced'}
                </button>
              ))}
            </div>
          </div>

          {/* Reset */}
          <div className="flex items-center justify-between gap-4 pt-6">
            <p className="text-muted-warm text-xs">
              Everything resets to defaults.
            </p>
            <OverlayButton onClick={resetSettings}>Reset</OverlayButton>
          </div>
        </div>
      </SectionOverlay>
  );
}
