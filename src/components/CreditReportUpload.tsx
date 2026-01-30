import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useCreditReportUpload } from "@/hooks/useCreditReportUpload";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreditReportUploadProps {
  onSuccess?: () => void;
}

export function CreditReportUpload({ onSuccess }: CreditReportUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    score: number | null;
    tradelinesExtracted: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAndParse, uploading, parsing, isProcessing } = useCreditReportUpload();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setResult(null);
    const uploadResult = await uploadAndParse(file);
    if (uploadResult) {
      setResult(uploadResult);
      onSuccess?.();
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all text-center",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50",
          isProcessing && "opacity-50 pointer-events-none"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center gap-4">
          {isProcessing ? (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div>
                <p className="text-lg font-medium text-foreground">
                  {uploading ? "Uploading..." : "Parsing with AI..."}
                </p>
                <p className="text-sm text-muted-foreground">
                  {uploading
                    ? "Uploading your credit report"
                    : "Extracting tradelines and score data"}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  Drop your credit report PDF here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse files
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="w-4 h-4 mr-2" />
                Select PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {result && (
        <div
          className={cn(
            "rounded-lg border p-4",
            result.success
              ? "border-success/30 bg-success/5"
              : "border-destructive/30 bg-destructive/5"
          )}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            )}
            <div>
              <p className="font-medium text-foreground">
                {result.success ? "Import Successful!" : "Import Failed"}
              </p>
              {result.success && (
                <div className="text-sm text-muted-foreground mt-1">
                  <p>
                    Extracted <strong>{result.tradelinesExtracted}</strong>{" "}
                    tradelines
                  </p>
                  {result.score && (
                    <p>
                      Credit Score: <strong>{result.score}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <p>
          <strong>Supported:</strong> PDF credit reports from Experian, Equifax,
          and TransUnion
        </p>
        <p>
          <strong>Max size:</strong> 10MB • Your data is encrypted and secure
        </p>
      </div>
    </div>
  );
}
