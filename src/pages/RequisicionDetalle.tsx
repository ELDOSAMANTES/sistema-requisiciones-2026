import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import requisicionService from '@/services/requisicionService';
import { UserInfoHeader } from '@/components/UserInfoHeader';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, Building, User, FileText, 
  CheckCircle2, Paperclip, Clock, ExternalLink, FileSearch, AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from "@/components/ui/skeleton";

export default function RequisicionDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [req, setReq] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔍 Agregamos un log para ver qué ID está recibiendo
    console.log(`[Detalle] Componente cargado. ID recibido: ${id}`);
    if (id) cargarDetalle(id);
  }, [id]);

  const cargarDetalle = async (reqId: string) => {
    try {
      setLoading(true);
      const data = await requisicionService.obtenerPorId(reqId);
      setReq(data);
    } catch (error) {
      console.error("❌ Error al cargar la requisición:", error);
      // Al fallar, establecemos req a null para mostrar la pantalla de No Encontrado.
      setReq(null); 
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to dynamically get color for the source type (for consistent UI)
  const getSourceColorClass = (type: string) => {
    switch (type?.toUpperCase()) {
        case 'COMPRANET':
            return 'bg-blue-500';
        case 'ARCHIVO':
            return 'bg-green-500';
        case 'CAMARA':
            return 'bg-purple-500';
        case 'INTERNET':
            return 'bg-orange-500';
        default:
            return 'bg-gray-500';
    }
  }

  // 1. Manejo de Estado de Carga
  if (loading) return <div className="container mx-auto p-6"><Skeleton className="h-96 w-full" /></div>;

  // 2. Manejo de Estado No Encontrado (Muestra un mensaje en lugar de un blanco)
  if (!req) return (
      <div className="container mx-auto p-12 text-center bg-white rounded-lg shadow-xl max-w-lg mt-10 border-t-4 border-red-500">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4"/>
          <h2 className="text-2xl font-bold text-gray-800">Requisición No Encontrada</h2>
          <p className="mt-3 text-gray-600">
              El ID <strong>{id}</strong> no existe o hubo un error de conexión con el servidor.
          </p>
          <Button className="mt-6" onClick={() => navigate('/requisiciones')}>
             Volver a la Lista
          </Button>
      </div>
  ); 

  // --- RESTO DEL COMPONENTE (Manejo de la data cargada) ---
  return (
    <div className="container mx-auto p-6 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <UserInfoHeader />

      <Button variant="ghost" className="mb-4 pl-0 hover:pl-2 transition-all" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Regresar
      </Button>

      {/* ENCABEZADO Y CONTENIDO PRINCIPAL - IGUAL A PASO 6 */}
      <Card>
        <CardHeader className="border-b border-border bg-muted/30">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl text-primary">{req.folio}</CardTitle>
              <CardDescription className="mt-1">
                Creada el {new Date(req.fechaElaboracion).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={req.estatus === 'CREADA' || req.estatus === 'En Captura' ? 'bg-amber-500' : 'bg-green-600'}>
                {req.estatus}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => window.print()}>Imprimir</Button>
              <Button size="sm" onClick={() => navigate(`/requisiciones/${req.id}/editar`)}>Editar</Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* INFORMACIÓN GENERAL */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-foreground">Información General</h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Fecha:</dt>
                    <dd className="font-medium">{new Date(req.fechaElaboracion).toLocaleDateString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Área:</dt>
                    <dd className="font-medium">{req.areaSolicitanteNombre}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Solicitante:</dt>
                    <dd className="font-medium">{req.solicitanteNombre}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-foreground">Detalles de Contratación</h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Tipo:</dt>
                    <dd className="font-medium capitalize">{req.tipoContratacion || 'No especificado'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Programa:</dt>
                    <dd className="font-medium">{req.programaProyecto || 'No especificado'}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <Separator />

            {/* PARTIDAS SOLICITADAS */}
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Partidas Solicitadas</h4>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left w-[100px]">CUCOP</th>
                      <th className="px-4 py-3 text-left">Descripción</th>
                      <th className="px-4 py-3 text-right w-[80px]">Cantidad</th>
                      <th className="px-4 py-3 text-left w-[100px]">Unidad</th>
                      <th className="px-4 py-3 text-right w-[120px]">Precio Unit.</th>
                      <th className="px-4 py-3 text-right w-[120px]">Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {req.partidas?.map((p: any, idx: number) => (
                      <tr key={idx} className="border-t hover:bg-muted/30">
                        <td className="px-4 py-3 font-mono text-xs">{p.cucop}</td>
                        <td className="px-4 py-3">{p.descripcion}</td>
                        <td className="px-4 py-3 text-right">{p.cantidad}</td>
                        <td className="px-4 py-3">{p.unidad}</td>
                        <td className="px-4 py-3 text-right">
                          ${Number(p.precioUnitario).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          ${(p.cantidad * p.precioUnitario).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LUGARES DE ENTREGA */}
            {req.lugarEntrega && (() => {
              try {
                const lugares = JSON.parse(req.lugarEntrega);
                if (lugares && lugares.length > 0) {
                  return (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-2 text-foreground">Lugar(es) de Entrega</h4>
                        <div className="space-y-2">
                          {lugares.map((dir: any, idx: number) => (
                            <div key={dir.id || idx} className="text-sm p-3 border rounded-md bg-muted/30">
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
                    </>
                  );
                }
              } catch (e) {
                console.error("Error parsing lugarEntrega:", e);
              }
              return null;
            })()}

            <Separator />

            {/* JUSTIFICACIÓN */}
            <div>
              <h4 className="font-semibold mb-2 text-foreground">Justificación de Compra</h4>
              <div className="bg-muted/30 p-4 rounded-md border text-sm italic">
                "{req.justificacion}"
              </div>
            </div>

            {/* INVESTIGACIÓN DE MERCADO */}
            {req.investigacionMercado && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Investigación de Mercado
                  </h4>
                  
                  {/* PROVEEDOR SELECCIONADO */}
                  {req.investigacionMercado.proveedorSeleccionado && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                      <h5 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Proveedor Adjudicado
                      </h5>
                      <p className="text-xl font-bold text-gray-900 mb-3">
                        {req.investigacionMercado.proveedorSeleccionado}
                      </p>
                      {req.investigacionMercado.razonSeleccion && (
                        <>
                          <h5 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Justificación de Elección
                          </h5>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {req.investigacionMercado.razonSeleccion}
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {/* FUENTES CONSULTADAS */}
                  {req.investigacionMercado.fuentesConsultadas && req.investigacionMercado.fuentesConsultadas.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-3 flex items-center gap-2">
                        <FileSearch className="h-4 w-4" />
                        Fuentes Consultadas ({req.investigacionMercado.fuentesConsultadas.length})
                      </h5>
                      <div className="grid gap-3">
                        {req.investigacionMercado.fuentesConsultadas.map((fuente: any, i: number) => (
                          <Card key={i} className={`border-l-4 ${getSourceColorClass(fuente.tipo).replace('bg', 'border-l')}`}>
                            <CardContent className="p-4 text-sm">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <p className="font-bold text-gray-900">{fuente.nombre}</p>
                                  <Badge className={`text-xs mt-1 text-white border-0 ${getSourceColorClass(fuente.tipo)}`}>
                                    {fuente.tipo}
                                  </Badge>
                                </div>
                                {fuente.precio > 0 && (
                                  <div className="text-right ml-4">
                                    <p className="text-xs text-gray-500">Precio Unitario</p>
                                    <p className="font-mono font-bold text-green-700">
                                      ${Number(fuente.precio).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              {(fuente.contrato || fuente.fecha || fuente.descripcion || fuente.url) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 bg-muted/30 p-3 rounded border">
                                  {fuente.contrato && fuente.contrato !== 'N/A' && (
                                    <div>
                                      <span className="text-xs font-semibold text-muted-foreground block">Contrato / Oficio</span>
                                      <span className="text-gray-900">{fuente.contrato}</span>
                                    </div>
                                  )}
                                  {fuente.fecha && fuente.fecha !== 'N/A' && (
                                    <div>
                                      <span className="text-xs font-semibold text-muted-foreground block">Fecha Referencia</span>
                                      <span className="text-gray-900">
                                        {fuente.fecha.includes('T') || fuente.fecha.includes('-') 
                                          ? new Date(fuente.fecha).toLocaleDateString('es-MX')
                                          : fuente.fecha}
                                      </span>
                                    </div>
                                  )}
                                  {fuente.descripcion && fuente.descripcion !== 'N/A' && (
                                    <div className="md:col-span-2">
                                      <span className="text-xs font-semibold text-muted-foreground block">Descripción</span>
                                      <span className="text-gray-700 italic">{fuente.descripcion}</span>
                                    </div>
                                  )}
                                  {fuente.url && fuente.url !== 'N/A' && (
                                    <div className="md:col-span-2">
                                      <a 
                                        href={fuente.url} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                        Ver evidencia en línea
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ANEXOS */}
            {req.anexos && req.anexos.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3 text-foreground">Archivos Adjuntos</h4>
                  <div className="space-y-2">
                    {req.anexos.map((anexo: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-md border">
                        <div className="flex items-center gap-3">
                          <Paperclip className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">{anexo.nombreArchivo}</span>
                        </div>
                        <Button variant="link" size="sm" asChild>
                          <a href={anexo.urlArchivo} target="_blank" rel="noreferrer">Ver</a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* HISTORIAL */}
            {req.historial && req.historial.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3 text-foreground">Historial</h4>
                  <div className="space-y-4 relative border-l-2 border-border ml-2 pl-4">
                    {req.historial.map((h: any, i: number) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-muted border-2 border-background"></div>
                        <p className="text-sm font-medium">{h.accion}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <User className="h-3 w-3" /> {h.usuarioNombre}
                          <Clock className="h-3 w-3 ml-2" /> {new Date(h.fecha).toLocaleString()}
                        </div>
                      </div>
                    ))}
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background"></div>
                      <p className="text-sm font-medium">Requisición Creada</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" /> {new Date(req.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}