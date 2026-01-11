import { jsPDF } from 'jspdf';
import { PDFGenerator } from './pdfGenerator';
import { DatosGeneralesForm, Partida, FuenteCompranet, FuenteArchivoInterno, FuenteCamaraUniversidad, FuenteInternet } from '@/types/requisicion';

export interface DocumentoGenerado {
  nombre: string;
  codigo: string;
  fechaGeneracion: string;
  blob: Blob | null;
}

/**
 * Generador especializado para documentos FO-CON
 */
export class FOCONGenerators {
  
  /**
   * FO-CON-01: Solicitud de Requisición (Paso 2)
   */
  static generarFOCON01(folio: string, datos: DatosGeneralesForm): DocumentoGenerado {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Encabezado con logo
    let y = PDFGenerator.crearEncabezadoConLogo(
      doc,
      'SOLICITUD DE REQUISICIÓN',
      'FO-CON-01',
      '/Logo.png'
    );
    
    // Información del Folio
    y = PDFGenerator.crearSeccion(doc, 'DATOS DE LA REQUISICIÓN', y);
    y = PDFGenerator.agregarCampo(doc, 'Folio:', folio, y);
    y = PDFGenerator.agregarCampo(doc, 'Fecha de Elaboración:', datos.fechaElaboracion, y);
    y = PDFGenerator.agregarCampo(doc, 'Área Solicitante:', datos.areaSolicitante, y);
    y = PDFGenerator.agregarCampo(doc, 'Solicitante:', datos.solicitante, y);
    
    y += 5;
    y = PDFGenerator.crearSeccion(doc, 'DETALLES DE CONTRATACIÓN', y);
    y = PDFGenerator.agregarCampo(doc, 'Tipo de Contratación:', datos.tipoContratacion, y);
    y = PDFGenerator.agregarCampo(doc, 'Partida Presupuestal:', datos.partidaPresupuestal || 'N/A', y);
    y = PDFGenerator.agregarCampo(doc, 'Programa/Proyecto:', datos.programaProyecto || 'N/A', y);
    
    // Lugares de entrega
    if (datos.lugarEntrega && datos.lugarEntrega.length > 0) {
      y += 5;
      y = PDFGenerator.crearSeccion(doc, 'LUGARES DE ENTREGA', y);
      datos.lugarEntrega.forEach((lugar, idx) => {
        y = PDFGenerator.agregarCampo(doc, `${idx + 1}.`, lugar.direccion, y);
      });
    }
    
    // Firmas
    y = doc.internal.pageSize.getHeight() - 40;
    PDFGenerator.agregarFirmas(doc, [
      { titulo: 'Elaboró' },
      { titulo: 'Autorizó' },
      { titulo: 'Vo. Bo.' }
    ], y);
    
    const blob = doc.output('blob');
    return {
      nombre: `${folio}-FOCON01.pdf`,
      codigo: 'FO-CON-01',
      fechaGeneracion: new Date().toISOString(),
      blob
    };
  }
  
