
// "use client";

// import AppNavigation from "@/components/AppNavigation";
// import { useEffect, useMemo, useState } from "react";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   ArrowDownLeft,
//   ArrowUpRight,
//   Search,
//   Plus,
//   X,
//   Trash2,
//   Wallet,
//   Download,
// } from "lucide-react";

// const STORAGE_KEY = "fintelligence-transactions-v1";

// const categories = [
//   "Food",
//   "Transport",
//   "Education",
//   "Shopping",
//   "Bills",
//   "Entertainment",
//   "Health",
//   "Salary",
//   "Freelance",
//   "Other",
// ];

// function getToday() {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, "0");
//   const day = String(now.getDate()).padStart(2, "0");

//   return `${year}-${month}-${day}`;
// }

// const emptyForm = {
//   title: "",
//   amount: "",
//   type: "expense",
//   category: "Food",
//   date: "",
// };

// export default function TransactionsPage() {
//   const [transactions, setTransactions] = useState([]);
//   const [loaded, setLoaded] = useState(false);
//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("All");
//   const [showModal, setShowModal] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [form, setForm] = useState(emptyForm);

//   // Load transactions from browser storage.
//   useEffect(() => {
//     try {
//       const saved = localStorage.getItem(STORAGE_KEY);

//       if (saved) {
//         const parsed = JSON.parse(saved);

//         if (Array.isArray(parsed)) {
//           setTransactions(parsed);
//         }
//       }
//     } catch (error) {
//       console.error("Failed to load transactions:", error);
//     } finally {
//       setLoaded(true);
//     }
//   }, []);

//   // Save transactions after loading is complete.
//   useEffect(() => {
//     if (!loaded) return;

//     try {
//       localStorage.setItem(
//         STORAGE_KEY,
//         JSON.stringify(transactions)
//       );
//     } catch (error) {
//       console.error("Failed to save transactions:", error);
//     }
//   }, [transactions, loaded]);

//   const filteredTransactions = useMemo(() => {
//     return transactions.filter((transaction) => {
//       const title = (transaction.title || "").toLowerCase();
//       const category = (transaction.category || "").toLowerCase();
//       const query = search.toLowerCase();

//       const matchesSearch =
//         title.includes(query) || category.includes(query);

//       const matchesFilter =
//         filter === "All" ||
//         (filter === "Income" && transaction.type === "income") ||
//         (filter === "Expenses" && transaction.type === "expense");

//       return matchesSearch && matchesFilter;
//     });
//   }, [transactions, search, filter]);

//   const income = transactions
//     .filter((transaction) => transaction.type === "income")
//     .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

//   const expenses = transactions
//     .filter((transaction) => transaction.type === "expense")
//     .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

//   function openAddModal() {
//     setEditingId(null);
//     setForm({
//       ...emptyForm,
//       date: getToday(),
//     });
//     setShowModal(true);
//   }

//   function openEditModal(transaction) {
//     setEditingId(transaction.id);
//     setForm({
//       title: transaction.title || "",
//       amount: String(transaction.amount ?? ""),
//       type: transaction.type || "expense",
//       category: transaction.category || "Other",
//       date: transaction.date || getToday(),
//     });
//     setShowModal(true);
//   }

//   function handleSubmit(event) {
//     event.preventDefault();

//     const amount = Number(form.amount);

//     if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0) {
//       alert("Enter a title and a valid amount.");
//       return;
//     }

//     if (!form.date) {
//       alert("Please select a transaction date.");
//       return;
//     }

//     const transaction = {
//       id: editingId ?? Date.now(),
//       title: form.title.trim(),
//       amount,
//       type: form.type,
//       category: form.category,
//       date: form.date,
//     };

//     if (editingId !== null) {
//       setTransactions((previous) =>
//         previous.map((item) =>
//           item.id === editingId ? transaction : item
//         )
//       );
//     } else {
//       setTransactions((previous) => [
//         transaction,
//         ...previous,
//       ]);
//     }

