import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ExternalLink, FileText, Download, Loader2, Printer } from "lucide-react";
import { DocumentoGenerado } from '@/lib/foconGenerators';
import { 
  Partida, 
  DatosGeneralesForm,
  FuenteCompranet,
  FuenteArchivoInterno,
  FuenteCamaraUniversidad,
  FuenteInternet,
  ProveedorInvitado
} from '@/types/requisicion';
import requisicionService from '@/services/requisicionService';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Paso6Props {
  datos: {
    folio: string;
    datosGenerales: DatosGeneralesForm;
    partidas: Partida[];
    justificacion: string;
    anexos: File[];
    fuentesCompranet: FuenteCompranet[];
    fuentesArchivosInternos: FuenteArchivoInterno[];
    fuentesCamaras: FuenteCamaraUniversidad[];
    fuentesInternet: FuenteInternet[];
    proveedoresInvitados: ProveedorInvitado[];
    proveedorGanador?: string;
    razonSeleccion?: string;
  };
  setPaso: (paso: number) => void;
  guardarBorrador: () => void;
  calcularSubtotal: () => number;
  calcularIVA: () => number;
  calcularTotal: () => number;
  documentosGenerados: DocumentoGenerado[];
}

const Paso6_VistaPrevia: React.FC<Paso6Props> = ({
  datos,
  setPaso,
  guardarBorrador,
  calcularSubtotal,
  calcularIVA,
  calcularTotal,
  documentosGenerados,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para indicar qué documento se está generando en el servidor
  const [generandoDocServer, setGenerandoDocServer] = useState<string | null>(null);

  // --- LÓGICA DE DESCARGA DESDE EL BACKEND (PYTHON) ---
  const handleDescargaBackend = async (tipoPlantilla: string) => {
    setGenerandoDocServer(tipoPlantilla);
    try {
      let datosParaPython = {};
      let nombreArchivoSalida = "";

      // ============================================================
      // 1. FOCON-01 (SOLICITUD DE REQUISICIÓN / PEDIDO)
      // ============================================================
      if (tipoPlantilla === 'focon01') {
        nombreArchivoSalida = `FOCON01_Pedido_${datos.folio}`;
        
        datosParaPython = {
          folio: datos.folio,
          fecha: datos.datosGenerales.fechaElaboracion,
          area: datos.datosGenerales.areaSolicitante,
          solicitante: datos.datosGenerales.solicitante,
          tipo_contratacion: datos.datosGenerales.tipoContratacion,
          programa: datos.datosGenerales.programaProyecto || "N/A",
          oficio_autorizacion: datos.datosGenerales.oficioAutorizacion || "S/N",

          // Mapeo de partidas corregido
          partidas: datos.partidas.map((p) => {
             const precioFinal = Number(p.precio_estimado || p.precio_unitario || 0);
             return {
                // IMPORTANTE: Asegúrate de que en Word sea {{ p.partida_especifica }}
                partida_especifica: p.partida_especifica || "S/D", 
                
                cucop: p.cucop,
                descripcion: p.descripcion,
                unidad: p.unidad,
                cantidad: p.cantidad,
                // Formateamos moneda
                precio: `$${precioFinal.toLocaleString('es-MX', {minimumFractionDigits: 2})}`,
                importe: `$${(p.cantidad * precioFinal).toLocaleString('es-MX', {minimumFractionDigits: 2})}`
             };
          }),
          
          subtotal: `$${calcularSubtotal().toLocaleString('es-MX', {minimumFractionDigits: 2})}`,
          iva: `$${calcularIVA().toLocaleString('es-MX', {minimumFractionDigits: 2})}`,
          total: `$${calcularTotal().toLocaleString('es-MX', {minimumFractionDigits: 2})}`
        };
      } 
      
      // ============================================================
      // 2. FOCON-03 (ANEXO TÉCNICO)
      // ============================================================
      else if (tipoPlantilla === 'focon03') {
         nombreArchivoSalida = `FOCON03_AnexoTecnico_${datos.folio}`;
         datosParaPython = {
            folio: datos.folio,
            area: datos.datosGenerales.areaSolicitante,
            partidas: datos.partidas.map((p, index) => ({
                idx: index + 1,
                descripcion: p.descripcion,
                cantidad: p.cantidad,
                unidad: p.unidad
            }))
         };
      }

      // ============================================================
      // 3. FOCON-05 (INVESTIGACIÓN DE MERCADO)
      // ============================================================
      else if (tipoPlantilla === 'focon05') {
         nombreArchivoSalida = `FOCON05_Investigacion_${datos.folio}`;
         datosParaPython = {
            folio: datos.folio,
            fecha: datos.datosGenerales.fechaElaboracion,
            proveedor_ganador: datos.proveedorGanador || "SIN SELECCIÓN",
            justificacion_seleccion: datos.razonSeleccion || "N/A",
            
            fuentes_compranet: datos.fuentesCompranet.map((f, i) => ({
                idx: i + 1,
                proveedor: f.nombre_proveedor,
                precio: `$${(f.precio_unitario || 0).toLocaleString('es-MX')}`,
                contrato: f.numero_contrato
            })),
            
            fuentes_internet: datos.fuentesInternet.map((f, i) => ({
                idx: i + 1,
                busqueda: f.termino_busqueda,
                pagina: f.url_pagina,
                proveedores: f.proveedores_encontrados.join(", ")
            })),
            
            fuentes_archivos: datos.fuentesArchivosInternos.map((f, i) => ({
                idx: i + 1,
                proveedor: f.proveedor,
                contrato: f.numero_contrato_anterior
            })),
            
            fuentes_camaras: datos.fuentesCamaras.map((f, i) => ({
                idx: i + 1,
                institucion: f.institucion,
                oficio: f.folio_oficio
            }))
         };
      }

      // ============================================================
      // 4. FOCON-06 (JUSTIFICACIÓN)
      // ============================================================
      else if (tipoPlantilla === 'focon06') { 
         nombreArchivoSalida = `FOCON06_Justificacion_${datos.folio}`;
         datosParaPython = {
            folio: datos.folio,
            area: datos.datosGenerales.areaSolicitante,
            fecha: datos.datosGenerales.fechaElaboracion,
            justificacion_texto: datos.justificacion 
         };
      }

      // Llamada al servicio
      await requisicionService.generarDocumentoBackend(tipoPlantilla, datosParaPython, nombreArchivoSalida);
      toast({ title: "Documento Generado", description: `Se descargó ${nombreArchivoSalida}` });

    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo generar el documento." });
    } finally {
      setGenerandoDocServer(null);
    }
  };

  // --- LÓGICA DE DESCARGA LOCAL (SI LA USAS) ---
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

  // --- LÓGICA DE ENVÍO AL API (CREAR REQUISICIÓN) ---
  const handleEnviarAutorizacion = async () => {
    if (!datos.datosGenerales || datos.partidas.length === 0 || !datos.justificacion) {
      toast({ title: 'Error de Validación', description: 'Faltan datos esenciales.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    const fuentesCompranetPayload = datos.fuentesCompranet.map(f => ({
      nombre_fuente: f.nombre_proveedor || 'Proveedor Compranet',
      tipo_fuente: 'COMPRANET',
      url_fuente: f.url_anuncio,
      precio_unitario: f.precio_unitario || 0,
      numero_contrato: f.numero_contrato,
      fecha_referencia: f.fecha_fallo_firma ? f.fecha_fallo_firma.split('T')[0] : null,
      descripcion_bien: f.descripcion
    }));

    const fuentesArchivosPayload = datos.fuentesArchivosInternos.map(f => ({
      nombre_fuente: f.proveedor || 'Archivo Interno',
      tipo_fuente: 'ARCHIVO',
      url_fuente: null,
      precio_unitario: f.precio_unitario || 0,
      numero_contrato: f.numero_contrato_anterior,
      fecha_referencia: f.fecha_contrato ? f.fecha_contrato.split('T')[0] : null,
      descripcion_bien: f.descripcion_bien,
    }));

    const fuentesCamarasPayload = datos.fuentesCamaras.map(f => ({
      nombre_fuente: f.institucion,
      tipo_fuente: 'CAMARA',
      url_fuente: f.url_respuesta_oficio || null,
      precio_unitario: 0,
      numero_contrato: f.folio_oficio,
      fecha_referencia: f.fecha_oficio ? f.fecha_oficio.split('T')[0] : null,
      descripcion_bien: `Solicitud a ${f.institucion}`,
    }));

    const fuentesInternetPayload = datos.fuentesInternet.map(f => ({
      nombre_fuente: f.proveedores_encontrados.join(', ') || f.termino_busqueda || 'Búsqueda Web',
      tipo_fuente: 'INTERNET',
      url_fuente: f.url_pagina,
      precio_unitario: 0,
      numero_contrato: null,
      fecha_referencia: null,
      descripcion_bien: f.descripcion_evidencia
    }));

    const todasLasFuentes = [
      ...fuentesCompranetPayload,
      ...fuentesArchivosPayload,
      ...fuentesCamarasPayload,
      ...fuentesInternetPayload
    ];

    const payload = {
      folio: datos.folio,
      fecha_elaboracion: datos.datosGenerales.fechaElaboracion,
      tipo_contratacion: datos.datosGenerales.tipoContratacion,
      estatus: 'En Autorización',
      justificacion: datos.justificacion,
      usuario_id: 1,
      area_id: 1,
      partidas: datos.partidas.map((p, index) => ({
        partida_numero: index + 1,
        cucop: p.cucop,
        descripcion: p.descripcion,
        cantidad: p.cantidad,
        unidad: p.unidad,
        precio_unitario: p.precio_unitario,
        partida_especifica: p.partida_especifica // Se guarda también en BD
      })),
      investigacion: {
        fuentes: todasLasFuentes,
        proveedor_seleccionado: datos.proveedorGanador,
        razon_seleccion: datos.razonSeleccion
      },
      anexos: datos.anexos.map((a) => ({
        nombre_archivo: a.name,
        tipo_anexo: 'Justificacion',
        url_archivo: `http://simulado.com/${a.name}`,
      })),
      oficio_autorizacion: datos.datosGenerales.oficioAutorizacion,
      partida_presupuestal: datos.datosGenerales.partidaPresupuestal,
      programa_proyecto: datos.datosGenerales.programaProyecto,
      lugar_entrega: JSON.stringify(datos.datosGenerales.lugarEntrega),
    };

    try {
      const nuevaReq = await requisicionService.crear(payload);
      toast({ title: 'Requisición Enviada', description: `Requisición ${nuevaReq.folio} creada.` });
      navigate('/requisiciones');
    } catch (error) {
      console.error('Error al crear requisición:', error);
      toast({ title: 'Error al Enviar', description: (error as Error).message || 'No se pudo guardar.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- HELPERS PARA ESTILOS ---
  const getEstatusInfo = (proveedor: ProveedorInvitado) => {
    if (!proveedor.solicitud_enviada) return { label: 'Pendiente de invitar', color: 'bg-muted text-muted-foreground', icon: null };
    if (proveedor.solicitud_enviada && !proveedor.respuesta_subida) return { label: 'Esperando respuesta', color: 'bg-amber-100 text-amber-800', icon: null };
    return { label: 'Cotización recibida', color: 'bg-green-100 text-green-800', icon: <Check className="h-3 w-3 mr-1" /> };
  };

  const getOrigenLabel = (origen: string) => {
    const labels: Record<string, string> = { 'compranet': 'Compranet', 'archivo_interno': 'Archivo Interno', 'camara_universidad': 'Cámara/Universidad', 'internet': 'Internet' };
    return labels[origen] || origen;
  };

  const getOrigenColor = (origen: string) => {
    const colors: Record<string, string> = { 'compranet': 'bg-blue-500', 'archivo_interno': 'bg-green-500', 'camara_universidad': 'bg-purple-500', 'internet': 'bg-orange-500' };
    return colors[origen] || 'bg-gray-500';
  };

  return (
    <Card>
      <CardHeader className="border-b border-border bg-muted/30">
        <CardTitle className="text-2xl text-primary">Paso 6: Vista Previa y Envío</CardTitle>
        <CardDescription>Revisa la información antes de enviar a autorización</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
            <h4 className="font-semibold text-blue-900 mb-2">Requisición Lista</h4>
            <p className="text-sm text-blue-800">
              Tu requisición está completa. Revisa cuidadosamente toda la información antes de enviarla al flujo de autorización.
            </p>
          </div>
          
          {/* === BOTONES DE DESCARGA (BACKEND) === */}
          <div className="bg-slate-50 border-2 border-slate-200 p-6 rounded-lg mb-6">
             <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-lg">
                <Printer className="h-5 w-5" />
                Formatos Oficiales (Backend)
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Button variant="outline" className="h-auto py-3 flex flex-col items-start gap-1 border-blue-200 hover:bg-blue-50" onClick={() => handleDescargaBackend('focon01')} disabled={generandoDocServer !== null}>
                   <span className="font-bold text-blue-700 flex items-center gap-2">
                     {generandoDocServer === 'focon01' ? <Loader2 className="animate-spin h-4 w-4"/> : <FileText className="h-4 w-4"/>} 
                     FO-CON-01
                   </span>
                   <span className="text-xs text-slate-500">Solicitud de Requisición</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-start gap-1 border-indigo-200 hover:bg-indigo-50" onClick={() => handleDescargaBackend('focon03')} disabled={generandoDocServer !== null}>
                   <span className="font-bold text-indigo-700 flex items-center gap-2">
                     {generandoDocServer === 'focon03' ? <Loader2 className="animate-spin h-4 w-4"/> : <FileText className="h-4 w-4"/>} 
                     FO-CON-03
                   </span>
                   <span className="text-xs text-slate-500">Anexo Técnico</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-start gap-1 border-emerald-200 hover:bg-emerald-50" onClick={() => handleDescargaBackend('focon05')} disabled={generandoDocServer !== null}>
                   <span className="font-bold text-emerald-700 flex items-center gap-2">
                     {generandoDocServer === 'focon05' ? <Loader2 className="animate-spin h-4 w-4"/> : <FileText className="h-4 w-4"/>} 
                     FO-CON-05
                   </span>
                   <span className="text-xs text-slate-500">Investigación de Mercado</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-start gap-1 border-orange-200 hover:bg-orange-50" onClick={() => handleDescargaBackend('focon06')} disabled={generandoDocServer !== null}>
                   <span className="font-bold text-orange-700 flex items-center gap-2">
                     {generandoDocServer === 'focon06' ? <Loader2 className="animate-spin h-4 w-4"/> : <FileText className="h-4 w-4"/>} 
                     FO-CON-06
                   </span>
                   <span className="text-xs text-slate-500">Justificación Técnica</span>
                </Button>
             </div>
          </div>

          <div className="border rounded-md">
            <div className="bg-muted/50 px-6 py-4 border-b">
              <h3 className="font-bold text-xl text-primary">Resumen de Requisición</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">Folio: {datos.folio}</span>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full font-medium">En Captura</span>
              </div>
            </div>
            <div className="p-6 space-y-6">
              
              {/* DATOS GENERALES */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Información General</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between"><dt className="text-muted-foreground">Fecha:</dt><dd className="font-medium">{datos.datosGenerales.fechaElaboracion}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Área:</dt><dd className="font-medium">{datos.datosGenerales.areaSolicitante}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Solicitante:</dt><dd className="font-medium">{datos.datosGenerales.solicitante}</dd></div>
                  </dl>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Contratación</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between"><dt className="text-muted-foreground">Tipo:</dt><dd className="font-medium">{datos.datosGenerales.tipoContratacion || 'N/A'}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Programa:</dt><dd className="font-medium">{datos.datosGenerales.programaProyecto || 'N/A'}</dd></div>
                  </dl>
                </div>
              </div>
              
              {/* TABLA DE PARTIDAS (VISUAL) */}
              <div>
                <h4 className="font-semibold mb-3 text-foreground">Partidas Solicitadas</h4>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Partida</TableHead>
                        <TableHead className="w-[100px]">CUCOP</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right w-[80px]">Cant.</TableHead>
                        <TableHead className="w-[80px]">Unidad</TableHead>
                        <TableHead className="text-right w-[120px]">Precio Est.</TableHead>
                        <TableHead className="text-right w-[120px]">Importe</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {datos.partidas.map((partida, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-bold text-xs">{partida.partida_especifica || '-'}</TableCell>
                          <TableCell className="font-mono text-xs">{partida.cucop}</TableCell>
                          <TableCell className="text-sm">{partida.descripcion.substring(0,60)}...</TableCell>
                          <TableCell className="text-right">{partida.cantidad}</TableCell>
                          <TableCell>{partida.unidad}</TableCell>
                          <TableCell className="text-right">${Number(partida.precio_estimado || partida.precio_unitario).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right font-medium">${(partida.cantidad * Number(partida.precio_estimado || partida.precio_unitario)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {/* LUGARES DE ENTREGA */}
              {datos.datosGenerales.lugarEntrega && datos.datosGenerales.lugarEntrega.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Lugar(es) de Entrega</h4>
                  <div className="space-y-2">
                    {datos.datosGenerales.lugarEntrega.map((dir, idx) => (
                      <div key={dir.id} className="text-sm p-3 border rounded-md bg-muted/30">
                        <p className="font-medium">{idx + 1}. {dir.direccion}</p>
                        {dir.linkGoogleMaps && (
                          <a href={dir.linkGoogleMaps} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                            <ExternalLink className="h-3 w-3" /> Ver en Google Maps
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* INVESTIGACIÓN DE MERCADO */}
              {datos.proveedoresInvitados.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-foreground">Investigación de Mercado</h4>
                  {datos.proveedorGanador && (
                    <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                      <h5 className="font-bold text-sm text-green-900 mb-1">PROVEEDOR ADJUDICADO</h5>
                      <p className="text-lg font-bold text-green-800 mb-2">{datos.proveedorGanador}</p>
                      <h5 className="font-semibold text-xs text-green-700 mb-1">Razón de Selección:</h5>
                      <p className="text-sm text-green-900 italic">"{datos.razonSeleccion}"</p>
                    </div>
                  )}
                  
                  {/* TABLA DE PROVEEDORES */}
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Proveedor</TableHead>
                          <TableHead>Origen</TableHead>
                          <TableHead>Estatus</TableHead>
                          <TableHead className="text-center">Evidencia</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {datos.proveedoresInvitados.filter(p => p.seleccionado).map((proveedor) => {
                          const estatus = getEstatusInfo(proveedor);
                          return (
                            <TableRow key={proveedor.id}>
                              <TableCell>
                                <div className="font-medium">{proveedor.nombre}</div>
                                {proveedor.rfc && <div className="text-xs text-muted-foreground">RFC: {proveedor.rfc}</div>}
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getOrigenColor(proveedor.origen)}`}>
                                  {getOrigenLabel(proveedor.origen)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${estatus.color}`}>
                                  {estatus.icon} {estatus.label}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                {proveedor.respuesta_subida ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <span className="text-xs text-muted-foreground">—</span>}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* JUSTIFICACIÓN */}
              {datos.justificacion && (
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Justificación</h4>
                  <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md border">
                    {datos.justificacion}
                  </div>
                </div>
              )}

              {/* TOTALES */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-80 space-y-2">
                    <div className="flex justify-between text-sm"><span>Subtotal:</span><span className="font-medium">${calcularSubtotal().toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between text-sm"><span>IVA (16%):</span><span className="font-medium">${calcularIVA().toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total:</span><span className="text-primary">${calcularTotal().toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* BOTONES FINALES */}
        <div className="flex justify-between pt-6 border-t mt-6">
          <Button variant="outline" onClick={() => setPaso(5)} disabled={isLoading}>Regresar</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={guardarBorrador} disabled={isLoading}>Guardar Borrador</Button>
            <Button onClick={handleEnviarAutorizacion} className="bg-primary text-primary-foreground" disabled={isLoading}>
              <Check className="h-4 w-4 mr-2" /> {isLoading ? 'Enviando...' : 'Enviar a Autorización'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Paso6_VistaPrevia;