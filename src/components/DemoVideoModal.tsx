 import { useState } from "react";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { 
   Play, 
   CreditCard, 
   FileText, 
   TrendingUp, 
   Crown,
   ChevronRight,
   CheckCircle2
 } from "lucide-react";
 
 interface DemoVideoModalProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
 }
 
 const demoSteps = [
   {
     icon: CreditCard,
     title: "AI Credit Analysis",
     description: "Upload your credit report and get instant AI-powered insights. Our engine identifies negative items, calculates impact scores, and prioritizes what to fix first.",
     features: ["Automatic tradeline detection", "Score impact analysis", "Priority ranking"],
   },
   {
     icon: FileText,
     title: "Automated Disputes",
     description: "Generate FCRA-compliant dispute letters with one click. Track progress, manage responses, and watch negative items get removed.",
     features: ["One-click letter generation", "Bureau tracking", "Response management"],
   },
   {
     icon: TrendingUp,
     title: "Wealth Building",
     description: "Get personalized wealth strategies based on your profile. From income optimization to asset building, we map your path to financial freedom.",
     features: ["Custom wealth plans", "Income strategies", "Asset roadmap"],
   },
   {
     icon: Crown,
     title: "Million Mode",
     description: "Unlock elite funding sequences. Graduate from $2,000 starter cards to $1,000,000+ in business credit through our proven 12-month system.",
     features: ["Funding timeline", "Credit stacking", "Business credit"],
   },
 ];
 
 export function DemoVideoModal({ open, onOpenChange }: DemoVideoModalProps) {
   const [currentStep, setCurrentStep] = useState(0);
 
   const handleNext = () => {
     if (currentStep < demoSteps.length - 1) {
       setCurrentStep(currentStep + 1);
     } else {
       onOpenChange(false);
       setCurrentStep(0);
     }
   };
 
   const handlePrev = () => {
     if (currentStep > 0) {
       setCurrentStep(currentStep - 1);
     }
   };
 
   const step = demoSteps[currentStep];
   const Icon = step.icon;
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-2xl p-0 overflow-hidden">
         <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Play className="w-6 h-6 text-primary" />
              How Lion's Wealth Engine Works
            </DialogTitle>
         </DialogHeader>
 
         <div className="p-6">
           {/* Progress indicators */}
           <div className="flex gap-2 mb-6">
             {demoSteps.map((_, index) => (
               <button
                 key={index}
                 onClick={() => setCurrentStep(index)}
                 className={`h-1.5 flex-1 rounded-full transition-colors ${
                   index === currentStep
                     ? "bg-primary"
                     : index < currentStep
                     ? "bg-primary/50"
                     : "bg-muted"
                 }`}
               />
             ))}
           </div>
 
           {/* Step content */}
           <div className="space-y-6">
             <div className="flex items-start gap-4">
               <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                 <Icon className="h-7 w-7 text-primary" />
               </div>
               <div>
                 <h3 className="text-xl font-semibold text-foreground mb-1">
                   {step.title}
                 </h3>
                 <p className="text-muted-foreground">
                   {step.description}
                 </p>
               </div>
             </div>
 
             {/* Feature list */}
             <div className="bg-card rounded-lg border border-border p-4">
               <p className="text-sm font-medium text-muted-foreground mb-3">Key Features:</p>
               <div className="space-y-2">
                 {step.features.map((feature, index) => (
                   <div key={index} className="flex items-center gap-2">
                     <CheckCircle2 className="w-4 h-4 text-primary" />
                     <span className="text-sm text-foreground">{feature}</span>
                   </div>
                 ))}
               </div>
             </div>
 
             {/* Visual placeholder */}
             <div className="relative aspect-video bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-border flex items-center justify-center">
               <div className="text-center">
                 <Icon className="w-16 h-16 text-primary/30 mx-auto mb-3" />
                 <p className="text-sm text-muted-foreground">
                   Step {currentStep + 1} of {demoSteps.length}
                 </p>
               </div>
             </div>
           </div>
 
           {/* Navigation */}
           <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
             <Button
               variant="ghost"
               onClick={handlePrev}
               disabled={currentStep === 0}
             >
               Previous
             </Button>
             <span className="text-sm text-muted-foreground">
               {currentStep + 1} / {demoSteps.length}
             </span>
             <Button variant="premium" onClick={handleNext}>
               {currentStep === demoSteps.length - 1 ? (
                 "Get Started"
               ) : (
                 <>
                   Next
                   <ChevronRight className="w-4 h-4" />
                 </>
               )}
             </Button>
           </div>
         </div>
       </DialogContent>
     </Dialog>
   );
 }