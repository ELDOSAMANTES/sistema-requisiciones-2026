import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Search, Loader2, FileSearch } from "lucide-react";
import { FuenteCompranet, Partida } from '@/types/requisicion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import requisicionService from '@/services/requisicionService';

interface Fuente1CompranetProps {
  fuentes: FuenteCompranet[];
  onChange: (fuentes: FuenteCompranet[]) => void;
  partidas: Partida[];
}

const Fuente1Compranet: React.FC<Fuente1CompranetProps> = ({ fuentes, onChange, partidas }) => {
  const [busquedaAbierta, setBusquedaAbierta] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [resultados, setResultados] = useState<any[]>([]);
  const [busquedaAutomatica, setBusquedaAutomatica] = useState(false);
  
  // Mostrar resumen de lo que se buscará
  const descripcionesList = partidas.map(p => p.descripcion).slice(0, 3).join(', ') + (partidas.length > 3 ? '...' : '');

  const agregarFuente = () => {
    onChange([...fuentes, {
      numero_procedimiento: '',
      institucion: '',
      titulo_expediente: '',
      fundamento_legal: '',
      tipo_contratacion: '',
      numero_contrato: '',
      titulo_contrato: '',
      descripcion: '',
      rfc_proveedor: '',
      nombre_proveedor: '',
      folio_rop: '',
      url_anuncio: '',
      fecha_fallo_firma: '',
    }]);
  };

  const buscarEnCompranet = async (termino?: string) => {
    const searchTerm = termino || terminoBusqueda.trim();
    
    if (!searchTerm) {
      toast.error('Por favor ingresa un término de búsqueda');
      return;
    }

    setCargando(true);
    // Actualizamos el input si la búsqueda vino de un botón automático
    if (termino) setTerminoBusqueda(termino);

    try {
      const data = await requisicionService.buscarHistoricoCompranet(searchTerm);
      
      if (data.length > 0) {
        setResultados(data);
        toast.success(`Se encontraron ${data.length} contratos similares.`);
      } else {
        setResultados([]);
        toast.info('No se encontraron contratos con esa descripción.');
      }
    } catch (error: any) {
      console.error('Error al buscar en Histórico de Compranet:', error);
      toast.error('No se pudo conectar con el servicio de búsqueda');
      setResultados([]);
    } finally {
      setCargando(false);
      if (termino) setBusquedaAutomatica(false);
    }
  };

  // --- CAMBIO CLAVE: Búsqueda automática por DESCRIPCIÓN ---
  useEffect(() => {
    if (partidas.length > 0 && !busquedaAutomatica && resultados.length === 0) {
      // Tomamos la descripción del primer bien agregado
      const primeraDescripcion = partidas[0].descripcion;
      if (primeraDescripcion) {
        setBusquedaAutomatica(true);
        setBusquedaAbierta(true);
        // Iniciamos la búsqueda con la descripción
        buscarEnCompranet(primeraDescripcion);
      }
    }
  }, [partidas]);

  const importarRegistro = (registro: any) => {
    const nuevaFuente: FuenteCompranet = {
      numero_procedimiento: registro.numero_procedimiento || registro.NUMERO_PROCEDIMIENTO || '',
      institucion: registro.institucion || registro.DEPENDENCIA || '',
      titulo_expediente: registro.titulo_expediente || registro.TITULO_EXPEDIENTE || '',
      fundamento_legal: registro.fundamento_legal || registro.FUNDAMENTO_LEGAL || '',
      tipo_contratacion: registro.tipo_contratacion || registro.TIPO_PROCEDIMIENTO || '',
      numero_contrato: registro.numero_contrato || registro.NUMERO_CONTRATO || registro.codigo_contrato || '',
      titulo_contrato: registro.titulo_contrato || registro.TITULO_CONTRATO || '',
      descripcion: registro.descripcion || registro.DESCRIPCION_EXPEDIENTE || registro.descripcion_contrato || '',
      rfc_proveedor: registro.rfc_proveedor || registro.PROVEEDOR_CONTRATISTA_RFC || '',
      nombre_proveedor: registro.nombre_proveedor || registro.PROVEEDOR_CONTRATISTA || registro.proveedor || '',
      folio_rop: registro.folio_rop || registro.FOLIO_ROP || '',
      url_anuncio: registro.url_anuncio || registro.URL_COMPRANET || '',
      fecha_fallo_firma: registro.fecha_fallo_firma || registro.FECHA_FALLO || registro.fecha_inicio || '',
      precio_unitario: parseFloat(registro.precio_unitario || registro.IMPORTE_CONTRATO || 0),
    };
    
    onChange([...fuentes, nuevaFuente]);
    toast.success('Registro importado exitosamente');
    setBusquedaAbierta(false); // Cerramos el modal al importar
  };

  const actualizarFuente = (index: number, campo: keyof FuenteCompranet, valor: string) => {
    const nuevasFuentes = [...fuentes];
    nuevasFuentes[index] = { ...nuevasFuentes[index], [campo]: valor };
    onChange(nuevasFuentes);
  };

  const eliminarFuente = (index: number) => {
    onChange(fuentes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {partidas.length > 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <FileSearch className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Bienes a investigar: <strong>{descripcionesList}</strong>
          </AlertDescription>
        </Alert>
      )}
      
      <Dialog open={busquedaAbierta} onOpenChange={setBusquedaAbierta}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full border-dashed border-2 hover:border-solid">
            <Search className="mr-2 h-4 w-4" />
            Buscar Contratos Similares en CompraNet
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Contratos (CompraNet)</DialogTitle>
            <DialogDescription>
              Busque bienes similares por descripción para encontrar precios de referencia históricos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-2 my-4">
            <Input
              placeholder="Ej: Servicio de limpieza, Laptop i7, Papel bond..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarEnCompranet()}
              className="flex-1"
            />
            <Button onClick={() => buscarEnCompranet()} disabled={cargando}>
              {cargando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </>
              )}
            </Button>
          </div>
          
          {/* BOTONES DE BÚSQUEDA RÁPIDA POR DESCRIPCIÓN */}
          {partidas.length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="text-sm text-muted-foreground self-center mr-2">Sugerencias:</span>
              {partidas.map((partida, idx) => (
                <Button
                  key={idx}
                  variant="secondary"
                  size="sm"
                  className="text-xs max-w-[200px] truncate"
                  title={partida.descripcion} // Tooltip con nombre completo
                  onClick={() => buscarEnCompranet(partida.descripcion)}
                >
                  Buscar: {partida.descripcion}
                </Button>
              ))}
            </div>
          )}

          {resultados.length > 0 ? (
            <div className="mt-4 border rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Descripción del Contrato</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultados.map((registro, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/50">
                      <TableCell className="font-medium text-xs max-w-[150px] truncate">
                        {registro.nombre_proveedor || registro.PROVEEDOR_CONTRATISTA || 'N/A'}
                      </TableCell>
                      <TableCell className="text-xs max-w-[350px]">
                        <p className="line-clamp-2" title={registro.descripcion || registro.DESCRIPCION_EXPEDIENTE}>
                          {registro.descripcion || registro.DESCRIPCION_EXPEDIENTE || registro.titulo_contrato || 'N/A'}
                        </p>
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold text-green-700">
                        ${Number(registro.precio_unitario || registro.IMPORTE_CONTRATO || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {registro.fecha_inicio || registro.FECHA_FALLO || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={() => importarRegistro(registro)}
                        >
                          Usar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            !cargando && (
              <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-md border border-dashed">
                <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>Ingrese una descripción para buscar contratos históricos similares.</p>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* TARJETAS DE FUENTES YA AGREGADAS */}
      {fuentes.map((fuente, index) => (
        <Card key={index} className="relative border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="pb-3 bg-slate-50/50 border-b">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-bold uppercase text-slate-700">
                Fuente Compranet #{index + 1}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => eliminarFuente(index)} className="h-6 w-6 text-red-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            
            {/* CAMPOS DEL FORMULARIO (Igual que antes pero más compactos) */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Número de Procedimiento</Label>
              <Input value={fuente.numero_procedimiento} onChange={(e) => actualizarFuente(index, 'numero_procedimiento', e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Institución</Label>
              <Input value={fuente.institucion} onChange={(e) => actualizarFuente(index, 'institucion', e.target.value)} className="h-8 text-sm" />
            </div>
            
            <div className="md:col-span-2 space-y-1">
              <Label className="text-xs text-muted-foreground">Descripción del Contrato</Label>
              <Input value={fuente.descripcion} onChange={(e) => actualizarFuente(index, 'descripcion', e.target.value)} className="h-8 text-sm bg-slate-50" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Proveedor</Label>
              <Input value={fuente.nombre_proveedor} onChange={(e) => actualizarFuente(index, 'nombre_proveedor', e.target.value)} className="h-8 text-sm font-medium" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Precio Unitario (Referencia)</Label>
              <Input 
                type="number" 
                value={fuente.precio_unitario || ''} 
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const nuevas = [...fuentes];
                  nuevas[index] = { ...nuevas[index], precio_unitario: isNaN(val) ? 0 : val };
                  onChange(nuevas);
                }} 
                className="h-8 text-sm font-bold text-green-700" 
              />
            </div>

            {/* Resto de campos ocultos en un acordeón o simplificados si no son críticos, 
                pero los mantengo aquí para integridad de datos */}
            <div className="hidden">
               {/* Aquí se guardan los datos que no se editan visualmente pero se necesitan para el formato */}
               <Input value={fuente.numero_contrato} readOnly />
               <Input value={fuente.fecha_fallo_firma} readOnly />
            </div>

          </CardContent>
        </Card>
      ))}

      <Button onClick={agregarFuente} variant="ghost" className="w-full border-dashed border-2 py-6 text-muted-foreground hover:text-primary">
        <Plus className="h-4 w-4 mr-2" />
        Agregar Manualmente
      </Button>
    </div>
  );
};

export default Fuente1Compranet;