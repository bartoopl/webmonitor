"use client";

import { useState, useEffect } from "react";
import { Bell, Plus, Trash2, Mail, Loader2, CheckCircle, X } from "lucide-react";

interface AlertChannel {
  id: string;
  type: string;
  value: string;
  isActive: boolean;
  createdAt: string;
}

export default function SettingsPage() {
  const [channels, setChannels] = useState<AlertChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newType, setNewType] = useState<"email" | "sms">("email");
  const [newValue, setNewValue] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchChannels();
  }, []);

  async function fetchChannels() {
    setIsLoading(true);
    const res = await fetch("/api/alert-channels");
    const data = await res.json();
    setChannels(data);
    setIsLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setIsAdding(true);
    setError("");

    if (newType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newValue)) {
      setError("Podaj prawidłowy adres email.");
      setIsAdding(false);
      return;
    }

    const res = await fetch("/api/alert-channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: newType, value: newValue }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Błąd dodawania kanału.");
    } else {
      setChannels((prev) => [...prev, data]);
      setNewValue("");
      setShowForm(false);
      setSuccess("Kanał alertów został dodany pomyślnie.");
      setTimeout(() => setSuccess(""), 4000);
    }

    setIsAdding(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Czy na pewno chcesz usunąć ten kanał alertów?")) return;

    await fetch(`/api/alert-channels/${id}`, { method: "DELETE" });
    setChannels((prev) => prev.filter((c) => c.id !== id));
    setSuccess("Kanał alertów został usunięty.");
    setTimeout(() => setSuccess(""), 3000);
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Ustawienia</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Konfiguruj kanały powiadomień dla alertów
        </p>
      </div>

      {/* Notifications */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {success}
          <button onClick={() => setSuccess("")} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Alert channels section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-400" />
            <h2 className="text-base font-semibold text-white">Kanały alertów</h2>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Dodaj kanał
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="px-6 py-4 bg-slate-800/30 border-b border-slate-800">
            {error && (
              <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="flex gap-3">
                <div className="w-36">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Typ</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as "email" | "sms")}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    {newType === "email" ? "Adres email" : "Numer telefonu"}
                  </label>
                  <input
                    type={newType === "email" ? "email" : "tel"}
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder={
                      newType === "email" ? "alert@firma.pl" : "+48 123 456 789"
                    }
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-sm font-medium rounded-lg transition-all"
                >
                  {isAdding ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  {isAdding ? "Dodawanie..." : "Dodaj"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(""); setNewValue(""); }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg transition-all"
                >
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Channels list */}
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
          </div>
        ) : channels.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 rounded-xl mb-4">
              <Bell className="w-6 h-6 text-slate-500" />
            </div>
            <h3 className="text-white font-medium mb-2">Brak kanałów alertów</h3>
            <p className="text-slate-500 text-sm mb-4">
              Dodaj kanał powiadomień, aby otrzymywać alerty gdy Twoje strony przestaną działać.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Dodaj pierwszy kanał
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {channels.map((channel) => (
              <div key={channel.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      channel.type === "email"
                        ? "bg-blue-500/10"
                        : "bg-purple-500/10"
                    }`}
                  >
                    <Mail
                      className={`w-4 h-4 ${
                        channel.type === "email" ? "text-blue-400" : "text-purple-400"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{channel.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {channel.type === "email" ? "Email" : "SMS"} ·{" "}
                      {channel.isActive ? (
                        <span className="text-emerald-400">Aktywny</span>
                      ) : (
                        <span className="text-red-400">Nieaktywny</span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(channel.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                  title="Usuń kanał"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SMTP info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-4 h-4 text-slate-400" />
          <h2 className="text-base font-semibold text-white">Konfiguracja SMTP</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Konfiguracja serwera email jest zarządzana przez zmienne środowiskowe w pliku{" "}
          <code className="text-blue-400 bg-slate-800 px-1.5 py-0.5 rounded text-xs">.env.local</code>
        </p>
        <div className="bg-slate-800/50 rounded-lg p-4 font-mono text-xs text-slate-400 space-y-1">
          <p><span className="text-blue-400">SMTP_HOST</span>=smtp.gmail.com</p>
          <p><span className="text-blue-400">SMTP_PORT</span>=587</p>
          <p><span className="text-blue-400">SMTP_USER</span>=twoj@email.com</p>
          <p><span className="text-blue-400">SMTP_PASS</span>=haslo_aplikacji</p>
          <p><span className="text-blue-400">SMTP_FROM</span>=WebMonitor &lt;twoj@email.com&gt;</p>
        </div>
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-xs text-amber-300">
            Dla Gmail użyj hasła aplikacji (App Password) zamiast zwykłego hasła.
            Włącz weryfikację dwuetapową i wygeneruj hasło aplikacji w ustawieniach konta Google.
          </p>
        </div>
      </div>
    </div>
  );
}
