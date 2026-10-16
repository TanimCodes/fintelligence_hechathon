"use client";

import AppNavigation from "@/components/AppNavigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Wallet,
  ChartNoAxesCombined,
  PiggyBank,
  Target,
  RefreshCw,
} from "lucide-react";

const STORAGE_KEY = "fintelligence-transactions-v1";
const API_URL = "http://127.0.0.1:8000/analyze";

function getAmount(transaction) {
  const amount = Number(transaction?.amount);
  return Number.isFinite(amount) ? amount : 0;
}

function getType(transaction) {
  return String(transaction?.type || "").toLowerCase().trim();
}

function money(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [transactionsLoaded, setTransactionsLoaded] = useState(false);

  // Load saved transactions.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setTransactions(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load transactions:", error);
      setAnalysisError("Could not load saved transactions.");
    } finally {
      setTransactionsLoaded(true);
    }
  }, []);

  // Analyze transactions using FastAPI.
  const analyzeData = useCallback(async (data) => {
    if (data.length === 0) {
      setAnalysis(null);
      setAnalysisError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setAnalysisError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactions: data,
        }),
      });

      if (!response.ok) {
        let message = `Backend error (${response.status})`;

        try {
          const errorData = await response.json();
          if (errorData.detail) {
            message =
              typeof errorData.detail === "string"
                ? errorData.detail
                : JSON.stringify(errorData.detail);
          }
        } catch {
          // Keep the default error message.
        }

        throw new Error(message);
      }

      const result = await response.json();

      if (
        typeof result.total_income !== "number" ||
        typeof result.total_expenses !== "number"
      ) {
        throw new Error("Unexpected response from the Python API.");
      }

      setAnalysis(result);
      setAnalysisError("");
    } catch (error) {
      console.error("Python analysis failed:", error);
      setAnalysis(null);
      setAnalysisError(
        error instanceof TypeError
          ? "Could not connect to Python. Make sure FastAPI is running on port 8000."
          : error.message || "Python analysis failed. Please retry."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (transactionsLoaded) {
      analyzeData(transactions);
    }
  }, [transactionsLoaded, transactions, analyzeData]);

  // Calculate totals from the saved transactions as a fallback.
  const income = useMemo(
    () =>
      transactions
        .filter((t) => getType(t) === "income")
        .reduce((sum, t) => sum + getAmount(t), 0),
    [transactions]
  );

  const expenses = useMemo(
    () =>
      transactions
        .filter((t) =>
          ["expense", "expenses"].includes(getType(t))
        )
        .reduce((sum, t) => sum + getAmount(t), 0),
    [transactions]
  );

  const balance = income - expenses;

  const categoryData = useMemo(() => {
    const totals = {};

    transactions
      .filter((t) =>
        ["expense", "expenses"].includes(getType(t))
      )
      .forEach((t) => {
        const category = String(t.category || "Other");
        totals[category] = (totals[category] || 0) + getAmount(t);
      });

    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [transactions]);

  const maxCategory = Math.max(
    ...categoryData.map((item) => item[1]),
    1
  );

  const totalIncome = analysis?.total_income ?? income;
  const totalExpenses = analysis?.total_expenses ?? expenses;
  const netBalance = analysis?.savings ?? balance;

  const savingsRate =
    analysis?.savings_rate ??
    (income > 0 ? (balance / income) * 100 : 0);

  const topCategory =
    analysis?.top_expense_category ??
    categoryData[0]?.[0] ??
    "None";

  async function retryAnalysis() {
    await analyzeData(transactions);
  }

  return (
    <main className="min-h-screen bg-[#0B1014] px-5 py-8 text-white md:px-8">
      <AppNavigation />

      <div className="mx-auto max-w-7xl">
        <header className="mb-9 flex items-center gap-3">
          <Link
            href="/"
            aria-label="Back to dashboard"
            className="rounded-xl border border-white/10 p-2.5 text-gray-300 transition hover:bg-white/10"
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <p className="text-sm text-[#83D9B0]">FINTELLIGENCE</p>
            <h1 className="mt-1 text-2xl font-semibold md:text-3xl">
              Analytics
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Understand your income and spending.
            </p>
          </div>
        </header>

        {/* Python backend status */}
        <section className="mb-6 rounded-2xl border border-white/10 bg-[#121A20] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">Python Financial Analysis</p>
              <p className="mt-1 text-sm text-gray-400">
                Powered by FastAPI, Pandas and NumPy
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs ${
                loading
                  ? "bg-amber-400/10 text-amber-300"
                  : analysis
                    ? "bg-[#83D9B0]/10 text-[#83D9B0]"
                    : analysisError
                      ? "bg-rose-400/10 text-rose-300"
                      : "bg-white/10 text-gray-400"
              }`}
            >
              {loading
                ? "Analyzing..."
                : analysis
                  ? "Analysis Ready"
                  : analysisError
                    ? "Connection Error"
                    : transactions.length === 0
                      ? "No Transactions"
                      : "Waiting for Data"}
            </span>
          </div>

          {analysisError && (
            <div className="mt-4">
              <p className="text-sm text-rose-400">{analysisError}</p>
              <button
                onClick={retryAnalysis}
                disabled={loading || !transactionsLoaded || transactions.length === 0}
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
                Retry Connection
              </button>
            </div>
          )}

          {!analysisError && transactionsLoaded && transactions.length === 0 && (
            <p className="mt-4 text-sm text-gray-400">
              Add transactions first to see your financial analysis.
            </p>
          )}
        </section>

        {/* Summary cards */}
        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <SummaryCard
            title="Total Income"
            amount={money(totalIncome)}
            icon={<TrendingUp size={20} />}
            color="text-[#83D9B0]"
          />

          <SummaryCard
            title="Total Expenses"
            amount={money(totalExpenses)}
            icon={<TrendingDown size={20} />}
            color="text-rose-400"
          />

          <SummaryCard
            title="Net Balance"
            amount={money(netBalance)}
            icon={<Wallet size={20} />}
            color={netBalance >= 0 ? "text-[#83D9B0]" : "text-rose-400"}
          />
        </section>

        {/* Financial insights */}
        <section className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#121A20] p-5">
            <div className="flex items-center gap-3">
              <PiggyBank className="text-[#83D9B0]" size={21} />
              <div>
                <p className="text-sm text-gray-400">Savings Rate</p>
                <h2 className="mt-1 text-2xl font-semibold">
                  {income > 0 || analysis
                    ? `${Number(savingsRate).toFixed(2)}%`
                    : "—"}
                </h2>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-400">
              Percentage of income remaining after expenses.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121A20] p-5">
            <div className="flex items-center gap-3">
              <Target className="text-[#83D9B0]" size={21} />
              <div>
                <p className="text-sm text-gray-400">
                  Highest Expense Category
                </p>
                <h2 className="mt-1 break-words text-xl font-semibold">
                  {topCategory}
                </h2>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-400">
              Category with the highest total spending.
            </p>
          </div>
        </section>

        {/* Charts */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#121A20] p-6">
            <div className="mb-6 flex items-center gap-3">
              <ChartNoAxesCombined className="text-[#83D9B0]" />
              <div>
                <h2 className="font-semibold">Income vs Expenses</h2>
                <p className="text-sm text-gray-400">
                  Based on your saved transactions
                </p>
              </div>
            </div>

            {income === 0 && expenses === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-6">
                <Bar
                  label="Income"
                  amount={income}
                  max={Math.max(income, expenses, 1)}
                  color="bg-[#83D9B0]"
                />
                <Bar
                  label="Expenses"
                  amount={expenses}
                  max={Math.max(income, expenses, 1)}
                  color="bg-rose-400"
                />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121A20] p-6">
            <h2 className="mb-1 font-semibold">Expenses by Category</h2>
            <p className="mb-6 text-sm text-gray-400">
              Where your money goes
            </p>

            {categoryData.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-5">
                {categoryData.map(([category, amount]) => (
                  <div key={category}>
                    <div className="mb-2 flex justify-between gap-3 text-sm">
                      <span className="text-gray-300">{category}</span>
                      <span className="font-medium">{money(amount)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[#83D9B0] transition-all"
                        style={{
                          width: `${Math.min(
                            (amount / maxCategory) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <p className="mt-5 text-xs text-gray-500">
          Transaction records are stored in your browser. Python analyzes
          the data through FastAPI; no database is used.
        </p>
      </div>
    </main>
  );
}

function SummaryCard({ title, amount, icon, color }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#121A20] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{title}</p>
        <span className={color}>{icon}</span>
      </div>
      <h2 className="mt-4 text-2xl font-semibold">{amount}</h2>
    </div>
  );
}

function Bar({ label, amount, max, color }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span>{money(amount)}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{
            width: `${Math.min((amount / max) * 100, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-white/10 py-12 text-center text-sm text-gray-400">
      No data yet. Add transactions first.
      <div className="mt-4">
        <Link
          href="/transactions"
          className="text-[#83D9B0] hover:underline"
        >
          Go to Transactions
        </Link>
      </div>
    </div>
  );
}