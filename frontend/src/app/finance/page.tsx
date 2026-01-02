'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { DollarSign, TrendingUp, TrendingDown, LayoutDashboard, CheckSquare, Activity, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function FinancePage() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [income, setIncome] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('FOOD');
    const [desc, setDesc] = useState('');

    const fetchData = async () => {
        try {
            const [expRes, incRes] = await Promise.all([
                api.get('/finance/expenses/'),
                api.get('/finance/income/')
            ]);
            setExpenses(expRes.data);
            setIncome(incRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/finance/expenses/', {
                amount: parseFloat(amount),
                category,
                description: desc,
                date_incurred: new Date().toISOString().split('T')[0]
            });
            setIsModalOpen(false);
            setAmount('');
            setDesc('');
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const totalExpense = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const totalIncome = income.reduce((sum, i) => sum + parseFloat(i.amount), 0);
    const balance = totalIncome - totalExpense;

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6 pb-24">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-600 bg-clip-text text-transparent">Finance</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold p-2 px-4 rounded-full shadow-lg transition"
                >
                    + Expense
                </button>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
                    <p className="text-gray-500 text-xs uppercase mb-1">Balance</p>
                    <p className={`text-xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${balance.toFixed(2)}
                    </p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
                    <p className="text-gray-500 text-xs uppercase mb-1">Spent</p>
                    <p className="text-xl font-bold text-red-400">${totalExpense.toFixed(2)}</p>
                </div>
            </div>

            {/* Recent Transactions */}
            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Expenses</h2>
                {expenses.slice().reverse().map((exp: any) => (
                    <div key={exp.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-red-500/20 p-2 rounded-full text-red-500">
                                <TrendingDown className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-200">{exp.category}</p>
                                <p className="text-xs text-gray-500">{exp.description || 'No desc'}</p>
                            </div>
                        </div>
                        <span className="font-bold text-red-400">-${parseFloat(exp.amount).toFixed(2)}</span>
                    </div>
                ))}
                {expenses.length === 0 && <p className="text-gray-600 text-center text-sm py-4">No expenses recorded.</p>}
            </section>

            {/* Add Expense Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 w-full max-w-md rounded-2xl p-6 border border-gray-700 animate-slide-up">
                        <h2 className="text-xl font-bold mb-4">Add Expense</h2>
                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Amount</label>
                                <input
                                    type="number" step="0.01"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:border-yellow-500 outline-none"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    required
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Category</label>
                                <select
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 outline-none"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                >
                                    <option value="FOOD">Food</option>
                                    <option value="TRANSPORT">Transport</option>
                                    <option value="RENT">Rent</option>
                                    <option value="ENTERTAINMENT">Entertainment</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Description</label>
                                <input
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 outline-none"
                                    value={desc}
                                    onChange={e => setDesc(e.target.value)}
                                    placeholder="Lunch, Uber, etc."
                                />
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-800 rounded-lg font-medium">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-yellow-600 text-black rounded-lg font-bold">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-800 flex justify-around py-4 pb-6 z-50">
                <Link href="/dashboard" className="flex flex-col items-center text-gray-500 hover:text-gray-300">
                    <LayoutDashboard className="w-6 h-6" />
                    <span className="text-[10px] mt-1">Home</span>
                </Link>
                <Link href="/tasks" className="flex flex-col items-center text-gray-500 hover:text-gray-300">
                    <CheckSquare className="w-6 h-6" />
                    <span className="text-[10px] mt-1">Tasks</span>
                </Link>
                <Link href="/health" className="flex flex-col items-center text-gray-500 hover:text-gray-300">
                    <Activity className="w-6 h-6" />
                    <span className="text-[10px] mt-1">Health</span>
                </Link>
                <Link href="/learning" className="flex flex-col items-center text-gray-500 hover:text-gray-300">
                    <GraduationCap className="w-6 h-6" />
                    <span className="text-[10px] mt-1">Learn</span>
                </Link>
                <Link href="/finance" className="flex flex-col items-center text-yellow-500">
                    <DollarSign className="w-6 h-6" />
                    <span className="text-[10px] mt-1">Finance</span>
                </Link>
            </nav>
        </div>
    );
}
