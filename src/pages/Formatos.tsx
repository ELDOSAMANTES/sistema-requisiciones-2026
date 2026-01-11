import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from 'jspdf';
import { PDFGenerator } from "@/lib/pdfGenerator";
import { generarFocon01 } from "./FormatosSteps/focon01";
import { generarFOCON02 } from "./FormatosSteps/focon02";
import { generarFOCON03 } from "./FormatosSteps/focon03";
import { generarFOCON04 } from "./FormatosSteps/focon04";
import { generarFOCON05 } from "./FormatosSteps/focon05";
import { generarFOCON06 } from "./FormatosSteps/focon06";
import { generarFOCON07 } from "./FormatosSteps/focon07";
import { generarFOCON08 } from "./FormatosSteps/focon08";
import { generarFOCON09 } from "./FormatosSteps/focon09";
import { generarFOCON10 } from "./FormatosSteps/focon10";

// --- DATOS Y CATEGORÍAS DE LOS FORMATOS ---
const formatosData = [
    { codigo: "FO-CON-01", nombre: "Orden de Suministro o Servicio", descripcion: "Formato oficial para la emisión de órdenes de suministro o prestación de servicios.", categoria: "Adquisiciones" },
    { codigo: "FO-CON-02", nombre: "Verificación de Existencias", descripcion: "Formato para verificar la existencia de bienes en almacén.", categoria: "Almacén" },
    { codigo: "FO-CON-03", nombre: "Requisición de Bienes y Servicios", descripcion: "Formato oficial para solicitar la adquisición de bienes, arrendamientos y servicios.", categoria: "Adquisiciones" },
    { codigo: "FO-CON-04", nombre: "Solicitud de Información/Cotización", descripcion: "Formato para solicitar cotizaciones e información a proveedores.", categoria: "Investigación de Mercado" },
    { codigo: "FO-CON-05", nombre: "Resultado de Investigación de Mercado", descripcion: "Formato para documentar los resultados de la investigación de mercado.", categoria: "Investigación de Mercado" },
    { codigo: "FO-CON-06", nombre: "Dictamen Técnico", descripcion: "Formato para el dictamen técnico de bienes o servicios.", categoria: "Evaluación" },
    { codigo: "FO-CON-07", nombre: "Acta de Recepción", descripcion: "Formato para documentar la recepción de bienes o servicios.", categoria: "Recepción" },
    { codigo: "FO-CON-08", nombre: "Garantía de Cumplimiento", descripcion: "Formato para registrar las garantías de cumplimiento de contratos.", categoria: "Contratos" },
    { codigo: "FO-CON-09", nombre: "Aviso de Rescisión", descripcion: "Formato para notificar la rescisión de contratos.", categoria: "Contratos" },
    { codigo: "FO-CON-10", nombre: "Pago a Proveedores", descripcion: "Formato para autorizar y documentar pagos a proveedores.", categoria: "Pagos" }
];

const categorias = ["Todos", "Adquisiciones", "Almacén", "Investigación de Mercado", "Evaluación", "Recepción", "Contratos", "Pagos"];

