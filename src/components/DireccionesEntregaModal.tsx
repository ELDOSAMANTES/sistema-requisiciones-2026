import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Plus, Trash2, ExternalLink } from "lucide-react";

export interface DireccionEntrega {
  id: string;
  direccion: string;
  linkGoogleMaps?: string;
}

interface DireccionesEntregaModalProps {
  direcciones: DireccionEntrega[];
  onGuardarDirecciones: (direcciones: DireccionEntrega[]) => void;
}

export const DireccionesEntregaModal: React.FC<DireccionesEntregaModalProps> = ({
  direcciones,
  onGuardarDirecciones,
}) => {
  const [open, setOpen] = useState(false);
  const [direccionesTemp, setDireccionesTemp] = useState<DireccionEntrega[]>(direcciones.length > 0 ? direcciones : []);
  const [nuevaDireccion, setNuevaDireccion] = useState({ direccion: '', linkGoogleMaps: '' });

  const agregarDireccion = () => {
    if (!nuevaDireccion.direccion.trim()) return;
    
    const nueva: DireccionEntrega = {
      id: Date.now().toString(),
      direccion: nuevaDireccion.direccion,
      linkGoogleMaps: nuevaDireccion.linkGoogleMaps || undefined,
    };
    
    setDireccionesTemp([...direccionesTemp, nueva]);
    setNuevaDireccion({ direccion: '', linkGoogleMaps: '' });
  };

  const eliminarDireccion = (id: string) => {
    setDireccionesTemp(direccionesTemp.filter(d => d.id !== id));
  };

  const guardarYCerrar = () => {
    onGuardarDirecciones(direccionesTemp);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <MapPin className="h-4 w-4 mr-2" />
          {direcciones.length === 0 ? 'Agregar lugar(es) de entrega' : `${direcciones.length} dirección(es) configurada(s)`}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lugares de Entrega</DialogTitle>
          <DialogDescription>
            Agrega una o más direcciones de entrega. Opcionalmente puedes incluir un link de Google Maps.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Lista de direcciones existentes */}
          {direccionesTemp.length > 0 && (
            <div className="space-y-3">
              <Label>Direcciones guardadas</Label>
              {direccionesTemp.map((dir) => (
                <div key={dir.id} className="flex gap-2 p-3 border rounded-md bg-muted/30">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{dir.direccion}</p>
                    {dir.linkGoogleMaps && (
                      <a 
                        href={dir.linkGoogleMaps} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Ver en Google Maps
                      </a>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => eliminarDireccion(dir.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Formulario para agregar nueva dirección */}
          <div className="space-y-4 border-t pt-4">
            <Label>Agregar nueva dirección</Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="direccion">Dirección completa *</Label>
                <Textarea
                  id="direccion"
                  placeholder="Ej: Calle Principal #123, Col. Centro, C.P. 12345, Ciudad de México"
                  value={nuevaDireccion.direccion}
                  onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, direccion: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="googleMaps">Link de Google Maps (opcional)</Label>
                <Input
                  id="googleMaps"
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={nuevaDireccion.linkGoogleMaps}
                  onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, linkGoogleMaps: e.target.value })}
                />
              </div>
              <Button 
                type="button" 
                onClick={agregarDireccion}
                disabled={!nuevaDireccion.direccion.trim()}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Dirección
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={guardarYCerrar} disabled={direccionesTemp.length === 0}>
            Guardar {direccionesTemp.length > 0 && `(${direccionesTemp.length})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
