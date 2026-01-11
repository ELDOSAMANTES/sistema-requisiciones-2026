import { Bell, User, LogOut, Settings, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { perfilService, PerfilUsuario } from "@/services/perfilService";

export const TopBar = () => {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);

  useEffect(() => {
    const cargarPerfil = async () => {
      const datos = await perfilService.obtenerPerfil();
      setPerfil(datos);
    };
    cargarPerfil();
  }, []);

  const getInitials = (nombre: string) => {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="h-16 border-b border-border bg-primary flex items-center px-4 sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-primary-foreground hover:bg-primary/90" />
        <img 
          src="https://framework-gb.cdn.gob.mx/landing/img/logoheader.svg" 
          alt="Gobierno de México" 
          className="h-10"
        />
      </div>
      
      <div className="ml-4 flex-1">
        <p className="text-primary-foreground/80 text-sm">
          Sistema Integral de Adquisiciones Gubernamentales
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-primary-foreground hover:bg-primary/90"
        >
          <Bell className="h-5 w-5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="text-primary-foreground hover:bg-primary/90 gap-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary-foreground text-primary text-xs">
                  {perfil ? getInitials(perfil.nombre) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium">{perfil?.nombre || 'Usuario'}</span>
                <span className="text-xs opacity-80">{perfil?.puesto || 'Cargando...'}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{perfil?.nombre}</p>
                <p className="text-xs text-muted-foreground">{perfil?.puesto}</p>
                <p className="text-xs text-muted-foreground">{perfil?.area}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Mi Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
