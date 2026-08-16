export type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle' | 'custom';

export interface ToneDefinition {
  freq: number;
  offset: number;
  duration: number;
  type?: OscillatorType;
}

const RARITY_MELODIES: Record<string, ToneDefinition[]> = {
  legendary: [
    { freq: 349.23, offset: 0, duration: 0.15, type: 'square' }, // F4
    { freq: 349.23, offset: 0.15, duration: 0.15, type: 'square' }, // F4
    { freq: 349.23, offset: 0.3, duration: 0.15, type: 'square' }, // F4
    { freq: 349.23, offset: 0.45, duration: 0.6, type: 'square' }, // F4 long
    { freq: 277.18, offset: 1.05, duration: 0.6, type: 'square' }, // Db4
    { freq: 311.13, offset: 1.65, duration: 0.6, type: 'square' }, // Eb4
    { freq: 349.23, offset: 2.25, duration: 2.0, type: 'square' }, // F4 final
    // Harmony
    { freq: 440.00, offset: 2.25, duration: 2.0, type: 'sine' }, // A4
    { freq: 523.25, offset: 2.25, duration: 2.0, type: 'sine' }, // C5
    { freq: 698.46, offset: 2.25, duration: 2.0, type: 'triangle' }, // F5
  ],
  epic: [
    { freq: 349.23, offset: 0, duration: 0.3, type: 'sine' }, // F4
    { freq: 440.00, offset: 0.1, duration: 0.3, type: 'sine' }, // A4
    { freq: 523.25, offset: 0.2, duration: 0.4, type: 'sine' }, // C5
    { freq: 698.46, offset: 0.3, duration: 0.8, type: 'sine' }, // F5
  ],
  rare: [
    { freq: 349.23, offset: 0, duration: 0.2, type: 'triangle' }, // F4
    { freq: 523.25, offset: 0.15, duration: 0.4, type: 'triangle' }, // C5
    { freq: 698.46, offset: 0.3, duration: 0.6, type: 'triangle' }, // F5
  ],
  common: [
    { freq: 349.23, offset: 0, duration: 0.2, type: 'sine' }, // F4
    { freq: 523.25, offset: 0.15, duration: 0.4, type: 'sine' }, // C5
  ],
};

export const playAchievementSound = (rarity: string = 'common') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const melody = RARITY_MELODIES[rarity] || RARITY_MELODIES.common;
    const now = ctx.currentTime;

    melody.forEach(({ freq, offset, duration, type = 'sine' }) => {
      const startTime = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (e) {
    console.error('Audio play failed:', e);
  }
};
