/**
 * Universal Speech Synthesizer Helper (Web & Mobile TTS)
 */
export function playKoreanSpeech(text: string): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9; // Slightly slower for elementary learners
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  } else {
    console.log(`[Speech Helper] Simulated speech: "${text}"`);
  }
}
