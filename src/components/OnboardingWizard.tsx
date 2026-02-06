 import { useState } from "react";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { Progress } from "@/components/ui/progress";
 import { 
   Zap, 
   TrendingUp, 
   FileText, 
   CheckCircle2,
   ArrowRight,
   Loader2,
   Trophy
 } from "lucide-react";
 import { useRecordScore } from "@/hooks/useTradelineActions";
 import { useCreateDispute } from "@/hooks/useDisputes";
 import { CreditBureau } from "@/types";
 import { z } from "zod";
 import { useNavigate } from "react-router-dom";
 
 interface OnboardingWizardProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onComplete: () => void;
 }
 
 const scoreSchema = z.object({
   score: z.coerce.number().min(300).max(850),
   bureau: z.enum(["experian", "equifax", "transunion"]),
 });
 
 type OnboardingStep = "welcome" | "score" | "dispute" | "complete";
 
 export function OnboardingWizard({ open, onOpenChange, onComplete }: OnboardingWizardProps) {
   const [step, setStep] = useState<OnboardingStep>("welcome");
   const [loading, setLoading] = useState(false);
   const [scoreData, setScoreData] = useState({ score: "", bureau: "" });
   const [disputeData, setDisputeData] = useState({ creditorName: "", reason: "", bureau: "" });
   const [errors, setErrors] = useState<Record<string, string>>({});
   
   const recordScore = useRecordScore();
   const createDispute = useCreateDispute();
   const navigate = useNavigate();
 
   const getProgress = () => {
     switch (step) {
       case "welcome": return 0;
       case "score": return 33;
       case "dispute": return 66;
       case "complete": return 100;
     }
   };
 
   const handleScoreSubmit = async () => {
     setErrors({});
     
     const result = scoreSchema.safeParse({
       score: scoreData.score,
       bureau: scoreData.bureau,
     });
 
     if (!result.success) {
       const fieldErrors: Record<string, string> = {};
       result.error.errors.forEach((err) => {
         if (err.path[0]) {
           fieldErrors[err.path[0].toString()] = err.message;
         }
       });
       setErrors(fieldErrors);
       return;
     }
 
     setLoading(true);
     try {
       await recordScore.mutateAsync({
         score: result.data.score,
         bureau: result.data.bureau as CreditBureau,
         source: "onboarding",
       });
       setStep("dispute");
     } catch (error) {
       console.error("Error recording score:", error);
     } finally {
       setLoading(false);
     }
   };
 
   const handleDisputeSubmit = async () => {
     if (!disputeData.creditorName || !disputeData.reason || !disputeData.bureau) {
       setErrors({
         creditorName: !disputeData.creditorName ? "Required" : "",
         reason: !disputeData.reason ? "Required" : "",
         bureau: !disputeData.bureau ? "Required" : "",
       });
       return;
     }
 
     setLoading(true);
     try {
       await createDispute.mutateAsync({
         bureau: disputeData.bureau as CreditBureau,
         reason: disputeData.reason,
       });
       setStep("complete");
     } catch (error) {
       console.error("Error creating dispute:", error);
     } finally {
       setLoading(false);
     }
   };
 
   const handleSkipDispute = () => {
     setStep("complete");
   };
 
   const handleComplete = () => {
     onComplete();
     onOpenChange(false);
     setStep("welcome");
     setScoreData({ score: "", bureau: "" });
     setDisputeData({ creditorName: "", reason: "", bureau: "" });
   };
 
   const handleViewDashboard = () => {
     handleComplete();
     navigate("/app");
   };
 
   const renderStep = () => {
     switch (step) {
       case "welcome":
         return (
           <div className="text-center space-y-6">
             <div className="flex justify-center">
               <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                 <Zap className="h-10 w-10 text-primary-foreground" />
               </div>
             </div>
             <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Welcome to Lion's Wealth Engine!
               </h2>
               <p className="text-muted-foreground">
                 Let's get your credit journey started in just 2 minutes.
               </p>
             </div>
             <div className="grid gap-3 text-left">
               {[
                 { icon: TrendingUp, text: "Add your first credit score" },
                 { icon: FileText, text: "Create your first dispute" },
                 { icon: CheckCircle2, text: "Unlock personalized insights" },
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                   <item.icon className="h-5 w-5 text-primary" />
                   <span className="text-sm text-foreground">{item.text}</span>
                 </div>
               ))}
             </div>
             <Button variant="premium" size="lg" className="w-full" onClick={() => setStep("score")}>
               Let's Go
               <ArrowRight className="w-5 h-5" />
             </Button>
           </div>
         );
 
       case "score":
         return (
           <div className="space-y-6">
             <div className="text-center">
               <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-4">
                 <TrendingUp className="h-6 w-6 text-primary" />
               </div>
               <h2 className="text-xl font-bold text-foreground mb-1">
                 Add Your Credit Score
               </h2>
               <p className="text-sm text-muted-foreground">
                 This helps us calculate your funding potential
               </p>
             </div>
 
             <div className="space-y-4">
               <div className="space-y-2">
                 <Label>Credit Bureau</Label>
                 <Select
                   value={scoreData.bureau}
                   onValueChange={(value) => setScoreData({ ...scoreData, bureau: value })}
                 >
                   <SelectTrigger className="bg-background">
                     <SelectValue placeholder="Select bureau" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="experian">Experian</SelectItem>
                     <SelectItem value="equifax">Equifax</SelectItem>
                     <SelectItem value="transunion">TransUnion</SelectItem>
                   </SelectContent>
                 </Select>
                 {errors.bureau && (
                   <p className="text-xs text-destructive">{errors.bureau}</p>
                 )}
               </div>
 
               <div className="space-y-2">
                 <Label>Credit Score</Label>
                 <Input
                   type="number"
                   min={300}
                   max={850}
                   placeholder="Enter your score (300-850)"
                   value={scoreData.score}
                   onChange={(e) => setScoreData({ ...scoreData, score: e.target.value })}
                   className="bg-background text-xl font-semibold text-center"
                 />
                 {errors.score && (
                   <p className="text-xs text-destructive">{errors.score}</p>
                 )}
               </div>
             </div>
 
             <Button 
               variant="premium" 
               size="lg" 
               className="w-full" 
               onClick={handleScoreSubmit}
               disabled={loading}
             >
               {loading ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
               ) : (
                 <>
                   Continue
                   <ArrowRight className="w-5 h-5" />
                 </>
               )}
             </Button>
           </div>
         );
 
       case "dispute":
         return (
           <div className="space-y-6">
             <div className="text-center">
               <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-4">
                 <FileText className="h-6 w-6 text-primary" />
               </div>
               <h2 className="text-xl font-bold text-foreground mb-1">
                 Create Your First Dispute
               </h2>
               <p className="text-sm text-muted-foreground">
                 Target a negative item on your report
               </p>
             </div>
 
             <div className="space-y-4">
               <div className="space-y-2">
                 <Label>Creditor Name</Label>
                 <Input
                   placeholder="e.g., Capital One, Collection Agency"
                   value={disputeData.creditorName}
                   onChange={(e) => setDisputeData({ ...disputeData, creditorName: e.target.value })}
                   className="bg-background"
                 />
                 {errors.creditorName && (
                   <p className="text-xs text-destructive">{errors.creditorName}</p>
                 )}
               </div>
 
               <div className="space-y-2">
                 <Label>Bureau</Label>
                 <Select
                   value={disputeData.bureau}
                   onValueChange={(value) => setDisputeData({ ...disputeData, bureau: value })}
                 >
                   <SelectTrigger className="bg-background">
                     <SelectValue placeholder="Select bureau" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="experian">Experian</SelectItem>
                     <SelectItem value="equifax">Equifax</SelectItem>
                     <SelectItem value="transunion">TransUnion</SelectItem>
                   </SelectContent>
                 </Select>
                 {errors.bureau && (
                   <p className="text-xs text-destructive">{errors.bureau}</p>
                 )}
               </div>
 
               <div className="space-y-2">
                 <Label>Dispute Reason</Label>
                 <Select
                   value={disputeData.reason}
                   onValueChange={(value) => setDisputeData({ ...disputeData, reason: value })}
                 >
                   <SelectTrigger className="bg-background">
                     <SelectValue placeholder="Select reason" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="not_my_account">Not My Account</SelectItem>
                     <SelectItem value="incorrect_balance">Incorrect Balance</SelectItem>
                     <SelectItem value="incorrect_payment_history">Incorrect Payment History</SelectItem>
                     <SelectItem value="account_closed">Account Should Show Closed</SelectItem>
                     <SelectItem value="duplicate_account">Duplicate Account</SelectItem>
                     <SelectItem value="outdated_information">Outdated Information</SelectItem>
                   </SelectContent>
                 </Select>
                 {errors.reason && (
                   <p className="text-xs text-destructive">{errors.reason}</p>
                 )}
               </div>
             </div>
 
             <div className="flex gap-3">
               <Button 
                 variant="outline" 
                 size="lg" 
                 className="flex-1"
                 onClick={handleSkipDispute}
               >
                 Skip for Now
               </Button>
               <Button 
                 variant="premium" 
                 size="lg" 
                 className="flex-1" 
                 onClick={handleDisputeSubmit}
                 disabled={loading}
               >
                 {loading ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                 ) : (
                   <>
                     Create Dispute
                   </>
                 )}
               </Button>
             </div>
           </div>
         );
 
       case "complete":
         return (
           <div className="text-center space-y-6">
             <div className="flex justify-center">
               <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                 <Trophy className="h-10 w-10 text-primary-foreground" />
               </div>
             </div>
             <div>
               <h2 className="text-2xl font-bold text-foreground mb-2">
                 You're All Set! 🎉
               </h2>
               <p className="text-muted-foreground">
                 Your credit optimization journey has officially begun.
               </p>
             </div>
             <div className="bg-card rounded-lg border border-border p-4 text-left">
               <p className="text-sm font-medium text-foreground mb-2">What's next?</p>
               <ul className="text-sm text-muted-foreground space-y-1">
                 <li>• Check your Next Best Move recommendations</li>
                 <li>• Upload a full credit report for AI analysis</li>
                 <li>• Explore your personalized wealth plan</li>
               </ul>
             </div>
             <Button variant="premium" size="lg" className="w-full" onClick={handleViewDashboard}>
               View Dashboard
               <ArrowRight className="w-5 h-5" />
             </Button>
           </div>
         );
     }
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-md">
         <DialogHeader className="sr-only">
           <DialogTitle>Onboarding Wizard</DialogTitle>
           <DialogDescription>Complete your CWE-X setup</DialogDescription>
         </DialogHeader>
         
         {step !== "welcome" && step !== "complete" && (
           <div className="mb-4">
             <Progress value={getProgress()} className="h-1" />
           </div>
         )}
         
         {renderStep()}
       </DialogContent>
     </Dialog>
   );
 }