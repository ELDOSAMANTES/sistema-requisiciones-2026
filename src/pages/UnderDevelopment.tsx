import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface UnderDevelopmentProps {
  module: string;
}

const UnderDevelopment = ({ module }: UnderDevelopmentProps) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Construction className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Módulo en Desarrollo</h2>
            <p className="text-muted-foreground">
              El módulo <span className="font-semibold text-foreground">{module}</span> se 
              encuentra actualmente en desarrollo y estará disponible en futuras versiones.
            </p>
            <p className="text-sm text-muted-foreground">
              Gracias por su comprensión.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnderDevelopment;