//     setShowModal(false);
//     setEditingId(null);
//     setForm(emptyForm);
//   }

//   function deleteTransaction(id) {
//     if (confirm("Delete this transaction?")) {
//       setTransactions((previous) =>
//         previous.filter((transaction) => transaction.id !== id)
//       );
//     }
//   }

//   function exportTransactions() {
//     if (transactions.length === 0) {
//       alert("No transactions to export!");
//       return;
//     }

//     const headers = [
//       "Title",
//       "Amount",
//       "Type",
//       "Category",
//       "Date",
//     ];

//     const rows = transactions.map((transaction) => [
//       transaction.title,
//       transaction.amount,
//       transaction.type,
//       transaction.category,
//       transaction.date,
//     ]);

//     const csv = [headers, ...rows]
//       .map((row) =>
//         row
//           .map(
//             (value) =>
//               `"${String(value ?? "").replace(/"/g, '""')}"`
//           )
//           .join(",")
//       )
//       .join("\r\n");

//     const blob = new Blob(["\uFEFF" + csv], {
//       type: "text/csv;charset=utf-8;",
//     });

//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");

//     link.href = url;
//     link.download = "fintelligence-transactions.csv";
//     document.body.appendChild(link);
//     link.click();
//     link.remove();

//     URL.revokeObjectURL(url);
//   }

//   function formatDate(date) {
//     if (!date) return "—";

//     const parsedDate = new Date(`${date}T00:00:00`);

//     if (Number.isNaN(parsedDate.getTime())) return "—";

//     return parsedDate.toLocaleDateString("en-US", {
//       month: "short",
//       day: "2-digit",
//       year: "numeric",
//     });
//   }

//   function formatMoney(amount) {
//     return `৳${Number(amount || 0).toLocaleString("en-BD", {
//       maximumFractionDigits: 2,
//     })}`;
//   }

//   return (
//     <main className="min-h-screen bg-[#0B1014] text-white">
//       <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
//         <AppNavigation />

//         <header className="mb-9 flex flex-wrap items-center justify-between gap-4">
//           <div className="flex items-center gap-3">
//             <Link
//               href="/"
//               className="rounded-xl border border-white/10 p-2.5 text-gray-300 hover:bg-white/10"
//               aria-label="Back to dashboard"
//             >
//               <ArrowLeft size={19} />
//             </Link>

//             <div>
//               <p className="text-sm text-[#83D9B0]">FINTELLIGENCE</p>
//               <h1 className="mt-1 text-2xl font-semibold md:text-3xl">
//                 Transactions
//               </h1>
//               <p className="mt-1 text-sm text-gray-400">
//                 Manage your income and expenses.
//               </p>
//             </div>
//           </div>

//           <div className="flex flex-wrap gap-3">
//             <button
//               onClick={exportTransactions}
//               className="flex items-center gap-2 rounded-xl border border-[#83D9B0]/40 px-4 py-3 font-medium text-[#83D9B0] hover:bg-[#83D9B0]/10"
//             >
//               <Download size={18} />
//               Export CSV
//             </button>

//             <button
//               onClick={openAddModal}
//               className="flex items-center gap-2 rounded-xl bg-[#83D9B0] px-4 py-3 font-semibold text-[#0B1014] hover:bg-[#9CE8C5]"
//             >
//               <Plus size={18} />
//               Add Transaction
//             </button>
//           </div>
//         </header>

//         <section className="mb-7 grid gap-4 sm:grid-cols-2">
//           <div className="rounded-2xl border border-white/10 bg-[#121A20] p-5">
//             <div className="flex items-center justify-between">
//               <p className="text-sm text-gray-400">Total Income</p>
//               <ArrowDownLeft className="text-[#83D9B0]" />
//             </div>
//             <h2 className="mt-4 text-2xl font-semibold">
//               {formatMoney(income)}
//             </h2>
//           </div>

