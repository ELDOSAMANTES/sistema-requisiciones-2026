import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X } from "lucide-react";
import { FuenteInternet } from "@/types/requisicion";
import { Badge } from "@/components/ui/badge";

interface Fuente4InternetProps {
  fuentes: FuenteInternet[];
  onChange: (fuentes: FuenteInternet[]) => void;
}

const Fuente4Internet: React.FC<Fuente4InternetProps> = ({ fuentes, onChange }) => {
  const [tempProveedor, setTempProveedor] = React.useState<{ [key: number]: string }>({});

  const agregarFuente = () => {
    onChange([...fuentes, {
      termino_busqueda: '',
      url_pagina: '',
      proveedores_encontrados: [],
      descripcion_evidencia: '',
    }]);
  };

  const actualizarFuente = (index: number, campo: keyof FuenteInternet, valor: any) => {
    const nuevasFuentes = [...fuentes];
    nuevasFuentes[index] = { ...nuevasFuentes[index], [campo]: valor };
    onChange(nuevasFuentes);
  };

  const eliminarFuente = (index: number) => {
    onChange(fuentes.filter((_, i) => i !== index));
  };

  const agregarProveedor = (index: number) => {
    const proveedor = tempProveedor[index]?.trim();
    if (proveedor) {
      const nuevasFuentes = [...fuentes];
      nuevasFuentes[index] = {
        ...nuevasFuentes[index],
        proveedores_encontrados: [...nuevasFuentes[index].proveedores_encontrados, proveedor]
      };
      onChange(nuevasFuentes);
      setTempProveedor({ ...tempProveedor, [index]: '' });
    }
  };

  const eliminarProveedor = (indexFuente: number, indexProveedor: number) => {
    const nuevasFuentes = [...fuentes];
    nuevasFuentes[indexFuente] = {
      ...nuevasFuentes[indexFuente],
      proveedores_encontrados: nuevasFuentes[indexFuente].proveedores_encontrados.filter((_, i) => i !== indexProveedor)
    };
    onChange(nuevasFuentes);
  };

  return (
    <div className="space-y-4">
      {fuentes.map((fuente, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Búsqueda en Internet #{index + 1}</CardTitle>
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
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor={`termino_${index}`}>Término de Búsqueda *</Label>
              <Textarea
                id={`termino_${index}`}
                value={fuente.termino_busqueda}
                onChange={(e) => actualizarFuente(index, 'termino_busqueda', e.target.value)}
                placeholder="Ej: Compra de laptops Dell Latitude 5000 México precio 2024"
                rows={2}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Términos utilizados en Google, Amazon, Mercado Libre, etc.
              </p>
            </div>
            <div>
              <Label htmlFor={`url_${index}`}>URL de la Página *</Label>
              <Input
                id={`url_${index}`}
                value={fuente.url_pagina}
                onChange={(e) => actualizarFuente(index, 'url_pagina', e.target.value)}
                placeholder="https://www.ejemplo.com/producto"
              />
            </div>
            <div>
              <Label htmlFor={`descripcion_${index}`}>Descripción de Evidencia *</Label>
              <Textarea
                id={`descripcion_${index}`}
                value={fuente.descripcion_evidencia}
                onChange={(e) => actualizarFuente(index, 'descripcion_evidencia', e.target.value)}
                placeholder="Describe lo encontrado en esta búsqueda"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor={`proveedores_${index}`}>Proveedores Encontrados</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id={`proveedores_${index}`}
                  value={tempProveedor[index] || ''}
                  onChange={(e) => setTempProveedor({ ...tempProveedor, [index]: e.target.value })}
                  placeholder="Nombre del proveedor"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      agregarProveedor(index);
                    }
                  }}
                />
                <Button 
                  variant="outline" 
                  onClick={() => agregarProveedor(index)}
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {fuente.proveedores_encontrados.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {fuente.proveedores_encontrados.map((proveedor, pIndex) => (
                    <Badge key={pIndex} variant="secondary" className="gap-1">
                      {proveedor}
                      <button
                        onClick={() => eliminarProveedor(index, pIndex)}
                        className="ml-1 hover:bg-destructive/20 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      <Button onClick={agregarFuente} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Agregar Búsqueda en Internet
      </Button>
    </div>
  );
};

export default Fuente4Internet;
