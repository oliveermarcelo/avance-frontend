"use client";

import { useState, useTransition, useMemo } from "react";
import { Plus, Loader2, X, Search, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createEnrollmentAction,
  type EnrollmentActionState,
} from "@/app/(admin)/admin/matriculas/actions";

interface StudentOption {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatar: string | null;
}

interface CourseOption {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
}

interface EnrollStudentButtonProps {
  students: StudentOption[];
  courses: CourseOption[];
}

export function EnrollStudentButton({ students, courses }: EnrollStudentButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<EnrollmentActionState | undefined>(undefined);

  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students.slice(0, 8);
    return students
      .filter((s) =>
        `${s.name} ${s.email}`.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [students, studentSearch]);

  const reset = () => {
    setStudentSearch("");
    setSelectedStudent(null);
    setSelectedCourseId("");
    setState(undefined);
  };

  const close = () => {
    reset();
    setOpen(false);
  };

  const handleSubmit = () => {
    if (!selectedStudent || !selectedCourseId) return;
    setState(undefined);
    const fd = new FormData();
    fd.append("userId", selectedStudent.id);
    fd.append("courseId", selectedCourseId);
    startTransition(async () => {
      const result = await createEnrollmentAction(fd);
      setState(result);
      if (result?.ok) {
        setTimeout(() => close(), 1200);
      }
    });
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Matricular aluno
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <header className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-slate-700" />
                <h2 className="text-base font-bold text-slate-900">
                  Matricular aluno em curso
                </h2>
              </div>
              <button
                onClick={close}
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <p className="mb-5 text-sm text-slate-500">
              Cortesia, demo ou pagamento offline. O aluno ganhara acesso
              imediato ao curso sem cobranca.
            </p>

            {state?.ok && state?.message && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {state.message}
              </div>
            )}

            {state?.message && !state.ok && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {state.message}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Aluno</Label>
                {selectedStudent ? (
                  <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                    {selectedStudent.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedStudent.avatar}
                        alt={selectedStudent.name}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                        {selectedStudent.initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {selectedStudent.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {selectedStudent.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStudent(null)}
                      className="text-xs font-medium text-slate-500 hover:text-slate-900"
                    >
                      Trocar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Buscar aluno por nome ou e-mail..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="pl-9"
                        autoFocus
                      />
                    </div>

                    {filteredStudents.length > 0 && (
                      <ul className="max-h-60 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-sm">
                        {filteredStudents.map((student) => (
                          <li key={student.id}>
                            <button
                              type="button"
                              onClick={() => setSelectedStudent(student)}
                              className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-slate-50"
                            >
                              {student.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={student.avatar}
                                  alt={student.name}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                                  {student.initials}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-slate-900">
                                  {student.name}
                                </p>
                                <p className="truncate text-[10px] text-slate-500">
                                  {student.email}
                                </p>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {studentSearch && filteredStudents.length === 0 && (
                      <p className="text-xs text-slate-500">
                        Nenhum aluno encontrado.
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseId">Curso</Label>
                <select
                  id="courseId"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  disabled={isPending}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="">Selecione um curso...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} {!c.isPublished && "(Rascunho)"}
                    </option>
                  ))}
                </select>
                {selectedCourse && !selectedCourse.isPublished && (
                  <p className="text-[10px] text-amber-600">
                    Este curso ainda nao esta publicado. O aluno tera acesso, mas
                    nao podera ver no catalogo.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={close} disabled={isPending}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isPending || !selectedStudent || !selectedCourseId}
              >
                {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Matricular
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}