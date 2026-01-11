import { jsPDF } from 'jspdf';
import { PDFGenerator } from '@/lib/pdfGenerator';

export const generarFOCON02 = (doc: jsPDF, y: number): number => {
  let currentY = y;
  currentY = PDFGenerator.crearSeccion(doc, "DATOS GENERALES", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "Área requirente:", "______________________________________", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "No. de requisición:", "______________________________________", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "Fecha:", "______________________________________", currentY);
  currentY += 5;
  currentY = PDFGenerator.crearSeccion(doc, "BIENES SOLICITADOS", currentY);
  currentY = PDFGenerator.agregarTablaBasica(doc, ["Part.", "CUCOP", "Descripción", "Cantidad", "Exist."], currentY);
  return currentY;
};