  /**
   * FO-CON-03: Anexo Técnico de Partidas (Paso 3)
   */
  static generarFOCON03(folio: string, partidas: Partida[], datos: DatosGeneralesForm): DocumentoGenerado {
    const doc = new jsPDF();
    
    let y = PDFGenerator.crearEncabezadoConLogo(
      doc,
      'ANEXO TÉCNICO DE PARTIDAS',
      'FO-CON-03',
      '/Logo.png'
    );
    
    y = PDFGenerator.agregarCampo(doc, 'Folio:', folio, y);
    y = PDFGenerator.agregarCampo(doc, 'Oficio de Autorización:', datos.oficioAutorizacion || 'N/A', y);
    
    y += 5;
    y = PDFGenerator.crearSeccion(doc, 'PARTIDAS SOLICITADAS', y);
    
    // Tabla de partidas
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    
    const tableStartY = y;
    const colWidths = [15, 25, 65, 20, 20, 25];
    let xPos = PDFGenerator.MARGEN_X;
    
    // Encabezados
    ['No.', 'CUCOP', 'Descripción', 'Cant.', 'Unidad', 'P. Unit.'].forEach((header, i) => {
      doc.text(header, xPos, y);
      xPos += colWidths[i];
    });
    
    y += 6;
    doc.setFont('helvetica', 'normal');
    
    // Filas de partidas
    partidas.forEach((partida, index) => {
      if (y > 250) {
        doc.addPage();
        y = PDFGenerator.MARGEN_Y;
      }
      
      xPos = PDFGenerator.MARGEN_X;
      doc.text(String(index + 1), xPos, y);
      xPos += colWidths[0];
      
      doc.text(partida.cucop || 'N/A', xPos, y);
      xPos += colWidths[1];
      
      const descripcionCorta = partida.descripcion.length > 40 
        ? partida.descripcion.substring(0, 37) + '...' 
        : partida.descripcion;
      doc.text(descripcionCorta, xPos, y);
      xPos += colWidths[2];
      
      doc.text(String(partida.cantidad), xPos, y);
      xPos += colWidths[3];
      
      doc.text(partida.unidad, xPos, y);
      xPos += colWidths[4];
      
      doc.text(`$${partida.precio_unitario.toFixed(2)}`, xPos, y);
      
      y += 7;
    });
    
    // Totales
    const subtotal = partidas.reduce((sum, p) => sum + (p.cantidad * p.precio_unitario), 0);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`SUBTOTAL: $${subtotal.toFixed(2)}`, PDFGenerator.MARGEN_X + 120, y);
    y += 6;
    doc.text(`IVA (16%): $${iva.toFixed(2)}`, PDFGenerator.MARGEN_X + 120, y);
    y += 6;
    doc.setFontSize(10);
    doc.text(`TOTAL: $${total.toFixed(2)}`, PDFGenerator.MARGEN_X + 120, y);
    
