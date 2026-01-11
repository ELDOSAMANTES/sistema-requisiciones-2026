import { jsPDF } from 'jspdf';
import { PDFGenerator } from '@/lib/pdfGenerator';

export const generarFOCON05 = (doc: jsPDF, y: number): number => {
  let currentY = y;
  currentY = PDFGenerator.crearSeccion(doc, "DATOS GENERALES", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "Fecha:", "______________________________________", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "Área requirente:", "______________________________________", currentY);
  currentY = PDFGenerator.agregarCampo(doc, "No. requisición:", "______________________________________", currentY);
  currentY += 5;
  currentY = PDFGenerator.crearSeccion(doc, "PROVEEDORES CONSULTADOS", currentY);
  currentY = PDFGenerator.agregarTablaBasica(doc, ["Proveedor", "RFC", "Total Cotizado"], currentY);
  return currentY;
};