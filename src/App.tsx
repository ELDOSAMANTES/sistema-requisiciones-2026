import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Requisiciones from "./pages/Requisiciones";
import RequisicionDetalle from "./pages/RequisicionDetalle";
import { NuevaRequisicion } from "./pages/NuevaRequisicion";
import EditarRequisicion from "./pages/EditarRequisicion";
import Formatos from "./pages/Formatos";
import UnderDevelopment from "./pages/UnderDevelopment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          
          <Route path="/requisiciones" element={<Layout><Requisiciones /></Layout>} />
          <Route path="/requisiciones/nueva" element={<Layout><NuevaRequisicion /></Layout>} />
          
          {/* <<< --- CORRECCIÓN IMPORTANTE --- >>> */}
          {/* Cambiamos ':folio' por ':id' para que RequisicionDetalle reciba el parámetro correcto */}
          <Route path="/requisiciones/:id" element={<Layout><RequisicionDetalle /></Layout>} />
          <Route path="/requisiciones/:id/editar" element={<Layout><EditarRequisicion /></Layout>} />

          <Route path="/formatos" element={<Layout><Formatos /></Layout>} />
          <Route path="/paaas" element={<Layout><UnderDevelopment module="PAAAS" /></Layout>} />
          <Route path="/area-compradora" element={<Layout><UnderDevelopment module="Área Compradora" /></Layout>} />
          <Route path="/catalogos" element={<Layout><UnderDevelopment module="Catálogos" /></Layout>} />
          <Route path="/administracion" element={<Layout><UnderDevelopment module="Administración" /></Layout>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;