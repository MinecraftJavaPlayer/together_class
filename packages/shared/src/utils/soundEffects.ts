/**
 * Global Sound Effects Helper (Direct HTML5 Audio Engine with automatic fallback)
 * - Button Click: /sounds/click.m4a (마크 효과음 개선판.m4a) -> /sounds/click.wav fallback
 * - Quiz Correct: /sounds/correctAnswer.wav (correctAnswer.nbs synthesized)
 * - Quiz Wrong: /sounds/wrong.mp3 (미션실패.mp3)
 */

function playAudioFile(url: string, volume: number = 1.0): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }
      const audio = new Audio(url);
      audio.volume = volume;
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
  ['/sounds/click.m4a', '/sounds/click.wav', '/sounds/correctAnswer.wav', '/sounds/wrong.mp3'].forEach((url) => {
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
  playAudioFile('/sounds/wrong.mp3', 1.0).catch(() => {});
}
