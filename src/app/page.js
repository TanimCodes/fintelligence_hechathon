
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
  Receipt,
  ChartNoAxesCombined,
  PiggyBank,
  Bot,
  Settings,
  Plus,
  ArrowRight,
  CircleDollarSign,
} from "lucide-react";

const STORAGE_TRANSACTIONS = "fintelligence-transactions-v1";
const STORAGE_BUDGETS = "fintelligence-budgets-v1";
const STORAGE_SETTINGS = "fintelligence-settings-v1";

const navItems = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: Receipt },
  { label: "Analytics", href: "/analytics", icon: ChartNoAxesCombined },
  { label: "Budgets", href: "/budgets", icon: PiggyBank },
  { label: "AI Assistant", href: "/ai-assistant", icon: Bot },
  { label: "Settings", href: "/settings", icon: Settings },
];

const categories = [
  { name: "Food", color: "#2dd4bf" },
  { name: "Transport", color: "#60a5fa" },
  { name: "Bills", color: "#c084fc" },
  { name: "Shopping", color: "#fbbf24" },
  { name: "Education", color: "#818cf8" },
  { name: "Entertainment", color: "#f472b6" },
  { name: "Health", color: "#34d399" },
  { name: "Other", color: "#fb7185" },
];

const CURRENCY_SYMBOLS = {
  BDT: "৳",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createInitialTransactions(today) {
  const date = formatLocalDate(today);

  return [
    {
      id: "demo-1",
      title: "Monthly Salary",
      category: "Salary",
      type: "income",
      amount: 45000,
      date,
    },
    {
      id: "demo-2",
      title: "Grocery Shopping",
      category: "Food",
      type: "expense",
      amount: 2500,
      date,
    },
    {
      id: "demo-3",
      title: "Internet Bill",
      category: "Bills",
      type: "expense",
      amount: 1000,
      date,
    },
    {
      id: "demo-4",
      title: "Freelance Work",
      category: "Freelance",
      type: "income",
      amount: 8000,
      date,
    },
    {
      id: "demo-5",
      title: "Transport",
      category: "Transport",
      type: "expense",
      amount: 600,
      date,
    },
  ];
}

function isIncome(transaction) {
  return String(transaction?.type || "").toLowerCase() === "income";
}

function isExpense(transaction) {
  const type = String(transaction?.type || "").toLowerCase();
  return type === "expense" || type === "expenses";
}

function money(amount, currency = "BDT") {
  const symbol = CURRENCY_SYMBOLS[currency] || CURRENCY_SYMBOLS.BDT;

  return `${symbol}${Number(amount || 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}`;
}

function getMonthTransactions(transactions, currentDate) {
  if (!currentDate) return [];

  const now = new Date(`${currentDate}T12:00:00`);

  return transactions.filter((transaction) => {
    if (!transaction?.date) return false;

    const date = new Date(`${transaction.date}T12:00:00`);

    return (
      !Number.isNaN(date.getTime()) &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  });
}

function getWeeklyData(transactions, currentDate) {
  if (!currentDate) return [];

  const today = new Date(`${currentDate}T12:00:00`);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    const dateString = formatLocalDate(date);

    const dayTransactions = transactions.filter(
      (item) => item?.date === dateString
    );

    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      income: dayTransactions
        .filter(isIncome)
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
      expense: dayTransactions
        .filter(isExpense)
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    };
  });
}