//           <div className="rounded-2xl border border-white/10 bg-[#121A20] p-5">
//             <div className="flex items-center justify-between">
//               <p className="text-sm text-gray-400">Total Expenses</p>
//               <ArrowUpRight className="text-rose-400" />
//             </div>
//             <h2 className="mt-4 text-2xl font-semibold">
//               {formatMoney(expenses)}
//             </h2>
//           </div>
//         </section>

//         <section className="rounded-2xl border border-white/10 bg-[#121A20] p-5 md:p-6">
//           <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//             <h2 className="text-lg font-semibold">All Transactions</h2>

//             <div className="flex flex-col gap-3 sm:flex-row">
//               <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B1014] px-3">
//                 <Search size={17} className="text-gray-400" />
//                 <input
//                   value={search}
//                   onChange={(event) => setSearch(event.target.value)}
//                   placeholder="Search transactions..."
//                   className="w-full bg-transparent py-3 text-sm outline-none sm:w-52"
//                 />
//               </div>

//               <select
//                 value={filter}
//                 onChange={(event) => setFilter(event.target.value)}
//                 className="rounded-xl border border-white/10 bg-[#0B1014] px-3 py-3 text-sm outline-none"
//               >
//                 <option>All</option>
//                 <option>Income</option>
//                 <option>Expenses</option>
//               </select>
//             </div>
//           </div>

//           {!loaded ? (
//             <p className="py-12 text-center text-gray-400">
//               Loading transactions...
//             </p>
//           ) : filteredTransactions.length === 0 ? (
//             <div className="py-14 text-center">
//               <Wallet
//                 size={36}
//                 className="mx-auto mb-3 text-gray-500"
//               />
//               <p className="font-medium">No transactions found</p>
//               <p className="mt-2 text-sm text-gray-400">
//                 Add a transaction to get started.
//               </p>
//               <button
//                 onClick={openAddModal}
//                 className="mt-5 rounded-xl bg-[#83D9B0] px-4 py-2.5 font-semibold text-[#0B1014]"
//               >
//                 <Plus size={16} className="mr-1 inline" />
//                 Add Transaction
//               </button>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[650px] text-left text-sm">
//                 <thead>
//                   <tr className="border-b border-white/10 text-gray-400">
//                     <th className="pb-4 font-medium">Transaction</th>
//                     <th className="pb-4 font-medium">Category</th>
//                     <th className="pb-4 font-medium">Date</th>
//                     <th className="pb-4 text-right font-medium">Amount</th>
//                     <th className="pb-4 text-right font-medium">Actions</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {filteredTransactions.map((transaction) => (
//                     <tr
//                       key={transaction.id}
//                       className="border-b border-white/5 last:border-0"
//                     >
//                       <td className="py-5 pr-4">
//                         <div className="flex items-center gap-3">
//                           <span
//                             className={`rounded-xl p-2 ${
//                               transaction.type === "income"
//                                 ? "bg-[#83D9B0]/10 text-[#83D9B0]"
//                                 : "bg-rose-400/10 text-rose-400"
//                             }`}
//                           >
//                             {transaction.type === "income" ? (
//                               <ArrowDownLeft size={18} />
//                             ) : (
//                               <ArrowUpRight size={18} />
//                             )}
//                           </span>
//                           <span className="font-medium">
//                             {transaction.title}
//                           </span>
//                         </div>
//                       </td>

//                       <td className="py-5 pr-4 text-gray-300">
//                         {transaction.category}
//                       </td>

//                       <td className="py-5 pr-4 text-gray-400">
//                         {formatDate(transaction.date)}
//                       </td>

//                       <td
//                         className={`py-5 text-right font-semibold ${
//                           transaction.type === "income"
//                             ? "text-[#83D9B0]"
//                             : "text-rose-400"
//                         }`}
//                       >
//                         {transaction.type === "income" ? "+" : "-"}
//                         {formatMoney(transaction.amount)}
//                       </td>

