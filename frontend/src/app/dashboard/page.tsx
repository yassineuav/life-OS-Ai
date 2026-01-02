'use client';

import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, CheckSquare, Activity, GraduationCap, DollarSign, Menu, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface AIInsight {
    risk_level: string;
    risk_score: number;
    main_message: string;
    details: string[];
}

interface DashboardStats {
    taskCount: number;
    taskCompleted: number;
    habitCount: number;
    habitCompleted: number;
    healthScore: number;
    financeSpent: number;
}

export default function Dashboard() {
    const { user } = useAuth();
    const [insight, setInsight] = useState<AIInsight | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        taskCount: 0, taskCompleted: 0,
        habitCount: 0, habitCompleted: 0,
        healthScore: 0, financeSpent: 0
    });
    const [challengeHeights, setChallengeHeights] = useState<number[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                // Parallel fetching for performance
                const [insightRes, tasksRes, healthRes, financeRes] = await Promise.allSettled([
                    api.get('/predictions/daily-insight/'),
                    api.get('/tasks/'), // Assuming this returns list of tasks
                    api.get('/health/daily/'), // List of health logs
                    api.get('/finance/expenses/') // List of expenses
                ]);

                // Handle Insight
                if (insightRes.status === 'fulfilled') setInsight(insightRes.value.data);

                // Handle Tasks & Habits
                let tCount = 0, tComp = 0, hCount = 0, hComp = 0;
                if (tasksRes.status === 'fulfilled') {
                    const tasks = tasksRes.value.data || [];
                    tasks.forEach((t: any) => {
                        // Simplify: Assume frequency='DAILY' is a habit
                        if (t.frequency === 'DAILY') {
                            hCount++;
                            if (t.status === 'COMPLETED') hComp++;
                        } else {
                            tCount++;
                            if (t.status === 'COMPLETED') tComp++;
                        }
                    });
                }

                // Handle Health
                let hScore = 0; // Default
                if (healthRes.status === 'fulfilled') {
                    // Get today's log if exists
                    const today = new Date().toISOString().split('T')[0];
                    const todayLog = healthRes.value.data.find((l: any) => l.date === today);
                    if (todayLog) hScore = todayLog.energy_level;
                }

                // Handle Finance
                let spent = 0;
                if (financeRes.status === 'fulfilled') {
                    const today = new Date().toISOString().split('T')[0];
                    const expenses = financeRes.value.data || [];
                    spent = expenses
                        .filter((e: any) => e.date_incurred === today)
                        .reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0);
                }

                setStats({
                    taskCount: tCount, taskCompleted: tComp,
                    habitCount: hCount, habitCompleted: hComp,
                    healthScore: hScore, financeSpent: spent
                });

            } catch (error) {
                console.error("Dashboard fetch error", error);
            }
        };
        fetchData();
        // Generate random heights only on client side
        setChallengeHeights([...Array(7)].map(() => Math.random() * 100));
    }, [user]);

    // Calculate Percentages
    const habitPercent = stats.habitCount > 0 ? (stats.habitCompleted / stats.habitCount) * 100 : 0;
    const taskPercent = stats.taskCount > 0 ? (stats.taskCompleted / stats.taskCount) * 100 : 0;
    const totalPercent = Math.round((habitPercent + taskPercent) / (stats.habitCount > 0 && stats.taskCount > 0 ? 2 : 1)) || 0;


    return (
        <div className="min-h-screen bg-gray-950 text-white pb-20">
            {/* Header */}
            <header className="p-6 flex justify-between items-center bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        Life OS
                    </h1>
                    <p className="text-gray-400 text-sm">Welcome back, {user?.username || 'User'}</p>
                </div>
                <div className="bg-gray-800 p-2 rounded-full">
                    <Menu className="w-6 h-6 text-gray-300" />
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6 space-y-6">

                {/* AI Insight Card */}
                {insight && (
                    <div className={`rounded-xl p-4 border relative overflow-hidden ${insight.risk_level === 'HIGH' ? 'bg-red-900/20 border-red-800' :
                        insight.risk_level === 'MEDIUM' ? 'bg-yellow-900/20 border-yellow-800' :
                            'bg-purple-900/20 border-purple-800'
                        }`}>
                        <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full ${insight.risk_level === 'HIGH' ? 'bg-red-500/20 text-red-500' :
                                insight.risk_level === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500' :
                                    'bg-purple-500/20 text-purple-500'
                                }`}>
                                {insight.risk_level === 'HIGH' ? <AlertTriangle className="w-5 h-5" /> :
                                    insight.risk_level === 'MEDIUM' ? <Activity className="w-5 h-5" /> :
                                        <Sparkles className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className={`font-semibold ${insight.risk_level === 'HIGH' ? 'text-red-400' :
                                    insight.risk_level === 'MEDIUM' ? 'text-yellow-400' :
                                        'text-purple-400'
                                    }`}>AI Insight</h3>
                                <p className="text-sm font-medium text-gray-200 mt-1">{insight.main_message}</p>
                                <ul className="mt-2 space-y-1">
                                    {insight.details.map((detail, idx) => (
                                        <li key={idx} className="text-xs text-gray-400 flex items-center">
                                            <span className="w-1 h-1 bg-gray-600 rounded-full mr-2"></span>
                                            {detail}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Daily Progress Card */}
                <div className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                    <h2 className="text-lg font-semibold mb-4 text-gray-200">Daily Progress</h2>
                    <div className="flex items-center justify-between">
                        <div className="relative w-24 h-24">
                            {/* Circular Progress */}
                            <div className="w-24 h-24 rounded-full border-4 border-gray-700 flex items-center justify-center relative">
                                <svg className="absolute w-full h-full transform -rotate-90">
                                    <circle cx="50%" cy="50%" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-700" />
                                    <circle cx="50%" cy="50%" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-purple-500"
                                        strokeDasharray={2 * Math.PI * 44}
                                        strokeDashoffset={2 * Math.PI * 44 * (1 - totalPercent / 100)}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <span className="text-xl font-bold">{totalPercent}%</span>
                            </div>
                        </div>
                        <div className="space-y-2 flex-1 ml-6">
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>Habits</span>
                                <span>{stats.habitCompleted}/{stats.habitCount}</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${habitPercent}%` }}></div>
                            </div>
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>Tasks</span>
                                <span>{stats.taskCompleted}/{stats.taskCount}</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-pink-500 transition-all duration-500" style={{ width: `${taskPercent}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Health Card */}
                    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                        <div className="flex items-center space-x-2 mb-2 text-green-400">
                            <Activity className="w-5 h-5" />
                            <span className="font-semibold">Health</span>
                        </div>
                        <div className="text-2xl font-bold">{stats.healthScore}/10</div>
                        <div className="text-xs text-gray-500">Energy Level</div>
                    </div>

                    {/* Finance Card */}
                    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                        <div className="flex items-center space-x-2 mb-2 text-yellow-400">
                            <DollarSign className="w-5 h-5" />
                            <span className="font-semibold">Finance</span>
                        </div>
                        <div className="text-2xl font-bold">${stats.financeSpent}</div>
                        <div className="text-xs text-gray-500">Spent Today</div>
                    </div>
                </div>

                {/* 90-Day High Level View */}
                <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                    <h3 className="font-semibold mb-3">90-Day Challenge</h3>
                    <div className="flex justify-between items-end h-24 space-x-1">
                        {[...Array(7)].map((_, i) => (
                            <div key={i} className="w-full bg-gray-800 rounded-t-sm relative group">
                                <div
                                    className={`absolute bottom-0 w-full rounded-t-sm ${i === 6 ? 'bg-purple-500' : 'bg-gray-700'}`}
                                    style={{ height: `${challengeHeights[i] || 10}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

            </main>

            {/* Sticky Bottom Nav */}
            <nav className="fixed bottom-0 w-full bg-gray-900 border-t border-gray-800 flex justify-around py-4 pb-6 z-50">
                <Link href="/dashboard" className="flex flex-col items-center text-purple-500">
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
                <Link href="/finance" className="flex flex-col items-center text-gray-500 hover:text-gray-300">
                    <DollarSign className="w-6 h-6" />
                    <span className="text-[10px] mt-1">Finance</span>
                </Link>
            </nav>
        </div>
    );
}
