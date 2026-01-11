import { jsPDF } from 'jspdf';

// ✅ Asegúrate de que la exportación sea nombrada con "export const"
export const generarFocon01 = (doc: jsPDF) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const MARGEN_X = 15;
  let y = 50; 

  const tableEndX = pageWidth - 30; 

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(MARGEN_X, y, tableEndX - MARGEN_X, 195);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text('DATOS DEL PROVEEDOR:', MARGEN_X + 2, y + 5);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  let tempY = y + 10;
  doc.text('Proveedor: ', MARGEN_X + 2, tempY);
  doc.text('No. de Contrato: ', MARGEN_X + 90, tempY);
  tempY += 5;
  doc.text('Domicilio: ', MARGEN_X + 2, tempY);
  doc.text('No. de Orden de Suministro: ', MARGEN_X + 90, tempY);
  tempY += 5;
  doc.text('Teléfono: ', MARGEN_X + 2, tempY);
  doc.text('Fecha: ', MARGEN_X + 90, tempY);
  tempY += 5;
  doc.text('Fax: ', MARGEN_X + 2, tempY);
  doc.text('No. de procedimiento: ', MARGEN_X + 90, tempY);
  tempY += 5;
  doc.text('Correo electrónico: ', MARGEN_X + 2, tempY);
  doc.text('Domicilio de entrega: ', MARGEN_X + 90, tempY);
  tempY += 5;
  doc.text('Fecha de entrega: ', MARGEN_X + 90, tempY);
  
  y = tempY + 5;

  const tableHeaders = [
      { text: 'PARTIDA\n', width: 15 }, 
      { text: 'CUCOP\n', width: 20 },
      { text: 'DESCRIPCIÓN\n', width: 55 }, 
      { text: 'UNIDAD DE\nMEDIDA\n', width: 18 },
      { text: 'CANTIDAD\nSOLICITADA\n', width: 18 }, 
      { text: 'PRECIO\nUNITARIO\n', width: 20 },
      { text: 'IMPORTE\n', width: 19 },
  ];
  
  let xPos = MARGEN_X;
  doc.setLineWidth(0.2);
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  
  doc.setFillColor(230, 230, 230);
  doc.rect(xPos, y, tableEndX - MARGEN_X, 10, 'F');
  doc.rect(xPos, y, tableEndX - MARGEN_X, 10);
  
  tableHeaders.forEach(header => {
      doc.text(header.text, xPos + (header.width / 2), y + 5, { align: 'center', baseline: 'middle' });
      xPos += header.width;
      if (xPos < tableEndX) {
          doc.line(xPos, y, xPos, y + 110);
      }
  });

  y += 10;
  
  for (let i = 0; i < 10; i++) {
      doc.line(MARGEN_X, y, tableEndX, y);
      y += 10;
  }
  
  y += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text('SUBTOTAL (19)', tableEndX - 45, y);
  doc.text('IVA (20)', tableEndX - 45, y + 5);
  doc.text('TOTAL (21)', tableEndX - 45, y + 10);
  doc.rect(tableEndX - 25, y - 3, 25, 15);
  
  y += 25;
  const signatureWidth = (tableEndX - MARGEN_X - 10) / 3;
  doc.rect(MARGEN_X, y, signatureWidth, 25);
  doc.text('Nombre y Firma del\nProveedor ', MARGEN_X + signatureWidth / 2, y + 8, { align: 'center' });
  doc.rect(MARGEN_X + signatureWidth + 5, y, signatureWidth, 25);
  doc.rect(MARGEN_X + (signatureWidth + 5) * 2, y, signatureWidth, 25);
  doc.text('Nombre y cargo del servidor público\nresponsable...', MARGEN_X + (signatureWidth + 5) * 2 + signatureWidth / 2, y + 5, { align: 'center' });
};