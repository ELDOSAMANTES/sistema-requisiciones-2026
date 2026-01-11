import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ExternalLink, FileText, Download } from "lucide-react";
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

  const handleEnviarAutorizacion = async () => {
    if (!datos.datosGenerales || datos.partidas.length === 0 || !datos.justificacion) {
      toast({ title: 'Error de Validación', description: 'Faltan datos esenciales.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    // Mapeo completo de fuentes con todos los detalles
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
          
          {/* DOCUMENTOS GENERADOS - RESUMEN COMPLETO */}
          {documentosGenerados.length > 0 && (
            <div className="bg-green-50 border-2 border-green-300 p-6 rounded-lg">
              <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Documentación Oficial Generada
              </h4>
              <p className="text-sm text-green-800 mb-4">
                Los siguientes formatos FO-CON han sido generados automáticamente y están listos para descarga:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documentosGenerados.map((doc, idx) => (
                  <Card key={idx} className="bg-white border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-green-900">{doc.codigo}</p>
                          <p className="text-xs text-green-700 mt-1">{doc.nombre}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.fechaGeneracion).toLocaleString('es-MX')}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => descargarDocumento(doc)}
                          className="ml-2"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          <div className="border rounded-md">
            <div className="bg-muted/50 px-6 py-4 border-b">
              <h3 className="font-bold text-xl text-primary">Requisición de Compra</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">Folio: {datos.folio}</span>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full font-medium">
                  En Captura
                </span>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Información General</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Fecha:</dt>
                      <dd className="font-medium">{datos.datosGenerales.fechaElaboracion}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Área:</dt>
                      <dd className="font-medium">{datos.datosGenerales.areaSolicitante}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Solicitante:</dt>
                      <dd className="font-medium">{datos.datosGenerales.solicitante}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Detalles de Contratación</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Tipo:</dt>
                      <dd className="font-medium">{datos.datosGenerales.tipoContratacion || 'No especificado'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Programa:</dt>
                      <dd className="font-medium">{datos.datosGenerales.programaProyecto || 'No especificado'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-foreground">Partidas Solicitadas</h4>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">CUCOP</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right w-[80px]">Cantidad</TableHead>
                        <TableHead className="w-[100px]">Unidad</TableHead>
                        <TableHead className="text-right w-[120px]">Precio Unit.</TableHead>
                        <TableHead className="text-right w-[120px]">Importe</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {datos.partidas.map((partida, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-xs">{partida.cucop}</TableCell>
                          <TableCell className="text-sm">{partida.descripcion}</TableCell>
                          <TableCell className="text-right">{partida.cantidad}</TableCell>
                          <TableCell>{partida.unidad}</TableCell>
                          <TableCell className="text-right">
                            ${partida.precio_unitario.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${(partida.cantidad * partida.precio_unitario).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {datos.datosGenerales.lugarEntrega && datos.datosGenerales.lugarEntrega.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Lugar(es) de Entrega</h4>
                  <div className="space-y-2">
                    {datos.datosGenerales.lugarEntrega.map((dir, idx) => (
                      <div key={dir.id} className="text-sm p-3 border rounded-md bg-muted/30">
                        <p className="font-medium">{idx + 1}. {dir.direccion}</p>
                        {dir.linkGoogleMaps && (
                          <a 
                            href={dir.linkGoogleMaps} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Ver en Google Maps
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {datos.proveedoresInvitados.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-foreground">Investigación de Mercado</h4>
                  
                  {/* Proveedor Adjudicado */}
                  {datos.proveedorGanador && datos.razonSeleccion && (
                    <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                      <h5 className="font-bold text-sm text-green-900 mb-1">PROVEEDOR ADJUDICADO</h5>
                      <p className="text-lg font-bold text-green-800 mb-2">{datos.proveedorGanador}</p>
                      <h5 className="font-semibold text-xs text-green-700 mb-1">Justificación de Selección:</h5>
                      <p className="text-sm text-green-900 italic">"{datos.razonSeleccion}"</p>
                    </div>
                  )}
                  
                  {/* Resumen de Fuentes Consultadas */}
                  <div className="mb-4 p-3 bg-muted/30 rounded-md border">
                    <h5 className="font-medium text-sm mb-2">Fuentes Consultadas</h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {datos.fuentesCompranet.length > 0 && (
                        <div>
                          <span className="font-medium">Compranet:</span> {datos.fuentesCompranet.length} contrato(s)
                        </div>
                      )}
                      {datos.fuentesArchivosInternos.length > 0 && (
                        <div>
                          <span className="font-medium">Archivos Internos:</span> {datos.fuentesArchivosInternos.length} registro(s)
                        </div>
                      )}
                      {datos.fuentesCamaras.length > 0 && (
                        <div>
                          <span className="font-medium">Cámaras/Universidades:</span> {datos.fuentesCamaras.length} institución(es)
                        </div>
                      )}
                      {datos.fuentesInternet.length > 0 && (
                        <div>
                          <span className="font-medium">Internet:</span> {datos.fuentesInternet.length} búsqueda(s)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tabla Detallada de Proveedores */}
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Proveedor</TableHead>
                          <TableHead>Origen</TableHead>
                          <TableHead>Contacto</TableHead>
                          <TableHead>Estatus</TableHead>
                          <TableHead className="text-center">Propuesta</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {datos.proveedoresInvitados.filter(p => p.seleccionado).map((proveedor) => {
                          const getEstatusInfo = () => {
                            if (!proveedor.solicitud_enviada) {
                              return { 
                                label: 'Pendiente de invitar', 
                                color: 'bg-muted text-muted-foreground',
                                icon: null 
                              };
                            }
                            if (proveedor.solicitud_enviada && !proveedor.respuesta_subida) {
                              return { 
                                label: 'Esperando respuesta', 
                                color: 'bg-amber-100 text-amber-800',
                                icon: null 
                              };
                            }
                            return { 
                              label: 'Cotización recibida', 
                              color: 'bg-green-100 text-green-800',
                              icon: <Check className="h-3 w-3 mr-1" /> 
                            };
                          };

                          const getOrigenLabel = (origen: string) => {
                            const labels = {
                              'compranet': 'Compranet',
                              'archivo_interno': 'Archivo Interno',
                              'camara_universidad': 'Cámara/Universidad',
                              'internet': 'Internet'
                            };
                            return labels[origen as keyof typeof labels] || origen;
                          };

                          const getOrigenColor = (origen: string) => {
                            const colors = {
                              'compranet': 'bg-blue-500',
                              'archivo_interno': 'bg-green-500',
                              'camara_universidad': 'bg-purple-500',
                              'internet': 'bg-orange-500'
                            };
                            return colors[origen as keyof typeof colors] || 'bg-gray-500';
                          };

                          const estatus = getEstatusInfo();

                          return (
                            <TableRow key={proveedor.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{proveedor.nombre}</div>
                                  {proveedor.rfc && (
                                    <div className="text-xs text-muted-foreground">RFC: {proveedor.rfc}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getOrigenColor(proveedor.origen)}`}>
                                  {getOrigenLabel(proveedor.origen)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {proveedor.email && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-muted-foreground">📧</span>
                                      <span className="truncate max-w-[150px]">{proveedor.email}</span>
                                    </div>
                                  )}
                                  {proveedor.telefono && (
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <span className="text-xs">📞</span>
                                      <span>{proveedor.telefono}</span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${estatus.color}`}>
                                  {estatus.icon}
                                  {estatus.label}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                {proveedor.respuesta_subida && proveedor.archivo_propuesta ? (
                                  <div className="flex flex-col items-center gap-1">
                                    <Check className="h-5 w-5 text-green-600" />
                                    <span className="text-xs font-medium text-green-700">
                                      {proveedor.archivo_propuesta.name}
                                    </span>
                                    {proveedor.fecha_respuesta && (
                                      <span className="text-xs text-muted-foreground">
                                        {proveedor.fecha_respuesta}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              {datos.justificacion && (
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Justificación</h4>
                  <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md border">
                    {datos.justificacion}
                  </div>
                </div>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-80 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span className="font-medium">${calcularSubtotal().toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>IVA (16%):</span>
                      <span className="font-medium">${calcularIVA().toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span className="text-primary">${calcularTotal().toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
            <h4 className="font-semibold text-amber-900 mb-2">Importante antes de enviar</h4>
            <ul className="text-sm text-amber-800 list-disc list-inside space-y-1">
              <li>Una vez enviada, la requisición no podrá ser editada</li>
              <li>Se notificará al flujo de autorización correspondiente</li>
              <li>Podrás consultar el estatus en "Mis Requisiciones"</li>
            </ul>
          </div>
        </div>
        <div className="flex justify-between pt-6 border-t mt-6">
          <Button variant="outline" onClick={() => setPaso(5)} disabled={isLoading}>
            Regresar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={guardarBorrador} disabled={isLoading}>
              Guardar Borrador
            </Button>
            <Button 
              onClick={handleEnviarAutorizacion} 
              className="bg-primary text-primary-foreground"
              disabled={isLoading}
            >
              <Check className="h-4 w-4 mr-2" />
              {isLoading ? 'Enviando...' : 'Enviar a Autorización'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Paso6_VistaPrevia;
