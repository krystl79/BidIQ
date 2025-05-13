import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source to use the ESM worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export async function convertPdfToText(file) {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    let arrayBuffer;
    if (file instanceof File) {
      arrayBuffer = await file.arrayBuffer();
    } else if (file instanceof ArrayBuffer) {
      arrayBuffer = file;
    } else if (file.data instanceof ArrayBuffer) {
      arrayBuffer = file.data;
    } else if (file.data instanceof Uint8Array) {
      arrayBuffer = file.data.buffer;
    } else {
      console.error('File data type:', typeof file.data);
      throw new Error('Invalid file format: data must be ArrayBuffer or Uint8Array');
    }

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error('Invalid or empty file');
    }

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    if (!fullText.trim()) {
      throw new Error('No text content extracted from PDF');
    }

    return fullText;
  } catch (error) {
    console.error('Error converting PDF to text:', error);
    if (error.name === 'InvalidPDFException') {
      throw new Error('Invalid PDF file format');
    } else if (error.name === 'MissingPDFException') {
      throw new Error('PDF file is missing or corrupted');
    } else if (error.name === 'UnexpectedResponseException') {
      throw new Error('Failed to load PDF file');
    }
    throw new Error(`Failed to convert PDF to text: ${error.message}`);
  }
} 