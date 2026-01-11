import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { perfilService, PerfilUsuario } from "@/services/perfilService";

export const UserInfoHeader = () => {
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

  if (!perfil) return null;

  return (
    <div className="flex items-center gap-3 mb-6 pb-4 border-b">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
          {getInitials(perfil.nombre)}
        </AvatarFallback>
      </Avatar>
      <div>
        <h3 className="font-semibold text-foreground">{perfil.nombre}</h3>
        <p className="text-sm text-muted-foreground">{perfil.puesto} • {perfil.area}</p>
      </div>
    </div>
  );
};
