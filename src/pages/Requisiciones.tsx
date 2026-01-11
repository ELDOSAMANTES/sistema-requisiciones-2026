import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // <<< Importación clave para refrescar
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Loader2, ArrowRight } from "lucide-react";
import { UserInfoHeader } from "@/components/UserInfoHeader";
import requisicionService from "@/services/requisicionService";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function Requisiciones() {
  const navigate = useNavigate();
  const location = useLocation(); // Hook para forzar la recarga
  
  const [isLoading, setIsLoading] = useState(true);
  const [requisiciones, setRequisiciones] = useState<any[]>([]);
  const [totalRequisiciones, setTotalRequisiciones] = useState(0);
  const [filtroTexto, setFiltroTexto] = useState('');
  
  const [pagina, setPagina] = useState(1);
  const limite = 200; // Aumentado para mostrar todas las requisiciones

  useEffect(() => {
    // CARGA DE DATOS: location.pathname fuerza la recarga al volver de la creación
    cargarRequisiciones(); 
  }, [pagina, location.pathname]); // <<< DEPENDENCIA: Se recarga si la página o ruta cambian

  const cargarRequisiciones = async (buscar?: string) => {
    try {
      setIsLoading(true);
      const params = {
        limit: limite,
        page: pagina,
        ...(buscar && buscar.trim() !== '' && { buscar: buscar.trim() }) 
      };
      
      const respuesta = await requisicionService.listar(params);
      
      setRequisiciones(respuesta.data || []);
      setTotalRequisiciones(respuesta.count || 0);

    } catch (error) {
      console.error("Error cargando requisiciones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuscar = () => {
    setPagina(1); 
    cargarRequisiciones(filtroTexto);
  };

  const getStatusColor = (estatus: string) => {
    const s = estatus?.toLowerCase() || '';
    if (s.includes('aprobada') || s.includes('adjudicada')) return "bg-green-100 text-green-700 border-green-200";
    if (s.includes('rechazada') || s.includes('cancelada')) return "bg-red-100 text-red-700 border-red-200";
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl animate-fade-in">
      <UserInfoHeader />
      
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Mis Requisiciones</h1>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white transition-all"
          onClick={() => navigate("/requisiciones/nueva")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Requisición
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex w-full max-w-sm gap-2">
            <Input 
              placeholder="Buscar por folio, solicitante..." 
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
            />
            <Button onClick={handleBuscar} disabled={isLoading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filtros
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Folio</TableHead>
                  <TableHead>Estatus</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}><Skeleton className="h-6 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : requisiciones.length > 0 ? (
                  requisiciones.map((req) => (
                    <TableRow 
                      key={req.id} 
                      className="cursor-pointer hover:bg-gray-50/50"
                      // <<< CORRECCIÓN CRÍTICA: NAVEGAR USANDO req.id >>>
                      // Esto soluciona el error "invalid syntax for type integer: REQ-..."
                      onClick={() => navigate(`/requisiciones/${req.id}`)}
                    >
                      <TableCell className="font-semibold text-blue-700">{req.folio}</TableCell>
                      <TableCell>
                        <Badge className={`border ${getStatusColor(req.estatus)}`}>
                          {req.estatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{req.solicitanteNombre || 'N/A'}</TableCell>
                      <TableCell>{req.areaSolicitanteNombre || 'N/A'}</TableCell>
                      <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <ArrowRight className="h-4 w-4 inline text-gray-400 group-hover:text-primary" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      No hay requisiciones creadas o que coincidan con la búsqueda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
};