import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { UserInfoHeader } from '@/components/UserInfoHeader';
import { FOCONGenerators, DocumentoGenerado } from '@/lib/foconGenerators';

// --- Importaciones Clave ---
import {
  Partida,
  DatosGeneralesForm,
  RequisicionCreatePayload,
  FuenteCompranet,
  FuenteArchivoInterno,
  FuenteCamaraUniversidad,
  FuenteInternet,
  ProveedorInvitado
} from '@/types/requisicion';
import requisicionService from '@/services/requisicionService';

// --- Importa Componentes de Pasos ---
import Paso1_Verificacion from './NuevaRequisicionSteps/Paso1_Verificacion';
import Paso2_DatosGenerales from './NuevaRequisicionSteps/Paso2_DatosGenerales';
import Paso3_DetalleBienes from './NuevaRequisicionSteps/Paso3_DetalleBienes';
import Paso4_InvestigacionMercado from './NuevaRequisicionSteps/Paso4_InvestigacionMercado';
import Paso5_JustificacionAnexos from './NuevaRequisicionSteps/Paso5_JustificacionAnexos';
import Paso6_VistaPrevia from './NuevaRequisicionSteps/Paso6_VistaPrevia';

export function NuevaRequisicion() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [paso, setPaso] = useState(1);

  // --- ESTADO CENTRAL ---
  const [folioGenerado] = useState(`REQ-${Date.now().toString().slice(-6)}`);
  const numeroRequisicion = folioGenerado.replace('REQ-', '');
  const oficioAutorizacion = `OFC/REQ/2025/${numeroRequisicion}`;
  
  const [partidas, setPartidas] = useState<Partida[]>([]);

  const [datosGenerales, setDatosGenerales] = useState<DatosGeneralesForm>({
    fechaElaboracion: new Date().toISOString().split('T')[0],
    areaSolicitante: 'Sistemas',
    solicitante: 'Admin',
    tipoContratacion: 'licitacion',
    oficioAutorizacion: oficioAutorizacion,
    partidaPresupuestal: '',
    programaProyecto: '',
    lugarEntrega: [],
  });
  
  // Estado de Investigación de Mercado
  const [fuentesCompranet, setFuentesCompranet] = useState<FuenteCompranet[]>([]);
  const [fuentesArchivosInternos, setFuentesArchivosInternos] = useState<FuenteArchivoInterno[]>([]);
  const [fuentesCamaras, setFuentesCamaras] = useState<FuenteCamaraUniversidad[]>([]);
  const [fuentesInternet, setFuentesInternet] = useState<FuenteInternet[]>([]);
  const [proveedoresInvitados, setProveedoresInvitados] = useState<ProveedorInvitado[]>([]);
  
  const [proveedorGanador, setProveedorGanador] = useState<string>('');
  const [razonSeleccion, setRazonSeleccion] = useState<string>('');
  
  const [justificacion, setJustificacion] = useState<string>('');
  const [anexos, setAnexos] = useState<File[]>([]);
  
  // Estado de documentos FO-CON generados
  const [documentosGenerados, setDocumentosGenerados] = useState<DocumentoGenerado[]>([]);
  // --- Fin Estado ---

  const handleSetPartidas = (nuevasPartidas: Partida[]) => {
    if (!Array.isArray(nuevasPartidas)) {
      console.error("¡ERROR GRAVE! handleSetPartidas recibió algo que no es un array:", nuevasPartidas);
    }
    setPartidas(nuevasPartidas);
  };
  const handleSetDatosGenerales = (datos: DatosGeneralesForm) => setDatosGenerales(datos);
  const handleSetJustificacion = (texto: string) => setJustificacion(texto);
  const handleSetAnexos = (archivos: File[]) => setAnexos(archivos);
  
  // Función para generar documentos FO-CON al avanzar de paso
  const generarDocumentoPaso = (pasoActual: number) => {
    let nuevoDoc: DocumentoGenerado | null = null;
    
    try {
      switch (pasoActual) {
        case 2:
          nuevoDoc = FOCONGenerators.generarFOCON01(folioGenerado, datosGenerales);
          break;
        case 3:
          nuevoDoc = FOCONGenerators.generarFOCON03(folioGenerado, partidas, datosGenerales);
          break;
        case 4:
          nuevoDoc = FOCONGenerators.generarFOCON05(
            folioGenerado,
            fuentesCompranet,
            fuentesArchivosInternos,
            fuentesCamaras,
            fuentesInternet,
            proveedorGanador,
            razonSeleccion
          );
          break;
        case 5:
          nuevoDoc = FOCONGenerators.generarFOCON06(folioGenerado, justificacion, datosGenerales);
          break;
      }
      
      if (nuevoDoc) {
        setDocumentosGenerados(prev => {
          // Evitar duplicados
          const existe = prev.find(d => d.codigo === nuevoDoc!.codigo);
          if (existe) {
            return prev.map(d => d.codigo === nuevoDoc!.codigo ? nuevoDoc! : d);
          }
          return [...prev, nuevoDoc!];
        });
        
        toast({
          title: 'Documento Generado',
          description: `${nuevoDoc.codigo} creado exitosamente`,
        });
      }
    } catch (error) {
      console.error('Error al generar documento:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el documento',
        variant: 'destructive'
      });
    }
  };
  
  // Función para avanzar de paso con generación de documento
  const avanzarPaso = (siguientePaso: number) => {
    const pasoActual = paso;
    generarDocumentoPaso(pasoActual);
    setPaso(siguientePaso);
  };

  const guardarBorrador = () => {
    console.log('Guardando borrador (simulado) con datos:', { datosGenerales, partidas, justificacion });
    toast({ title: 'Borrador Guardado (Simulado)', description: `Requisición ${folioGenerado} guardada.` });
  };

  // --- Funciones de Cálculo ---
   const calcularSubtotal = () => {
     if (!Array.isArray(partidas)) return 0;
     return partidas.reduce((sum, p) => sum + (p.cantidad * p.precio_unitario), 0);
   };
   const calcularIVA = () => calcularSubtotal() * 0.16;
   const calcularTotal = () => calcularSubtotal() + calcularIVA();
  // --- FIN Funciones de Cálculo ---

  // --- FUNCIÓN FINAL DE ENVÍO (ACTUALIZADA) ---
  const handleEnviarRequisicion = async () => {
    // Usamos Array.isArray para verificar el tipo
    const ArrayOfPartidas = Array.isArray; 

    if (!ArrayOfPartidas(partidas) || partidas.length === 0 || !justificacion) {
      toast({ title: 'Error de Validación', description: 'Faltan datos esenciales (Partidas o Justificación).', variant: 'destructive' });
      return;
    }
    
    // <<< --- CORRECCIÓN CRÍTICA: VALIDACIÓN DE INVESTIGACIÓN --- >>>
    // Si no está seleccionado el ganador o la razón está vacía, detenemos el envío.
    if (!proveedorGanador || proveedorGanador.trim() === '' || !razonSeleccion || razonSeleccion.trim() === '') {
        toast({ 
            title: 'Validación Faltante', 
            description: 'Debe seleccionar un proveedor adjudicado y justificar la elección en el Paso 4.', 
            variant: 'destructive' 
        });
        return; 
    }
    // <<< --- FIN VALIDACIÓN --- >>>

    setIsLoading(true);
    
    // --- MAPEO RICO DE FUENTES PARA GUARDAR DETALLES COMPLETOS ---
    
    // 1. Compranet (Rico en datos)
    const fuentesCompranetPayload = fuentesCompranet.map(f => ({
      nombre_fuente: f.nombre_proveedor || 'Proveedor Compranet',
      tipo_fuente: 'COMPRANET',
      url_fuente: f.url_anuncio,
      precio_unitario: f.precio_unitario || 0,
      numero_contrato: f.numero_contrato,
      fecha_referencia: f.fecha_fallo_firma ? f.fecha_fallo_firma.split('T')[0] : null,
      descripcion_bien: f.descripcion
    }));

    // 2. Archivos Internos
    const fuentesArchivosPayload = fuentesArchivosInternos.map(f => ({
      nombre_fuente: f.proveedor || 'Archivo Interno',
      tipo_fuente: 'ARCHIVO',
      url_fuente: null,
      precio_unitario: f.precio_unitario || 0,
      numero_contrato: f.numero_contrato_anterior,
      fecha_referencia: f.fecha_contrato ? f.fecha_contrato.split('T')[0] : null,
      descripcion_bien: f.descripcion_bien,
    }));

    // 3. Cámaras / Universidades
    const fuentesCamarasPayload = fuentesCamaras.map(f => ({
      nombre_fuente: f.institucion,
      tipo_fuente: 'CAMARA',
      url_fuente: f.url_respuesta_oficio || null,
      precio_unitario: 0,
      numero_contrato: f.folio_oficio,
      fecha_referencia: f.fecha_oficio ? f.fecha_oficio.split('T')[0] : null,
      descripcion_bien: `Solicitud a ${f.institucion}`,
    }));

    // 4. Internet
    const fuentesInternetPayload = fuentesInternet.map(f => ({
      nombre_fuente: f.proveedores_encontrados.join(', ') || f.termino_busqueda || 'Búsqueda Web',
      tipo_fuente: 'INTERNET',
      url_fuente: f.url_pagina,
      precio_unitario: 0,
      numero_contrato: null,
      fecha_referencia: null,
      descripcion_bien: f.descripcion_evidencia
    }));

    // Unir todas las fuentes en un solo array
    const todasLasFuentes = [
      ...fuentesCompranetPayload,
      ...fuentesArchivosPayload,
      ...fuentesCamarasPayload,
      ...fuentesInternetPayload
    ];
    
    // --- Fin Corrección Mapeo ---

    const payload: RequisicionCreatePayload = {
      folio: folioGenerado,
      fecha_elaboracion: datosGenerales.fechaElaboracion,
      tipo_contratacion: datosGenerales.tipoContratacion,
      estatus: 'En Autorización',
      justificacion: justificacion,
      usuario_id: 1, 
      area_id: 1,
      partidas: partidas.map((p, index) => ({
        partida_numero: index + 1,
        cucop: p.cucop,
        descripcion: p.descripcion,
        cantidad: p.cantidad,
        unidad: p.unidad,
        precio_unitario: p.precio_unitario,
      })),
      investigacion: {
        // Enviamos el array rico de objetos
        fuentes: todasLasFuentes, 
        proveedor_seleccionado: proveedorGanador,
        razon_seleccion: razonSeleccion
      },
      anexos: anexos.map((a) => ({
        nombre_archivo: a.name,
        tipo_anexo: 'Justificacion',
        url_archivo: `http://simulado.com/${a.name}`,
      })),
       oficio_autorizacion: datosGenerales.oficioAutorizacion,
      partida_presupuestal: datosGenerales.partidaPresupuestal,
      programa_proyecto: datosGenerales.programaProyecto,
      lugar_entrega: JSON.stringify(datosGenerales.lugarEntrega),
    };

    try {
      const nuevaReq = await requisicionService.crear(payload);
      toast({ title: 'Requisición Enviada', description: `Requisición ${nuevaReq.folio} creada.` });
      navigate('/requisiciones');
    } catch (error) {
      console.error('NuevaRequisicion: Error al crear requisición:', error);
      toast({ title: 'Error al Enviar', description: (error as Error).message || 'No se pudo guardar.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Lógica de Renderizado ---
  const renderizarPaso = () => {
    switch (paso) {
      case 1:
        return (
          <Paso1_Verificacion
            partidas={partidas}
            setPartidas={handleSetPartidas}
            folio={folioGenerado}
            setPaso={setPaso}
            guardarBorrador={guardarBorrador}
          />
        );
       case 2:
         return ( 
           <Paso2_DatosGenerales 
             datosGenerales={datosGenerales} 
             setDatosGenerales={handleSetDatosGenerales} 
             folioGenerado={folioGenerado} 
             setPaso={avanzarPaso} 
             guardarBorrador={guardarBorrador}
             documentosGenerados={documentosGenerados}
             partidas={partidas}
           /> 
         );
       case 3:
          return ( 
            <Paso3_DetalleBienes 
              partidas={partidas} 
              setPartidas={handleSetPartidas} 
              calcularSubtotal={calcularSubtotal} 
              calcularIVA={calcularIVA} 
              calcularTotal={calcularTotal} 
              setPaso={avanzarPaso} 
              guardarBorrador={guardarBorrador} 
              oficioAutorizacion={oficioAutorizacion}
              documentosGenerados={documentosGenerados}
            /> 
          );
       case 4:
          return ( 
            <Paso4_InvestigacionMercado 
              partidas={partidas}
              fuentesCompranet={fuentesCompranet}
              setFuentesCompranet={setFuentesCompranet}
              fuentesArchivosInternos={fuentesArchivosInternos}
              setFuentesArchivosInternos={setFuentesArchivosInternos}
              fuentesCamaras={fuentesCamaras}
              setFuentesCamaras={setFuentesCamaras}
              fuentesInternet={fuentesInternet}
              setFuentesInternet={setFuentesInternet}
              proveedoresInvitados={proveedoresInvitados}
              setProveedoresInvitados={setProveedoresInvitados}
              
              proveedorGanador={proveedorGanador}
              setProveedorGanador={setProveedorGanador}
              razonSeleccion={razonSeleccion}
              setRazonSeleccion={setRazonSeleccion}
              
              setPaso={avanzarPaso}
              guardarBorrador={guardarBorrador}
              documentosGenerados={documentosGenerados}
            /> 
          );
       case 5:
         return ( 
           <Paso5_JustificacionAnexos 
             justificacion={justificacion} 
             setJustificacion={handleSetJustificacion} 
             anexos={anexos} 
             setAnexos={handleSetAnexos} 
             setPaso={avanzarPaso} 
             guardarBorrador={guardarBorrador}
             documentosGenerados={documentosGenerados}
           /> 
         );
       case 6:
         const datosPaso6 = {
           folio: folioGenerado,
           datosGenerales,
           partidas,
           justificacion,
           anexos,
           fuentesCompranet,
           fuentesArchivosInternos,
           fuentesCamaras,
           fuentesInternet,
           proveedoresInvitados,
           proveedorGanador,
           razonSeleccion
         };
         return ( 
           <Paso6_VistaPrevia 
             datos={datosPaso6} 
             setPaso={setPaso} 
             guardarBorrador={guardarBorrador} 
             calcularSubtotal={calcularSubtotal} 
             calcularIVA={calcularIVA} 
             calcularTotal={calcularTotal}
             documentosGenerados={documentosGenerados}
           /> 
         );
      default:
        return ( <Paso1_Verificacion partidas={partidas} setPartidas={handleSetPartidas} folio={folioGenerado} setPaso={setPaso} guardarBorrador={guardarBorrador} /> );
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <UserInfoHeader />
      <div className="mb-8">
         <div className="flex items-center justify-between mb-4">
           {[1, 2, 3, 4, 5, 6].map((num) => ( <div key={num} className="flex items-center flex-1"> <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold cursor-pointer ${paso >= num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`} onClick={() => !isLoading && setPaso(num)}> {num} </div> {num < 6 && ( <div className={`flex-1 h-1 mx-2 ${paso > num ? 'bg-primary' : 'bg-muted'}`} /> )} </div> ))}
         </div>
         <div className="flex justify-between text-xs text-muted-foreground px-2">
           <span>Verificación</span> <span>Datos</span> <span>Partidas</span> <span>Mercado</span> <span>Anexos</span> <span>Envío</span>
         </div>
      </div>
      {renderizarPaso()}
      {/* Muestra el botón de enviar solo en el paso 6 (ya está dentro del componente Paso 6) */}
    </div>
  );
}

export default NuevaRequisicion;