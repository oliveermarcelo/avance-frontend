import { db } from '@/lib/db'
import { PaymentStatus } from '@prisma/client'

export interface MonthlyEnrollment {
  month: string
  count: number
}

export interface CourseAnalytics {
  id: string
  title: string
  enrollments: number
  completionRate: number
  revenue: number
  avgProgress: number
}

export interface InstructorAnalyticsData {
  totalStudents: number
  avgCompletionRate: number
  totalRevenue: number
  avgProgress: number
  monthlyEnrollments: MonthlyEnrollment[]
  courseStats: CourseAnalytics[]
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export async function getInstructorAnalytics(instructorId: string): Promise<InstructorAnalyticsData> {
  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const buildEmptyMonths = (): MonthlyEnrollment[] => {
    const result: MonthlyEnrollment[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      result.push({ month: MONTHS[d.getMonth()], count: 0 })
    }
    return result
  }

  const courses = await db.course.findMany({
    where: { instructorId, deletedAt: null },
    select: { id: true, title: true }
  })

  if (courses.length === 0) {
    return {
      totalStudents: 0,
      avgCompletionRate: 0,
      totalRevenue: 0,
      avgProgress: 0,
      monthlyEnrollments: buildEmptyMonths(),
      courseStats: []
    }
  }

  const courseIds = courses.map(c => c.id)

  const [recentEnrollments, allEnrollments, payments] = await Promise.all([
    db.enrollment.findMany({
      where: { courseId: { in: courseIds }, enrolledAt: { gte: sixMonthsAgo } },
      select: { enrolledAt: true, courseId: true }
    }),
    db.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      select: { userId: true, courseId: true, status: true, progress: true }
    }),
    db.payment.findMany({
      where: { courseId: { in: courseIds }, status: PaymentStatus.PAID },
      select: { amount: true, courseId: true }
    })
  ])

  // Monthly enrollments map
  const monthMap = new Map<string, number>()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthMap.set(`${d.getFullYear()}-${d.getMonth()}`, 0)
  }
  for (const e of recentEnrollments) {
    const d = new Date(e.enrolledAt)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (monthMap.has(key)) monthMap.set(key, (monthMap.get(key) ?? 0) + 1)
  }
  const monthlyEnrollments: MonthlyEnrollment[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    monthlyEnrollments.push({ month: MONTHS[d.getMonth()], count: monthMap.get(key) ?? 0 })
  }

  // Per-course stats
  const courseStats: CourseAnalytics[] = courses.map(course => {
    const ce = allEnrollments.filter(e => e.courseId === course.id)
    const completed = ce.filter(e => e.status === 'COMPLETED' || e.progress >= 100).length
    const completionRate = ce.length > 0 ? Math.round((completed / ce.length) * 100) : 0
    const revenue = payments
      .filter(p => p.courseId === course.id)
      .reduce((sum, p) => sum + Number(p.amount), 0)
    const avgProgress = ce.length > 0
      ? Math.round(ce.reduce((sum, e) => sum + e.progress, 0) / ce.length)
      : 0
    return { id: course.id, title: course.title, enrollments: ce.length, completionRate, revenue, avgProgress }
  })

  const totalStudents = new Set(allEnrollments.map(e => e.userId)).size
  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const avgCompletionRate = courseStats.length > 0
    ? Math.round(courseStats.reduce((sum, c) => sum + c.completionRate, 0) / courseStats.length)
    : 0
  const avgProgress = allEnrollments.length > 0
    ? Math.round(allEnrollments.reduce((sum, e) => sum + e.progress, 0) / allEnrollments.length)
    : 0

  return { totalStudents, avgCompletionRate, totalRevenue, avgProgress, monthlyEnrollments, courseStats }
}