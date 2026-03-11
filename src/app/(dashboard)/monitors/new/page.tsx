"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Globe, Clock, Loader2, CheckCircle } from "lucide-react";

const INTERVAL_OPTIONS = [
  { value: 1, label: "Co minutę" },
  { value: 2, label: "Co 2 minuty" },
  { value: 5, label: "Co 5 minut" },
  { value: 10, label: "Co 10 minut" },
  { value: 15, label: "Co 15 minut" },
  { value: 30, label: "Co 30 minut" },
  { value: 60, label: "Co godzinę" },
];

export default function NewMonitorPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [interval, setInterval] = useState(5);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function ensureHttp(value: string): string {
    if (!value) return value;
    if (!value.startsWith("http://") && !value.startsWith("https://")) {
      return "https://" + value;
    }
    return value;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const normalizedUrl = ensureHttp(url);

    try {
      new URL(normalizedUrl);
    } catch {
      setError("Podaj poprawny adres URL.");
      setIsLoading(false);
      return;
    }

    const res = await fetch("/api/monitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, url: normalizedUrl, interval }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Błąd tworzenia monitora. Spróbuj ponownie.");
      setIsLoading(false);
    } else {
      router.push(`/monitors/${data.id}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/monitors"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Powrót do monitorów
        </Link>
        <h1 className="text-2xl font-bold text-white">Nowy monitor</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Dodaj stronę internetową do monitorowania
        </p>
      </div>

      {/* Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        {error && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Monitor name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
              Nazwa monitora <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Np. Strona główna, API produkcyjne, Blog"
              required
              maxLength={100}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">
              Nazwa ułatwiająca identyfikację monitora
            </p>
          </div>

          {/* URL */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-slate-300 mb-1.5">
              Adres URL <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pełny adres URL ze schematem (https:// lub http://)
            </p>
          </div>

          {/* Interval */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Częstotliwość sprawdzania
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {INTERVAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setInterval(opt.value)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                    interval === opt.value
                      ? "bg-blue-600/20 border-blue-500 text-blue-300"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info box */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-300">
                <p className="font-medium text-blue-300 mb-1">Co jest monitorowane?</p>
                <ul className="text-slate-400 space-y-0.5 text-xs">
                  <li>• Dostępność HTTP (kody 2xx, 3xx = OK)</li>
                  <li>• Czas odpowiedzi w milisekundach</li>
                  <li>• Automatyczne alerty przy zmianie statusu</li>
                  <li>• Historia sprawdzeń i uptime %</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Dodawanie...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Dodaj monitor
                </>
              )}
            </button>
            <Link
              href="/monitors"
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-all text-sm"
            >
              Anuluj
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
