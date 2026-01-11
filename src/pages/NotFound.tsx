import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-4xl font-bold">404</h1>
            <h2 className="text-2xl font-semibold">Página No Encontrada</h2>
            <p className="text-muted-foreground">
              Lo sentimos, la página que buscas no existe o ha sido movida.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-primary hover:bg-primary/90"
            >
              <Home className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
