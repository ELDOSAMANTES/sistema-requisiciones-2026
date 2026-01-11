
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

export interface Area {
  id: number;
  nombre: string;
}

export interface Partida {
  id?: number;
  requisicion_id?: number;
  cucop: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precio_unitario: number;
  precio_estimado?: number; // Precio de referencia de la tabla CUCOP
  importe?: number;
}

export interface DireccionEntrega {
  id: string;
  direccion: string;
  linkGoogleMaps?: string;
}

export interface DatosGeneralesForm {
  fechaElaboracion: string;
  areaSolicitante: string;
  solicitante: string;
  tipoContratacion: string;
  oficioAutorizacion: string;
  partidaPresupuestal: string;
  programaProyecto: string;
  lugarEntrega: DireccionEntrega[];
}

export interface CucopResponse {
  codigo: string;
  descripcion: string;
  unidad: string;
  precio_unitario?: number; // Precio de referencia de la tabla CUCOP
}

export interface RequisicionCreatePayload {
  folio: string;
  fecha_elaboracion: string;
  tipo_contratacion: string;
  estatus: string;
  justificacion: string;
  usuario_id: number;
  area_id: number;
  partidas: Array<{
    partida_numero: number;
    cucop: string;
    descripcion: string;
    cantidad: number;
    unidad: string;
    precio_unitario: number;
  }>;
  investigacion: {
    fuentes: Array<{ nombre_fuente: string }>;
    proveedor_seleccionado?: string;
    razon_seleccion?: string;
  };
  anexos: Array<{
    nombre_archivo: string;
    tipo_anexo: string;
    url_archivo: string;
  }>;
  oficio_autorizacion?: string;
  partida_presupuestal?: string;
  programa_proyecto?: string;
  lugar_entrega?: string;
  fecha_entrega?: string;
}

export interface Anexo {
  id?: number;
  requisicion_id?: number;
  nombre_archivo: string;
  url_archivo: string;
  tipo_archivo?: string;
  fecha_subida?: string;
}

// Fuentes de evidencia para investigación de mercado
export interface FuenteCompranet {
  id?: string;
  numero_procedimiento: string;
  institucion: string;
  titulo_expediente: string;
  fundamento_legal?: string;
  tipo_contratacion?: string;
  numero_contrato?: string;
  titulo_contrato?: string;
  descripcion?: string;
  rfc_proveedor: string;
  nombre_proveedor: string;
  folio_rop?: string;
  url_anuncio?: string;
  fecha_fallo_firma?: string;
  partida_cucop_coincidente?: string;
  precio_unitario?: number;
}

export interface FuenteArchivoInterno {
  id?: string;
  numero_contrato_anterior: string;
  fecha_contrato: string;
  proveedor: string;
  descripcion_bien: string;
  precio_unitario: number;
}

export interface FuenteCamaraUniversidad {
  id?: string;
  institucion: string;
  fecha_oficio: string;
  folio_oficio: string;
  respuesta_recibida: boolean;
  url_respuesta_oficio?: string;
}

export interface FuenteInternet {
  id?: string;
  termino_busqueda: string;
  url_pagina: string;
  proveedores_encontrados: string[];
  descripcion_evidencia: string;
  url_captura?: string;
}

export interface ProveedorInvitado {
  id: string;
  nombre: string;
  descripcion?: string;
  email: string;
  telefono?: string;
  rfc?: string;
  origen: 'compranet' | 'archivo_interno' | 'camara_universidad' | 'internet';
  seleccionado: boolean;
  tipo_oficio?: 'informacion' | 'cotizacion' | 'ambas';
  solicitud_enviada: boolean;
  respuesta_subida: boolean;
  archivo_propuesta: File | null;
  fecha_respuesta?: string;
  oficio_generado?: boolean;
  url_respuesta?: string;
  datos_cotizacion?: {
    subtotal: number;
    iva: number;
    total: number;
    items?: Array<{
      descripcion: string;
      cantidad: number;
      precio_unitario: number;
      importe: number;
    }>;
  };
}

export interface InvestigacionMercado {
  id?: number;
  requisicion_id?: number;
  fuentes_compranet: FuenteCompranet[];
  fuentes_archivos_internos: FuenteArchivoInterno[];
  fuentes_camaras_universidades: FuenteCamaraUniversidad[];
  fuentes_internet: FuenteInternet[];
  proveedores_invitados: ProveedorInvitado[];
  proveedor_seleccionado?: string;
  razon_seleccion?: string;
}

export interface Historial {
  id?: number;
  requisicion_id?: number;
  fecha: string;
  usuario: string;
  accion: string;
}

export interface Requisicion {
  id?: number;
  folio: string;
  fecha_elaboracion: string;
  area_solicitante: string;
  solicitante: string;
  usuario_id?: number;
  area_id?: number;
  oficio_autorizacion?: string;
  partida_presupuestal?: string;
  tipo_contratacion: string;
  programa_proyecto?: string;
  lugar_entrega?: string;
  fecha_entrega?: string;
  plazo_condiciones_pago?: string;
  justificacion: string;
  estatus: string;
  subtotal_estimado?: number;
  iva_estimado?: number;
  total_estimado?: number;
  created_at?: string;
  updated_at?: string;
  
  // Relaciones (para eager loading)
  Usuario?: Usuario;
  Area?: Area;
  Partidas?: Partida[];
  Anexos?: Anexo[];
  Historials?: Historial[];
  InvestigacionMercado?: InvestigacionMercado;
}

// Tipos para respuestas del API
export interface APIResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  count?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipos para los parámetros de consulta
export interface RequisicionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  estatus?: string;
  area_id?: number;
  usuario_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}
