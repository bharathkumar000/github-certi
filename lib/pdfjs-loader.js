/**
 * Helper to dynamically load and initialize Mozilla PDF.js in the browser
 */
export async function getPdfJs() {
  if (typeof window === 'undefined') return null;

  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.js';
    return window.pdfjsLib;
  }

  return new Promise((resolve, reject) => {
    let script = document.querySelector('script[src="/vendor/pdfjs/pdf.min.js"]');
    if (!script) {
      script = document.createElement('script');
      script.src = '/vendor/pdfjs/pdf.min.js';
      script.async = true;
      document.head.appendChild(script);
    }

    const handleLoad = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      } else {
        reject(new Error('PDF.js library failed to initialize'));
      }
    };

    if (window.pdfjsLib) {
      handleLoad();
    } else {
      script.addEventListener('load', handleLoad, { once: true });
      script.addEventListener('error', (err) => reject(err), { once: true });
    }
  });
}

/**
 * Renders page 1 of a PDF URL onto an HTML5 canvas at high retina scale
 */
export async function renderPdfToCanvas(pdfUrl, canvas) {
  if (!canvas || !pdfUrl) return { width: 1086, height: 814.5, aspectRatio: '1086 / 814.5' };

  const pdfjs = await getPdfJs();
  if (!pdfjs) return { width: 1086, height: 814.5, aspectRatio: '1086 / 814.5' };

  const loadingTask = pdfjs.getDocument(pdfUrl);
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);

  // High scale for crisp rendering
  const viewport = page.getViewport({ scale: 2.0 });
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;

  return {
    width: viewport.width,
    height: viewport.height,
    aspectRatio: `${viewport.width} / ${viewport.height}`
  };
}