function readStoredArray(key) {
  try {
    const value = localStorage.getItem(key);

    if (!value) return [];

    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const [settings, setSettings] = useState({
    name: "",
    displayName: "",
    currency: "BDT",
    monthlyBudget: "10000",
    notifications: true,
  });

  const [currentDate, setCurrentDate] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const today = new Date();

    setCurrentDate(formatLocalDate(today));

    try {
      const savedTransactions = localStorage.getItem(
        STORAGE_TRANSACTIONS
      );

      const savedSettings = localStorage.getItem(STORAGE_SETTINGS);

      const parsedTransactions = savedTransactions
        ? JSON.parse(savedTransactions)
        : null;

      setTransactions(
        Array.isArray(parsedTransactions)
          ? parsedTransactions
          : createInitialTransactions(today)
      );

      setBudgets(readStoredArray(STORAGE_BUDGETS));

      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);

        if (
          parsedSettings &&
          typeof parsedSettings === "object" &&
          !Array.isArray(parsedSettings)
        ) {
          setSettings((previous) => ({
            ...previous,
            ...parsedSettings,
          }));
        }
      }
    } catch (error) {
      console.error("Could not load dashboard data:", error);
      setTransactions(createInitialTransactions(today));
      setBudgets([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  const monthTransactions = useMemo(
    () => getMonthTransactions(transactions, currentDate),
    [transactions, currentDate]
  );

  const income = useMemo(
    () =>
      monthTransactions
        .filter(isIncome)
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [monthTransactions]
  );

  const expenses = useMemo(
    () =>
      monthTransactions
        .filter(isExpense)
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [monthTransactions]
  );

  const balance = income - expenses;

  // Monthly budget comes from Settings.
  // Category budgets are managed separately on the Budgets page.
  const totalBudget = Math.max(
    0,
    Number(settings.monthlyBudget || 0) || 0
  );

  const budgetUsed =
    totalBudget > 0 ? (expenses / totalBudget) * 100 : 0;

  const categoryTotals = useMemo(
    () =>
      categories
        .map((category) => ({
          ...category,
          amount: monthTransactions
            .filter(
              (item) =>
                isExpense(item) && item.category === category.name
            )
            .reduce(
              (sum, item) => sum + Number(item.amount || 0),
              0
            ),
        }))
        .filter((category) => category.amount > 0)
        .sort((a, b) => b.amount - a.amount),
    [monthTransactions]
  );

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => {
          const dateA = a?.date || "";
          const dateB = b?.date || "";
          return dateB.localeCompare(dateA);
        })
        .slice(0, 5),
    [transactions]
  );

  const weeklyData = useMemo(
    () => getWeeklyData(transactions, currentDate),
    [transactions, currentDate]
  );

  const maxWeeklyValue = Math.max(
    1,
    ...weeklyData.flatMap((day) => [day.income, day.expense])
  );

  const firstName =
    String(settings.name || settings.displayName || "")
      .trim()
      .split(/\s+/)[0] || "User";

  if (!loaded || !currentDate) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080d18] text-white">
        Loading dashboard...
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#080d18] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#0b1220] p-5 lg:flex lg:flex-col">
          <Link href="/" className="mb-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-400 text-[#07111b]">
              <Wallet size={23} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Fintelligence
              </h1>
              <p className="text-xs text-slate-400">
                Personal Finance
              </p>
            </div>
          </Link>

          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                    item.href === "/"
                      ? "bg-teal-400/10 font-semibold text-teal-300"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={19} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-teal-400/20 bg-teal-400/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-teal-300">
              <Bot size={19} />
              <span className="font-semibold">Smart Insights</span>
            </div>

            <p className="mb-3 text-xs leading-5 text-slate-400">
              Review your spending and discover ways to save.
            </p>

            <Link
              href="/ai-assistant"
              className="flex items-center justify-between text-sm font-medium text-teal-300 hover:text-teal-200"
            >
              Explore insights <ArrowRight size={16} />
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#080d18]/95 px-5 py-4 backdrop-blur md:px-8">
            <div>
              <h2 className="text-xl font-bold md:text-2xl">
                Dashboard
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Welcome back, {firstName}!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-400 sm:inline">
                {new Date(`${currentDate}T12:00:00`).toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </span>

              <Link
                href="/transactions"
                className="flex items-center gap-2 rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-bold text-[#07111b] transition hover:bg-teal-300"
              >
                <Plus size={17} />
                Add Transaction
              </Link>
            </div>
          </header>

          <div className="border-b border-white/10 px-4 py-3 lg:hidden">
            <nav className="flex gap-2 overflow-x-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-lg px-3 py-2 text-sm ${
                    item.href === "/"
                      ? "bg-teal-400/10 text-teal-300"
                      : "bg-white/5 text-slate-400"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mx-auto max-w-[1500px] space-y-6 p-4 md:p-8">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Total Income"
                amount={money(income, settings.currency)}
                note="This month"
                icon={TrendingUp}
                iconColor="text-teal-300"
                iconBg="bg-teal-400/10"
              />

              <SummaryCard
                title="Total Expenses"
                amount={money(expenses, settings.currency)}
                note="This month"
                icon={TrendingDown}
                iconColor="text-rose-300"
                iconBg="bg-rose-400/10"
              />

              <SummaryCard
                title="Net Balance"
                amount={money(balance, settings.currency)}
                note="Income minus expenses"
                icon={Wallet}
                iconColor="text-blue-300"
                iconBg="bg-blue-400/10"
              />

              <SummaryCard
                title="Monthly Budget"
                amount={money(totalBudget, settings.currency)}
                note={
                  totalBudget > 0
                    ? `${Math.round(budgetUsed)}% used`
                    : "Set your budget in Settings"
                }
                icon={PiggyBank}
                iconColor="text-purple-300"
                iconBg="bg-purple-400/10"
              />
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#0d1525] p-5 md:p-6 xl:col-span-2">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">
                      Weekly Cash Flow
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Income and expenses over the last 7 days
                    </p>
                  </div>

                  <div className="flex gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-teal-300" />
                      Income
                    </span>

                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                      Expenses
                    </span>
                  </div>
                </div>

                <div className="flex h-56 items-end justify-between gap-2 border-b border-white/10 pb-2">
                  {weeklyData.map((day) => (
                    <div
                      key={day.day}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <div className="flex h-full w-full items-end justify-center gap-1">
                        <div
                          title={`Income: ${money(
                            day.income,
                            settings.currency
                          )}`}
                          className="w-3 rounded-t-md bg-teal-300 transition-all sm:w-5"
                          style={{
                            height: `${Math.max(
                              day.income > 0 ? 4 : 0,
                              (day.income / maxWeeklyValue) * 85
                            )}%`,
                          }}
                        />

                        <div
                          title={`Expenses: ${money(
                            day.expense,
                            settings.currency
                          )}`}
                          className="w-3 rounded-t-md bg-rose-400 transition-all sm:w-5"
                          style={{
                            height: `${Math.max(
                              day.expense > 0 ? 4 : 0,
                              (day.expense / maxWeeklyValue) * 85
                            )}%`,
                          }}
                        />
                      </div>

                      <span className="text-xs text-slate-500">
                        {day.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d1525] p-5 md:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">
                      Budget Overview
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Monthly spending limit
                    </p>
                  </div>

                  <PiggyBank className="text-purple-300" size={22} />
                </div>

                <div className="mb-2 flex items-end justify-between gap-2">
                  <span className="text-2xl font-bold">
                    {money(expenses, settings.currency)}
                  </span>

                  <span className="text-sm text-slate-400">
                    of {money(totalBudget, settings.currency)}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all ${
                      budgetUsed >= 100
                        ? "bg-rose-400"
                        : "bg-teal-300"
                    }`}
                    style={{
                      width: `${Math.min(budgetUsed, 100)}%`,
                    }}
                  />
                </div>

                <p
                  className={`mt-3 text-sm ${
                    budgetUsed >= 100 && totalBudget > 0
                      ? "text-rose-300"
                      : "text-slate-400"
                  }`}
                >
                  {totalBudget <= 0
                    ? "Set a monthly budget in Settings to track your limit."
                    : budgetUsed >= 100
                    ? `You have exceeded your budget by ${money(
                        expenses - totalBudget,
                        settings.currency
                      )}.`
                    : `${money(
                        totalBudget - expenses,
                        settings.currency
                      )} remaining in your budget.`}
                </p>

                <Link
                  href="/budgets"
                  className="mt-6 flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm font-medium transition hover:bg-white/5"
                >
                  Manage budgets
                  <ArrowUpRight size={17} />
                </Link>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#0d1525] p-5 md:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">
                      Spending Breakdown
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Expenses by category this month
                    </p>
                  </div>

                  <CircleDollarSign
                    className="text-teal-300"
                    size={22}
                  />
                </div>

                {categoryTotals.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No expenses recorded this month.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {categoryTotals.map((category) => (
                      <div key={category.name}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-slate-300">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor: category.color,
                              }}
                            />
                            {category.name}
                          </span>

                          <span className="font-medium">
                            {money(
                              category.amount,
                              settings.currency
                            )}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(
                                (category.amount / Math.max(expenses, 1)) *
                                  100,
                                100
                              )}%`,
                              backgroundColor: category.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href="/analytics"
                  className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-sm font-medium text-teal-300 hover:text-teal-200"
                >
                  View analytics <ArrowRight size={17} />
                </Link>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d1525] p-5 md:p-6 xl:col-span-2">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">
                      Recent Transactions
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Your latest financial activity
                    </p>
                  </div>

                  <Link
                    href="/transactions"
                    className="flex items-center gap-1 text-sm font-medium text-teal-300 hover:text-teal-200"
                  >
                    View all <ArrowRight size={16} />
                  </Link>
                </div>

                {recentTransactions.length === 0 ? (
                  <div className="py-10 text-center">
                    <Receipt
                      className="mx-auto mb-3 text-slate-500"
                      size={30}
                    />

                    <p className="text-sm text-slate-400">
                      No transactions yet.
                    </p>

                    <Link
                      href="/transactions"
                      className="mt-3 inline-flex items-center gap-2 text-sm text-teal-300"
                    >
                      <Plus size={16} />
                      Add your first transaction
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {recentTransactions.map((transaction, index) => {
                      const incomeTransaction = isIncome(transaction);

                      return (
                        <div
                          key={transaction.id ?? `${transaction.date}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-xl px-2 py-3 transition hover:bg-white/[0.03] sm:px-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                incomeTransaction
                                  ? "bg-teal-400/10 text-teal-300"
                                  : "bg-rose-400/10 text-rose-300"
                              }`}
                            >
                              {incomeTransaction ? (
                                <ArrowDownRight size={20} />
                              ) : (
                                <ArrowUpRight size={20} />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {transaction.title ||
                                  transaction.description ||
                                  "Transaction"}
                              </p>

                              <p className="mt-1 truncate text-xs text-slate-500">
                                {transaction.category || "Other"} ·{" "}
                                {transaction.date || "No date"}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 text-sm font-semibold ${
                              incomeTransaction
                                ? "text-teal-300"
                                : "text-rose-300"
                            }`}
                          >
                            {incomeTransaction ? "+" : "-"}
                            {money(
                              transaction.amount,
                              settings.currency
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-teal-400/15 bg-gradient-to-r from-teal-400/10 to-blue-400/5 p-5 md:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-teal-400/10 p-3 text-teal-300">
                    <Bot size={23} />
                  </div>

                  <div>
                    <h3 className="font-bold">
                      Your Financial Snapshot
                    </h3>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                      {expenses === 0
                        ? "Start tracking your expenses to understand your spending habits."
                        : balance < 0
                        ? "Your expenses are higher than your income this month. Review your transactions and budget."
                        : totalBudget > 0 && budgetUsed >= 80
                        ? "You are close to your monthly budget limit. Review your spending before making extra purchases."
                        : "Your income is currently higher than your expenses. Keep tracking your spending to stay on top of your finances."}
                    </p>
                  </div>
                </div>

                <Link
                  href="/ai-assistant"
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-teal-300/20 px-4 py-3 text-sm font-semibold text-teal-300 transition hover:bg-teal-300/10"
                >
                  Open AI Assistant <ArrowRight size={16} />
                </Link>
              </div>
            </section>

            <footer className="pb-3 pt-1 text-center text-xs text-slate-600">
              Fintelligence · Your finances, made clearer.
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  amount,
  note,
  icon: Icon,
  iconColor,
  iconBg,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1525] p-5 transition hover:border-white/20">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-3 break-words text-2xl font-bold tracking-tight">
            {amount}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${iconBg} ${iconColor}`}>
          <Icon size={22} />
        </div>
      </div>

      <p className="text-xs text-slate-500">{note}</p>
    </div>
  );
}