    const blob = doc.output('blob');
    return {
      nombre: `${folio}-FOCON03.pdf`,
      codigo: 'FO-CON-03',
      fechaGeneracion: new Date().toISOString(),
      blob
    };
  }
  
  /**
   * FO-CON-05: Cédula de Investigación de Mercado (Paso 4)
   */
  static generarFOCON05(
    folio: string,
    fuentesCompranet: FuenteCompranet[],
    fuentesArchivos: FuenteArchivoInterno[],
    fuentesCamaras: FuenteCamaraUniversidad[],
    fuentesInternet: FuenteInternet[],
    proveedorGanador?: string,
    razonSeleccion?: string
  ): DocumentoGenerado {
    const doc = new jsPDF();
    
    let y = PDFGenerator.crearEncabezadoConLogo(
      doc,
      'CÉDULA DE INVESTIGACIÓN DE MERCADO',
      'FO-CON-05',
      '/Logo.png'
    );
    
    y = PDFGenerator.agregarCampo(doc, 'Folio:', folio, y);
    y = PDFGenerator.agregarCampo(doc, 'Fecha de Investigación:', new Date().toLocaleDateString('es-MX'), y);
    
    // Proveedor adjudicado
    if (proveedorGanador) {
      y += 5;
      y = PDFGenerator.crearSeccion(doc, 'PROVEEDOR ADJUDICADO', y);
      doc.setFillColor(200, 255, 200);
      doc.rect(PDFGenerator.MARGEN_X, y, doc.internal.pageSize.getWidth() - 2 * PDFGenerator.MARGEN_X, 20, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(proveedorGanador, PDFGenerator.MARGEN_X + 2, y + 7);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      if (razonSeleccion) {
        const maxWidth = doc.internal.pageSize.getWidth() - 2 * PDFGenerator.MARGEN_X - 4;
        const lines = doc.splitTextToSize(`Justificación: ${razonSeleccion}`, maxWidth);
        doc.text(lines, PDFGenerator.MARGEN_X + 2, y + 13);
      }
      y += 25;
    }
    
    // Fuentes consultadas
    y += 5;
    y = PDFGenerator.crearSeccion(doc, 'FUENTES CONSULTADAS', y);
    
    doc.setFontSize(9);
    
    if (fuentesCompranet.length > 0) {
      y += 3;
      doc.setFont('helvetica', 'bold');
      doc.text(`CompraNet (${fuentesCompranet.length} registros)`, PDFGenerator.MARGEN_X, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      fuentesCompranet.forEach((f, i) => {
        if (y > 250) {
          doc.addPage();
          y = PDFGenerator.MARGEN_Y;
        }
        doc.text(`${i + 1}. ${f.nombre_proveedor} - $${f.precio_unitario?.toFixed(2) || '0.00'}`, PDFGenerator.MARGEN_X + 3, y);
        y += 5;
      });
    }
    
    if (fuentesArchivos.length > 0) {
      y += 3;
      doc.setFont('helvetica', 'bold');
      doc.text(`Archivos Internos (${fuentesArchivos.length} registros)`, PDFGenerator.MARGEN_X, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      fuentesArchivos.forEach((f, i) => {
        if (y > 250) {
          doc.addPage();
          y = PDFGenerator.MARGEN_Y;
        }
        doc.text(`${i + 1}. ${f.proveedor} - $${f.precio_unitario?.toFixed(2) || '0.00'}`, PDFGenerator.MARGEN_X + 3, y);
        y += 5;
      });
    }
    
    if (fuentesCamaras.length > 0) {
      y += 3;
      doc.setFont('helvetica', 'bold');
      doc.text(`Cámaras/Universidades (${fuentesCamaras.length} instituciones)`, PDFGenerator.MARGEN_X, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      fuentesCamaras.forEach((f, i) => {
        if (y > 250) {
          doc.addPage();
          y = PDFGenerator.MARGEN_Y;
        }
        doc.text(`${i + 1}. ${f.institucion}`, PDFGenerator.MARGEN_X + 3, y);
        y += 5;
      });
    }
    
    if (fuentesInternet.length > 0) {
      y += 3;
      doc.setFont('helvetica', 'bold');
      doc.text(`Internet (${fuentesInternet.length} búsquedas)`, PDFGenerator.MARGEN_X, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      fuentesInternet.forEach((f, i) => {
        if (y > 250) {
          doc.addPage();
          y = PDFGenerator.MARGEN_Y;
        }
        doc.text(`${i + 1}. ${f.termino_busqueda}`, PDFGenerator.MARGEN_X + 3, y);
        y += 5;
      });
    }
    
    const blob = doc.output('blob');
    return {
      nombre: `${folio}-FOCON05.pdf`,
      codigo: 'FO-CON-05',
      fechaGeneracion: new Date().toISOString(),
      blob
    };
  }
  
  /**
   * FO-CON-06: Justificación Técnica y Económica (Paso 5)
   */
  static generarFOCON06(folio: string, justificacion: string, datos: DatosGeneralesForm): DocumentoGenerado {
    const doc = new jsPDF();
    
    let y = PDFGenerator.crearEncabezadoConLogo(
      doc,
      'JUSTIFICACIÓN TÉCNICA Y ECONÓMICA',
      'FO-CON-06',
      '/Logo.png'
    );
    
    y = PDFGenerator.agregarCampo(doc, 'Folio:', folio, y);
    y = PDFGenerator.agregarCampo(doc, 'Área Solicitante:', datos.areaSolicitante, y);
    y = PDFGenerator.agregarCampo(doc, 'Fecha:', new Date().toLocaleDateString('es-MX'), y);
    
    y += 10;
    y = PDFGenerator.crearSeccion(doc, 'JUSTIFICACIÓN DE LA ADQUISICIÓN', y);
    
    // Justificación con wrapping
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const maxWidth = doc.internal.pageSize.getWidth() - 2 * PDFGenerator.MARGEN_X;
    const lines = doc.splitTextToSize(justificacion, maxWidth);
    
    lines.forEach((line: string) => {
      if (y > 260) {
        doc.addPage();
        y = PDFGenerator.MARGEN_Y;
      }
      doc.text(line, PDFGenerator.MARGEN_X, y);
      y += 6;
    });
    
    // Firmas
    y = Math.max(y + 20, doc.internal.pageSize.getHeight() - 40);
    PDFGenerator.agregarFirmas(doc, [
      { titulo: 'Elaboró' },
      { titulo: 'Revisó' },
      { titulo: 'Autorizó' }
    ], y);
    
    const blob = doc.output('blob');
    return {
      nombre: `${folio}-FOCON06.pdf`,
      codigo: 'FO-CON-06',
      fechaGeneracion: new Date().toISOString(),
      blob
    };
  }
}
