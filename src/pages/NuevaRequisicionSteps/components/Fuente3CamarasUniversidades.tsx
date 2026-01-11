import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Upload } from "lucide-react";
import { FuenteCamaraUniversidad } from "@/types/requisicion";
import { useToast } from "@/hooks/use-toast";

interface Fuente3CamarasUniversidadesProps {
  fuentes: FuenteCamaraUniversidad[];
  onChange: (fuentes: FuenteCamaraUniversidad[]) => void;
}

const Fuente3CamarasUniversidades: React.FC<Fuente3CamarasUniversidadesProps> = ({ fuentes, onChange }) => {
  const { toast } = useToast();

  const agregarFuente = () => {
    onChange([...fuentes, {
      institucion: '',
      fecha_oficio: '',
      folio_oficio: '',
      respuesta_recibida: false,
      url_respuesta_oficio: '',
    }]);
  };

  const actualizarFuente = (index: number, campo: keyof FuenteCamaraUniversidad, valor: string) => {
    const nuevasFuentes = [...fuentes];
    nuevasFuentes[index] = { ...nuevasFuentes[index], [campo]: valor };
    onChange(nuevasFuentes);
  };

  const eliminarFuente = (index: number) => {
    onChange(fuentes.filter((_, i) => i !== index));
  };

  const handleFileUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // TODO: Implementar subida de archivos a Supabase Storage
      toast({
        title: "Archivo seleccionado",
        description: `${files[0].name} - Funcionalidad de almacenamiento pendiente`,
      });
    }
  };

  return (
    <div className="space-y-4">
      {fuentes.map((fuente, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Cámara/Universidad #{index + 1}</CardTitle>
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
              <Label htmlFor={`institucion_${index}`}>Nombre de la Institución *</Label>
              <Input
                id={`institucion_${index}`}
                value={fuente.institucion}
                onChange={(e) => actualizarFuente(index, 'institucion', e.target.value)}
                placeholder="Ej: CANACINTRA, UNAM, IPN"
              />
            </div>
            <div>
              <Label htmlFor={`fecha_oficio_${index}`}>Fecha del Oficio *</Label>
              <Input
                id={`fecha_oficio_${index}`}
                type="date"
                value={fuente.fecha_oficio}
                onChange={(e) => actualizarFuente(index, 'fecha_oficio', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`folio_${index}`}>Folio del Oficio *</Label>
              <Input
                id={`folio_${index}`}
                value={fuente.folio_oficio}
                onChange={(e) => actualizarFuente(index, 'folio_oficio', e.target.value)}
                placeholder="Ej: OF-2024-001"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor={`url_respuesta_${index}`}>URL Respuesta Oficio (opcional)</Label>
              <Input
                id={`url_respuesta_${index}`}
                value={fuente.url_respuesta_oficio || ''}
                onChange={(e) => actualizarFuente(index, 'url_respuesta_oficio', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>
      ))}
      <Button onClick={agregarFuente} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Agregar Cámara/Universidad
      </Button>
    </div>
  );
};

export default Fuente3CamarasUniversidades;
