declare global {
  interface Window {
    Tesseract?: any;
  }
}

/**
 * Real-time Optical Character Recognition (OCR) engine for extracting text
 * directly from uploaded image files (JPG, PNG, etc.) in the browser.
 */
export async function extractTextFromImageFile(file: File): Promise<string> {
  if (typeof window === 'undefined') return '';

  try {
    // 1. Load Tesseract.js OCR engine dynamically if not present
    if (!window.Tesseract) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('OCR engine script failed to load'));
        document.head.appendChild(script);
      });
    }

    // 2. Perform real Optical Character Recognition (OCR) on the uploaded file
    if (window.Tesseract) {
      const worker = await window.Tesseract.createWorker('kor+eng');
      const result = await worker.recognize(file);
      await worker.terminate();

      if (result && result.data && result.data.text) {
        const cleaned = result.data.text
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0)
          .join('\n');

        if (cleaned.length > 0) {
          return cleaned;
        }
      }
    }
  } catch (e) {
    console.warn('Real-time image OCR processing warning:', e);
  }

  return '';
}
