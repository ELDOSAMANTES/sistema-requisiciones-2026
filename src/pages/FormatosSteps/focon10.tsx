import { jsPDF } from 'jspdf';
import { PDFGenerator } from '@/lib/pdfGenerator';

export const generarFOCON10 = (doc: jsPDF, y: number): number => {
  let currentY = y;
  currentY = PDFGenerator.crearSeccion(doc, "DATOS DEL PAGO", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "No. de Contrato:", "______________________________________", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "Proveedor:", "______________________________________", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "Factura No.:", "______________________________________", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "Monto a pagar:", "______________________________________", currentY);
  currentY += 5;
  currentY = PDFGenerator.crearSeccion(doc, "CONCEPTOS", currentY);
  currentY = PDFGenerator.agregarTablaBasica(doc, ["Concepto", "Monto"], currentY);
  return currentY;
};