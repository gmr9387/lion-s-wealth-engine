 import { supabase } from "@/integrations/supabase/client";
 
 type NotificationType = 
   | "dispute_status_update"
   | "subscription_confirmation"
   | "subscription_cancelled"
   | "action_reminder"
   | "welcome";
 
 interface SendNotificationParams {
   type: NotificationType;
   userId: string;
   data?: Record<string, unknown>;
 }
 
 export async function sendNotification({ type, userId, data }: SendNotificationParams) {
   try {
     const { data: response, error } = await supabase.functions.invoke("send-notification", {
       body: { type, userId, data },
     });
 
     if (error) {
       console.error("Failed to send notification:", error);
       throw error;
     }
 
     return response;
   } catch (error) {
     console.error("Notification error:", error);
     throw error;
   }
 }
 
 export function useNotifications() {
   const sendDisputeUpdate = async (userId: string, disputeData: {
     creditorName: string;
     status: string;
     notes?: string;
   }) => {
     return sendNotification({
       type: "dispute_status_update",
       userId,
       data: disputeData,
     });
   };
 
   const sendSubscriptionConfirmation = async (userId: string, planName: string) => {
     return sendNotification({
       type: "subscription_confirmation",
       userId,
       data: { planName },
     });
   };
 
   const sendSubscriptionCancelled = async (userId: string) => {
     return sendNotification({
       type: "subscription_cancelled",
       userId,
     });
   };
 
   const sendActionReminder = async (userId: string, actionData: {
     actionTitle: string;
     actionDescription?: string;
     dueDate?: string;
   }) => {
     return sendNotification({
       type: "action_reminder",
       userId,
       data: actionData,
     });
   };
 
   const sendWelcome = async (userId: string) => {
     return sendNotification({
       type: "welcome",
       userId,
     });
   };
 
   return {
     sendDisputeUpdate,
     sendSubscriptionConfirmation,
     sendSubscriptionCancelled,
     sendActionReminder,
     sendWelcome,
   };
 }