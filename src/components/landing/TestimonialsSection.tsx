import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Went from 520 to 718 in 9 months. The dispute letters alone saved me thousands compared to a credit repair agency.",
    name: "Marcus T.",
    role: "Small Business Owner",
    score: "+198 pts",
  },
  {
    quote:
      "The funding timeline showed me exactly when to apply for each card. I stacked $85K in business credit by month 14.",
    name: "Jasmine R.",
    role: "Entrepreneur",
    score: "$85K funded",
  },
  {
    quote:
      "Million Mode is no joke. The AI mapped out every step. I just had to show up and execute. Best investment I've made.",
    name: "David K.",
    role: "Real Estate Investor",
    score: "700+ score",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-28 border-t border-border/50 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            Real Results
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            People Who{" "}
            <span className="text-gradient-gold">Took Action</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="relative rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-6 flex flex-col"
            >
              <Quote className="w-8 h-8 text-primary/20 mb-3" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, si) => (
                  <Star
                    key={si}
                    className="w-3.5 h-3.5 fill-primary text-primary"
                  />
                ))}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">
                "{t.quote}"
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {t.score}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
