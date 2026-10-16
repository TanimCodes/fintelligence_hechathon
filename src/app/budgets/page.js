
"use client";

import AppNavigation from "@/components/AppNavigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Target,
  Trash2,
  Wallet,
  X,
  AlertTriangle,
} from "lucide-react";

const TRANSACTIONS_KEY = "fintelligence-transactions-v1";
const BUDGETS_KEY = "fintelligence-budgets-v1";
const SETTINGS_KEY = "fintelligence-settings-v1";

const categories = [
  "Food",
  "Transport",
  "Education",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Other",
];

const currencySymbols = {
  BDT: "৳",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export default function BudgetsPage() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [settings, setSettings] = useState({
    currency: "BDT",
    monthlyBudget: "10000",
    notifications: true,
  });
  const [loaded, setLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    category: "Food",
    amount: "",
  });

  useEffect(() => {
    try {
      const savedTransactions = localStorage.getItem(TRANSACTIONS_KEY);
      const savedBudgets = localStorage.getItem(BUDGETS_KEY);
      const savedSettings = localStorage.getItem(SETTINGS_KEY);

      if (savedTransactions) {
        const parsed = JSON.parse(savedTransactions);
        if (Array.isArray(parsed)) setTransactions(parsed);
      }

      if (savedBudgets) {
        const parsed = JSON.parse(savedBudgets);
        if (Array.isArray(parsed)) setBudgets(parsed);
      }

      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed && typeof parsed === "object") {
          setSettings((previous) => ({
            ...previous,
            ...parsed,
          }));
        }
      }
    } catch (error) {
      console.error("Could not load saved data:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
      } catch (error) {
        console.error("Could not save budgets:", error);
      }
    }
  }, [budgets, loaded]);

  const currencySymbol =
    currencySymbols[settings.currency] || "৳";

  const money = (amount) =>
    `${currencySymbol}${Number(amount || 0).toLocaleString("en-BD", {
      maximumFractionDigits: 2,
    })}`;

  const spending = useMemo(() => {
    const totals = {};

    transactions
      .filter(
        (transaction) =>
          String(transaction.type || "").toLowerCase() === "expense" ||
          String(transaction.type || "").toLowerCase() === "expenses"
      )
      .forEach((transaction) => {
        const category = transaction.category || "Other";
        const amount = Number(transaction.amount || 0);

        if (Number.isFinite(amount) && amount > 0) {
          totals[category] = (totals[category] || 0) + amount;
        }
      });

    return totals;
  }, [transactions]);

  const totalBudget = budgets.reduce(
    (sum, budget) => sum + Number(budget.amount || 0),
    0
  );

  const totalSpent = Object.values(spending).reduce(
    (sum, amount) => sum + amount,
    0
  );

  const monthlyBudget = Math.max(
    0,
    Number(settings.monthlyBudget) || 0
  );

  const monthlyRemaining = monthlyBudget - totalSpent;
  const monthlyPercent =
    monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

  function addBudget(event) {
    event.preventDefault();

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) return;

    setBudgets((previous) => {
      const existing = previous.find(
        (budget) => budget.category === form.category
      );

      if (existing) {
        return previous.map((budget) =>
          budget.category === form.category
            ? { ...budget, amount }
            : budget
        );
      }

      return [
        ...previous,
        {
          id: `${Date.now()}-${form.category}`,
          category: form.category,
          amount,
        },
      ];
    });

    setForm({ category: "Food", amount: "" });
    setShowModal(false);
  }

  function deleteBudget(id) {
    if (confirm("Delete this budget?")) {
      setBudgets((previous) =>
        previous.filter((budget) => budget.id !== id)
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#0B1014] px-5 py-8 text-white md:px-8">
      <AppNavigation />

      <div className="mx-auto max-w-7xl">
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="Back to dashboard"
              className="rounded-xl border border-white/10 p-2.5 text-gray-300 hover:bg-white/10"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <p className="text-sm text-[#83D9B0]">FINTELLIGENCE</p>
              <h1 className="mt-1 text-2xl font-semibold md:text-3xl">
                Budgets & Goals
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                Set spending limits and track your progress.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#83D9B0] px-4 py-3 font-semibold text-[#0B1014] hover:bg-[#9CE8C5]"
          >
            <Plus size={18} />
            Set Budget
          </button>
        </header>

        {/* Monthly budget overview */}
        <section className="mb-6 rounded-2xl border border-white/10 bg-[#121A20] p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-400">
                Monthly Spending Limit
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                {money(monthlyBudget)}
              </h2>
            </div>

            <Wallet className="text-[#83D9B0]" size={25} />
          </div>

          <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm">
            <span className="text-gray-400">
              Spent: {money(totalSpent)}
            </span>
            <span
              className={
                monthlyRemaining < 0
                  ? "text-rose-400"
                  : "text-[#83D9B0]"
              }
            >
              {monthlyRemaining < 0
                ? `Over budget: ${money(Math.abs(monthlyRemaining))}`
                : `Remaining: ${money(monthlyRemaining)}`}
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-all ${
                monthlyRemaining < 0
                  ? "bg-rose-400"
                  : "bg-[#83D9B0]"
              }`}
              style={{
                width: `${Math.min(monthlyPercent, 100)}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs text-gray-500">
            {Math.round(monthlyPercent)}% of your monthly limit used.
            Change this limit in Settings.
          </p>

          {settings.notifications && monthlyRemaining < 0 && (
            <div
              role="status"
              className="mt-4 flex items-start gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-300"
            >
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <p>
                Your monthly spending limit has been exceeded by{" "}
                {money(Math.abs(monthlyRemaining))}.
              </p>
            </div>
          )}
        </section>

        {/* Category summary */}
        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Total Category Budget"
            amount={money(totalBudget)}
            icon={<Wallet />}
          />

          <SummaryCard
            title="Total Expenses"
            amount={money(totalSpent)}
            icon={<Target />}
          />

          <SummaryCard
            title="Category Budget Remaining"
            amount={money(totalBudget - budgets.reduce(
              (sum, budget) =>
                sum + Math.min(
                  spending[budget.category] || 0,
                  Number(budget.amount) || 0
                ),
              0
            ))}
            icon={<Target />}
          />
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#121A20] p-5 md:p-6">
          <h2 className="mb-1 text-lg font-semibold">
            Category Budgets
          </h2>
          <p className="mb-6 text-sm text-gray-400">
            Your spending compared with each category limit.
          </p>

          {!loaded ? (
            <p className="py-10 text-center text-gray-400">
              Loading...
            </p>
          ) : budgets.length === 0 ? (
            <div className="py-12 text-center">
              <Target
                className="mx-auto mb-3 text-gray-500"
                size={36}
              />
              <p className="font-medium">No budgets yet</p>
              <p className="mt-2 text-sm text-gray-400">
                Set a category budget to start tracking your spending.
              </p>

              <button
                onClick={() => setShowModal(true)}
                className="mt-5 rounded-xl bg-[#83D9B0] px-4 py-2.5 font-semibold text-[#0B1014]"
              >
                <Plus size={16} className="mr-1 inline" />
                Set your first budget
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {budgets.map((budget) => {
                const spent = spending[budget.category] || 0;
                const limit = Number(budget.amount) || 0;
                const percent = limit > 0 ? (spent / limit) * 100 : 0;
                const exceeded = spent > limit;
                const nearLimit = percent >= 80 && !exceeded;

                return (
                  <div
                    key={budget.id}
                    className="rounded-xl border border-white/10 p-4"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-medium">
                          {budget.category}
                        </h3>
                        <p className="mt-1 text-sm text-gray-400">
                          {money(spent)} spent of {money(limit)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-medium ${
                            exceeded
                              ? "text-rose-400"
                              : nearLimit
                                ? "text-amber-300"
                                : "text-[#83D9B0]"
                          }`}
                        >
                          {Math.round(percent)}%
                        </span>

                        <button
                          onClick={() => deleteBudget(budget.id)}
                          className="rounded-lg p-2 text-rose-400 hover:bg-rose-400/10"
                          aria-label={`Delete ${budget.category} budget`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all ${
                          exceeded
                            ? "bg-rose-400"
                            : nearLimit
                              ? "bg-amber-300"
                              : "bg-[#83D9B0]"
                        }`}
                        style={{
                          width: `${Math.min(percent, 100)}%`,
                        }}
                      />
                    </div>

                    {settings.notifications && exceeded && (
                      <p
                        role="status"
                        className="mt-3 flex items-center gap-2 text-sm text-rose-400"
                      >
                        <AlertTriangle size={16} />
                        Over budget by {money(spent - limit)}.
                      </p>
                    )}

                    {settings.notifications && nearLimit && (
                      <p className="mt-3 text-sm text-amber-300">
                        You have used at least 80% of this budget.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <p className="mt-5 text-xs text-gray-500">
          Budgets and transactions are stored locally in this browser.
          Currency changes update the display symbol only; they do not
          convert existing amounts.
        </p>
      </div>

      {/* Add or update category budget */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121A20] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Set Category Budget
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/10"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addBudget} className="space-y-4">
              <div>
                <label
                  htmlFor="budgetCategory"
                  className="mb-2 block text-sm text-gray-300"
                >
                  Category
                </label>

                <select
                  id="budgetCategory"
                  value={form.category}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0B1014] px-4 py-3 outline-none focus:border-[#83D9B0]"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="budgetAmount"
                  className="mb-2 block text-sm text-gray-300"
                >
                  Monthly Limit ({currencySymbol})
                </label>

                <input
                  id="budgetAmount"
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      amount: event.target.value,
                    })
                  }
                  placeholder="e.g. 5000"
                  className="w-full rounded-xl border border-white/10 bg-[#0B1014] px-4 py-3 outline-none focus:border-[#83D9B0]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#83D9B0] py-3 font-semibold text-[#0B1014] hover:bg-[#9CE8C5]"
              >
                Save Budget
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryCard({ title, amount, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#121A20] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{title}</p>
        <span className="text-[#83D9B0]">{icon}</span>
      </div>
      <h2 className="mt-4 text-2xl font-semibold">{amount}</h2>
    </div>
  );
}
