import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export default function EditarRequisicion() {
  const { folio } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estado del formulario
  const [formData, setFormData] = useState({
    area: "Dirección de Recursos Materiales",
    solicitante: "María González López",
    tipo: "Adjudicación Directa",
    programa: "Programa de Modernización Administrativa",
    justificacion: "Se requieren estos bienes para el correcto funcionamiento de las oficinas administrativas...",
    items: [
      {
        id: 1,
        partida: 1,
        cucop: "44101600",
        descripcion: "Computadora de escritorio HP Core i5, 8GB RAM",
        cantidad: 10,
        unidad: "Pieza",
        precioUnitario: 12000,
      },
      {
        id: 2,
        partida: 2,
        cucop: "44101700",
        descripcion: "Monitor LED 24 pulgadas Full HD",
        cantidad: 10,
        unidad: "Pieza",
        precioUnitario: 3500,
      },
    ],
  });

  const calcularImporte = (cantidad: number, precio: number) => cantidad * precio;

  const calcularSubtotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + calcularImporte(item.cantidad, item.precioUnitario),
      0
    );
  };

  const calcularIVA = () => calcularSubtotal() * 0.16;
  const calcularTotal = () => calcularSubtotal() + calcularIVA();

  const handleItemChange = (id: number, field: string, value: any) => {
    setFormData({
      ...formData,
      items: formData.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const agregarItem = () => {
    const newId = Math.max(...formData.items.map((i) => i.id)) + 1;
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          id: newId,
          partida: formData.items.length + 1,
          cucop: "",
          descripcion: "",
          cantidad: 1,
          unidad: "Pieza",
          precioUnitario: 0,
        },
      ],
    });
  };

  const eliminarItem = (id: number) => {
    if (formData.items.length <= 1) {
      toast({
        title: "Error",
        description: "Debe haber al menos una partida en la requisición",
        variant: "destructive",
      });
      return;
    }
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.id !== id),
    });
  };

  const handleGuardar = () => {
    toast({
      title: "Requisición actualizada",
      description: `La requisición ${folio} ha sido actualizada exitosamente`,
    });
    navigate(`/requisiciones/${folio}`);
  };

  const handleCancelar = () => {
    navigate(`/requisiciones/${folio}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/requisiciones/${folio}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Editar Requisición
            </h1>
            <p className="text-muted-foreground mt-1">Folio: {folio}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancelar}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleGuardar}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Datos Generales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area">Área Solicitante</Label>
              <Input
                id="area"
                value={formData.area}
                onChange={(e) =>
                  setFormData({ ...formData, area: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="solicitante">Solicitante</Label>
              <Input
                id="solicitante"
                value={formData.solicitante}
                onChange={(e) =>
                  setFormData({ ...formData, solicitante: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Contratación</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adjudicación Directa">
                    Adjudicación Directa
                  </SelectItem>
                  <SelectItem value="Invitación a cuando menos tres personas">
                    Invitación a cuando menos tres personas
                  </SelectItem>
                  <SelectItem value="Licitación Pública">
                    Licitación Pública
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="programa">Programa/Proyecto</Label>
              <Input
                id="programa"
                value={formData.programa}
                onChange={(e) =>
                  setFormData({ ...formData, programa: e.target.value })
                }
              />
            </div>
          </div>

          {/* Justificación */}
          <div className="space-y-2">
            <Label htmlFor="justificacion">Justificación de la Compra</Label>
            <Textarea
              id="justificacion"
              value={formData.justificacion}
              onChange={(e) =>
                setFormData({ ...formData, justificacion: e.target.value })
              }
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detalle de Partidas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Detalle de Bienes y Servicios</CardTitle>
          <Button size="sm" onClick={agregarItem}>
            Agregar Partida
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Partida</TableHead>
                <TableHead className="w-[120px]">CUCOP</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-[100px]">Cantidad</TableHead>
                <TableHead className="w-[100px]">Unidad</TableHead>
                <TableHead className="w-[120px]">Precio Unit.</TableHead>
                <TableHead className="w-[120px]">Importe</TableHead>
                <TableHead className="w-[80px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.partida}</TableCell>
                  <TableCell>
                    <Input
                      value={item.cucop}
                      onChange={(e) =>
                        handleItemChange(item.id, "cucop", e.target.value)
                      }
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.descripcion}
                      onChange={(e) =>
                        handleItemChange(item.id, "descripcion", e.target.value)
                      }
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.cantidad}
                      onChange={(e) =>
                        handleItemChange(
                          item.id,
                          "cantidad",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.unidad}
                      onChange={(e) =>
                        handleItemChange(item.id, "unidad", e.target.value)
                      }
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.precioUnitario}
                      onChange={(e) =>
                        handleItemChange(
                          item.id,
                          "precioUnitario",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(
                      calcularImporte(item.cantidad, item.precioUnitario)
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarItem(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totales */}
          <div className="mt-6 flex justify-end">
            <div className="w-96 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">
                  {formatCurrency(calcularSubtotal())}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (16%):</span>
                <span className="font-medium">
                  {formatCurrency(calcularIVA())}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-primary">
                  {formatCurrency(calcularTotal())}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
