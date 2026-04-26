export interface Course {
  name: string;
  slug: string;
  title: string;
  shortDescription: string;
  description?: string;
  thumbnail?: string;
  category: string;
  instructor: {
    name: string;
    avatar?: string;
  };
  totalLessons: number;
  totalDurationMinutes: number;
  rating: number;
  totalStudents: number;
  isPremium: boolean;
  isPublished: boolean;
  price: number;
  isFree: boolean;
}

export interface CourseProgress {
  courseSlug: string;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
  lastLessonId?: string;
}

export interface Lesson {
  id: string;
  title: string;
  videoUrl?: string;
  durationSeconds: number;
  order: number;
  isCompleted: boolean;
}