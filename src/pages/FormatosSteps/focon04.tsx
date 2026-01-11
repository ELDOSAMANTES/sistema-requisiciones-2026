import { jsPDF } from 'jspdf';
import { PDFGenerator } from '@/lib/pdfGenerator';

export const generarFOCON04 = (doc: jsPDF, y: number): number => {
  let currentY = y;
  currentY = PDFGenerator.crearSeccion(doc, "DATOS DEL PROVEEDOR", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "Nombre:", "______________________________________", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "Domicilio:", "______________________________________", currentY);
  currentY += 5;
  currentY = PDFGenerator.crearSeccion(doc, "BIENES/SERVICIOS A COTIZAR", currentY);
  currentY = PDFGenerator.agregarTablaBasica(doc, ["No.", "Descripción", "Cantidad", "Unidad"], currentY);
  return currentY;
};