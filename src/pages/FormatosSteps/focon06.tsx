import { jsPDF } from 'jspdf';
import { PDFGenerator } from '@/lib/pdfGenerator';

export const generarFOCON06 = (doc: jsPDF, y: number): number => {
  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = y;
  currentY = PDFGenerator.crearSeccion(doc, "DATOS GENERALES", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "Procedimiento:", "______________________________________", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "Fecha:", "______________________________________", currentY);
  currentY += 5;
  currentY = PDFGenerator.crearSeccion(doc, "EVALUACIÓN TÉCNICA", currentY);
  doc.text("Descripción del bien o servicio evaluado:", PDFGenerator.MARGEN_X, currentY);
  currentY += 15;
  doc.rect(PDFGenerator.MARGEN_X, currentY, pageWidth - 2 * PDFGenerator.MARGEN_X, 30);
  return currentY;
};