import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, FileText, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DocumentoGenerado } from '@/lib/foconGenerators';
import Fuente1Compranet from "./components/Fuente1Compranet";
import Fuente2ArchivosInternos from "./components/Fuente2ArchivosInternos";
import Fuente3CamarasUniversidades from "./components/Fuente3CamarasUniversidades";
import Fuente4Internet from "./components/Fuente4Internet";
import ProveedoresInvitados from "./components/ProveedoresInvitados";
import { 
  FuenteCompranet, 
  FuenteArchivoInterno, 
  FuenteCamaraUniversidad, 
  FuenteInternet,
  ProveedorInvitado,
  Partida
} from "@/types/requisicion";
import { useToast } from "@/hooks/use-toast";

interface Paso4Props {
  guardarBorrador: () => void;
  setPaso: (paso: number) => void;
  partidas: Partida[];
  fuentesCompranet: FuenteCompranet[];
  setFuentesCompranet: (fuentes: FuenteCompranet[]) => void;
  fuentesArchivosInternos: FuenteArchivoInterno[];
  setFuentesArchivosInternos: (fuentes: FuenteArchivoInterno[]) => void;
  fuentesCamaras: FuenteCamaraUniversidad[];
  setFuentesCamaras: (fuentes: FuenteCamaraUniversidad[]) => void;
  fuentesInternet: FuenteInternet[];
  setFuentesInternet: (fuentes: FuenteInternet[]) => void;
  proveedoresInvitados: ProveedorInvitado[];
  setProveedoresInvitados: (proveedores: ProveedorInvitado[]) => void;
  proveedorGanador: string;
  setProveedorGanador: (valor: string) => void;
  razonSeleccion: string;
  setRazonSeleccion: (valor: string) => void;
  documentosGenerados: DocumentoGenerado[];
}

