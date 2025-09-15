// Utility to convert a PDF File into an array of base64-encoded PNG images.
export async function pdfFileToImages(file) {
  const pdfjsLib = await import('pdfjs-dist/build/pdf');
  const pdfWorker = await import('pdfjs-dist/build/pdf.worker.mjs');

  // Set worker (pdf.js v4)
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const images = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;
    const dataUrl = canvas.toDataURL('image/png');
    images.push(dataUrl);
  }

  return images;
}