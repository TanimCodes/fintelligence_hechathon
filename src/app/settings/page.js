
"use client";

import AppNavigation from "@/components/AppNavigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  UserRound,
  Wallet,
  Bell,
  ShieldCheck,
  Save,
  CheckCircle2,
} from "lucide-react";

const SETTINGS_KEY = "fintelligence-settings-v1";

const DEFAULT_SETTINGS = {
  name: "",
  currency: "BDT",
  monthlyBudget: "10000",
  notifications: true,
};

const CURRENCIES = {
  BDT: { label: "BDT — Bangladeshi Taka (৳)", symbol: "৳" },
  USD: { label: "USD — US Dollar ($)", symbol: "$" },
  EUR: { label: "EUR — Euro (€)", symbol: "€" },
  GBP: { label: "GBP — British Pound (£)", symbol: "£" },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...parsed,
            currency: CURRENCIES[parsed.currency]
              ? parsed.currency
              : "BDT",
            notifications: parsed.notifications !== false,
          });
        }
      }
    } catch (err) {
      console.error("Could not load settings:", err);
      setError("Could not load saved settings.");
    } finally {
      setLoaded(true);
    }
  }, []);

  function updateSetting(key, value) {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSaved(false);
    setError("");
  }

  function handleSave(event) {
    event.preventDefault();
    setError("");

    const budget = Number(settings.monthlyBudget);

    if (
      settings.monthlyBudget.trim() === "" ||
      !Number.isFinite(budget) ||
      budget < 0
    ) {
      setError("Please enter a valid monthly budget.");
      return;
    }

    try {
      const updatedSettings = {
        ...settings,
        monthlyBudget: String(budget),
      };

      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(updatedSettings)
      );

      setSettings(updatedSettings);
      setSaved(true);
    } catch (err) {
      console.error("Could not save settings:", err);
      setError("Could not save settings. Please try again.");
    }
  }

  const currencySymbol =
    CURRENCIES[settings.currency]?.symbol || "৳";

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B1014] text-gray-300">
        Loading settings...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B1014] px-5 py-8 text-white md:px-8">
      <AppNavigation />

      <div className="mx-auto max-w-4xl">
        <header className="mb-9 flex items-center gap-3">
          <Link
            href="/"
            className="rounded-xl border border-white/10 p-2.5 text-gray-300 hover:bg-white/10"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <p className="text-sm text-[#83D9B0]">FINTELLIGENCE</p>
            <h1 className="mt-1 text-2xl font-semibold md:text-3xl">
              Settings
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Customize your finance dashboard.
            </p>
          </div>
        </header>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile */}
          <section className="rounded-2xl border border-white/10 bg-[#121A20] p-6">
            <div className="mb-6 flex items-center gap-3">
              <UserRound className="text-[#83D9B0]" size={21} />
              <div>
                <h2 className="font-semibold">Profile</h2>
                <p className="text-sm text-gray-400">
                  Personalize your experience.
                </p>
              </div>
            </div>

            <label
              htmlFor="displayName"
              className="mb-2 block text-sm text-gray-300"
            >
              Display name
            </label>

            <input
              id="displayName"
              type="text"
              maxLength={60}
              value={settings.name}
              onChange={(e) => updateSetting("name", e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-xl border border-white/10 bg-[#0B1014] px-4 py-3 outline-none focus:border-[#83D9B0]"
            />
          </section>

          {/* Finance Preferences */}
          <section className="rounded-2xl border border-white/10 bg-[#121A20] p-6">
            <div className="mb-6 flex items-center gap-3">
              <Wallet className="text-[#83D9B0]" size={21} />
              <div>
                <h2 className="font-semibold">Finance Preferences</h2>
                <p className="text-sm text-gray-400">
                  Choose your preferred currency and budget.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="currency"
                  className="mb-2 block text-sm text-gray-300"
                >
                  Currency
                </label>

                <select
                  id="currency"
                  value={settings.currency}
                  onChange={(e) =>
                    updateSetting("currency", e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0B1014] px-4 py-3 outline-none focus:border-[#83D9B0]"
                >
                  {Object.entries(CURRENCIES).map(([code, currency]) => (
                    <option key={code} value={code}>
                      {currency.label}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-gray-500">
                  Currency preference: {settings.currency} ({currencySymbol}).
                  Existing amounts are not converted.
                </p>
              </div>

              <div>
                <label
                  htmlFor="monthlyBudget"
                  className="mb-2 block text-sm text-gray-300"
                >
                  Monthly budget ({currencySymbol})
                </label>

                <input
                  id="monthlyBudget"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={settings.monthlyBudget}
                  onChange={(e) =>
                    updateSetting("monthlyBudget", e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0B1014] px-4 py-3 outline-none focus:border-[#83D9B0]"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Your preferred monthly spending limit.
                </p>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="rounded-2xl border border-white/10 bg-[#121A20] p-6">
            <div className="mb-5 flex items-center gap-3">
              <Bell className="text-[#83D9B0]" size={21} />
              <div>
                <h2 className="font-semibold">Notifications</h2>
                <p className="text-sm text-gray-400">
                  Manage your budget reminder preference.
                </p>
              </div>
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Budget reminders</p>
                <p className="mt-1 text-sm text-gray-400">
                  Enable budget reminder alerts where supported.
                </p>
              </div>

              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) =>
                  updateSetting("notifications", e.target.checked)
                }
                className="h-5 w-5 accent-[#83D9B0]"
              />
            </label>

            <p className="mt-4 text-xs text-gray-500">
              This saves your preference. Automatic browser notifications
              require additional notification logic.
            </p>
          </section>

          {/* Privacy */}
          <section className="rounded-2xl border border-white/10 bg-[#121A20] p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck
                className="mt-1 shrink-0 text-[#83D9B0]"
                size={21}
              />

              <div>
                <h2 className="font-semibold">Privacy</h2>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Your settings are stored in this browser using
                  LocalStorage. They are not synced across accounts or
                  devices, and there is no cloud backup.
                </p>
              </div>
            </div>
          </section>

          {/* Save */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-[#83D9B0] px-5 py-3 font-semibold text-[#0B1014] transition hover:bg-[#9CE8C5]"
            >
              <Save size={18} />
              Save Settings
            </button>

            {saved && (
              <p
                role="status"
                className="flex items-center gap-2 text-sm text-[#83D9B0]"
              >
                <CheckCircle2 size={17} />
                Settings saved successfully!
              </p>
            )}

            {error && (
              <p role="alert" className="text-sm text-rose-400">
                {error}
              </p>
            )}
          </div>
        </form>

        <p className="mt-6 text-xs text-gray-500">
          Fintelligence · Your Money, Smarter.
        </p>
      </div>
    </main>
  );
}
