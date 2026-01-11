import { jsPDF } from 'jspdf';
import { PDFGenerator } from '@/lib/pdfGenerator';

export const generarFOCON09 = (doc: jsPDF, y: number): number => {
  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = y;
  currentY = PDFGenerator.crearSeccion(doc, "DATOS DEL CONTRATO", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "No. de Contrato:", "______________________________________", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "Proveedor:", "______________________________________", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "Fecha de rescisión:", "______________________________________", currentY);
  currentY += 5;
  currentY = PDFGenerator.crearSeccion(doc, "MOTIVO DE RESCISIÓN", currentY);
  doc.text("Descripción del motivo:", PDFGenerator.MARGEN_X, currentY);
  currentY += 15;
  doc.rect(PDFGenerator.MARGEN_X, currentY, pageWidth - 2 * PDFGenerator.MARGEN_X, 30);
  return currentY;
};