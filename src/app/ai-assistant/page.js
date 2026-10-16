
"use client";

import AppNavigation from "@/components/AppNavigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Send,
  Bot,
  User,
  Wallet,
  Lightbulb,
} from "lucide-react";

const STORAGE_KEY = "fintelligence-transactions-v1";
const API_URL = "http://127.0.0.1:8000/chat";

const suggestions = [
  "Analyze my spending",
  "How can I save money?",
  "Give me a budget tip",
];

export default function AIAssistantPage() {
  const [transactions, setTransactions] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your Money Companion. Ask me about your income, expenses, or savings.",
    },
  ]);

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
      console.error("Could not load transactions:", error);
    }
  }, []);

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const money = (amount) =>
    `৳${Number(amount).toLocaleString("en-BD", {
      maximumFractionDigits: 2,
    })}`;

  async function sendMessage(text = input) {
    const question = text.trim();

    if (!question || loading) return;

    setInput("");
    setLoading(true);

    setMessages((previous) => [
      ...previous,
      { role: "user", text: question },
    ]);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          transactions,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.error ||
            `Backend request failed (${response.status}).`
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: data.answer || "Sorry, I could not generate an answer.",
        },
      ]);
    } catch (error) {
      console.error("AI Assistant error:", error);

      let errorMessage = error.message;

      if (
        error instanceof TypeError &&
        error.message.toLowerCase().includes("fetch")
      ) {
        errorMessage =
          "Python backend-এর সঙ্গে সংযোগ হচ্ছে না। Backend server চালু আছে কি না দেখো।";
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: `Sorry, request failed: ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0B1014] px-5 py-8 text-white md:px-8">
      <AppNavigation />

      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center gap-3">
          <Link
            href="/"
            className="rounded-xl border border-white/10 p-2.5 text-gray-300 hover:bg-white/10"
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <p className="text-sm text-[#83D9B0]">FINTELLIGENCE</p>
            <h1 className="mt-1 text-2xl font-semibold md:text-3xl">
              AI Money Companion
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Your personal finance guidance assistant.
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="flex min-h-[600px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#121A20]">
            <div className="flex items-center gap-3 border-b border-white/10 p-5">
              <div className="rounded-xl bg-[#83D9B0]/10 p-3 text-[#83D9B0]">
                <Sparkles size={22} />
              </div>

              <div>
                <h2 className="font-semibold">Money Companion</h2>
                <p className="text-xs text-gray-400">
                  Powered by Gemini AI via Python FastAPI
                </p>
              </div>

              <span className="ml-auto flex items-center gap-2 text-xs text-[#83D9B0]">
                <span className="h-2 w-2 rounded-full bg-[#83D9B0]" />
                {loading ? "Thinking..." : "Ready"}
              </span>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.role === "assistant" && (
                    <span className="h-fit rounded-lg bg-[#83D9B0]/10 p-2 text-[#83D9B0]">
                      <Bot size={18} />
                    </span>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap ${
                      message.role === "user"
                        ? "bg-[#83D9B0] text-[#0B1014]"
                        : "border border-white/10 bg-[#0B1014] text-gray-200"
                    }`}
                  >
                    {message.text}
                  </div>

                  {message.role === "user" && (
                    <span className="h-fit rounded-lg bg-white/10 p-2 text-gray-300">
                      <User size={18} />
                    </span>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Bot size={18} className="text-[#83D9B0]" />
                  Analyzing your transactions...
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-5">
              <div className="mb-3 flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={loading}
                    onClick={() => sendMessage(suggestion)}
                    className="rounded-full border border-white/10 px-3 py-2 text-xs text-gray-300 hover:border-[#83D9B0] hover:text-[#83D9B0] disabled:opacity-40"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0B1014] p-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your spending..."
                  disabled={loading}
                  className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="rounded-lg bg-[#83D9B0] p-3 text-[#0B1014] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send size={17} />
                </button>
              </form>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#121A20] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Wallet className="text-[#83D9B0]" size={19} />
                <h2 className="font-semibold">Your Overview</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Income</p>
                  <p className="mt-1 text-xl font-semibold text-[#83D9B0]">
                    {money(income)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Expenses</p>
                  <p className="mt-1 text-xl font-semibold text-rose-400">
                    {money(expenses)}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-sm text-gray-400">Net Balance</p>
                  <p className="mt-1 text-xl font-semibold">
                    {money(income - expenses)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#83D9B0]/20 bg-[#83D9B0]/5 p-5">
              <Lightbulb className="mb-3 text-[#83D9B0]" size={22} />
              <h2 className="font-semibold">Smart Tip</h2>
              <p className="mt-2 text-sm leading-6 text-gray-300">
                Track your expenses regularly and set realistic category
                budgets to build healthier financial habits.
              </p>
            </div>

            <Link
              href="/transactions"
              className="block rounded-xl border border-white/10 px-4 py-3 text-center text-sm text-gray-300 hover:bg-white/5"
            >
              View Transactions
            </Link>
          </aside>
        </section>

        <p className="mt-5 text-xs text-gray-500">
          AI responses are generated by Gemini using the transaction data
          provided by your app. Review financial suggestions carefully.
        </p>
      </div>
    </main>
  );
}