const Paso4_InvestigacionMercado: React.FC<Paso4Props> = ({
  guardarBorrador,
  setPaso,
  partidas,
  fuentesCompranet,
  setFuentesCompranet,
  fuentesArchivosInternos,
  setFuentesArchivosInternos,
  fuentesCamaras,
  setFuentesCamaras,
  fuentesInternet,
  setFuentesInternet,
  proveedoresInvitados,
  setProveedoresInvitados,
  proveedorGanador,
  setProveedorGanador,
  razonSeleccion,
  setRazonSeleccion,
  documentosGenerados,
}) => {
  const { toast } = useToast();
  
  const descargarDocumento = (doc: DocumentoGenerado) => {
    if (doc.blob) {
      const url = URL.createObjectURL(doc.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.nombre;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  React.useEffect(() => {
    const proveedores: ProveedorInvitado[] = [];
    
    // Proveedores desde Compranet
    (fuentesCompranet || []).forEach((fuente, index) => {
      if (fuente.nombre_proveedor && fuente.nombre_proveedor.trim()) {
        const existente = (proveedoresInvitados || []).find(p => p.id === `compranet-${index}`);
        proveedores.push({
          id: `compranet-${index}`,
          nombre: fuente.nombre_proveedor,
          descripcion: fuente.descripcion || fuente.titulo_contrato || fuente.titulo_expediente,
          email: existente?.email || '',
          telefono: existente?.telefono,
          rfc: fuente.rfc_proveedor || undefined,
          origen: 'compranet',
          seleccionado: existente?.seleccionado || false,
          tipo_oficio: existente?.tipo_oficio,
          solicitud_enviada: existente?.solicitud_enviada || false,
          respuesta_subida: existente?.respuesta_subida || false,
          archivo_propuesta: existente?.archivo_propuesta || null,
          fecha_respuesta: existente?.fecha_respuesta,
          oficio_generado: existente?.oficio_generado,
          url_respuesta: existente?.url_respuesta,
        });
      }
    });

    // Proveedores desde Archivos Internos
    (fuentesArchivosInternos || []).forEach((fuente, index) => {
      if (fuente.proveedor && fuente.proveedor.trim()) {
        const id = `archivo-interno-${index}`;
        const existente = (proveedoresInvitados || []).find(p => p.id === id);
        proveedores.push({
          id,
          nombre: fuente.proveedor,
          descripcion: fuente.descripcion_bien,
          email: existente?.email || '',
          telefono: existente?.telefono,
          origen: 'archivo_interno',
          seleccionado: existente?.seleccionado || false,
          tipo_oficio: existente?.tipo_oficio,
          solicitud_enviada: existente?.solicitud_enviada || false,
          respuesta_subida: existente?.respuesta_subida || false,
          archivo_propuesta: existente?.archivo_propuesta || null,
          fecha_respuesta: existente?.fecha_respuesta,
          oficio_generado: existente?.oficio_generado,
          url_respuesta: existente?.url_respuesta,
        });
      }
    });

    // Proveedores desde Cámaras/Universidades
    (fuentesCamaras || []).forEach((fuente, index) => {
      if (fuente.institucion && fuente.institucion.trim()) {
        const id = `camara-universidad-${index}`;
        const existente = (proveedoresInvitados || []).find(p => p.id === id);
        proveedores.push({
          id,
          nombre: fuente.institucion,
          descripcion: `Oficio ${fuente.folio_oficio || 'N/A'} - ${fuente.fecha_oficio}`,
          email: existente?.email || '',
          telefono: existente?.telefono,
          origen: 'camara_universidad',
          seleccionado: existente?.seleccionado || false,
          tipo_oficio: existente?.tipo_oficio,
          solicitud_enviada: existente?.solicitud_enviada || false,
          respuesta_subida: existente?.respuesta_subida || false,
          archivo_propuesta: existente?.archivo_propuesta || null,
          fecha_respuesta: existente?.fecha_respuesta,
          oficio_generado: existente?.oficio_generado,
          url_respuesta: existente?.url_respuesta,
        });
      }
    });

    // Proveedores desde Internet
    (fuentesInternet || []).forEach((fuente, indexFuente) => {
      (fuente.proveedores_encontrados || []).forEach((proveedor, indexProveedor) => {
        const id = `internet-${indexFuente}-${indexProveedor}`;
        const existente = (proveedoresInvitados || []).find(p => p.id === id);
        proveedores.push({
          id,
          nombre: proveedor,
          descripcion: fuente.descripcion_evidencia,
          email: existente?.email || '',
          telefono: existente?.telefono,
          origen: 'internet',
          seleccionado: existente?.seleccionado || false,
          tipo_oficio: existente?.tipo_oficio,
          solicitud_enviada: existente?.solicitud_enviada || false,
          respuesta_subida: existente?.respuesta_subida || false,
          archivo_propuesta: existente?.archivo_propuesta || null,
          fecha_respuesta: existente?.fecha_respuesta,
          oficio_generado: existente?.oficio_generado,
          url_respuesta: existente?.url_respuesta,
        });
      });
    });
    
    // Solo actualizamos si hay cambios sustanciales para evitar loops
    if (proveedores.length > proveedoresInvitados.length) {
        setProveedoresInvitados(proveedores);
    }
  }, [fuentesCompranet, fuentesArchivosInternos, fuentesCamaras, fuentesInternet]); // Agregamos todas las fuentes


  const validarPaso = () => {
    const totalFuentes = (fuentesCompranet?.length || 0) + (fuentesArchivosInternos?.length || 0) + 
                         (fuentesCamaras?.length || 0) + (fuentesInternet?.length || 0);
    if (totalFuentes < 3) {
      toast({
        title: "Fuentes insuficientes",
        description: "Debes registrar al menos 3 fuentes de evidencia para continuar",
        variant: "destructive",
      });
      return false;
    }

    // <<< --- CORRECCIÓN: Validar que se haya seleccionado proveedor y razón --- >>>
    if (!proveedorGanador || !razonSeleccion) {
        toast({
            title: "Falta selección de proveedor",
            description: "Debes seleccionar un proveedor ganador y justificar la elección.",
            variant: "destructive",
        });
        return false;
    }

    return true;
  };

  const handleContinuar = () => {
    if (validarPaso()) {
      setPaso(5);
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-border bg-muted/30">
        <CardTitle className="text-2xl text-primary">Paso 4: Investigación de Mercado</CardTitle>
        <CardDescription>
          Registro de evidencia de investigación - Cumplimiento normativo
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Registra al menos 3 fuentes de evidencia. Los proveedores se agregarán automáticamente a la lista de invitados.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="compranet" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="compranet">Compranet ({fuentesCompranet?.length || 0})</TabsTrigger>
            <TabsTrigger value="archivos">Archivos Internos ({fuentesArchivosInternos?.length || 0})</TabsTrigger>
            <TabsTrigger value="camaras">Cámaras/Univ ({fuentesCamaras?.length || 0})</TabsTrigger>
            <TabsTrigger value="internet">Internet ({fuentesInternet?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="compranet" className="space-y-4 mt-4">
            <Fuente1Compranet fuentes={fuentesCompranet} onChange={setFuentesCompranet} partidas={partidas} />
          </TabsContent>
          <TabsContent value="archivos" className="space-y-4 mt-4">
            <Fuente2ArchivosInternos fuentes={fuentesArchivosInternos} onChange={setFuentesArchivosInternos} />
          </TabsContent>
          <TabsContent value="camaras" className="space-y-4 mt-4">
            <Fuente3CamarasUniversidades fuentes={fuentesCamaras} onChange={setFuentesCamaras} />
          </TabsContent>
          <TabsContent value="internet" className="space-y-4 mt-4">
            <Fuente4Internet fuentes={fuentesInternet} onChange={setFuentesInternet} />
          </TabsContent>
        </Tabs>

        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Proveedores Identificados ({proveedoresInvitados?.length || 0})</CardTitle>
            <CardDescription>Selecciona los proveedores a contactar</CardDescription>
          </CardHeader>
          <CardContent>
            <ProveedoresInvitados proveedores={proveedoresInvitados} onProveedoresChange={setProveedoresInvitados} />
          </CardContent>
        </Card>

        {/* <<< --- UI PARA SELECCIONAR GANADOR --- >>> */}
        <Card className="border-2 border-green-500/20 bg-green-50/30">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">Resultado de la Investigación</CardTitle>
            <CardDescription>Selecciona al proveedor adjudicado y justifica la decisión</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Proveedor Seleccionado</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={proveedorGanador}
                onChange={(e) => setProveedorGanador(e.target.value)}
              >
                <option value="">Seleccione un proveedor...</option>
                {proveedoresInvitados.map((p) => (
                  <option key={p.id} value={p.nombre}>{p.nombre}</option>
                ))}
                <option value="otro">Otro (Especificar manualmente)</option>
              </select>
              {proveedorGanador === 'otro' && (
                 <Input 
                   className="mt-2" 
                   placeholder="Escriba el nombre del proveedor..." 
                   onChange={(e) => setProveedorGanador(e.target.value)} 
                 />
              )}
            </div>

            <div>
              <Label>Razón de la Selección (Criterio Económico/Técnico)</Label>
              <Textarea
                value={razonSeleccion}
                onChange={(e) => setRazonSeleccion(e.target.value)}
                placeholder="Ej: Cumple con todas las especificaciones técnicas y ofreció el precio más bajo del mercado..."
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>
        {/* <<< --- FIN CORRECCIÓN UI --- >>> */}

        {/* DOCUMENTOS GENERADOS */}
        {documentosGenerados.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mt-6">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Formatos Generados
            </h4>
            <div className="flex flex-wrap gap-2">
              {documentosGenerados.map((doc, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => descargarDocumento(doc)}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  {doc.codigo}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={() => setPaso(3)}>Regresar</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={guardarBorrador}>Guardar Borrador</Button>
            <Button onClick={handleContinuar} className="bg-primary text-primary-foreground">Continuar</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Paso4_InvestigacionMercado;