//                       <td className="py-5 text-right">
//                         <div className="flex justify-end gap-2">
//                           <button
//                             onClick={() => openEditModal(transaction)}
//                             className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/10"
//                           >
//                             Edit
//                           </button>
//                           <button
//                             onClick={() => deleteTransaction(transaction.id)}
//                             className="rounded-lg border border-white/10 p-2 text-rose-400 hover:bg-rose-400/10"
//                             aria-label={`Delete ${transaction.title}`}
//                           >
//                             <Trash2 size={15} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </section>

//         <p className="mt-5 text-xs text-gray-500">
//           Data is saved locally in this browser. It is not synced across devices.
//         </p>
//       </div>

//       {showModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
//           <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#121A20] p-6 shadow-2xl">
//             <div className="mb-6 flex items-center justify-between">
//               <h2 className="text-xl font-semibold">
//                 {editingId !== null ? "Edit Transaction" : "Add Transaction"}
//               </h2>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
//                 aria-label="Close"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="mb-2 block text-sm text-gray-300">
//                   Transaction title
//                 </label>
//                 <input
//                   required
//                   value={form.title}
//                   onChange={(event) =>
//                     setForm({ ...form, title: event.target.value })
//                   }
//                   placeholder="e.g. Grocery shopping"
//                   className="w-full rounded-xl border border-white/10 bg-[#0B1014] px-4 py-3 outline-none focus:border-[#83D9B0]"
//                 />
//               </div>

//               <div>
//                 <label className="mb-2 block text-sm text-gray-300">
//                   Amount (৳)
//                 </label>
//                 <input
//                   required
//                   type="number"
//                   min="0.01"
//                   step="0.01"
//                   value={form.amount}
//                   onChange={(event) =>
//                     setForm({ ...form, amount: event.target.value })
//                   }
//                   placeholder="0.00"
//                   className="w-full rounded-xl border border-white/10 bg-[#0B1014] px-4 py-3 outline-none focus:border-[#83D9B0]"
//                 />
//               </div>

//               <div>
//                 <label className="mb-2 block text-sm text-gray-300">
//                   Type
//                 </label>
//                 <div className="grid grid-cols-2 gap-3">
//                   {["expense", "income"].map((type) => (
//                     <button
//                       key={type}
//                       type="button"
//                       onClick={() =>
//                         setForm({
//                           ...form,
//                           type,
//                           category:
//                             type === "income" ? "Salary" : "Food",
//                         })
//                       }
//                       className={`rounded-xl border px-4 py-3 capitalize ${
//                         form.type === type
//                           ? "border-[#83D9B0] bg-[#83D9B0]/10 text-[#83D9B0]"
//                           : "border-white/10 text-gray-300"
//                       }`}
//                     >
//                       {type}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <label className="mb-2 block text-sm text-gray-300">
//                   Category
//                 </label>
//                 <select
//                   value={form.category}
//                   onChange={(event) =>
//                     setForm({ ...form, category: event.target.value })
//                   }
//                   className="w-full rounded-xl border border-white/10 bg-[#0B1014] px-4 py-3 outline-none focus:border-[#83D9B0]"
//                 >
//                   {categories
//                     .filter((category) =>
//                       form.type === "income"
//                         ? ["Salary", "Freelance", "Other"].includes(category)
//                         : !["Salary", "Freelance"].includes(category)
//                     )
//                     .map((category) => (
//                       <option key={category} value={category}>
//                         {category}
//                       </option>
//                     ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="mb-2 block text-sm text-gray-300">
//                   Date
//                 </label>
//                 <input
//                   required
//                   type="date"
//                   value={form.date}
//                   onChange={(event) =>
//                     setForm({ ...form, date: event.target.value })
//                   }
//                   className="w-full rounded-xl border border-white/10 bg-[#0B1014] px-4 py-3 outline-none focus:border-[#83D9B0]"
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className="w-full rounded-xl bg-[#83D9B0] py-3 font-semibold text-[#0B1014] hover:bg-[#9CE8C5]"
//               >
//                 {editingId !== null ? "Save Changes" : "Add Transaction"}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </main>
//   );
// }

