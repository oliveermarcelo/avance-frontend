import { db } from "@/lib/db";
import { HomeHero } from "@/components/public/home-hero";
import { TrustStrip } from "@/components/public/trust-strip";
import { FeaturedCourses } from "@/components/public/featured-courses";
import { BenefitsSection } from "@/components/public/benefits-section";
import { HowItWorksSection } from "@/components/public/how-it-works-section";
import { TestimonialsSection } from "@/components/public/testimonials-section";
import { FinalCtaSection } from "@/components/public/final-cta-section";

async function getFeaturedCourses() {
  const courses = await db.course.findMany({
    where: {
      isPublished: true,
      deletedAt: null,
      OR: [{ isFeatured: true }, { isPremium: true }],
    },
    orderBy: [{ isFeatured: "desc" }, { enrollmentCount: "desc" }],
    take: 6,
    include: {
      category: { select: { name: true, color: true } },
      instructor: { select: { name: true } },
    },
  });

  return courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    shortDescription: c.shortDescription,
    thumbnail: c.thumbnail,
    price: c.price.toNumber(),
    isFree: c.isFree,
    isPremium: c.isPremium,
    totalLessons: c.totalLessons,
    totalDuration: c.totalDuration,
    enrollmentCount: c.enrollmentCount,
    category: c.category,
    instructor: c.instructor,
  }));
}

export default async function HomePage() {
  const featuredCourses = await getFeaturedCourses();

  return (
    <>
      <HomeHero />
      <TrustStrip />
      <FeaturedCourses courses={featuredCourses} />
      <BenefitsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FinalCtaSection />
    </>
  );
}

export const dynamic = "force-dynamic";