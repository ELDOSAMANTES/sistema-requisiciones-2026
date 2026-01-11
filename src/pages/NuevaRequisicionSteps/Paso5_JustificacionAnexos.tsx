import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Trash2, Download } from "lucide-react";
import { DocumentoGenerado } from '@/lib/foconGenerators';

interface Paso5Props {
  justificacion: string;
  setJustificacion: (justificacion: string) => void;
  anexos: File[];
  setAnexos: (anexos: File[]) => void;
  guardarBorrador: () => void;
  setPaso: (paso: number) => void;
  documentosGenerados: DocumentoGenerado[];
}

const Paso5_JustificacionAnexos: React.FC<Paso5Props> = ({
  justificacion,
  setJustificacion,
  anexos,
  setAnexos,
  guardarBorrador,
  setPaso,
  documentosGenerados,
}) => {
  const descargarDocumento = (doc: DocumentoGenerado) => {
    if (doc.blob) {
      const url = URL.createObjectURL(doc.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.nombre;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
  return (
    <Card>
      <CardHeader className="border-b border-border bg-muted/30">
        <CardTitle className="text-2xl text-primary">Paso 5: Justificación y Anexos Técnicos</CardTitle>
        <CardDescription>Formato FO-CON-03 (Parte 3) - Documenta la necesidad y especificaciones</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold">Justificación para la Adquisición</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Explica detalladamente las razones por las cuales se requieren los bienes o servicios, cómo beneficiarán
              a la dependencia y por qué es necesario realizar esta contratación.
            </p>
            <Textarea
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="Redacta la justificación completa..."
              className="min-h-[200px]"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Caracteres: {justificacion.length} | Mínimo recomendado: 500
            </p>
          </div>
          <div>
            <Label className="text-base font-semibold">Anexos Técnicos</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Adjunta documentos que soporten tu requisición: fichas técnicas, especificaciones, catálogos,
              estudios de mercado, etc.
            </p>
            <div className="border-2 border-dashed border-border rounded-md p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
              <input
                type="file"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    setAnexos([...anexos, ...Array.from(e.target.files)]);
                  }
                }}
                className="hidden"
                id="file-upload"
              />
              <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
                Seleccionar Archivos
              </Button>
            </div>
            {anexos.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold text-sm">Archivos Adjuntos:</h4>
                {anexos.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAnexos(anexos.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-green-50 border border-green-200 p-4 rounded-md">
            <h4 className="font-semibold text-green-900 mb-2">Anexos Automáticos</h4>
            <p className="text-sm text-green-800 mb-3">
              Los siguientes documentos se adjuntarán automáticamente a tu requisición:
            </p>
            <ul className="text-sm text-green-800 list-disc list-inside space-y-1">
              <li>FO-CON-02: Constancia de No Existencia</li>
              <li>FO-CON-05: Resultado de Investigación de Mercado</li>
              <li>Cotizaciones de proveedores</li>
            </ul>
          </div>
        </div>
        
        {/* DOCUMENTOS GENERADOS */}
        {documentosGenerados.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mt-6">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Formatos Generados
            </h4>
            <div className="flex flex-wrap gap-2">
              {documentosGenerados.map((doc, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => descargarDocumento(doc)}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  {doc.codigo}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-between pt-6 border-t mt-6">
          <Button variant="outline" onClick={() => setPaso(4)}>
            Regresar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={guardarBorrador}>
              Guardar Borrador
            </Button>
            <Button onClick={() => setPaso(6)} className="bg-primary text-primary-foreground">
              Continuar a Vista Previa
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Paso5_JustificacionAnexos;