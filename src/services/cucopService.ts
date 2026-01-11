// src/services/cucopService.ts

// 1. Apunta a tu Backend Local
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

export interface Capitulo {
  id_capitulo: number;
  descripcion: string;
}

export interface Generica {
  id_generica: number;
  descripcion: string;
}

export interface Especifica {
  id_especifica: string;
  descripcion: string;
}

// Esta interfaz es la que usa tu componente Paso1 (NO le cambies nada)
export interface Producto {
  id: string;
  clave_cucop_plus: string; // El componente busca esto
  descripcion: string;
  unidad: string;           // El componente busca esto
  precio_estimado: number;  // El componente busca esto
  id_especifica: string;
}

export const cucopService = {
  // 1. Obtener Capítulos
  async getCapitulos(): Promise<Capitulo[]> {
    try {
      const res = await fetch(`${API_URL}/cucop/capitulos`);
      const json = await res.json();
      return Array.isArray(json) ? json : (json.data || []);
    } catch (error) {
      console.error("Error getCapitulos:", error);
      return [];
    }
  },

  // 2. Obtener Genéricas
  async getGenericas(idCapitulo: number): Promise<Generica[]> {
    try {
      const res = await fetch(`${API_URL}/cucop/capitulo/${idCapitulo}/genericas`);
      const json = await res.json();
      return Array.isArray(json) ? json : (json.data || []);
    } catch (error) {
      console.error("Error getGenericas:", error);
      return [];
    }
  },

  // 3. Obtener Específicas
  async getEspecificas(idGenerica: number): Promise<Especifica[]> {
    try {
      const res = await fetch(`${API_URL}/cucop/generica/${idGenerica}/especificas`);
      const json = await res.json();
      return Array.isArray(json) ? json : (json.data || []);
    } catch (error) {
      console.error("Error getEspecificas:", error);
      return [];
    }
  },

  // 4. Obtener Productos (CON TRADUCTOR)
  async getProductos(idEspecifica: string): Promise<Producto[]> {
    try {
      const res = await fetch(`${API_URL}/cucop/especifica/${idEspecifica}/productos`);
      if (!res.ok) throw new Error('Error al cargar productos');
      
      const json = await res.json();
      const datosBackend = Array.isArray(json) ? json : (json.data || []);

      // AQUÍ OCURRE LA MAGIA: Traducimos los nombres
      return datosBackend.map((item: any) => ({
        id: item.id,
        // Si el backend manda 'id' pero el front quiere 'clave_cucop_plus', los igualamos:
        clave_cucop_plus: item.id || item.clave_cucop_plus, 
        descripcion: item.descripcion,
        // Traducimos 'unidad_medida' a 'unidad'
        unidad: item.unidad_medida || item.unidad || 'PZA', 
        // Traducimos 'precio_unitario' a 'precio_estimado'
        precio_estimado: Number(item.precio_unitario || item.precio_estimado || 0),
        id_especifica: idEspecifica
      }));

    } catch (error) {
      console.error("Error getProductos:", error);
      return [];
    }
  }
};