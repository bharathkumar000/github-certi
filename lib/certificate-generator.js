import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

/**
 * Converts a hex color string (e.g. #1a1f2c or #ffffff) to pdf-lib rgb()
 */
function hexToRgb(hex = '#000000') {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return rgb(r / 255, g / 255, b / 255);
}

/**
 * Resolves standard pdf-lib font based on layout font family string
 */
function getStandardFontName(fontFamilyName = 'Helvetica-Bold') {
  const normalized = fontFamilyName.toLowerCase();
  if (normalized.includes('times') || normalized.includes('term') || normalized.includes('gyre')) {
    return normalized.includes('bold') || normalized.includes('term') ? StandardFonts.TimesRomanBold : StandardFonts.TimesRoman;
  }
  if (normalized.includes('courier')) {
    return normalized.includes('bold') ? StandardFonts.CourierBold : StandardFonts.Courier;
  }
  return normalized.includes('bold') ? StandardFonts.HelveticaBold : StandardFonts.Helvetica;
}

/**
 * Reads template buffer from local file system or URL
 */
async function loadTemplateBuffer(templatePath) {
  if (!templatePath) {
    throw new Error('Template path not specified');
  }

  // If local public path like /templates/default-certificate.png or /uploads/...
  if (templatePath.startsWith('/')) {
    const localFilePath = path.join(process.cwd(), 'public', templatePath.replace(/^\//, ''));
    if (fs.existsSync(localFilePath)) {
      return {
        buffer: fs.readFileSync(localFilePath),
        isPdf: localFilePath.toLowerCase().endsWith('.pdf')
      };
    }
  }

  // If http/https URL
  if (templatePath.startsWith('http')) {
    const res = await fetch(templatePath);
    if (!res.ok) throw new Error(`Failed to fetch template from ${templatePath}`);
    const arrayBuffer = await res.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      isPdf: templatePath.toLowerCase().endsWith('.pdf')
    };
  }

  // Fallback to checking gitopia-certificate.pdf in public directory
  const fallback = path.join(process.cwd(), 'public', 'templates', 'gitopia-certificate.pdf');
  if (fs.existsSync(fallback)) {
    return {
      buffer: fs.readFileSync(fallback),
      isPdf: true
    };
  }

  const rootFallback = path.join(process.cwd(), 'public', 'gitopia-certificate.pdf');
  if (fs.existsSync(rootFallback)) {
    return {
      buffer: fs.readFileSync(rootFallback),
      isPdf: true
    };
  }

  throw new Error(`Template file not found at ${templatePath}`);
}

/**
 * Generates a high-quality PDF Certificate
 * 
 * @param {Object} options
 * @param {string} options.participantName
 * @param {string} options.dateText
 * @param {string} options.templatePath
 * @param {Object} options.layout
 * @returns {Promise<Uint8Array>}
 */
export async function generateCertificatePdf({
  participantName = 'Participant Name',
  dateText = '',
  templatePath = '/templates/default-certificate.png',
  layout = {}
}) {
  const { buffer, isPdf } = await loadTemplateBuffer(templatePath);

  let pdfDoc;
  let page;

  if (isPdf) {
    // If template is already a PDF
    pdfDoc = await PDFDocument.load(buffer);
    page = pdfDoc.getPages()[0];
  } else {
    // If template is an image (PNG or JPG)
    pdfDoc = await PDFDocument.create();
    let embeddedImage;
    try {
      embeddedImage = await pdfDoc.embedPng(buffer);
    } catch (pngErr) {
      try {
        embeddedImage = await pdfDoc.embedJpg(buffer);
      } catch (jpgErr) {
        throw new Error('Unsupported image format. Please upload PNG or JPG.');
      }
    }

    const { width, height } = embeddedImage.scale(1);
    page = pdfDoc.addPage([width, height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width,
      height
    });
  }

  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();

  // Layout parameters with sensible defaults (TeX Gyre Termes at 52pt)
  const nameXPercent = Number(layout.name_x ?? 7.25);
  const nameYPercent = Number(layout.name_y ?? 50.5);
  const nameFontFamily = layout.name_font_family || 'TeX Gyre Termes';
  const isAlexandra = nameFontFamily.toLowerCase().includes('alexandra');
  let nameFontSize = Number(layout.name_font_size ?? (isAlexandra ? 76 : 52));
  // If switching from legacy Alexandra 76pt to TeX Gyre Termes, normalize to 52pt to avoid overlap
  if (!isAlexandra && nameFontSize > 64) {
    nameFontSize = 52;
  }
  const nameColor = hexToRgb(layout.name_color || '#111827');
  const nameAlignment = layout.name_alignment || 'left';
  const nameMaxWidthPercent = Number(layout.name_max_width ?? 85);

  const dateXPercent = Number(layout.date_x ?? 74.2);
  const dateYPercent = Number(layout.date_y ?? 82.5);
  const dateFontFamily = layout.date_font_family || 'Helvetica';
  const dateFontSize = Number(layout.date_font_size ?? 13);
  const dateColor = hexToRgb(layout.date_color || '#334155');
  const dateAlignment = layout.date_alignment || 'left';

  // Register fontkit for custom font embedding
  pdfDoc.registerFontkit(fontkit);

  // Embed TeX Gyre Termes, Alexandra, or standard fallback
  let nameFont = null;
  const lowerFamily = nameFontFamily.toLowerCase();
  const isTermes = lowerFamily.includes('termes') || lowerFamily.includes('gyre');

  if (isTermes) {
    const isRegular = lowerFamily.includes('regular') && !lowerFamily.includes('bold');
    const isItalic = lowerFamily.includes('italic');
    let fontFileName = 'texgyretermes-bold.otf'; // Default to bold for certificate recipient name
    if (isRegular && isItalic) {
      fontFileName = 'texgyretermes-italic.otf';
    } else if (isRegular) {
      fontFileName = 'texgyretermes-regular.otf';
    } else if (isItalic) {
      fontFileName = 'texgyretermes-bolditalic.otf';
    }

    const termesPath = path.join(process.cwd(), 'public', 'fonts', fontFileName);
    if (fs.existsSync(termesPath)) {
      try {
        const fontBytes = fs.readFileSync(termesPath);
        nameFont = await pdfDoc.embedFont(fontBytes);
      } catch (err) {
        console.warn('Could not embed custom TeX Gyre Termes font, falling back to standard font:', err.message);
      }
    }
  } else if (isAlexandra) {
    const customFontPath = path.join(process.cwd(), 'public', 'fonts', 'Alexandra.ttf');
    if (fs.existsSync(customFontPath)) {
      try {
        const fontBytes = fs.readFileSync(customFontPath);
        nameFont = await pdfDoc.embedFont(fontBytes);
      } catch (err) {
        console.warn('Could not embed custom Alexandra font, falling back to standard font:', err.message);
      }
    }
  }

  if (!nameFont) {
    nameFont = await pdfDoc.embedFont(getStandardFontName(nameFontFamily));
  }

  let dateFont = null;
  const lowerDateFamily = dateFontFamily.toLowerCase();
  if (lowerDateFamily.includes('termes') || lowerDateFamily.includes('gyre')) {
    const fontFileName = lowerDateFamily.includes('bold') ? 'texgyretermes-bold.otf' : 'texgyretermes-regular.otf';
    const termesDatePath = path.join(process.cwd(), 'public', 'fonts', fontFileName);
    if (fs.existsSync(termesDatePath)) {
      try {
        const dateFontBytes = fs.readFileSync(termesDatePath);
        dateFont = await pdfDoc.embedFont(dateFontBytes);
      } catch (err) {
        // fallback
      }
    }
  }
  if (!dateFont) {
    dateFont = await pdfDoc.embedFont(getStandardFontName(dateFontFamily));
  }

  // Auto-scale Name for long text so it never overflows
  const maxAllowedWidth = (nameMaxWidthPercent / 100) * pageWidth;
  const initialWidth = nameFont.widthOfTextAtSize(participantName, nameFontSize);

  if (initialWidth > maxAllowedWidth && initialWidth > 0) {
    const scaleFactor = maxAllowedWidth / initialWidth;
    nameFontSize = Math.max(16, nameFontSize * scaleFactor);
  }

  // Calculate coordinates (PDF Y origin is at bottom left)
  const renderedNameWidth = nameFont.widthOfTextAtSize(participantName, nameFontSize);
  const baseNameX = (nameXPercent / 100) * pageWidth;
  const namePdfY = pageHeight - (nameYPercent / 100) * pageHeight - (nameFontSize * 0.35);

  let finalNameX = baseNameX;
  if (nameAlignment === 'center') {
    finalNameX = baseNameX - renderedNameWidth / 2;
  } else if (nameAlignment === 'right') {
    finalNameX = baseNameX - renderedNameWidth;
  }

  // Draw Name
  page.drawText(participantName, {
    x: finalNameX,
    y: namePdfY,
    size: nameFontSize,
    font: nameFont,
    color: nameColor
  });

  // Calculate Date coordinates and draw if dateText is provided
  if (dateText) {
    const renderedDateWidth = dateFont.widthOfTextAtSize(dateText, dateFontSize);
    const baseDateX = (dateXPercent / 100) * pageWidth;
    const datePdfY = pageHeight - (dateYPercent / 100) * pageHeight - (dateFontSize * 0.35);

    let finalDateX = baseDateX;
    if (dateAlignment === 'center') {
      finalDateX = baseDateX - renderedDateWidth / 2;
    } else if (dateAlignment === 'right') {
      finalDateX = baseDateX - renderedDateWidth;
    }

    page.drawText(dateText, {
      x: finalDateX,
      y: datePdfY,
      size: dateFontSize,
      font: dateFont,
      color: dateColor
    });
  }

  return await pdfDoc.save();
}
