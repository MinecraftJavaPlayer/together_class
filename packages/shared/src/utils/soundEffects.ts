/**
 * Global Sound Effects Helper (Direct HTML5 Audio Engine with automatic fallback)
 * - Button Click: /sounds/click.m4a (마크 효과음 개선판.m4a) -> /sounds/click.wav fallback
 * - Quiz Correct: /sounds/correctAnswer.wav (correctAnswer.nbs synthesized)
 * - Quiz Wrong: /sounds/wrong.mp3 (미션실패.mp3)
 * - Rank Demote: /sounds/demote.mp3
 * - Rank Promote / Placement: /sounds/promote.mp3
 */

let masterVolume = 1.0;
let isAudioMuted = false;

// Initialize from localStorage if in browser
if (typeof window !== 'undefined') {
  try {
    const savedVol = localStorage.getItem('dahamkke_audio_volume');
    if (savedVol !== null) masterVolume = parseFloat(savedVol);
    const savedMute = localStorage.getItem('dahamkke_audio_muted');
    if (savedMute !== null) isAudioMuted = savedMute === 'true';
  } catch (e) {}
}

export function getAudioVolume(): number {
  return masterVolume;
}

export function setAudioVolume(vol: number): void {
  masterVolume = Math.max(0, Math.min(1, vol));
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('dahamkke_audio_volume', String(masterVolume));
      window.dispatchEvent(new CustomEvent('dahamkke_audio_settings_changed'));
    } catch (e) {}
  }
}

export function isAudioEnabled(): boolean {
  return !isAudioMuted;
}

export function setAudioEnabled(enabled: boolean): void {
  isAudioMuted = !enabled;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('dahamkke_audio_muted', String(isAudioMuted));
      window.dispatchEvent(new CustomEvent('dahamkke_audio_settings_changed'));
    } catch (e) {}
  }
}

function playAudioFile(url: string, volume: number = 1.0): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window === 'undefined' || isAudioMuted) {
        resolve();
        return;
      }
      const audio = new Audio(url);
      audio.volume = Math.max(0, Math.min(1, volume * masterVolume));
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => resolve()).catch((err) => reject(err));
      } else {
        resolve();
      }
    } catch (e) {
      reject(e);
    }
  });
}

export function unlockAudio(): void {
  if (typeof window === 'undefined') return;
  [
    '/sounds/click.m4a',
    '/sounds/click.wav',
    '/sounds/correctAnswer.wav',
    '/sounds/wrong.mp3',
    '/sounds/demote.mp3',
    '/sounds/promote.mp3',
  ].forEach((url) => {
    try {
      const a = new Audio(url);
      a.preload = 'auto';
      a.load();
    } catch (e) {}
  });
}

export function playClickSound(): void {
  if (typeof window === 'undefined') return;
  // Try click.m4a first (마크 효과음 개선판), fallback to click.wav
  playAudioFile('/sounds/click.m4a', 1.0).catch(() => {
    playAudioFile('/sounds/click.wav', 1.0).catch(() => {});
  });
}

export function playCorrectSound(): void {
  if (typeof window === 'undefined') return;
  playAudioFile('/sounds/correctAnswer.wav', 1.0).catch(() => {});
}

export function playWrongSound(): void {
  if (typeof window === 'undefined') return;
  // Make '미션실패' wrong sound noticeably quieter (0.38 volume) as requested
  playAudioFile('/sounds/wrong.mp3', 0.38).catch(() => {});
}

/**
 * 랭크 강등 효과음 (첫 번째 효과음 - demote.mp3)
 */
export function playDemoteSound(): void {
  if (typeof window === 'undefined') return;
  playAudioFile('/sounds/demote.mp3', 1.0).catch(() => {});
}

/**
 * 랭크 승급 및 배치 완료 효과음 (두 번째 효과음 - promote.mp3)
 */
export function playPromoteSound(): void {
  if (typeof window === 'undefined') return;
  playAudioFile('/sounds/promote.mp3', 1.0).catch(() => {});
}
