  import React from 'react';
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Plus, Trash2 } from "lucide-react";
  import { FuenteArchivoInterno } from "@/types/requisicion";

  interface Fuente2ArchivosInternosProps {
    fuentes: FuenteArchivoInterno[];
    onChange: (fuentes: FuenteArchivoInterno[]) => void;
  }

  const Fuente2ArchivosInternos: React.FC<Fuente2ArchivosInternosProps> = ({ fuentes, onChange }) => {
  const agregarFuente = () => {
    onChange([...fuentes, {
      numero_contrato_anterior: '',
      fecha_contrato: '',
      proveedor: '',
      descripcion_bien: '',
      precio_unitario: 0,
    }]);
  };

    const actualizarFuente = (index: number, campo: keyof FuenteArchivoInterno, valor: string) => {
      const nuevasFuentes = [...fuentes];
      nuevasFuentes[index] = { ...nuevasFuentes[index], [campo]: valor };
      onChange(nuevasFuentes);
    };

    const eliminarFuente = (index: number) => {
      onChange(fuentes.filter((_, i) => i !== index));
    };

    return (
      <div className="space-y-4">
        {fuentes.map((fuente, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Archivo/Contrato Interno #{index + 1}</CardTitle>
                {fuentes.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => eliminarFuente(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor={`numero_contrato_${index}`}>Número de Contrato Anterior *</Label>
                <Input
                  id={`numero_contrato_${index}`}
                  value={fuente.numero_contrato_anterior}
                  onChange={(e) => actualizarFuente(index, 'numero_contrato_anterior', e.target.value)}
                  placeholder="Ej: CONT-2023-001"
                />
              </div>
              <div>
                <Label htmlFor={`fecha_${index}`}>Fecha del Contrato *</Label>
                <Input
                  id={`fecha_${index}`}
                  type="date"
                  value={fuente.fecha_contrato}
                  onChange={(e) => actualizarFuente(index, 'fecha_contrato', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`proveedor_${index}`}>Proveedor *</Label>
                <Input
                  id={`proveedor_${index}`}
                  value={fuente.proveedor}
                  onChange={(e) => actualizarFuente(index, 'proveedor', e.target.value)}
                  placeholder="Nombre del proveedor"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor={`descripcion_${index}`}>Descripción del Bien *</Label>
                <Input
                  id={`descripcion_${index}`}
                  value={fuente.descripcion_bien}
                  onChange={(e) => actualizarFuente(index, 'descripcion_bien', e.target.value)}
                  placeholder="Descripción del bien o servicio contratado"
                />
              </div>
              <div>
                <Label htmlFor={`precio_${index}`}>Precio Unitario *</Label>
                <Input
                  id={`precio_${index}`}
                  type="number"
                  step="0.01"
                  value={fuente.precio_unitario}
                  onChange={(e) => actualizarFuente(index, 'precio_unitario', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </CardContent>
          </Card>
        ))}
        <Button onClick={agregarFuente} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Archivo Interno
        </Button>
      </div>
    );
  };

  export default Fuente2ArchivosInternos;
