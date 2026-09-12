/**
 * Global Sound Effects Helper (High Performance Web Audio API & HTML5 Fallback)
 * - Button Click: /sounds/click.m4a (마크 효과음 개선판.m4a) with /sounds/click.wav fallback
 * - Quiz Correct: /sounds/correctAnswer.wav (correctAnswer.nbs synthesized)
 * - Quiz Wrong: /sounds/wrong.mp3 (미션실패.mp3)
 */

let audioCtx: AudioContext | null = null;
const audioBuffers: Record<string, AudioBuffer> = {};
const preloadedElements: Record<string, HTMLAudioElement> = {};
let isUnlocked = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

// Unlock Web Audio API & Audio Elements on first user gesture
export function unlockAudio(): void {
  if (typeof window === 'undefined') return;

  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const urls = [
    '/sounds/click.m4a',
    '/sounds/click.wav',
    '/sounds/correctAnswer.wav',
    '/sounds/wrong.mp3',
  ];

  urls.forEach((url) => {
    try {
      if (!preloadedElements[url]) {
        const audio = new Audio(url);
        audio.volume = 1.0;
        audio.preload = 'auto';
        audio.load();
        preloadedElements[url] = audio;
      }
    } catch (e) {}
  });

  if (ctx) {
    urls.forEach((url) => {
      if (!audioBuffers[url]) {
        fetch(url)
          .then((res) => res.arrayBuffer())
          .then((buf) => ctx.decodeAudioData(buf))
          .then((decoded) => {
            audioBuffers[url] = decoded;
          })
          .catch(() => {});
      }
    });
  }

  isUnlocked = true;
}

// Attach gesture listener to window if client side
if (typeof window !== 'undefined') {
  const events = ['click', 'pointerdown', 'touchstart', 'keydown'];
  const handleGesture = () => {
    unlockAudio();
  };
  events.forEach((evt) => window.addEventListener(evt, handleGesture, { capture: true, passive: true }));
}

function playSound(urls: string[], volume = 1.0) {
  if (typeof window === 'undefined') return;

  // Ensure unlocked
  unlockAudio();

  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  // Strategy 1: Web Audio API (Zero latency, reliable)
  for (const url of urls) {
    if (ctx && audioBuffers[url]) {
      try {
        const source = ctx.createBufferSource();
        source.buffer = audioBuffers[url];
        const gainNode = ctx.createGain();
        gainNode.gain.value = volume;
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
        return;
      } catch (e) {}
    }
  }

  // Strategy 2: HTML5 Audio Fallback
  for (const url of urls) {
    try {
      let audio = preloadedElements[url];
      if (!audio) {
        audio = new Audio(url);
        audio.volume = volume;
        audio.preload = 'auto';
        preloadedElements[url] = audio;
      }

      // Clone or reset to play overlapping clicks instantly
      const clone = audio.cloneNode(true) as HTMLAudioElement;
      clone.volume = volume;
      clone.currentTime = 0;
      const playPromise = clone.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback to original element
          audio.currentTime = 0;
          audio.play().catch(() => {});
        });
      }
      return;
    } catch (e) {}
  }
}

export function playClickSound(): void {
  playSound(['/sounds/click.m4a', '/sounds/click.wav'], 1.0);
}

export function playCorrectSound(): void {
  playSound(['/sounds/correctAnswer.wav'], 1.0);
}

export function playWrongSound(): void {
  playSound(['/sounds/wrong.mp3'], 1.0);
}
