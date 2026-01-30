import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface BusinessEntity {
  id: string;
  business_name: string | null;
  entity_type: string;
  ein: string | null;
  state_of_formation: string | null;
  formation_date: string | null;
  business_address: string | null;
  business_phone: string | null;
  bank_account_opened: boolean;
  created_at: string;
}

interface BusinessStep {
  id: string;
  business_id: string | null;
  step_number: number;
  step_title: string;
  step_description: string | null;
  status: "pending" | "in_progress" | "completed";
  completed_at: string | null;
  notes: string | null;
}

const DEFAULT_STEPS = [
  { step_number: 1, step_title: "Choose Business Structure", step_description: "LLC recommended for liability protection and tax flexibility" },
  { step_number: 2, step_title: "Register Business Name", step_description: "File with your state's Secretary of State" },
  { step_number: 3, step_title: "Obtain EIN", step_description: "Free from IRS - takes 5 minutes online" },
  { step_number: 4, step_title: "Open Business Bank Account", step_description: "Separate business and personal finances" },
  { step_number: 5, step_title: "Establish Business Address", step_description: "Virtual mailbox or physical location" },
  { step_number: 6, step_title: "Get Business Phone", step_description: "Dedicated business line for credibility" },
];

export function useBusiness() {
  const [loading, setLoading] = useState(true);
  const [entity, setEntity] = useState<BusinessEntity | null>(null);
  const [steps, setSteps] = useState<BusinessStep[]>([]);
  const { session } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    if (!session?.user?.id) return;

    setLoading(true);

    // Fetch business entity
    const { data: entityData } = await supabase
      .from("business_entities")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    setEntity(entityData);

    // Fetch steps
    const { data: stepsData } = await supabase
      .from("business_steps")
      .select("*")
      .eq("user_id", session.user.id)
      .order("step_number", { ascending: true });

    // Cast status to proper type
    const typedSteps: BusinessStep[] = (stepsData || []).map((step) => ({
      ...step,
      status: step.status as "pending" | "in_progress" | "completed",
    }));

    setSteps(typedSteps);
    setLoading(false);
  };

  const startBusinessSetup = async () => {
    if (!session?.user?.id) return;

    try {
      // Create business entity
      const { data: newEntity, error: entityError } = await supabase
        .from("business_entities")
        .insert({ user_id: session.user.id })
        .select()
        .single();

      if (entityError) throw entityError;

      // Create default steps
      const stepsToInsert = DEFAULT_STEPS.map((step) => ({
        user_id: session.user.id,
        business_id: newEntity.id,
        ...step,
        status: "pending" as const,
      }));

      const { error: stepsError } = await supabase
        .from("business_steps")
        .insert(stepsToInsert);

      if (stepsError) throw stepsError;

      toast({
        title: "Business setup started!",
        description: "Complete each step to build your business credit foundation.",
      });

      await fetchData();
    } catch (error) {
      console.error("Error starting business setup:", error);
      toast({
        title: "Error",
        description: "Failed to start business setup",
        variant: "destructive",
      });
    }
  };

  const updateStep = async (stepId: string, status: "pending" | "in_progress" | "completed", notes?: string) => {
    try {
      const updateData: Partial<BusinessStep> = { status };
      if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
      }
      if (notes !== undefined) {
        updateData.notes = notes;
      }

      const { error } = await supabase
        .from("business_steps")
        .update(updateData)
        .eq("id", stepId);

      if (error) throw error;

      await fetchData();

      if (status === "completed") {
        toast({ title: "Step completed!" });
      }
    } catch (error) {
      console.error("Error updating step:", error);
      toast({
        title: "Error",
        description: "Failed to update step",
        variant: "destructive",
      });
    }
  };

  const updateEntity = async (updates: Partial<BusinessEntity>) => {
    if (!entity?.id) return;

    try {
      const { error } = await supabase
        .from("business_entities")
        .update(updates)
        .eq("id", entity.id);

      if (error) throw error;

      await fetchData();
      toast({ title: "Business info updated!" });
    } catch (error) {
      console.error("Error updating entity:", error);
      toast({
        title: "Error",
        description: "Failed to update business info",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session?.user?.id]);

  const completedSteps = steps.filter((s) => s.status === "completed").length;
  const totalSteps = steps.length || DEFAULT_STEPS.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return {
    loading,
    entity,
    steps,
    completedSteps,
    totalSteps,
    progress,
    startBusinessSetup,
    updateStep,
    updateEntity,
    refetch: fetchData,
    hasStarted: !!entity || steps.length > 0,
  };
}
