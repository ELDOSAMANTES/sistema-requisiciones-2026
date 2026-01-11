import { jsPDF } from 'jspdf';
import { PDFGenerator } from '@/lib/pdfGenerator';

export const generarFOCON07 = (doc: jsPDF, y: number): number => {
  let currentY = y;
  currentY = PDFGenerator.crearSeccion(doc, "DATOS DE LA ENTREGA", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "No. de Contrato:", "______________________________________", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "Proveedor:", "______________________________________", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "Fecha de recepción:", "______________________________________", currentY);
  currentY += 5;
  currentY = PDFGenerator.crearSeccion(doc, "BIENES/SERVICIOS RECIBIDOS", currentY);
  currentY = PDFGenerator.agregarTablaBasica(doc, ["Part.", "Descripción", "Cant. Contratada", "Cant. Recibida"], currentY);
  return currentY;
};