import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, Mail, CheckCircle } from "lucide-react";
import { ProveedorInvitado } from "@/types/requisicion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ProveedoresInvitadosProps {
  proveedores: ProveedorInvitado[];
  onProveedoresChange: (proveedores: ProveedorInvitado[]) => void;
}

const ProveedoresInvitados: React.FC<ProveedoresInvitadosProps> = ({ proveedores, onProveedoresChange }) => {
  const { toast } = useToast();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleSeleccionChange = (proveedorId: string, seleccionado: boolean) => {
    const updated = proveedores.map(p => 
      p.id === proveedorId ? { ...p, seleccionado } : p
    );
    onProveedoresChange(updated);
  };

  const handleEmailChange = (proveedorId: string, email: string) => {
    const updated = proveedores.map(p => 
      p.id === proveedorId ? { ...p, email } : p
    );
    onProveedoresChange(updated);
  };

  const handleTelefonoChange = (proveedorId: string, telefono: string) => {
    const updated = proveedores.map(p => 
      p.id === proveedorId ? { ...p, telefono } : p
    );
    onProveedoresChange(updated);
  };

  const enviarSolicitud = (proveedor: ProveedorInvitado) => {
    if (!proveedor.email) {
      toast({
        title: "Email requerido",
        description: "Debes ingresar un email antes de enviar la solicitud",
        variant: "destructive",
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(proveedor.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      });
      return;
    }

    // Construir mailto con asunto y cuerpo predefinidos
    const asunto = encodeURIComponent("Solicitud de Cotización - Requisición de Compra");
    const cuerpo = encodeURIComponent(`Estimado/a ${proveedor.nombre},

Por medio del presente, solicitamos su cotización para los bienes/servicios descritos en la requisición adjunta.

Por favor, envíenos su propuesta económica a la brevedad posible.

Atentamente,
[Tu Nombre]
[Tu Área]`);

    window.location.href = `mailto:${proveedor.email}?subject=${asunto}&body=${cuerpo}`;

    // Marcar como enviada
    const updated = proveedores.map(p => 
      p.id === proveedor.id ? { ...p, solicitud_enviada: true } : p
    );
    onProveedoresChange(updated);

    toast({
      title: "Solicitud enviada",
      description: `Se abrió tu cliente de correo para enviar la solicitud a ${proveedor.nombre}`,
    });
  };

  const handleFileSelect = (proveedorId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo (PDF, JPG, PNG)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Solo se permiten archivos PDF, JPG o PNG",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "El archivo no debe superar los 5MB",
        variant: "destructive",
      });
      return;
    }

    // Actualizar estado con el archivo
    const updated = proveedores.map(p => 
      p.id === proveedorId 
        ? { 
            ...p, 
            respuesta_subida: true, 
            archivo_propuesta: file,
            fecha_respuesta: new Date().toISOString().split('T')[0]
          } 
        : p
    );
    onProveedoresChange(updated);

    toast({
      title: "Propuesta cargada",
      description: `Archivo "${file.name}" cargado exitosamente`,
    });
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

  const getEstatusProveedor = (proveedor: ProveedorInvitado) => {
    if (!proveedor.solicitud_enviada) {
      return { label: 'Pendiente de invitar', color: 'bg-muted text-muted-foreground' };
    }
    if (proveedor.solicitud_enviada && !proveedor.respuesta_subida) {
      return { label: 'Esperando respuesta', color: 'bg-amber-100 text-amber-800' };
    }
    return { label: 'Cotización recibida', color: 'bg-green-100 text-green-800' };
  };

  if (proveedores.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No hay proveedores identificados aún. Agrega información en las fuentes de evidencia para poblar esta lista automáticamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {proveedores.filter(p => p.seleccionado).length} de {proveedores.length} proveedores seleccionados
        {proveedores.length < 3 && (
          <span className="ml-2 text-destructive font-medium">
            (Se requieren al menos 3 proveedores)
          </span>
        )}
      </div>

      <div className="space-y-3">
        {proveedores.map((proveedor) => {
          const estatus = getEstatusProveedor(proveedor);
          
          return (
            <Card key={proveedor.id} className={proveedor.seleccionado ? 'border-primary' : ''}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={proveedor.seleccionado}
                    onCheckedChange={(checked) => handleSeleccionChange(proveedor.id, checked as boolean)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold">{proveedor.nombre}</div>
                        {proveedor.descripcion && (
                          <p className="text-sm text-muted-foreground mt-1">{proveedor.descripcion}</p>
                        )}
                        {proveedor.rfc && (
                          <p className="text-sm text-muted-foreground">RFC: {proveedor.rfc}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className={`${getOrigenColor(proveedor.origen)} text-white border-0`}>
                          {getOrigenLabel(proveedor.origen)}
                        </Badge>
                        <Badge variant="outline" className={estatus.color}>
                          {estatus.label}
                        </Badge>
                      </div>
                    </div>

                    {proveedor.seleccionado && (
                      <div className="space-y-3 pt-2 border-t">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`email-${proveedor.id}`} className="text-xs">
                              Email <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id={`email-${proveedor.id}`}
                              type="email"
                              placeholder="correo@ejemplo.com"
                              value={proveedor.email}
                              onChange={(e) => handleEmailChange(proveedor.id, e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`telefono-${proveedor.id}`} className="text-xs">
                              Teléfono (opcional)
                            </Label>
                            <Input
                              id={`telefono-${proveedor.id}`}
                              type="tel"
                              placeholder="5512345678"
                              value={proveedor.telefono || ''}
                              onChange={(e) => handleTelefonoChange(proveedor.id, e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => enviarSolicitud(proveedor)}
                            disabled={proveedor.solicitud_enviada}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            {proveedor.solicitud_enviada ? 'Solicitud Enviada' : 'Enviar Solicitud'}
                          </Button>

                          {proveedor.solicitud_enviada && (
                            <>
                              <input
                                ref={el => fileInputRefs.current[proveedor.id] = el}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileSelect(proveedor.id, e)}
                                className="hidden"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRefs.current[proveedor.id]?.click()}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                {proveedor.respuesta_subida ? 'Cambiar Propuesta' : 'Subir Propuesta'}
                              </Button>
                            </>
                          )}

                          {proveedor.respuesta_subida && proveedor.archivo_propuesta && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <FileText className="h-4 w-4 mr-2" />
                                  Ver Archivo
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Propuesta de {proveedor.nombre}</DialogTitle>
                                  <DialogDescription>
                                    Archivo recibido el {proveedor.fecha_respuesta}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="p-4 border rounded-md bg-muted/30">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-8 w-8 text-primary" />
                                      <div className="flex-1">
                                        <p className="font-medium">{proveedor.archivo_propuesta.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {(proveedor.archivo_propuesta.size / 1024).toFixed(2)} KB
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    El archivo se encuentra almacenado en el navegador. Para una gestión completa de documentos, 
                                    considere implementar un sistema de almacenamiento en el backend.
                                  </p>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProveedoresInvitados;
