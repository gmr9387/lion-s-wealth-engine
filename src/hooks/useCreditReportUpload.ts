import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface UploadResult {
  success: boolean;
  score: number | null;
  bureau: string | null;
  tradelinesExtracted: number;
}

export function useCreditReportUpload() {
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();

  const uploadAndParse = async (file: File): Promise<UploadResult | null> => {
    if (!session?.user?.id || !session?.access_token) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to upload credit reports",
        variant: "destructive",
      });
      return null;
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return null;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);

    try {
      // Create upload record
      const { data: uploadRecord, error: insertError } = await supabase
        .from("credit_report_uploads")
        .insert({
          user_id: session.user.id,
          file_name: file.name,
          file_size: file.size,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) {
        throw new Error("Failed to create upload record");
      }

      // Upload file to storage
      const filePath = `${session.user.id}/${uploadRecord.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("credit-reports")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error("Failed to upload file");
      }

      setUploading(false);
      setParsing(true);

      toast({
        title: "Upload complete",
        description: "Parsing credit report with AI...",
      });

      // Read file as text for parsing
      const text = await file.text();

      // Call edge function to parse
      const { data, error } = await supabase.functions.invoke("parse-credit-report", {
        body: {
          uploadId: uploadRecord.id,
          reportText: text,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to parse credit report");
      }

      toast({
        title: "Credit report parsed!",
        description: `Extracted ${data.tradelinesExtracted} tradelines${data.score ? ` and score ${data.score}` : ""}`,
      });

      return data as UploadResult;
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process credit report",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  return {
    uploadAndParse,
    uploading,
    parsing,
    isProcessing: uploading || parsing,
  };
}
