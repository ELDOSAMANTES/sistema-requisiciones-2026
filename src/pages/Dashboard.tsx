import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Clock, 
  FileCheck, 
  FileX, 
  Plus, 
  Search, 
  ArrowRight,
  Filter,
  Layers,
  Megaphone,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserInfoHeader } from "@/components/UserInfoHeader";
import requisicionService from "@/services/requisicionService";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardMetrics {
  total: number;
  pendientes: number;
  aprobadas: number;
  rechazadas: number;
}

type TipoFiltro = 'total' | 'pendientes' | 'aprobadas' | 'rechazadas';

// Datos para el carrusel de enlaces externos
const externalLinks = [
  {
    title: "COMPRAS MX (UPCP)",
    premise: "Portal oficial para revisar las convocatorias y procesos de contratación en tiempo real.",
    url: "https://upcp-compranet.buengobierno.gob.mx",
    icon: Megaphone,
    image: "data:image/jpeg;base64,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",
    color: "bg-blue-600",
  },
  {
    title: "Datos Abiertos (Contratos)",
    premise: "Concentrado histórico de contrataciones abiertas del Gobierno de México.",
    url: "https://historico.datos.gob.mx/busca/dataset/concentrado-de-contrataciones-abiertas-de-compranet",
    icon: Layers,
    image: "https://www.gob.mx/cms/uploads/action_program/main_image/27419/post_datos_abiertos.jpg",
    color: "bg-green-600",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Almacenamos TODAS las requisiciones aquí
  const [todasLasRequisiciones, setTodasLasRequisiciones] = useState<any[]>([]);
  // Almacenamos las que se muestran en la tabla aquí
  const [listaVisualizada, setListaVisualizada] = useState<any[]>([]);
  
  const [filtroActivo, setFiltroActivo] = useState<TipoFiltro>('total');
  
  const [metricas, setMetricas] = useState<DashboardMetrics>({
    total: 0, pendientes: 0, aprobadas: 0, rechazadas: 0
  });

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  // Efecto para filtrar cuando cambia la selección
  useEffect(() => {
    filtrarTabla(filtroActivo);
  }, [filtroActivo, todasLasRequisiciones]);

  const cargarDatosDashboard = async () => {
    try {
      setIsLoading(true);
      // Traemos hasta 100 para tener margen de filtrado local
      const respuesta = await requisicionService.listar({ limit: 100, page: 1 });
      const data = respuesta.data || [];
      setTodasLasRequisiciones(data);

      // Calcular Métricas
      setMetricas({
        total: respuesta.count || data.length,
        pendientes: data.filter((r: any) => ['En Captura', 'En Autorización', 'En Revisión', 'CREADA'].includes(r.estatus)).length,
        aprobadas: data.filter((r: any) => ['Aprobada', 'Autorizada', 'Adjudicada'].includes(r.estatus)).length,
        rechazadas: data.filter((r: any) => ['Rechazada', 'Cancelada'].includes(r.estatus)).length,
      });
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtrarTabla = (tipo: TipoFiltro) => {
    let filtradas = [];
    switch (tipo) {
      case 'pendientes':
        filtradas = todasLasRequisiciones.filter((r: any) => ['En Captura', 'En Autorización', 'En Revisión', 'CREADA'].includes(r.estatus));
        break;
      case 'aprobadas':
        filtradas = todasLasRequisiciones.filter((r: any) => ['Aprobada', 'Autorizada', 'Adjudicada'].includes(r.estatus));
        break;
      case 'rechazadas':
        filtradas = todasLasRequisiciones.filter((r: any) => ['Rechazada', 'Cancelada'].includes(r.estatus));
        break;
      default: // total
        filtradas = todasLasRequisiciones;
        break;
    }
    // Mostramos solo las últimas 8 requisiciones
    setListaVisualizada(filtradas.slice(0, 8));
  };

  const getStatusColor = (estatus: string) => {
    const s = estatus?.toLowerCase() || '';
    if (s.includes('aprobada') || s.includes('adjudicada')) return "text-green-600 bg-green-100";
    if (s.includes('rechazada') || s.includes('cancelada')) return "text-red-600 bg-red-100";
    return "text-yellow-600 bg-yellow-100";
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl animate-fade-in flex flex-col min-h-screen bg-gray-50">
      <UserInfoHeader />

      <Card className="border-none shadow-xl bg-white flex-grow">
        <CardContent className="p-6 space-y-8 flex flex-col h-full">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Panel de Control</h1>
              <p className="text-gray-500 mt-1">Resumen de actividad y gestión de requisiciones</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/requisiciones")} className="hover:bg-accent/10">
                <Search className="mr-2 h-4 w-4" /> Buscar
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all hover:scale-[1.02]"
                onClick={() => navigate("/requisiciones/nueva")}
              >
                <Plus className="mr-2 h-4 w-4" /> Nueva Requisición
              </Button>
            </div>
          </div>

          {/* --- TARJETAS INTERACTIVAS --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard 
              title="Total Requisiciones" value={metricas.total} icon={BarChart3} color="blue" loading={isLoading}
              active={filtroActivo === 'total'} onClick={() => setFiltroActivo('total')}
            />
            <KPICard 
              title="En Proceso" value={metricas.pendientes} icon={Clock} color="yellow" loading={isLoading}
              active={filtroActivo === 'pendientes'} onClick={() => setFiltroActivo('pendientes')}
            />
            <KPICard 
              title="Aprobadas" value={metricas.aprobadas} icon={FileCheck} color="green" loading={isLoading}
              active={filtroActivo === 'aprobadas'} onClick={() => setFiltroActivo('aprobadas')}
            />
            <KPICard 
              title="Rechazadas" value={metricas.rechazadas} icon={FileX} color="red" loading={isLoading}
              active={filtroActivo === 'rechazadas'} onClick={() => setFiltroActivo('rechazadas')}
            />
          </div>

          {/* --- CONTENIDO PRINCIPAL Y CARRUSEL --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2 flex-grow min-h-[400px]">
            
            {/* TABLA DINÁMICA */}
            <div className="lg:col-span-2 space-y-4 flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {filtroActivo === 'total' ? 'Últimas Requisiciones' : `Requisiciones: ${filtroActivo.toUpperCase()}`}
                  {filtroActivo !== 'total' && <Filter className="h-4 w-4 text-primary" />}
                </h3>
                <Button variant="link" className="text-primary p-0 h-auto" onClick={() => navigate("/requisiciones")}>
                  Ver todas <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              <Card className="border-gray-100 shadow-lg bg-gray-50/50 flex-grow">
                <CardContent className="p-0 h-full">
                  <div className="h-full overflow-y-auto">
                    {isLoading ? (
                      <div className="p-4 space-y-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
                      </div>
                    ) : listaVisualizada.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {listaVisualizada.map((req) => (
                          <div
                            key={req.id}
                            className="flex items-center justify-between p-4 hover:bg-white transition-colors cursor-pointer group"
                            onClick={() => navigate(`/requisiciones/${req.id}`)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm group-hover:border-primary/40 transition-colors">
                                <span className="text-primary font-semibold text-xs">
                                  {req.folio?.split('-').pop() || 'REQ'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{req.folio}</p>
                                <p className="text-sm text-gray-500">
                                  {req.areaSolicitanteNombre || 'Sistemas'} • {new Date(req.fechaElaboracion).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(req.estatus)}`}>
                                {req.estatus}
                              </span>
                              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-gray-500">
                        <p>No se encontraron requisiciones en esta categoría.</p>
                        <Button variant="link" onClick={() => setFiltroActivo('total')} className="mt-2">
                          Ver todas las requisiciones
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Avisos Y CARRUSEL EN COLUMNA DERECHA */}
            <div className="space-y-6 flex flex-col">
              
              {/* Avisos Importantes */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900">Avisos Importantes</h3>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200 shadow-sm">
                  <h4 className="font-bold text-red-900 mb-1 flex items-center gap-2">
                    <Megaphone className='h-4 w-4'/> Cierre de Presupuesto
                  </h4>
                  <p className="text-sm text-red-700">
                    Recuerde que la fecha límite para subir requisiciones al cierre presupuestal del mes es el día **25**.
                  </p>
                </div>
              </div>
              
              {/* CARRUSEL INTERACTIVO */}
              <div className="flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Herramientas Clave</h3>
                <Card className="flex-grow shadow-lg overflow-hidden p-0 relative min-h-[250px] lg:min-h-0">
                  <CustomCarousel items={externalLinks} delay={4000} />
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente Carrusel Manual
function CustomCarousel({ items, delay = 3000 }: { items: typeof externalLinks; delay?: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextItem = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    const interval = setInterval(nextItem, delay);
    return () => clearInterval(interval);
  }, [nextItem, delay]);

  const item = items[currentIndex];

  return (
    <div className="w-full h-full relative overflow-hidden rounded-xl">
      <div 
        key={currentIndex}
        className="h-full w-full transition-opacity duration-1000 cursor-pointer"
        onClick={() => window.open(item.url, '_blank')}
      >
        {/* Imagen de fondo */}
        <img 
          src={item.image} 
          alt={`Fondo de ${item.title}`} 
          className="absolute inset-0 w-full h-full object-cover opacity-70 transition-opacity duration-500" 
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        
        {/* Contenido con overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center h-full p-6 relative z-10 bg-black/60 transition-opacity duration-500">
          <div className="mb-4">
            <item.icon className="h-10 w-10 mx-auto" />
          </div>
          
          <h4 className="text-2xl font-bold mb-2">{item.title}</h4>
          <p className="text-sm opacity-90">{item.premise}</p>
          
          <Button variant="link" className="mt-4 text-white hover:underline">
            Ir al portal <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Indicadores de diapositiva */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {items.map((_, index) => (
          <span
            key={index}
            className={`block h-2 w-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-white w-5' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// KPI Card Mejorada con Interaction
function KPICard({ title, value, icon: Icon, color, loading, active, onClick }: any) {
  const colorClasses: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-200 ring-blue-400",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200 ring-yellow-400",
    green: "bg-green-50 text-green-600 border-green-200 ring-green-400",
    red: "bg-red-50 text-red-600 border-red-200 ring-red-400",
  };

  const baseColor = colorClasses[color] || "bg-gray-50 text-gray-600 border-gray-200 ring-gray-400";

  return (
    <Card 
      className={`
        border shadow-md transition-all cursor-pointer hover:scale-[1.03]
        ${active ? `ring-2 ring-offset-2 ${baseColor.split(' ').filter(c => c.startsWith('ring-')).join(' ')} ${baseColor.split(' ').filter(c => c.startsWith('border-')).join(' ')} bg-white/70` : 'border-gray-100 bg-white hover:shadow-lg'}
      `}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <h3 className={`text-3xl font-extrabold ${active ? 'text-gray-900' : 'text-gray-700'}`}>{value}</h3>
            )}
          </div>
          <div className={`p-3 rounded-xl border shadow-sm ${baseColor.split(' ').filter(c => !c.startsWith('ring-')).join(' ')}`}>
            {loading ? <Loader2 className="h-6 w-6 animate-spin text-gray-500" /> : <Icon className="h-6 w-6" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}