"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
  Phone,
  Stethoscope,
  Link as LinkIcon,
  FileText,
} from "lucide-react";
import { updateInstructorProfileAction } from "@/app/(instructor)/instrutor/perfil/actions";

interface ProfileFormProps {
  initial: {
    name: string;
    email: string;
    phone: string;
    crm: string;
    bio: string;
    avatar: string;
  };
}

export function InstructorProfileForm({ initial }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [crm, setCrm] = useState(initial.crm);
  const [bio, setBio] = useState(initial.bio);
  const [avatar, setAvatar] = useState(initial.avatar);
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(t);
  }, [feedback]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    setFieldErrors({});

    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("crm", crm);
    formData.append("bio", bio);
    formData.append("avatar", avatar);

    startTransition(async () => {
      const result = await updateInstructorProfileAction(undefined, formData);
      if (result.ok) {
        setFeedback({ ok: true, message: result.message ?? "Salvo!" });
      } else {
        setFeedback({
          ok: false,
          message: result.message ?? "Verifique os campos abaixo",
        });
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${
            feedback.ok
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          {feedback.ok ? (
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
          )}
          <p
            className={`text-sm font-semibold ${
              feedback.ok ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {feedback.message}
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="avatar"
          className="text-xs font-bold text-slate-700 inline-flex items-center gap-1.5"
        >
          <LinkIcon className="h-3 w-3" />
          URL da foto de perfil
        </label>
        <input
          id="avatar"
          name="avatar"
          type="text"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          disabled={isPending}
          placeholder="https://..."
          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm placeholder:text-slate-400 focus:border-[#1E5A8C] focus:outline-none focus:ring-1 focus:ring-[#1E5A8C] disabled:opacity-60"
        />
        {fieldErrors.avatar && (
          <p className="text-[10px] text-red-600">{fieldErrors.avatar[0]}</p>
        )}
        <p className="text-[10px] text-slate-500">
          Cole a URL de uma imagem hospedada (ex: gravatar, imgur). Em breve, upload direto.
        </p>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="name"
          className="text-xs font-bold text-slate-700 inline-flex items-center gap-1.5"
        >
          <UserIcon className="h-3 w-3" />
          Nome completo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-[#1E5A8C] focus:outline-none focus:ring-1 focus:ring-[#1E5A8C] disabled:opacity-60"
        />
        {fieldErrors.name && (
          <p className="text-[10px] text-red-600">{fieldErrors.name[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="text-xs font-bold text-slate-500 inline-flex items-center gap-1.5"
        >
          E-mail (somente leitura)
        </label>
        <input
          id="email"
          type="email"
          value={initial.email}
          disabled
          className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
        />
        <p className="text-[10px] text-slate-500">
          Para alterar o e-mail, entre em contato com o admin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="phone"
            className="text-xs font-bold text-slate-700 inline-flex items-center gap-1.5"
          >
            <Phone className="h-3 w-3" />
            Telefone
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isPending}
            placeholder="(11) 99999-9999"
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm placeholder:text-slate-400 focus:border-[#1E5A8C] focus:outline-none focus:ring-1 focus:ring-[#1E5A8C] disabled:opacity-60"
          />
          {fieldErrors.phone && (
            <p className="text-[10px] text-red-600">{fieldErrors.phone[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="crm"
            className="text-xs font-bold text-slate-700 inline-flex items-center gap-1.5"
          >
            <Stethoscope className="h-3 w-3" />
            CRM
          </label>
          <input
            id="crm"
            name="crm"
            type="text"
            value={crm}
            onChange={(e) => setCrm(e.target.value)}
            disabled={isPending}
            placeholder="12345-SP"
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm placeholder:text-slate-400 focus:border-[#1E5A8C] focus:outline-none focus:ring-1 focus:ring-[#1E5A8C] disabled:opacity-60"
          />
          {fieldErrors.crm && (
            <p className="text-[10px] text-red-600">{fieldErrors.crm[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="bio"
          className="text-xs font-bold text-slate-700 inline-flex items-center gap-1.5"
        >
          <FileText className="h-3 w-3" />
          Sobre voce (bio)
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={5}
          maxLength={500}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          disabled={isPending}
          placeholder="Conte um pouco sobre voce, sua formacao e experiencia. Esta bio aparece na pagina dos seus cursos."
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-[#1E5A8C] focus:outline-none focus:ring-1 focus:ring-[#1E5A8C] disabled:opacity-60 resize-none"
        />
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-500">
            Aparece na pagina dos seus cursos.
          </p>
          <p className="text-[10px] text-slate-400">{bio.length}/500</p>
        </div>
        {fieldErrors.bio && (
          <p className="text-[10px] text-red-600">{fieldErrors.bio[0]}</p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#1E5A8C] px-5 text-xs font-bold text-white transition hover:bg-[#164767] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              Salvar alteracoes
            </>
          )}
        </button>
      </div>
    </form>
  );
}