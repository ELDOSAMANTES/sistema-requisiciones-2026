import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, FileText, Download } from "lucide-react";
import { Partida } from '@/types/requisicion';
import { DocumentoGenerado } from '@/lib/foconGenerators';

interface Paso3Props {
  partidas: Partida[];
  setPartidas: (partidas: Partida[]) => void;
  calcularSubtotal: () => number;
  calcularIVA: () => number;
  calcularTotal: () => number;
  guardarBorrador: () => void;
  setPaso: (paso: number) => void;
  oficioAutorizacion: string;
  documentosGenerados: DocumentoGenerado[];
}

const Paso3_DetalleBienes: React.FC<Paso3Props> = ({
  partidas,
  setPartidas,
  calcularSubtotal,
  calcularIVA,
  calcularTotal,
  guardarBorrador,
  setPaso,
  oficioAutorizacion,
  documentosGenerados,
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
  const actualizarPartida = (index: number, campo: keyof Partida, valor: any) => {
    // Validación especial para precio_unitario
    if (campo === 'precio_unitario') {
      const precio = parseFloat(valor) || 0;
      const precioEstimado = partidas[index].precio_estimado || 0;
      
      // El precio no puede ser mayor que el precio estimado
      if (precio > precioEstimado) {
        return; // No actualiza si el precio es mayor
      }
    }
    
    const nuevasPartidas = [...partidas];
    nuevasPartidas[index] = { ...nuevasPartidas[index], [campo]: valor };
    setPartidas(nuevasPartidas);
  };

  const eliminarPartida = (index: number) => {
    const nuevasPartidas = partidas.filter((_, i) => i !== index);
    setPartidas(nuevasPartidas);
  };

  return (
    <Card>
      <CardHeader className="border-b border-border bg-muted/30">
        <CardTitle className="text-2xl text-primary">Paso 3: Detalle de Bienes y Servicios</CardTitle>
        <CardDescription>Formato FO-CON-03 (Parte 2) - Especifica las partidas a adquirir</CardDescription>
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-semibold text-foreground">
            No. de Oficio de Autorización Presupuestal: <span className="font-normal">{oficioAutorizacion}</span>
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No.</TableHead>
                <TableHead className="w-28">CUCOP</TableHead>
                <TableHead className="min-w-[200px]">Descripción Detallada</TableHead>
                <TableHead className="w-24">Cantidad</TableHead>
                <TableHead className="w-24">Unidad</TableHead>
                {/* COLUMNA 1: Precio Estimado (NO EDITABLE) */}
                <TableHead className="w-32 text-muted-foreground">P. Unit. Est. (Ref)</TableHead>
                {/* COLUMNA 2: Precio Unitario (EDITABLE) */}
                <TableHead className="w-32">Precio Unitario</TableHead>
                <TableHead className="w-32">Importe</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partidas.map((partida, index) => {
                // El importe se calcula sobre el PRECIO UNITARIO (el editable)
                const importe = (partida.cantidad || 0) * (partida.precio_unitario || 0);
                
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    
                    {/* CUCOP (No editable según tu código original) */}
                    <TableCell>
                      <Input
                        value={partida.cucop}
                        onChange={(e) => actualizarPartida(index, 'cucop', e.target.value)}
                        placeholder="CUCOP"
                        disabled
                        className="bg-muted"
                      />
                    </TableCell>
                    
                    {/* Descripción */}
                    <TableCell>
                      <Textarea
                        value={partida.descripcion}
                        onChange={(e) => actualizarPartida(index, 'descripcion', e.target.value)}
                        placeholder="Descripción técnica detallada"
                        className="min-h-[60px]"
                      />
                    </TableCell>
                    
                    {/* Cantidad */}
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={partida.cantidad}
                        onChange={(e) => actualizarPartida(index, 'cantidad', parseFloat(e.target.value) || 0)}
                      />
                    </TableCell>
                    
                    {/* Unidad */}
                    <TableCell>
                      <Input
                        value={partida.unidad}
                        onChange={(e) => actualizarPartida(index, 'unidad', e.target.value)}
                        placeholder="Unidad"
                      />
                    </TableCell>

                    {/* Precio Estimado de Referencia (NO EDITABLE) */}
                    <TableCell>
                      <Input
                        type="number"
                        value={partida.precio_estimado || ''} 
                        placeholder="$0.00"
                        disabled
                        className="bg-muted/50 text-muted-foreground border-dashed"
                      />
                    </TableCell>

                    {/* --- CAMBIO AQUÍ: COLUMNA EDITABLE --- */}
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={partida.precio_unitario}
                        onChange={(e) => actualizarPartida(index, 'precio_unitario', parseFloat(e.target.value) || 0)}
                        placeholder="$0.00"
                        className="font-semibold"
                      />
                    </TableCell>

                    {/* Importe Calculado */}
                    <TableCell className="font-semibold">
                      ${importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    
                    {/* Botón Eliminar */}
                    <TableCell>
                      {partidas.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => eliminarPartida(index)}
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Sección de Totales */}
          <div className="border-t pt-4 mt-6">
            <div className="flex justify-end">
              <div className="w-80 space-y-2 bg-muted/20 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">${calcularSubtotal().toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA (16%):</span>
                  <span className="font-medium">${calcularIVA().toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2 border-primary/20">
                  <span>Total:</span>
                  <span className="text-primary">${calcularTotal().toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

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

        {/* Botones de Acción */}
        <div className="flex justify-between pt-6 border-t mt-6">
          <Button variant="outline" onClick={() => setPaso(2)}>
            Regresar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={guardarBorrador}>
              Guardar Borrador
            </Button>
            <Button onClick={() => setPaso(4)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Continuar a Investigación de Mercado
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Paso3_DetalleBienes;