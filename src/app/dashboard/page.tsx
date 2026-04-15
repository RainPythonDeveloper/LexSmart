"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { listContracts } from "@/lib/api";
import Header from "@/components/Header";
import type { ContractSummary } from "@/types";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [contracts, setContracts] = useState<ContractSummary[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    listContracts()
      .then((res) => setContracts(res.contracts))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || !user) return null;

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Мои договоры</h1>
          <Link
            href="/contract/new"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            + Новый договор
          </Link>
        </div>

        {fetching ? (
          <p className="text-gray-400 text-sm">Загрузка...</p>
        ) : contracts.length === 0 ? (
          <div className="rounded border border-dashed border-gray-300 py-16 text-center">
            <p className="text-gray-500">У вас пока нет договоров</p>
            <Link
              href="/contract/new"
              className="mt-2 inline-block text-sm text-blue-600 hover:underline"
            >
              Создать первый договор
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Сотрудник</th>
                  <th className="px-4 py-3">Должность</th>
                  <th className="px-4 py-3">Тип</th>
                  <th className="px-4 py-3">Дата</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 font-medium">{c.employee_name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.position}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium">
                        {c.org_type === "IP" ? "ИП" : "ТОО"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(c.created_at).toLocaleDateString("ru-RU")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
