import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Navigation, Building2, Clock, Phone, FileText, Download, Info } from "lucide-react";
import { DocumentoGenerado } from "@/lib/foconGenerators";
import { Partida } from '@/types/requisicion';

const UBICACIONES_PREDEFINIDAS = [
  {
    nombre: "Almacén General",
    direccion: "Av. Industria Militar 1055, Lomas de Sotelo, Miguel Hidalgo, 11200 Ciudad de México, CDMX",
    horario: "Lunes a Viernes de 9:00 a 15:00 hrs",
    contacto: "Jefe de Almacén - Ext. 1234",
  },
  {
    nombre: "Oficinas Administrativas (Piso 3)",
    direccion: "Av. Paseo de la Reforma 135, Tabacalera, Cuauhtémoc, 06030 Ciudad de México, CDMX",
    horario: "Lunes a Viernes de 9:00 a 18:00 hrs",
    contacto: "Recepción Administrativa - Ext. 5678",
  },
];

// --- COMPONENTE DEL MODAL DE MAPA ---
interface ModalEntregaProps {
  ubicacionesGuardadas: any[];
  onGuardar: (ubicaciones: any[]) => void;
}

const ModalEntregaConMapa: React.FC<ModalEntregaProps> = ({ ubicacionesGuardadas, onGuardar }) => {
  const [open, setOpen] = useState(false);
  const [nuevaUbicacion, setNuevaUbicacion] = useState({
    sede: "", direccion: "", referencia: "", horario: "", contacto: "",
  });

  const cargarPredefinida = (nombreSede: string) => {
    const encontrada = UBICACIONES_PREDEFINIDAS.find(u => u.nombre === nombreSede);
    if (encontrada) {
      setNuevaUbicacion({
        sede: encontrada.nombre,
        direccion: encontrada.direccion,
        referencia: "",
        horario: encontrada.horario,
        contacto: encontrada.contacto
      });
    }
  };

  const handleGuardar = () => {
    if (!nuevaUbicacion.sede || !nuevaUbicacion.direccion) return;
    onGuardar([...ubicacionesGuardadas, nuevaUbicacion]);
    setOpen(false);
    setNuevaUbicacion({ sede: "", direccion: "", referencia: "", horario: "", contacto: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-auto py-4 border-dashed border-gray-400 bg-gray-50 flex flex-col gap-2 hover:bg-white hover:border-[#9D2449] group transition-all">
          <MapPin className="h-6 w-6 text-gray-400 group-hover:text-[#9D2449]" />
          <span className="text-gray-600 text-xs font-bold group-hover:text-[#9D2449]">
            {ubicacionesGuardadas.length > 0 
              ? `${ubicacionesGuardadas.length} Ubicación(es) definida(s) - Clic para editar` 
              : "Definir lugar de entrega y condiciones"}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#9D2449] font-bold text-lg border-b pb-2">Lugar de entrega</DialogTitle>
          <DialogDescription>
            Indique la dirección exacta y condiciones para la recepción de los bienes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-bold text-gray-600">Sede predefinida</Label>
              <Select onValueChange={cargarPredefinida}>
                <SelectTrigger className="rounded-md border-gray-300"><SelectValue placeholder="Seleccione una opción..." /></SelectTrigger>
                <SelectContent>
                  {UBICACIONES_PREDEFINIDAS.map((u, idx) => (
                    <SelectItem key={idx} value={u.nombre}>{u.nombre}</SelectItem>
                  ))}
                  <SelectItem value="otra">Otra ubicación externa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 pt-2 border-t">
              <div>
                <Label className="text-xs font-bold text-gray-600 flex items-center gap-2"><Building2 className="h-3 w-3"/> Dirección completa</Label>
                <Textarea 
                  value={nuevaUbicacion.direccion} 
                  onChange={(e) => setNuevaUbicacion({...nuevaUbicacion, direccion: e.target.value})} 
                  className="h-20 resize-none border-gray-300 focus:ring-[#9D2449]"
                  placeholder="Calle, Número, Colonia, C.P., Municipio/Alcaldía, Estado"
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-gray-600 flex items-center gap-2"><Navigation className="h-3 w-3"/> Referencias</Label>
                <Input 
                  value={nuevaUbicacion.referencia} 
                  onChange={(e) => setNuevaUbicacion({...nuevaUbicacion, referencia: e.target.value})}
                  className="border-gray-300"
                  placeholder="Portón verde, Entre calles..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-gray-600 flex items-center gap-2"><Clock className="h-3 w-3"/> Horario</Label>
                  <Input 
                    value={nuevaUbicacion.horario} 
                    onChange={(e) => setNuevaUbicacion({...nuevaUbicacion, horario: e.target.value})}
                    className="border-gray-300"
                    placeholder="Lun-Vie 9:00-15:00"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-gray-600 flex items-center gap-2"><Phone className="h-3 w-3"/> Contacto</Label>
                  <Input 
                    value={nuevaUbicacion.contacto} 
                    onChange={(e) => setNuevaUbicacion({...nuevaUbicacion, contacto: e.target.value})}
                    className="border-gray-300"
                    placeholder="Nombre / Extensión"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* MAPA REAL */}
          <div className="h-full min-h-[300px] bg-slate-100 rounded-md border border-slate-200 flex flex-col items-center justify-center text-gray-400 relative overflow-hidden">
             {!nuevaUbicacion.direccion ? (
               <>
                 <MapPin className="h-12 w-12 text-gray-300 mb-2"/>
                 <span className="text-xs font-medium tracking-wide">Ingrese una dirección</span>
                 <span className="text-[10px]">(El mapa aparecerá aquí)</span>
               </>
             ) : (
               <iframe
                 width="100%"
                 height="100%"
                 style={{ border: 0 }}
                 loading="lazy"
                 allowFullScreen
                 src={`https://maps.google.com/maps?q=${encodeURIComponent(nuevaUbicacion.direccion)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
               ></iframe>
             )}
          </div>
        </div>
        <DialogFooter className="mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)} className="text-xs font-bold">Cancelar</Button>
          <Button onClick={handleGuardar} className="bg-[#9D2449] hover:bg-[#7c1c38] text-white text-xs font-bold">Guardar ubicación</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- COMPONENTE PRINCIPAL ---

interface Paso2Props {
  datosGenerales: any;
  setDatosGenerales: (datos: any) => void;
  folioGenerado: string;
  guardarBorrador: () => void;
  setPaso: (paso: number) => void;
  documentosGenerados: DocumentoGenerado[];
  partidas: Partida[];
}

const Paso2_DatosGenerales: React.FC<Paso2Props> = ({
  datosGenerales,
  setDatosGenerales,
  folioGenerado,
  guardarBorrador,
  setPaso,
  documentosGenerados,
  partidas
}) => {
  
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

  useEffect(() => {
    if (partidas && partidas.length > 0) {
      const partidasDetectadas = partidas.map(p => String(p.cucop).substring(0, 5));
      const unicas = Array.from(new Set(partidasDetectadas)).sort();
      const stringPartidas = unicas.join(',');
      if (datosGenerales.partidaPresupuestal !== stringPartidas) {
        setDatosGenerales((prev: any) => ({ ...prev, partidaPresupuestal: stringPartidas }));
      }
    } else {
      if (datosGenerales.partidaPresupuestal !== "") {
        setDatosGenerales((prev: any) => ({ ...prev, partidaPresupuestal: "" }));
      }
    }
  }, [partidas]);

  const listaPartidasSeleccionadas = datosGenerales.partidaPresupuestal 
    ? datosGenerales.partidaPresupuestal.split(',').filter(Boolean) 
    : [];

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm border-t-4 border-t-[#D4C19C]">
        <CardHeader className="pb-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-[#333333]">
                Datos generales
              </CardTitle>
              <CardDescription>Formato FO-CON-03 (Parte 1)</CardDescription>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-gray-500 tracking-wider">FOLIO</span>
              <p className="text-lg font-mono font-bold text-[#9D2449]">{folioGenerado}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* FECHA Y TIPO */}
            <div>
              <Label className="text-xs font-bold text-gray-600">Fecha de elaboración</Label>
              <Input 
                type="date" 
                value={datosGenerales.fechaElaboracion} 
                onChange={(e) => setDatosGenerales({ ...datosGenerales, fechaElaboracion: e.target.value })} 
                className="mt-1 border-gray-300 focus:ring-[#9D2449]"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-gray-600">Tipo de contratación</Label>
              <Select value={datosGenerales.tipoContratacion} onValueChange={(val) => setDatosGenerales({ ...datosGenerales, tipoContratacion: val })}>
                <SelectTrigger className="mt-1 border-gray-300 focus:ring-[#9D2449]">
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adjudicacion">Adjudicación Directa</SelectItem>
                  <SelectItem value="invitacion">Invitación a cuando menos tres personas</SelectItem>
                  <SelectItem value="licitacion">Licitación Pública Nacional</SelectItem>
                  <SelectItem value="licitacion-internacional">Licitación Pública Internacional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ÁREAS (READONLY) */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold text-gray-600">Área solicitante</Label>
                <Input value={datosGenerales.areaSolicitante} disabled className="mt-1 bg-gray-100 border-gray-200 text-gray-600 font-medium" />
              </div>
              <div>
                <Label className="text-xs font-bold text-gray-600">Solicitante</Label>
                <Input value={datosGenerales.solicitante} disabled className="mt-1 bg-gray-100 border-gray-200 text-gray-600 font-medium" />
              </div>
            </div>

            {/* PARTIDAS PRESUPUESTALES (AUTOMÁTICAS) */}
            <div className="md:col-span-2 bg-[#F9F9F9] border border-gray-200 p-4 rounded-md">
              <Label className="text-xs font-bold text-[#9D2449] flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4"/> Partidas presupuestales afectadas
              </Label>
              
              <div className="flex flex-wrap gap-2 min-h-[30px]">
                {listaPartidasSeleccionadas.length > 0 ? (
                  listaPartidasSeleccionadas.map((idPartida: string) => (
                    <Badge key={idPartida} className="bg-white hover:bg-white text-gray-800 border border-gray-300 px-3 py-1 rounded-full shadow-sm">
                      <span className="font-mono font-bold text-[#9D2449] mr-2">{idPartida}</span>
                      <span className="text-[10px] text-gray-500 tracking-wide">Partida Específica</span>
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic flex items-center gap-2">
                    <Info className="h-4 w-4"/> No se han agregado bienes en el paso anterior.
                  </p>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-2 italic border-t border-gray-200 pt-2">
                * Estas partidas se calculan automáticamente según los bienes seleccionados.
              </p>
            </div>

            {/* LUGAR DE ENTREGA */}
            <div className="md:col-span-2">
              <Label className="text-xs font-bold text-gray-600 mb-1 block">Lugar y condiciones de entrega</Label>
              
              <ModalEntregaConMapa 
                ubicacionesGuardadas={datosGenerales.lugarEntrega || []}
                onGuardar={(ubicaciones) => setDatosGenerales({ ...datosGenerales, lugarEntrega: ubicaciones })}
              />

              {datosGenerales.lugarEntrega && datosGenerales.lugarEntrega.length > 0 && (
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {datosGenerales.lugarEntrega.map((loc: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 border border-l-4 border-l-[#D4C19C] rounded-md bg-white shadow-sm">
                      <MapPin className="h-5 w-5 text-[#9D2449] mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800">{loc.sede}</p>
                        <p className="text-xs text-gray-500">{loc.direccion}</p>
                        <div className="flex flex-wrap gap-4 mt-1 text-[10px] text-gray-400 font-medium">
                           {loc.horario && <span className="flex items-center gap-1"><Clock className="h-3 w-3"/> {loc.horario}</span>}
                           {loc.contacto && <span className="flex items-center gap-1"><Phone className="h-3 w-3"/> {loc.contacto}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* DESCARGAS */}
          {documentosGenerados.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-md mt-4">
              <h4 className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-2">
                <Download className="h-4 w-4" /> Formatos disponibles
              </h4>
              <div className="flex flex-wrap gap-2">
                {documentosGenerados.map((doc, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => descargarDocumento(doc)}
                    className="text-xs bg-white text-blue-700 border-blue-200 hover:bg-blue-100 h-7"
                  >
                    {doc.codigo}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* NAVEGACIÓN */}
          <div className="flex justify-between pt-6 border-t mt-6">
            <Button variant="outline" onClick={() => setPaso(1)} className="border-[#9D2449] text-[#9D2449] hover:bg-[#F3E5E9] text-xs font-bold">
              Regresar
            </Button>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={guardarBorrador} className="text-gray-500 hover:text-gray-700 text-xs font-bold">
                Guardar borrador
              </Button>
              <Button 
                onClick={() => setPaso(3)} 
                className="bg-[#13322B] hover:bg-[#0f2621] text-white text-xs font-bold px-6"
              >
                Continuar
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default Paso2_DatosGenerales;