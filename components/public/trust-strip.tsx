import { Users, BookOpen, Award, Star } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "5.000+",
    label: "profissionais formados",
  },
  {
    icon: BookOpen,
    value: "200+",
    label: "horas de conteudo",
  },
  {
    icon: Award,
    value: "98%",
    label: "indice de satisfacao",
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "avaliacao media",
  },
];

export function TrustStrip() {
  return (
    <section className="border-b border-slate-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#1F3A2D]/5 text-[#1F3A2D]">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-montserrat text-2xl font-bold text-[#1F3A2D] leading-none">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}