"use client";

import AppNavigation from "@/components/AppNavigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Plus,
  X,
  Trash2,
  Wallet,
  Download,
  TrendingUp,
  TrendingDown,
  ReceiptText,
  SlidersHorizontal,
  CalendarDays,
  Pencil,
  ArrowUpDown,
  CircleDollarSign,
} from "lucide-react";

const STORAGE_KEY = "fintelligence-transactions-v1";

const categories = [
  "Food",
  "Transport",
  "Education",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Salary",
  "Freelance",
  "Other",
];

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const emptyForm = {
  title: "",
  amount: "",
  type: "expense",
  category: "Food",
  date: "",
};

function formatMoney(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [sortNewest, setSortNewest] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setTransactions(parsed);
      }
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error("Failed to save transactions:", error);
    }
  }, [transactions, loaded]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => {
        const title = (transaction.title || "").toLowerCase();
        const category = (transaction.category || "").toLowerCase();
        const query = search.toLowerCase();

        const matchesSearch =
          title.includes(query) || category.includes(query);

        const matchesFilter =
          filter === "All" ||
          (filter === "Income" && transaction.type === "income") ||
          (filter === "Expenses" && transaction.type === "expense");

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        const dateA = a.date || "";
        const dateB = b.date || "";
        return sortNewest
          ? dateB.localeCompare(dateA)
          : dateA.localeCompare(dateB);
      });
  }, [transactions, search, filter, sortNewest]);

  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const balance = income - expenses;

  function openAddModal() {
    setEditingId(null);
    setForm({ ...emptyForm, date: getToday() });
    setShowModal(true);
  }

  function openEditModal(transaction) {
    setEditingId(transaction.id);
    setForm({
      title: transaction.title || "",
      amount: String(transaction.amount ?? ""),
      type: transaction.type || "expense",
      category: transaction.category || "Other",
      date: transaction.date || getToday(),
    });
    setShowModal(true);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const amount = Number(form.amount);

    if (
      !form.title.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      alert("Enter a title and a valid amount.");
      return;
    }

    if (!form.date) {
      alert("Please select a transaction date.");
      return;
    }

    const transaction = {
      id: editingId ?? Date.now(),
      title: form.title.trim(),
      amount,
      type: form.type,
      category: form.category,
      date: form.date,
    };

    if (editingId !== null) {
      setTransactions((previous) =>
        previous.map((item) =>
          item.id === editingId ? transaction : item
        )
      );
    } else {
      setTransactions((previous) => [transaction, ...previous]);
    }

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function deleteTransaction(id) {
    if (confirm("Delete this transaction?")) {
      setTransactions((previous) =>
        previous.filter((transaction) => transaction.id !== id)
      );
    }
  }

  function exportTransactions() {
    if (transactions.length === 0) {
      alert("No transactions to export!");
      return;
    }

    const headers = ["Title", "Amount", "Type", "Category", "Date"];

    const rows = transactions.map((transaction) => [
      transaction.title,
      transaction.amount,
      transaction.type,
      transaction.category,
      transaction.date,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map(
            (value) => `"${String(value ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "fintelligence-transactions.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080D18] text-white">
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-emerald-400/[0.06] blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-96 h-96 w-96 rounded-full bg-cyan-400/[0.04] blur-[120px]" />

      <div className="relative mx-auto max-w-[1440px] px-4 py-5 sm:px-6 md:px-8 md:py-8">
        <AppNavigation />

        <header className="mb-8 mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <Link
              href="/"
              className="mt-1 rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-slate-300 transition hover:border-emerald-300/30 hover:bg-emerald-300/10 hover:text-emerald-300"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.6)]" />
                <p className="text-xs font-semibold tracking-[0.22em] text-emerald-300">
                  FINANCIAL MANAGEMENT
                </p>
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Transactions<span className="text-emerald-300">.</span>
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Track every taka. Understand every decision.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 sm:justify-end">
            <button
              onClick={exportTransactions}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-emerald-300/30 hover:bg-emerald-300/[0.06] hover:text-emerald-300"
            >
              <Download size={17} />
              Export CSV
            </button>

            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-3 text-sm font-bold text-[#07111b] shadow-[0_5px_25px_rgba(110,231,183,0.12)] transition hover:bg-emerald-200 hover:shadow-[0_5px_30px_rgba(110,231,183,0.22)]"
            >
              <Plus size={18} />
              Add Transaction
            </button>
          </div>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Income"
            amount={formatMoney(income)}
            note="Money coming in"
            icon={TrendingUp}
            color="emerald"
          />

          <StatCard
            title="Total Expenses"
            amount={formatMoney(expenses)}
            note="Money going out"
            icon={TrendingDown}
            color="rose"
          />

          <StatCard
            title="Net Balance"
            amount={formatMoney(balance)}
            note="Income minus expenses"
            icon={Wallet}
            color="blue"
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0D1522]/90 shadow-2xl shadow-black/10">
          <div className="flex flex-col gap-4 border-b border-white/[0.07] p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-emerald-300/15 bg-emerald-300/[0.08] p-2.5 text-emerald-300">
                  <ReceiptText size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">All Transactions</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {filteredTransactions.length}{" "}
                    {filteredTransactions.length === 1
                      ? "record"
                      : "records"}{" "}
                    found
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/[0.09] bg-[#080D18] px-3 transition focus-within:border-emerald-300/40 sm:w-64">
                <Search size={17} className="shrink-0 text-slate-500" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search transactions..."
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-slate-500 hover:text-white"
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/[0.09] bg-[#080D18] px-3">
                <SlidersHorizontal size={16} className="text-slate-500" />
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  className="w-full bg-transparent py-3 text-sm text-slate-300 outline-none sm:w-auto"
                >
                  <option className="bg-[#0D1522]">All</option>
                  <option className="bg-[#0D1522]">Income</option>
                  <option className="bg-[#0D1522]">Expenses</option>
                </select>
              </div>
            </div>
          </div>

          {!loaded ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-emerald-300/20 border-t-emerald-300" />
              <p className="text-sm text-slate-400">
                Loading your transactions...
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="px-5 py-16 text-center sm:py-20">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-300">
                <Wallet size={30} />
              </div>

              <h3 className="text-lg font-semibold">
                {search || filter !== "All"
                  ? "No matching transactions"
                  : "Your financial journey starts here"}
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                {search || filter !== "All"
                  ? "Try a different search term or change your filter."
                  : "Add your first transaction to start tracking income and expenses."}
              </p>

              {search || filter !== "All" ? (
                <button
                  onClick={() => {
                    setSearch("");
                    setFilter("All");
                  }}
                  className="mt-5 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
                >
                  Clear filters
                </button>
              ) : (
                <button
                  onClick={openAddModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-4 py-3 text-sm font-bold text-[#07111b] hover:bg-emerald-200"
                >
                  <Plus size={17} />
                  Add your first transaction
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-white/[0.015]">
                    <tr className="border-b border-white/[0.07] text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-4 font-semibold">
                        Transaction
                      </th>
                      <th className="px-4 py-4 font-semibold">Category</th>
                      <th className="px-4 py-4 font-semibold">
                        <button
                          onClick={() => setSortNewest((value) => !value)}
                          className="inline-flex items-center gap-2 transition hover:text-emerald-300"
                        >
                          Date <ArrowUpDown size={13} />
                        </button>
                      </th>
                      <th className="px-4 py-4 text-right font-semibold">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTransactions.map((transaction) => {
                      const isIncome = transaction.type === "income";

                      return (
                        <tr
                          key={transaction.id}
                          className="group border-b border-white/[0.045] transition hover:bg-white/[0.025] last:border-0"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                                  isIncome
                                    ? "border-emerald-300/10 bg-emerald-300/[0.08] text-emerald-300"
                                    : "border-rose-300/10 bg-rose-300/[0.07] text-rose-300"
                                }`}
                              >
                                {isIncome ? (
                                  <ArrowDownLeft size={20} />
                                ) : (
                                  <ArrowUpRight size={20} />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[240px] truncate font-semibold text-slate-100">
                                  {transaction.title || "Untitled"}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {isIncome ? "Income" : "Expense"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="inline-flex items-center rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-1.5 text-xs text-slate-300">
                              {transaction.category || "Other"}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-slate-400">
                              <CalendarDays
                                size={15}
                                className="text-slate-600"
                              />
                              {formatDate(transaction.date)}
                            </div>
                          </td>

                          <td
                            className={`px-4 py-4 text-right font-bold ${
                              isIncome
                                ? "text-emerald-300"
                                : "text-rose-300"
                            }`}
                          >
                            {isIncome ? "+" : "−"}
                            {formatMoney(transaction.amount)}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2 opacity-70 transition group-hover:opacity-100">
                              <button
                                onClick={() => openEditModal(transaction)}
                                className="rounded-lg border border-white/[0.08] p-2 text-slate-400 transition hover:border-emerald-300/20 hover:bg-emerald-300/[0.07] hover:text-emerald-300"
                                aria-label={`Edit ${transaction.title}`}
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() =>
                                  deleteTransaction(transaction.id)
                                }
                                className="rounded-lg border border-white/[0.08] p-2 text-slate-500 transition hover:border-rose-300/20 hover:bg-rose-300/[0.07] hover:text-rose-300"
                                aria-label={`Delete ${transaction.title}`}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-white/[0.06] md:hidden">
                {filteredTransactions.map((transaction) => {
                  const isIncome = transaction.type === "income";

                  return (
                    <div
                      key={transaction.id}
                      className="p-4 transition hover:bg-white/[0.02] sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                              isIncome
                                ? "bg-emerald-300/[0.09] text-emerald-300"
                                : "bg-rose-300/[0.08] text-rose-300"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft size={20} />
                            ) : (
                              <ArrowUpRight size={20} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {transaction.title || "Untitled"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {transaction.category || "Other"}
                            </p>
                          </div>
                        </div>

                        <p
                          className={`shrink-0 text-sm font-bold ${
                            isIncome
                              ? "text-emerald-300"
                              : "text-rose-300"
                          }`}
                        >
                          {isIncome ? "+" : "−"}
                          {formatMoney(transaction.amount)}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <CalendarDays size={14} />
                          {formatDate(transaction.date)}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(transaction)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              deleteTransaction(transaction.id)
                            }
                            className="rounded-lg border border-white/10 p-2 text-rose-300"
                            aria-label={`Delete ${transaction.title}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] bg-white/[0.015] px-5 py-4 text-xs text-slate-500 sm:px-6">
            <span>
              Showing {filteredTransactions.length} of {transactions.length}{" "}
              transactions
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Data saved in this browser
            </span>
          </div>
        </section>

        <footer className="mt-7 flex flex-col items-center justify-between gap-3 pb-3 text-xs text-slate-600 sm:flex-row">
          <p>© Fintelligence · Personal Finance Management</p>
          <p className="flex items-center gap-1.5">
            <CircleDollarSign size={14} />
            Make every taka count.
          </p>
        </footer>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0D1522] shadow-[0_25px_100px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-emerald-300/15 bg-emerald-300/[0.08] p-2.5 text-emerald-300">
                  {editingId !== null ? (
                    <Pencil size={19} />
                  ) : (
                    <Plus size={20} />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {editingId !== null
                      ? "Edit Transaction"
                      : "New Transaction"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Enter the details below
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-white/[0.08] p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Transaction title
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="e.g. Grocery shopping"
                  className="w-full rounded-xl border border-white/[0.09] bg-[#080D18] px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-600 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/[0.06]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Amount
                </label>
                <div className="flex items-center rounded-xl border border-white/[0.09] bg-[#080D18] transition focus-within:border-emerald-300/50">
                  <span className="border-r border-white/[0.07] px-4 py-3.5 text-sm font-semibold text-emerald-300">
                    ৳
                  </span>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) =>
                      setForm({ ...form, amount: event.target.value })
                    }
                    placeholder="0.00"
                    className="w-full bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Transaction type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["expense", "income"].map((type) => {
                    const selected = form.type === type;
                    const isIncome = type === "income";

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            type,
                            category: isIncome ? "Salary" : "Food",
                          })
                        }
                        className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-semibold capitalize transition ${
                          selected
                            ? isIncome
                              ? "border-emerald-300/40 bg-emerald-300/[0.08] text-emerald-300"
                              : "border-rose-300/40 bg-rose-300/[0.07] text-rose-300"
                            : "border-white/[0.08] bg-white/[0.015] text-slate-400 hover:bg-white/[0.04]"
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft size={17} />
                        ) : (
                          <ArrowUpRight size={17} />
                        )}
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                    className="w-full rounded-xl border border-white/[0.09] bg-[#080D18] px-3 py-3.5 text-sm text-slate-200 outline-none focus:border-emerald-300/50"
                  >
                    {categories
                      .filter((category) =>
                        form.type === "income"
                          ? ["Salary", "Freelance", "Other"].includes(category)
                          : !["Salary", "Freelance"].includes(category)
                      )
                      .map((category) => (
                        <option
                          key={category}
                          value={category}
                          className="bg-[#0D1522]"
                        >
                          {category}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Date
                  </label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      setForm({ ...form, date: event.target.value })
                    }
                    className="w-full rounded-xl border border-white/[0.09] bg-[#080D18] px-3 py-3.5 text-sm text-slate-200 outline-none focus:border-emerald-300/50"
                  />
                </div>
              </div>

              <div className="flex gap-3 border-t border-white/[0.07] pt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-white/[0.09] px-4 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.04]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-3.5 text-sm font-bold text-[#07111b] transition hover:bg-emerald-200"
                >
                  {editingId !== null ? (
                    <Pencil size={16} />
                  ) : (
                    <Plus size={17} />
                  )}
                  {editingId !== null ? "Save Changes" : "Add Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({ title, amount, note, icon: Icon, color }) {
  const styles = {
    emerald: {
      icon: "border-emerald-300/10 bg-emerald-300/[0.08] text-emerald-300",
      glow: "group-hover:border-emerald-300/20",
      accent: "bg-emerald-300",
    },
    rose: {
      icon: "border-rose-300/10 bg-rose-300/[0.07] text-rose-300",
      glow: "group-hover:border-rose-300/20",
      accent: "bg-rose-300",
    },
    blue: {
      icon: "border-sky-300/10 bg-sky-300/[0.07] text-sky-300",
      glow: "group-hover:border-sky-300/20",
      accent: "bg-sky-300",
    },
  };

  const style = styles[color];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0D1522] p-5 transition duration-300 hover:-translate-y-0.5 hover:bg-[#101a29] ${style.glow}`}
    >
      <div
        className={`absolute right-0 top-0 h-28 w-28 translate-x-8 -translate-y-8 rounded-full opacity-[0.06] blur-2xl ${style.accent}`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-4 break-words text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {amount}
          </p>
          <p className="mt-2 text-xs text-slate-500">{note}</p>
        </div>

        <div className={`rounded-xl border p-3 ${style.icon}`}>
          <Icon size={22} />
        </div>
      </div>

      <div className="mt-5 h-px w-full bg-white/[0.05]" />
      <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <span className={`h-1.5 w-1.5 rounded-full ${style.accent}`} />
        All recorded transactions
      </p>
    </div>
  );
}
