import { jsPDF } from 'jspdf';
import { PDFGenerator } from '@/lib/pdfGenerator';

export const generarFOCON08 = (doc: jsPDF, y: number): number => {
  let currentY = y;
  currentY = PDFGenerator.crearSeccion(doc, "DATOS DEL CONTRATO", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "No. de Contrato:", "______________________________________", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "Proveedor:", "______________________________________", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "Monto total:", "______________________________________", currentY);
  currentY += 5;
  currentY = PDFGenerator.crearSeccion(doc, "DATOS DE LA GARANTÍA", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "Tipo de garantía:", "______________________________________", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "No. de póliza/fianza:", "______________________________________", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "Vigencia:", "______________________________________", currentY);
  return currentY;
};