import { jsPDF } from 'jspdf';
import { PDFGenerator } from '@/lib/pdfGenerator';

export const generarFOCON03 = (doc: jsPDF, y: number): number => {
  let currentY = y;
  currentY = PDFGenerator.crearSeccion(doc, "DATOS GENERALES", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "Fecha de elaboración:", "______________________________________", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "Área requirente:", "______________________________________", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "No. de requisición:", "______________________________________", currentY);
  currentY += 5;
  currentY = PDFGenerator.crearSeccion(doc, "BIENES/SERVICIOS SOLICITADOS", currentY);
  currentY = PDFGenerator.agregarTablaBasica(doc, ["Part.", "CUCOP", "Descripción", "Cantidad", "Unidad"], currentY);
  return currentY;
};
