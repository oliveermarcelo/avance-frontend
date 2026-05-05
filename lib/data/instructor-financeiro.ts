import { db } from '@/lib/db'
import { PaymentStatus } from '@prisma/client'

export interface PaymentRow {
  id: string
  courseTitle: string
  studentName: string
  studentEmail: string
  amount: number
  method: string
  status: string
  paidAt: string | null
  createdAt: string
}

export interface CourseRevenue {
  id: string
  title: string
  revenue: number
  sales: number
}

export interface InstructorFinanceiroData {
  totalRevenue: number
  monthRevenue: number
  avgTicket: number
  totalSales: number
  payments: PaymentRow[]
  byCourse: CourseRevenue[]
}

const METHOD_LABEL: Record<string, string> = {
  PIX: 'PIX',
  CREDIT_CARD: 'Cartao',
  BOLETO: 'Boleto'
}

const STATUS_LABEL: Record<string, string> = {
  PAID: 'Pago',
  PENDING: 'Pendente',
  FAILED: 'Falhou',
  REFUNDED: 'Estornado'
}

export async function getInstructorFinanceiro(instructorId: string): Promise<InstructorFinanceiroData> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const courses = await db.course.findMany({
    where: { instructorId, deletedAt: null },
    select: { id: true, title: true }
  })

  if (courses.length === 0) {
    return { totalRevenue: 0, monthRevenue: 0, avgTicket: 0, totalSales: 0, payments: [], byCourse: [] }
  }

  const courseIds = courses.map(c => c.id)
  const courseMap = new Map(courses.map(c => [c.id, c.title]))

  const rawPayments = await db.payment.findMany({
    where: { courseId: { in: courseIds } },
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  const paidPayments = rawPayments.filter(p => p.status === PaymentStatus.PAID)

  const totalRevenue = paidPayments.reduce((s, p) => s + Number(p.amount), 0)
  const monthRevenue = paidPayments
    .filter(p => p.paidAt && new Date(p.paidAt) >= startOfMonth)
    .reduce((s, p) => s + Number(p.amount), 0)
  const totalSales = paidPayments.length
  const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0

  const payments: PaymentRow[] = rawPayments.map(p => ({
    id: p.id,
    courseTitle: courseMap.get(p.courseId) ?? '',
    studentName: p.user.name,
    studentEmail: p.user.email,
    amount: Number(p.amount),
    method: METHOD_LABEL[p.method] ?? p.method,
    status: STATUS_LABEL[p.status] ?? p.status,
    paidAt: p.paidAt ? p.paidAt.toISOString() : null,
    createdAt: p.createdAt.toISOString()
  }))

  const revenueMap = new Map<string, { revenue: number; sales: number }>()
  for (const p of paidPayments) {
    const cur = revenueMap.get(p.courseId) ?? { revenue: 0, sales: 0 }
    revenueMap.set(p.courseId, { revenue: cur.revenue + Number(p.amount), sales: cur.sales + 1 })
  }

  const byCourse: CourseRevenue[] = courses
    .map(c => ({
      id: c.id,
      title: c.title,
      revenue: revenueMap.get(c.id)?.revenue ?? 0,
      sales: revenueMap.get(c.id)?.sales ?? 0
    }))
    .sort((a, b) => b.revenue - a.revenue)

  return { totalRevenue, monthRevenue, avgTicket, totalSales, payments, byCourse }
}