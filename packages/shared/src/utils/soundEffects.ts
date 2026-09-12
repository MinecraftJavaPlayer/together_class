/**
 * Global Sound Effects Helper
 * - Button Click: /sounds/click.m4a (마크 효과음 개선판.m4a - High Volume)
 * - Quiz Correct: /sounds/correctAnswer.wav (correctAnswer.nbs Note Block Melody)
 * - Quiz Wrong: /sounds/wrong.mp3 (미션실패.mp3)
 */

export function playClickSound(): void {
  if (typeof window === 'undefined') return;
  try {
    const audio = new Audio('/sounds/click.m4a');
    audio.volume = 1.0; // Loud volume applied
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

export function playCorrectSound(): void {
  if (typeof window === 'undefined') return;
  try {
    const audio = new Audio('/sounds/correctAnswer.wav');
    audio.volume = 1.0;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

export function playWrongSound(): void {
  if (typeof window === 'undefined') return;
  try {
    const audio = new Audio('/sounds/wrong.mp3');
    audio.volume = 1.0;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}
