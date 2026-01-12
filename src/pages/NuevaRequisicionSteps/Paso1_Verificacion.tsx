import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Partida } from '@/types/requisicion';
import { cucopService, Capitulo, Generica, Especifica, Producto } from '@/services/cucopService';
import { Plus, Trash2, Loader2, Check, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  partidas: Partida[];
  setPartidas: (partidas: Partida[]) => void;
  folio: string;
  setPaso: (paso: number) => void;
  guardarBorrador: () => void;
}

export default function Paso1_Verificacion({
  partidas,
  setPartidas,
  folio,
  setPaso,
  guardarBorrador
}: Props) {
  const { toast } = useToast();
  
  // --- ESTADOS DE DATOS ---
  const [capitulos, setCapitulos] = useState<Capitulo[]>([]);
  const [genericas, setGenericas] = useState<Generica[]>([]);
  const [especificas, setEspecificas] = useState<Especifica[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  // --- ESTADOS DE SELECCIÓN ---
  const [selectedCapitulo, setSelectedCapitulo] = useState('');
  const [selectedGenerica, setSelectedGenerica] = useState('');
  
  // ESTE ES EL DATO CLAVE QUE QUEREMOS GUARDAR:
  const [selectedEspecifica, setSelectedEspecifica] = useState(''); 

  // --- ESTADOS DE UI ---
  const [isLoadingCapitulos, setIsLoadingCapitulos] = useState(false);
  const [isLoadingGenericas, setIsLoadingGenericas] = useState(false);
  const [isLoadingEspecificas, setIsLoadingEspecificas] = useState(false);
  const [isLoadingProductos, setIsLoadingProductos] = useState(false);

  // --- SELECCIÓN Y AGREGADO ---
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [busquedaFiltro, setBusquedaFiltro] = useState('');

  // 1. CARGA INICIAL
  useEffect(() => {
    const loadCapitulos = async () => {
      setIsLoadingCapitulos(true);
      try {
        const data = await cucopService.getCapitulos();
        setCapitulos(data);
      } catch (error) {
        console.error('Error cargando capítulos:', error);
        toast({ title: 'Error de conexión', description: 'No se pudieron cargar los catálogos.', variant: 'destructive' });
      } finally {
        setIsLoadingCapitulos(false);
      }
    };
    loadCapitulos();
  }, []);

  // 2. CAMBIO CAPÍTULO
  const handleCapituloChange = async (capituloId: string) => {
    setSelectedCapitulo(capituloId);
    setGenericas([]); setSelectedGenerica('');
    setEspecificas([]); setSelectedEspecifica('');
    setProductos([]); setProductoSeleccionado(null);

    if (!capituloId) return;

    setIsLoadingGenericas(true);
    try {
      const data = await cucopService.getGenericas(Number(capituloId));
      setGenericas(data);
    } catch (error) { console.error(error); } finally { setIsLoadingGenericas(false); }
  };

  // 3. CAMBIO GENÉRICA
  const handleGenericaChange = async (genericaId: string) => {
    setSelectedGenerica(genericaId);
    setEspecificas([]); setSelectedEspecifica('');
    setProductos([]); setProductoSeleccionado(null);

    if (!genericaId) return;

    setIsLoadingEspecificas(true);
    try {
      const data = await cucopService.getEspecificas(Number(genericaId));
      setEspecificas(data);
    } catch (error) { console.error(error); } finally { setIsLoadingEspecificas(false); }
  };

  // 4. CAMBIO ESPECÍFICA
  const handleEspecificaChange = async (especificaId: string) => {
    setSelectedEspecifica(especificaId); // <--- Aquí guardamos el ID (ej: "21101")
    setProductos([]); setProductoSeleccionado(null);

    if (!especificaId) return;

    setIsLoadingProductos(true);
    try {
      const data = await cucopService.getProductos(especificaId);
      setProductos(data);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'No se pudieron cargar los productos.', variant: 'destructive' });
    } finally {
      setIsLoadingProductos(false);
    }
  };

  // FILTRO
  const productosMostrados = productos.filter(p => {
    if (!busquedaFiltro) return true;
    const term = busquedaFiltro.toLowerCase();
    return p.clave_cucop_plus.toLowerCase().includes(term) || p.descripcion.toLowerCase().includes(term);
  });

  const handleSeleccionarProducto = (p: Producto) => {
    setProductoSeleccionado(p);
    setCantidad(1);
  };

  // --- AQUÍ OCURRE EL CAMBIO IMPORTANTE ---
  const handleAgregarBien = () => {
    if (!productoSeleccionado) {
      toast({ title: 'Atención', description: 'Seleccione un bien de la lista.', variant: 'destructive' });
      return;
    }
    if (cantidad <= 0) {
      toast({ title: 'Cantidad inválida', variant: 'destructive' });
      return;
    }
    
    const nuevaPartida: Partida = {
      cucop: productoSeleccionado.clave_cucop_plus,
      descripcion: productoSeleccionado.descripcion,
      unidad: productoSeleccionado.unidad,
      cantidad: cantidad,
      precio_unitario: 0,
      precio_estimado: productoSeleccionado.precio_estimado,
      // AGREGAMOS LA PARTIDA ESPECÍFICA QUE ESTÁ SELECCIONADA EN EL DROPDOWN
      partida_especifica: selectedEspecifica 
    };
    
    setPartidas([...partidas, nuevaPartida]);
    setProductoSeleccionado(null);
    setCantidad(1);
    toast({ title: 'Bien agregado', className: "bg-[#9D2449] text-white" });
  };

  const handleEliminarBien = (index: number) => {
    const nuevas = partidas.filter((_, i) => i !== index);
    setPartidas(nuevas);
  };

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm border-t-4 border-t-[#D4C19C]">
        <CardHeader className="pb-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-[#333333]">
                Verificación de existencia de bienes
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">Consulte el Catálogo Único (CUCOP) para agregar bienes.</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-gray-500 tracking-wider">FOLIO</span>
              <p className="text-lg font-mono font-bold text-[#9D2449]">{folio}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          
          {/* FILTROS DE BÚSQUEDA */}
          <div className="bg-gray-50 p-4 border rounded-md">
            <h3 className="text-sm font-semibold text-[#333333] mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Filtros de búsqueda
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              
              <div className="md:col-span-4 space-y-1">
                <Label className="text-xs font-medium text-gray-600">Capítulo</Label>
                <Select value={selectedCapitulo} onValueChange={handleCapituloChange} disabled={isLoadingCapitulos}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {capitulos.map((c) => (
                      <SelectItem key={c.id_capitulo} value={String(c.id_capitulo)}>
                        {c.id_capitulo} - {c.descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-4 space-y-1">
                <Label className="text-xs font-medium text-gray-600">Partida Genérica</Label>
                <Select value={selectedGenerica} onValueChange={handleGenericaChange} disabled={!selectedCapitulo || isLoadingGenericas}>
                  <SelectTrigger className="bg-white border-gray-300">
                    {isLoadingGenericas ? <span className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin"/> Cargando...</span> : <SelectValue placeholder="Seleccione..." />}
                  </SelectTrigger>
                  <SelectContent>
                    {genericas.map((g) => (
                      <SelectItem key={g.id_generica} value={String(g.id_generica)}>
                        {g.id_generica} - {g.descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-4 space-y-1">
                <Label className="text-xs font-medium text-gray-600">Partida Específica</Label>
                <Select value={selectedEspecifica} onValueChange={handleEspecificaChange} disabled={!selectedGenerica || isLoadingEspecificas}>
                  <SelectTrigger className="bg-white border-gray-300">
                    {isLoadingEspecificas ? <span className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin"/> Cargando...</span> : <SelectValue placeholder="Seleccione..." />}
                  </SelectTrigger>
                  <SelectContent>
                    {especificas.map((e) => (
                      <SelectItem key={e.id_especifica} value={e.id_especifica}>
                        {e.id_especifica} - {e.descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* TABLA DE RESULTADOS Y SELECCIÓN */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* IZQUIERDA: TABLA */}
            <div className="md:col-span-8 space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-gray-600">Resultados disponibles</Label>
                <Input 
                  className="w-64 h-8 text-xs border-gray-300" 
                  placeholder="Filtrar por descripción..." 
                  value={busquedaFiltro} 
                  onChange={(e) => setBusquedaFiltro(e.target.value)} 
                  disabled={!selectedEspecifica}
                />
              </div>
              
              <div className="border rounded-md h-[350px] bg-white relative">
                <ScrollArea className="h-full w-full">
                  <Table>
                    <TableHeader className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                      <TableRow className="hover:bg-gray-100">
                        <TableHead className="w-[50px] text-center text-xs font-bold text-gray-700">Sel.</TableHead>
                        <TableHead className="w-[100px] text-xs font-bold text-gray-700">Clave</TableHead>
                        <TableHead className="text-xs font-bold text-gray-700">Descripción del bien</TableHead>
                        <TableHead className="w-[80px] text-xs font-bold text-gray-700">Unidad</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!selectedEspecifica ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-xs text-gray-500">
                            Seleccione una partida específica para ver resultados.
                          </TableCell>
                        </TableRow>
                      ) : isLoadingProductos ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#9D2449]"/>
                          </TableCell>
                        </TableRow>
                      ) : productosMostrados.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-xs text-gray-500">
                            No se encontraron registros.
                          </TableCell>
                        </TableRow>
                      ) : (
                        productosMostrados.map((p) => (
                          <TableRow 
                            key={p.id} 
                            className={`cursor-pointer transition-colors border-b hover:bg-gray-50 ${productoSeleccionado?.id === p.id ? 'bg-[#F3E5E9] border-l-4 border-l-[#9D2449]' : ''}`}
                            onClick={() => handleSeleccionarProducto(p)}
                          >
                            <TableCell className="text-center py-2">
                              {productoSeleccionado?.id === p.id && <Check className="h-4 w-4 text-[#9D2449] mx-auto" />}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-gray-600 py-2">{p.clave_cucop_plus}</TableCell>
                            <TableCell className="text-xs text-gray-700 py-2">{p.descripcion}</TableCell>
                            <TableCell className="text-xs text-gray-600 py-2">{p.unidad}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>

            {/* DERECHA: DETALLE */}
            <div className="md:col-span-4 space-y-4">
              <div className="bg-gray-50 border rounded-md p-4 h-full flex flex-col">
                <h4 className="text-sm font-bold text-[#9D2449] border-b pb-2 mb-3">
                  Detalle del bien
                </h4>
                
                {productoSeleccionado ? (
                  <div className="space-y-4 flex-1">
                    <div>
                      <Label className="text-[10px] text-gray-500 uppercase font-bold">Clave CUCOP</Label>
                      <p className="text-sm font-mono font-medium">{productoSeleccionado.clave_cucop_plus}</p>
                    </div>
                    {/* MOSTRAMOS LA PARTIDA SELECCIONADA AQUÍ TAMBIÉN PARA CONFIRMAR */}
                    <div>
                        <Label className="text-[10px] text-gray-500 uppercase font-bold">Partida Específica</Label>
                        <p className="text-sm font-mono font-bold text-gray-700">{selectedEspecifica}</p>
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-500 uppercase font-bold">Descripción</Label>
                      <p className="text-xs font-medium text-gray-800 leading-relaxed">
                        {productoSeleccionado.descripcion}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px] text-gray-500 uppercase font-bold">Unidad</Label>
                        <p className="text-xs font-medium">{productoSeleccionado.unidad}</p>
                      </div>
                      <div>
                        <Label className="text-[10px] text-gray-500 uppercase font-bold">Precio Ref.</Label>
                        <p className="text-xs font-medium">${Number(productoSeleccionado.precio_estimado).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-auto">
                      <Label className="text-xs font-bold text-gray-700">Cantidad a solicitar</Label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          type="number" 
                          className="border-gray-300 focus:ring-[#9D2449]"
                          value={cantidad} 
                          onChange={(e) => setCantidad(parseInt(e.target.value) || 1)} 
                          min="1" 
                        />
                        <Button 
                          onClick={handleAgregarBien} 
                          className="bg-[#9D2449] hover:bg-[#7c1c38] text-white w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Agregar
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center space-y-2">
                    <FileText className="h-8 w-8 opacity-20" />
                    <p className="text-xs">Seleccione un bien de la tabla para ver detalles y agregarlo.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TABLA INFERIOR */}
          <div className="pt-4">
            <h3 className="text-sm font-bold text-[#333333] mb-2 border-b pb-1">
              Partidas agregadas a la solicitud
            </h3>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-[#EAEAEA]">
                  <TableRow>
                    {/* AGREGUÉ COLUMNA VISUAL PARA QUE VEAS QUE SÍ SE GUARDA */}
                    <TableHead className="text-xs font-bold text-gray-700">Partida</TableHead> 
                    <TableHead className="text-xs font-bold text-gray-700">Clave</TableHead>
                    <TableHead className="text-xs font-bold text-gray-700">Descripción</TableHead>
                    <TableHead className="text-xs font-bold text-gray-700">Unidad</TableHead>
                    <TableHead className="text-right text-xs font-bold text-gray-700">Cant.</TableHead>
                    <TableHead className="text-right text-xs font-bold text-gray-700">P. Unit (Ref)</TableHead>
                    <TableHead className="text-right text-xs font-bold text-gray-700">Importe</TableHead>
                    <TableHead className="text-center text-xs font-bold text-gray-700">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partidas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-16 text-center text-xs text-gray-500">
                        No hay partidas agregadas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    partidas.map((p, i) => (
                      <TableRow key={i} className="hover:bg-gray-50">
                        {/* AQUI MOSTRAMOS LA PARTIDA ESPECIFICA GUARDADA */}
                        <TableCell className="text-xs font-bold">{p.partida_especifica || '-'}</TableCell> 
                        <TableCell className="font-mono text-xs">{p.cucop}</TableCell>
                        <TableCell className="text-xs">{p.descripcion}</TableCell>
                        <TableCell className="text-xs">{p.unidad}</TableCell>
                        <TableCell className="text-right text-xs font-bold">{p.cantidad}</TableCell>
                        <TableCell className="text-right text-xs text-gray-500">${Number(p.precio_estimado).toFixed(2)}</TableCell>
                        <TableCell className="text-right text-xs font-bold text-[#9D2449]">
                          ${(p.cantidad * Number(p.precio_estimado)).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEliminarBien(i)}
                            className="text-gray-500 hover:text-red-700 h-6 w-6"
                          >
                            <Trash2 className="h-3 w-3"/>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* BOTONERA */}
          <div className="flex justify-end pt-4 border-t gap-3">
            <Button variant="outline" onClick={guardarBorrador} className="border-[#9D2449] text-[#9D2449] hover:bg-[#F3E5E9]">
              Guardar borrador
            </Button>
            <Button 
              onClick={() => setPaso(2)} 
              disabled={partidas.length === 0}
              className="bg-[#13322B] hover:bg-[#0f2621] text-white px-6"
            >
              Continuar
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}