const Formatos = () => {
    const [categoriaActiva, setCategoriaActiva] = useState("Todos");
    const { toast } = useToast();

    const formatosFiltrados = categoriaActiva === "Todos"
        ? formatosData
        : formatosData.filter(f => f.categoria === categoriaActiva);

    // --- LÓGICA DE GENERACIÓN DE PDF ---
    const generarPlantillaPDF = (codigo: string, nombre: string) => {
        const doc = codigo === "FO-CON-02"
            ? new jsPDF({ orientation: 'landscape' })
            : new jsPDF();
        
        // Agregar fondo modular
        PDFGenerator.agregarFondoModular(doc, '/fondo.jpg');
        
        // Crear encabezado con logo
        let y = PDFGenerator.crearEncabezadoConLogo(doc, nombre, codigo, '/Logo.png');
        
        // Generar contenido específico según el formato usando las funciones modulares
        switch (codigo) {
            case "FO-CON-01":
                generarFocon01(doc);
                break;
            case "FO-CON-02":
                generarFOCON02(doc, y);
                break;
            case "FO-CON-03":
                y = generarFOCON03(doc, y);
                y += 10;
                PDFGenerator.agregarFirmas(doc, [
                    { titulo: "Solicitante" },
                    { titulo: "Jefe de Área" },
                    { titulo: "Autorización" }
                ], y);
                break;
            case "FO-CON-04":
                y = generarFOCON04(doc, y);
                y += 10;
                PDFGenerator.agregarFirmas(doc, [
                    { titulo: "Responsable de adquisiciones" }
                ], y);
                break;
            case "FO-CON-05":
                y = generarFOCON05(doc, y);
                y += 10;
                PDFGenerator.agregarFirmas(doc, [
                    { titulo: "Elaboró" },
                    { titulo: "Revisó" },
                    { titulo: "Autorizó" }
                ], y);
                break;
            case "FO-CON-06":
                y = generarFOCON06(doc, y);
                y += 45;
                PDFGenerator.agregarFirmas(doc, [
                    { titulo: "Evaluador Técnico" },
                    { titulo: "Vo.Bo. Jefe de Área" }
                ], y);
                break;
            case "FO-CON-07":
                y = generarFOCON07(doc, y);
                y += 10;
                PDFGenerator.agregarFirmas(doc, [
                    { titulo: "Recibió" },
                    { titulo: "Entregó (Proveedor)" }
                ], y);
                break;
            case "FO-CON-08":
                y = generarFOCON08(doc, y);
                y += 10;
                PDFGenerator.agregarFirmas(doc, [
                    { titulo: "Responsable de contratos" }
                ], y);
                break;
            case "FO-CON-09":
                y = generarFOCON09(doc, y);
                y += 45;
                PDFGenerator.agregarFirmas(doc, [
                    { titulo: "Autoridad competente" }
                ], y);
                break;
            case "FO-CON-10":
                y = generarFOCON10(doc, y);
                y += 10;
                PDFGenerator.agregarFirmas(doc, [
                    { titulo: "Solicitó" },
                    { titulo: "Autorizó" }
                ], y);
                break;
            default:
                doc.text(`Plantilla ${codigo} no disponible`, 20, y);
        }

        return doc;
    };

    const handleDescargarPDF = (codigo: string, nombre: string) => {
        try {
            const doc = generarPlantillaPDF(codigo, nombre);
            const blob = doc.output('blob');
            PDFGenerator.descargarPDF(blob, `${codigo}_${nombre.replace(/\s+/g, '_')}.pdf`);
            
            toast({
                title: "PDF generado",
                description: `El formato ${codigo} se ha descargado correctamente`,
            });
        } catch (error) {
            console.error("Error al generar PDF:", error);
            toast({
                title: "Error",
                description: "No se pudo generar el PDF. Por favor intenta de nuevo.",
                variant: "destructive",
            });
        }
    };

    const handleVistaPrevia = (codigo: string, nombre: string) => {
        try {
            const doc = generarPlantillaPDF(codigo, nombre);
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');
            
            toast({
                title: "Vista previa",
                description: `Abriendo vista previa del formato ${codigo}`,
            });
        } catch (error) {
            console.error("Error al generar vista previa:", error);
            toast({
                title: "Error",
                description: "No se pudo generar la vista previa. Por favor intenta de nuevo.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Formatos FO-CON</h1>
                <p className="text-muted-foreground mt-1">
                    Consulta y descarga los formatos oficiales para el proceso de contratación
                </p>
            </div>

            {/* Tabs de Categorías */}
            <Tabs value={categoriaActiva} onValueChange={setCategoriaActiva}>
                <TabsList className="w-full justify-start flex-wrap h-auto">
                    {categorias.map((cat) => (
                        <TabsTrigger key={cat} value={cat} className="flex-shrink-0">
                            {cat}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value={categoriaActiva} className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {formatosFiltrados.map((formato) => (
                            <Card key={formato.codigo} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{formato.codigo}</CardTitle>
                                            <CardDescription className="mt-1 font-medium">
                                                {formato.nombre}
                                            </CardDescription>
                                        </div>
                                        <FileText className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {formato.descripcion}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="flex-1"
                                            onClick={() => handleVistaPrevia(formato.codigo, formato.nombre)}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            Vista Previa
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            className="flex-1"
                                            onClick={() => handleDescargarPDF(formato.codigo, formato.nombre)}
                                        >
                                            <Download className="h-4 w-4 mr-1" />
                                            Descargar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Formatos;
