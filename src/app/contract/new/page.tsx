"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { validateContract, generateContract } from "@/lib/api";
import Header from "@/components/Header";
import type { ContractCreate, ValidationResult } from "@/types";

const EMPTY_FORM: ContractCreate = {
  org_type: "IP",
  employer_name: "",
  employer_iin_bin: "",
  employer_address: "",
  employee_name: "",
  employee_iin: "",
  employee_address: "",
  position: "",
  salary: 0,
  currency: "KZT",
  start_date: new Date().toISOString().split("T")[0],
  end_date: null,
  probation_months: 0,
  work_schedule: "5/2",
  vacation_days: 24,
  custom_clauses: "",
};

export default function NewContractPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<ContractCreate>(EMPTY_FORM);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [step, setStep] = useState<"form" | "validation" | "done">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  function update<K extends keyof ContractCreate>(key: K, value: ContractCreate[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleValidate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await validateContract(form);
      setValidation(result);
      setStep("validation");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка проверки");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGenerate() {
    setError("");
    setSubmitting(true);
    try {
      const blob = await generateContract(form);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contract_${form.org_type.toLowerCase()}_${form.employee_name.replace(/\s/g, "_")}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка генерации");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) return null;

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-xl font-semibold">Новый трудовой договор</h1>

        {error && (
          <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        {step === "form" && (
          <form onSubmit={handleValidate} className="space-y-6">
            {/* Org type */}
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Тип организации</legend>
              <div className="flex gap-4">
                {(["IP", "TOO"] as const).map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="org_type"
                      value={t}
                      checked={form.org_type === t}
                      onChange={() => update("org_type", t)}
                      className="accent-blue-600"
                    />
                    {t === "IP" ? "ИП (IP)" : "ТОО (TOO)"}
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Employer section */}
            <section className="rounded border border-gray-200 bg-white p-4 space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">Работодатель</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Наименование" value={form.employer_name} onChange={(v) => update("employer_name", v)} required />
                <Field label="ИИН/БИН (12 цифр)" value={form.employer_iin_bin} onChange={(v) => update("employer_iin_bin", v)} required maxLength={12} minLength={12} />
              </div>
              <Field label="Адрес" value={form.employer_address} onChange={(v) => update("employer_address", v)} required />
            </section>

            {/* Employee section */}
            <section className="rounded border border-gray-200 bg-white p-4 space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">Работник</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="ФИО" value={form.employee_name} onChange={(v) => update("employee_name", v)} required />
                <Field label="ИИН (12 цифр)" value={form.employee_iin} onChange={(v) => update("employee_iin", v)} required maxLength={12} minLength={12} />
              </div>
              <Field label="Адрес" value={form.employee_address} onChange={(v) => update("employee_address", v)} required />
              <Field label="Должность" value={form.position} onChange={(v) => update("position", v)} required />
            </section>

            {/* Terms */}
            <section className="rounded border border-gray-200 bg-white p-4 space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">Условия</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Зарплата (KZT)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.salary || ""}
                    onChange={(e) => update("salary", Number(e.target.value))}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Дата начала</label>
                  <input
                    type="date"
                    required
                    value={form.start_date}
                    onChange={(e) => update("start_date", e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Дата окончания</label>
                  <input
                    type="date"
                    value={form.end_date || ""}
                    onChange={(e) => update("end_date", e.target.value || null)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Исп. срок (мес, 0-3)</label>
                  <input
                    type="number"
                    min={0}
                    max={3}
                    value={form.probation_months}
                    onChange={(e) => update("probation_months", Number(e.target.value))}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Режим работы</label>
                  <input
                    type="text"
                    value={form.work_schedule}
                    onChange={(e) => update("work_schedule", e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Отпуск (дней, мин 24)</label>
                  <input
                    type="number"
                    min={24}
                    value={form.vacation_days}
                    onChange={(e) => update("vacation_days", Number(e.target.value))}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </section>

            {/* Custom clauses */}
            <section className="rounded border border-gray-200 bg-white p-4">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Дополнительные условия (необязательно)
              </label>
              <textarea
                rows={3}
                maxLength={5000}
                value={form.custom_clauses}
                onChange={(e) => update("custom_clauses", e.target.value)}
                placeholder="Введите дополнительные условия для проверки на соответствие ТК РК..."
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </section>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Проверка..." : "Проверить соответствие"}
            </button>
          </form>
        )}

        {step === "validation" && validation && (
          <div className="space-y-4">
            {/* Compliance result */}
            <div
              className={`rounded border p-4 ${
                validation.is_compliant
                  ? "border-green-200 bg-green-50"
                  : "border-yellow-200 bg-yellow-50"
              }`}
            >
              <p className="font-medium">
                {validation.is_compliant
                  ? "Договор соответствует ТК РК"
                  : "Обнаружены замечания"}
              </p>
            </div>

            {/* Warnings */}
            {validation.warnings.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Предупреждения</h3>
                {validation.warnings.map((w, i) => (
                  <div
                    key={i}
                    className={`rounded border p-3 text-sm ${
                      w.severity === "high"
                        ? "border-red-200 bg-red-50"
                        : w.severity === "medium"
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-blue-200 bg-blue-50"
                    }`}
                  >
                    <span className="font-medium">{w.article}</span>
                    <span className="mx-2 text-gray-400">|</span>
                    <span
                      className={`text-xs font-medium uppercase ${
                        w.severity === "high"
                          ? "text-red-600"
                          : w.severity === "medium"
                          ? "text-yellow-600"
                          : "text-blue-600"
                      }`}
                    >
                      {w.severity}
                    </span>
                    <p className="mt-1 text-gray-700">{w.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {validation.recommendations.length > 0 && (
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Рекомендации</h3>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {validation.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep("form")}
                className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Назад к форме
              </button>
              <button
                onClick={handleGenerate}
                disabled={submitting}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Генерация..." : "Скачать .docx"}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="rounded border border-green-200 bg-green-50 p-6 text-center">
            <p className="text-lg font-medium text-green-800">Договор сгенерирован!</p>
            <p className="mt-1 text-sm text-green-600">Файл загружен на ваше устройство.</p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() => {
                  setForm(EMPTY_FORM);
                  setValidation(null);
                  setStep("form");
                }}
                className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Создать ещё
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                К списку договоров
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

// --- Reusable field component ---

function Field({
  label,
  value,
  onChange,
  required,
  maxLength,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-gray-500">{label}</label>
      <input
        type="text"
        required={required}
        maxLength={maxLength}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}
