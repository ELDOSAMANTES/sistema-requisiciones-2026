import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { perfilService, PerfilUsuario } from "@/services/perfilService";

export const UserProfileCard = () => {
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
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(perfil.nombre)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{perfil.nombre}</h3>
            <p className="text-sm text-muted-foreground">{perfil.puesto}</p>
            <p className="text-xs text-muted-foreground">{perfil.area}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
