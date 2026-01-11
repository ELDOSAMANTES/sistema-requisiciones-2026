import axios, { AxiosInstance } from 'axios';
import type {
  Requisicion,
  APIResponse,
  PaginatedResponse,
  RequisicionQueryParams,
  CucopResponse,
  Partida,
  DatosGeneralesForm,
  RequisicionCreatePayload,
} from '@/types/requisicion';

// Configuración del cliente Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    console.log('[API Request]', config.method?.toUpperCase(), config.url, config.data || config.params);
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('[API Response]', response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error.response?.status, error.config.url, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Mapeador Frontend -> Backend
const mapearFrontendABackend = (data: any): any => {
  console.log("[Mapper FE->BE] Datos recibidos:", data);
  
  let investigacionPayload;

  if (data.investigacion && data.investigacion.proveedor_seleccionado) {
      // Caso A: Viene listo desde NuevaRequisicion.tsx (Lo ideal)
      investigacionPayload = data.investigacion;
  } else {
      // Caso B: Fallback (solo mapea fuentes sueltas)
      investigacionPayload = {
        proveedor_seleccionado: null,
        razon_seleccion: null,
        fuentes: data.fuentesConsultadas?.map((f:string) => ({nombre_fuente: f})) || [],
      };
  }

  const payload = {
    folio: data.folioGenerado || data.folio,
    fecha_elaboracion: data.fechaElaboracion || data.fecha_elaboracion,
    area_id: data.area_id || 1,
    usuario_id: data.usuario_id || 1,
    tipo_contratacion: data.tipoContratacion || data.tipo_contratacion,
    justificacion: data.justificacion,
    estatus: data.estatus || 'En Captura',
    partidas: data.partidas?.map((p: Partida) => ({
      cucop: p.cucop,
      descripcion: p.descripcion,
      cantidad: Number(p.cantidad) || 0,
      unidad: p.unidad,
      precio_unitario: Number(p.precio_unitario) || 0,
    })) || [],
    
    // Usamos el payload de investigación procesado arriba
    investigacion: investigacionPayload,

    oficio_autorizacion: data.oficioAutorizacion || data.oficio_autorizacion,
    partida_presupuestal: data.partidaPresupuestal || data.partida_presupuestal,
    programa_proyecto: data.programaProyecto || data.programa_proyecto,
    lugar_entrega: data.lugarEntrega || data.lugar_entrega,
    fecha_entrega: data.fechaEntrega || data.fecha_entrega,
    plazo_condiciones_pago: data.plazoCondicionesPago || data.plazo_condiciones_pago,
    anexos: data.anexos?.map((a: File | any) => ({
      nombre_archivo: a.name || a.nombre_archivo,
      tipo_anexo: 'General',
    })) || [],
  };
  console.log("[Mapper FE->BE] Payload enviado:", payload);
  return payload;
};

// Mapeador Backend -> Frontend
const mapearBackendAFrontend = (data: any): any => {
  const mappedData = {
    id: data.id,
    folio: data.folio,
    fechaElaboracion: data.fecha_elaboracion,
    areaSolicitanteNombre: data.Area?.nombre,
    solicitanteNombre: data.solicitante?.nombre,
    usuarioId: data.usuario_id,
    areaId: data.area_id,
    tipoContratacion: data.tipo_contratacion,
    justificacion: data.justificacion,
    estatus: data.estatus,
    oficioAutorizacion: data.oficio_autorizacion,
    partidaPresupuestal: data.partida_presupuestal,
    programaProyecto: data.programa_proyecto,
    lugarEntrega: data.lugar_entrega,
    fechaEntrega: data.fecha_entrega,
    plazoCondicionesPago: data.plazo_condiciones_pago,
    subtotalEstimado: data.subtotal_estimado,
    ivaEstimado: data.iva_estimado,
    totalEstimado: data.total_estimado,
    partidas: data.Partidas?.map((p: any) => ({
      id: p.id,
      cucop: p.cucop,
      descripcion: p.descripcion,
      cantidad: p.cantidad,
      unidad: p.unidad,
      precioUnitario: p.precio_unitario,
      importeEstimado: p.importe,
    })) || [],
    anexos: data.Anexos?.map((a: any) => ({
      id: a.id,
      nombreArchivo: a.nombre_archivo,
      urlArchivo: a.url_archivo,
      tipoAnexo: a.tipo_anexo,
    })) || [],
    historial: data.Historials?.map((h: any) => ({
      id: h.id,
      fecha: h.fecha,
      usuarioNombre: h.Usuario?.nombre,
      accion: h.accion,
    })) || [],
    
    // <<< MAPEO CORREGIDO DE INVESTIGACIÓN >>>
    investigacionMercado: data.InvestigacionMercado ? {
      proveedorSeleccionado: data.InvestigacionMercado.proveedor_seleccionado,
      razonSeleccion: data.InvestigacionMercado.razon_seleccion,
      // Mapeo unificado de todas las fuentes con campos completos
      fuentesConsultadas: data.InvestigacionMercado.FuenteInvestigacions?.map((f:any) => ({
          nombre: f.nombre_fuente || 'Sin nombre',
          tipo: f.tipo_fuente || 'N/A',
          precio: f.precio_unitario || 0,
          // Mapeo flexible de contrato (puede venir de diferentes campos según el tipo)
          contrato: f.numero_contrato || f.codigo_contrato || f.folio_oficio || 'N/A',
          // Mapeo flexible de fecha
          fecha: f.fecha_referencia || f.fecha_contrato || f.fecha_fallo_firma || f.fecha_oficio || 'N/A',
          // Mapeo flexible de descripción
          descripcion: f.descripcion_bien || f.descripcion || f.titulo_expediente || f.descripcion_evidencia || 'N/A',
          // Mapeo flexible de URL
          url: f.url_fuente || f.url_pagina || f.url_anuncio || f.url_respuesta_oficio || 'N/A',
      })) || [],
    } : undefined,
    
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
  return mappedData;
};

export const requisicionService = {
  async crear(data: any): Promise<Requisicion> {
    try {
      const payload = mapearFrontendABackend(data);
      const response = await apiClient.post<{ message?: string; data?: Requisicion }>('/requisiciones', payload);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Error al crear');
    } catch (error: any) {
        console.error("[Service] Error en crear:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Error al crear la requisición');
    }
  },

  async listar(params: RequisicionQueryParams = {}): Promise<PaginatedResponse<any>> {
     try {
        const response = await apiClient.get<{ message?: string; data?: any }>('/requisiciones', { params } );
        if (response.data && response.data.data) {
           const backendData = response.data.data;
           const requisiciones = Array.isArray(backendData) ? backendData : backendData.data || [];
           const total = backendData.total || backendData.count || requisiciones.length;
           
           return {
               data: requisiciones.map(mapearBackendAFrontend),
               count: total,
               page: backendData.page || params.page || 1,
               limit: backendData.limit || params.limit || 20,
               totalPages: Math.ceil(total / (backendData.limit || params.limit || 20)),
           };
        }
        throw new Error(response.data.message || 'Error al listar');
     } catch (error: any) {
         console.error("[Service] Error en listar:", error.response?.data || error.message);
         throw new Error(error.response?.data?.message || error.message || 'Error al listar requisiciones');
     }
  },

  async obtenerPorId(id: string | number): Promise<any> {
    try {
        const response = await apiClient.get<{ message?: string; data?: Requisicion }>(`/requisiciones/${id}`);
        if (response.data && response.data.data) {
            return mapearBackendAFrontend(response.data.data);
        }
        throw new Error(response.data.message || 'No encontrado');
    } catch (error: any) {
        if (error.response?.status === 404) { throw new Error('Requisición no encontrada.'); }
        console.error(`[Service] Error en obtenerPorId (${id}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || `Error al obtener ${id}`);
    }
  },

  async actualizar(id: string | number, data: any): Promise<any> {
    try {
        const payload = mapearFrontendABackend(data);
        const response = await apiClient.put<{ message?: string; data?: Requisicion }>(`/requisiciones/${id}`, payload);
        if (response.data && response.data.data) {
            return mapearBackendAFrontend(response.data.data);
        }
        throw new Error(response.data.message || 'Error al actualizar');
    } catch (error: any) {
        console.error(`[Service] Error en actualizar (${id}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || `Error al actualizar ${id}`);
    }
  },

  async cambiarEstatus(id: string | number, nuevoEstatus: string, comentario?: string): Promise<any> {
     console.log(`[Service] Cambiando estatus de ID ${id} a ${nuevoEstatus}`);
     return this.actualizar(id, { estatus: nuevoEstatus });
   },

  async eliminar(id: string | number): Promise<void> {
    try {
        await apiClient.delete(`/requisiciones/${id}`);
        console.log(`[Service] Requisición ${id} eliminada.`);
    } catch (error: any) {
        console.error(`[Service] Error en eliminar (${id}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al eliminar');
    }
  },

  async buscarCucop(codigo: string): Promise<CucopResponse> {
    try {
      console.log(`[Service] Buscando CUCOP código: ${codigo}`);
      const response = await apiClient.get<{ message?: string; data?: CucopResponse }>(`/cucop/buscar/${codigo}`);
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Respuesta inesperada del servidor.");
      }
    } catch (error: any) {
      console.error(`[Service] Error en buscarCucop (${codigo}):`, error.response ? error.response.data : error.message);
      throw new Error(error.response?.data?.message || error.message || `Error al buscar CUCOP ${codigo}`);
    }
  },

  async buscarHistoricoCompranet(termino: string): Promise<any[]> {
    try {
      console.log(`[Service] Buscando en histórico de Compranet: ${termino}`);
      const response = await apiClient.get<{ message?: string; data?: any[] }>(`/compranet/historico`, {
        params: { buscar: termino, limit: 20 }
      });
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || "Respuesta inesperada del servidor.");
      }
    } catch (error: any) {
      console.error(`[Service] Error en buscarHistoricoCompranet (${termino}):`, error.response ? error.response.data : error.message);
      throw new Error(error.response?.data?.message || error.message || `Error al buscar en histórico`);
    }
  },

  async obtenerCapitulos(): Promise<{ id_capitulo: string; descripcion: string }[]> {
    try {
      console.log(`[Service] Obteniendo capítulos disponibles`);
      const response = await apiClient.get<{ message?: string; data?: any[] }>('/cucop/capitulos');
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        // Fallback con datos estáticos si el endpoint no existe
        return [
          { id_capitulo: '2000', descripcion: 'MATERIALES Y SUMINISTROS' },
          { id_capitulo: '3000', descripcion: 'SERVICIOS GENERALES' },
          { id_capitulo: '5000', descripcion: 'BIENES MUEBLES, INMUEBLES E INTANGIBLES' },
        ];
      }
    } catch (error: any) {
      console.warn(`[Service] Usando capítulos estáticos:`, error.message);
      return [
        { id_capitulo: '2000', descripcion: 'MATERIALES Y SUMINISTROS' },
        { id_capitulo: '3000', descripcion: 'SERVICIOS GENERALES' },
        { id_capitulo: '5000', descripcion: 'BIENES MUEBLES, INMUEBLES E INTANGIBLES' },
      ];
    }
  },

  async buscarCucopPorCapitulo(capitulo: string): Promise<CucopResponse[]> {
    try {
      console.log(`[Service] Buscando CUCOPs por capítulo: ${capitulo}`);
      const response = await apiClient.get<{ message?: string; data?: CucopResponse[] }>(`/cucop/capitulo/${capitulo}`);
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || "Respuesta inesperada del servidor.");
      }
    } catch (error: any) {
      console.error(`[Service] Error en buscarCucopPorCapitulo (${capitulo}):`, error.response ? error.response.data : error.message);
      throw new Error(error.response?.data?.message || error.message || `Error al buscar CUCOPs del capítulo ${capitulo}`);
    }
  },
};

export default requisicionService;