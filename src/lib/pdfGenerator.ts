import { jsPDF } from 'jspdf';

/**
 * Clase de utilidad que contiene métodos estáticos para generar documentos PDF.
 * Funciona como una "caja de herramientas" con funciones reutilizables para crear
 * encabezados, secciones, campos, tablas y otros elementos comunes en los PDFs.
 */
export class PDFGenerator {
    // --- CONSTANTES DE DISEÑO ---
    public static readonly COLOR_PRIMARIO = [139, 69, 19]; // Tono vino oficial (RGB)
    public static readonly MARGEN_X = 20;
    public static readonly MARGEN_Y = 20;

    /**
     * Crea el encabezado estándar con el logo del Gobierno de México.
     * @param doc Instancia de jsPDF.
     * @param titulo Título principal del documento.
     * @param codigo Código del formato (ej. "FO-CON-01").
     * @param logoPath Ruta al archivo del logo (ej. '/logo.png').
     * @returns La nueva posición 'y' después de dibujar el encabezado.
     */
    public static crearEncabezadoConLogo(doc: jsPDF, titulo: string, codigo: string, logoPath: string): number {
        const pageWidth = doc.internal.pageSize.getWidth();

        try {
            // Se asume que el logo está en la carpeta 'public'
            doc.addImage(logoPath, 'PNG', this.MARGEN_X, this.MARGEN_Y - 10, 30, 15);
        } catch (e) {
            console.error(`No se pudo cargar el logo desde ${logoPath}. Asegúrate de que el archivo exista en la carpeta 'public'.`);
            doc.text("[Logo]", this.MARGEN_X, this.MARGEN_Y);
        }
        
        // La fuente Montserrat debe ser registrada en jsPDF para ser usada.
        // Por defecto, se usará 'helvetica'.
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(this.COLOR_PRIMARIO[0], this.COLOR_PRIMARIO[1], this.COLOR_PRIMARIO[2]);
        doc.text('Gobierno de México', pageWidth / 2, this.MARGEN_Y, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(`FORMATO ${codigo}`, pageWidth / 2, this.MARGEN_Y + 8, { align: 'center' });
        doc.text(titulo, pageWidth / 2, this.MARGEN_Y + 15, { align: 'center' });

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.1);
        doc.line(this.MARGEN_X, this.MARGEN_Y + 22, pageWidth - this.MARGEN_X, this.MARGEN_Y + 22);
        
        return this.MARGEN_Y + 30;
    }

    /**
     * Agrega una textura de fondo de forma modular en el lado derecho de la página.
     * @param doc Instancia de jsPDF.
     * @param imagenPath Ruta a la imagen de textura (ej. '/fondo.jpg').
     */
    public static agregarFondoModular(doc: jsPDF, imagenPath: string): void {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const anchoTextura = 30; // Aumentado para un diseño más ancho
        const xInicio = pageWidth - anchoTextura;

        try {
            const img = new Image();
            img.src = imagenPath;
            // Usamos parches más grandes para un mejor rendimiento y apariencia
            const tileWidth = 15;
            const tileHeight = 15;

            for (let y = 0; y < pageHeight; y += tileHeight) {
                for (let x = xInicio; x < pageWidth; x += tileWidth) {
                    doc.addImage(img, 'JPEG', x, y, tileWidth, tileHeight);
                }
            }
        } catch (e) {
            console.error(`No se pudo cargar la imagen de fondo desde ${imagenPath}. Asegúrate de que el archivo exista en la carpeta 'public'.`);
        }
    }

    /**
     * Crea una barra de sección con fondo de color y texto.
     */
    public static crearSeccion(doc: jsPDF, texto: string, y: number): number {
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.setFillColor(this.COLOR_PRIMARIO[0], this.COLOR_PRIMARIO[1], this.COLOR_PRIMARIO[2]);
        doc.rect(this.MARGEN_X, y, pageWidth - 2 * this.MARGEN_X, 7, 'F');
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(texto, this.MARGEN_X + 2, y + 5);
        return y + 10;
    }
    
    /**
     * Agrega una línea de campo con una etiqueta en negrita y un espacio para el valor.
     */
    public static agregarCampo(doc: jsPDF, etiqueta: string, valor: string, y: number): number {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(etiqueta, this.MARGEN_X, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(valor || 'N/A'), this.MARGEN_X + 65, y);
        return y + 7;
    }

    /**
     * Dibuja los espacios para las firmas en la parte inferior del documento.
     */
    public static agregarFirmas(doc: jsPDF, firmas: Array<{ titulo: string }>, y: number): void {
        const pageWidth = doc.internal.pageSize.getWidth();
        const anchoFirma = (pageWidth - 2 * this.MARGEN_X - 10) / firmas.length;
        firmas.forEach((firma, index) => {
            const x = this.MARGEN_X + (index * (anchoFirma + 5));
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.3);
            doc.line(x, y + 15, x + anchoFirma, y + 15);
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            doc.text(firma.titulo, x + anchoFirma / 2, y + 20, { align: 'center' });
        });
    }

    /**
     * Dibuja una tabla simple con encabezados y filas vacías con líneas.
     */
    public static agregarTablaBasica(doc: jsPDF, headers: string[], y: number): number {
        const colWidth = (doc.internal.pageSize.getWidth() - 2 * this.MARGEN_X) / headers.length;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        let xPos = this.MARGEN_X;
        headers.forEach(header => {
            doc.text(header, xPos, y);
            xPos += colWidth;
        });
        y += 5;
        for (let i = 0; i < 3; i++) {
            xPos = this.MARGEN_X;
            doc.setFont('helvetica', 'normal');
            headers.forEach(() => {
                doc.text("_________________", xPos + 2, y);
                xPos += colWidth;
            });
            y += 6;
        }
        return y;
    };

    /**
     * Inicia la descarga del PDF generado en el navegador del usuario.
     */
    public static descargarPDF(blob: Blob, nombreArchivo: string): void {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nombreArchivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}