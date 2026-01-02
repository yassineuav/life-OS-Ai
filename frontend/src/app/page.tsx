'use client';

import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, CheckSquare, Activity, GraduationCap, DollarSign, Menu, Sparkles, AlertTriangle, ShieldCheck, User, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

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
  sleepHours: number;
  financeSpent: number;
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    taskCount: 0, taskCompleted: 0,
    habitCount: 0, habitCompleted: 0,
    healthScore: 0, sleepHours: 0, financeSpent: 0
  });
  const [challengeHeights, setChallengeHeights] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { logout } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [insightRes, tasksRes, healthRes, financeRes] = await Promise.allSettled([
          api.get('/predictions/daily-insight/'),
          api.get('/tasks/'),
          api.get('/health/daily/'),
          api.get('/finance/expenses/')
        ]);

        // Handle Insight
        if (insightRes.status === 'fulfilled') setInsight(insightRes.value.data);

        // Handle Tasks & Habits
        let tCount = 0, tComp = 0, hCount = 0, hComp = 0;
        if (tasksRes.status === 'fulfilled') {
          const tasks = tasksRes.value.data || [];
          console.log("Fetched Tasks for Dashboard:", tasks.length);
          tasks.forEach((t: any) => {
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
        let hScore = 0;
        let sHours = 0;
        if (healthRes.status === 'fulfilled') {
          const logs = healthRes.value.data || [];
          const today = new Date().toISOString().split('T')[0];
          const todayLog = logs.find((l: any) => l.date === today);
          if (todayLog) {
            hScore = todayLog.energy_level;
            sHours = todayLog.sleep_hours;
          }

          // Generate last 7 days dates for the chart
          const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
          });

          const heights = last7Days.map(date => {
            const log = logs.find((l: any) => l.date === date);
            if (!log) return 5;
            const sleepScore = Math.min(log.sleep_hours / 8, 1) * 40;
            const energyScore = (log.energy_level / 10) * 40;
            const gymScore = log.gym_session_completed ? 20 : 0;
            return sleepScore + energyScore + gymScore;
          });
          setChallengeHeights(heights);
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
          healthScore: hScore, sleepHours: sHours, financeSpent: spent
        });

      } catch (error) {
        console.error("Dashboard fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Calculations
  // Habits: Only DAILY
  const habitPercent = stats.habitCount > 0 ? (stats.habitCompleted / stats.habitCount) * 100 : 0;
  // Tasks: Show ALL tasks to ensure the card is never empty if data exists
  const allTaskCount = stats.taskCount + stats.habitCount;
  const allTaskCompleted = stats.taskCompleted + stats.habitCompleted;
  const taskPercent = allTaskCount > 0 ? (allTaskCompleted / allTaskCount) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* Header */}
      <header className="px-6 py-8 flex justify-between items-start sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Life OS
          </h1>
          <p className="text-gray-400 text-sm mt-1">Focus. Build. Achieve.</p>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20 active:scale-95 transition"
          >
            {user?.username?.charAt(0).toUpperCase() || 'X'}
          </button>

          {isSettingsOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsSettingsOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl py-2 z-20 animate-in fade-in zoom-in duration-200 origin-top-right">
                <div className="px-4 py-2 border-b border-gray-800 mb-2">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Account</p>
                  <p className="text-sm font-medium text-gray-200 truncate">{user?.username || 'Guest'}</p>
                </div>

                <Link
                  href="/profile"
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 transition"
                  onClick={() => setIsSettingsOpen(false)}
                >
                  <User className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm">Profile</span>
                </Link>

                <button
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 transition"
                  onClick={() => setIsSettingsOpen(false)}
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Settings</span>
                </button>

                <div className="my-1 border-t border-gray-800"></div>

                <button
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    logout();
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-bold">Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 space-y-6">

        {/* AI Insight Hero */}
        {insight && (
          <div className="relative overflow-hidden rounded-3xl p-6 bg-gray-900 border border-gray-800 shadow-2xl">
            <div className={`absolute top-0 left-0 w-1 h-full ${insight.risk_level === 'HIGH' ? 'bg-red-500' :
              insight.risk_level === 'MEDIUM' ? 'bg-yellow-500' : 'bg-emerald-500'
              }`}></div>

            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold tracking-wider text-purple-400 uppercase">Daily Insight</span>
                </div>
                <h2 className="text-xl font-bold text-gray-100 leading-tight">{insight.main_message}</h2>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${insight.risk_level === 'HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                insight.risk_level === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                {insight.risk_level} RISK
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2">
              {insight.details.map((detail, idx) => (
                <div key={idx} className="flex items-center text-sm text-gray-400 bg-gray-800/50 p-2 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-3"></div>
                  {detail}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 1. Daily Drivers Grid */}
        <section>
          <h3 className="text-lg font-bold text-gray-300 mb-3 px-1">Daily Drivers</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Habits Card */}
            <Link href="/tasks" className="block group">
              <div className="bg-gray-900 rounded-3xl p-5 border border-gray-800 relative overflow-hidden h-full hover:border-indigo-500/50 transition duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                  <CheckSquare className="w-16 h-16 text-indigo-400" />
                </div>
                <div className="relative z-10">
                  <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Habits</h4>
                  <div className="flex items-end space-x-1 mb-2">
                    <span className="text-3xl font-bold text-indigo-400">{stats.habitCompleted}</span>
                    <span className="text-sm text-gray-500 mb-1">/{stats.habitCount}</span>
                  </div>
                  {/* Progress Ring or Bar */}
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${habitPercent}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{Math.round(habitPercent)}% Completed</p>
                </div>
              </div>
            </Link>

            {/* Tasks Card */}
            <Link href="/tasks" className="block group">
              <div className="bg-gray-900 rounded-3xl p-5 border border-gray-800 relative overflow-hidden h-full hover:border-pink-500/50 transition duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                  <LayoutDashboard className="w-16 h-16 text-pink-400" />
                </div>
                <div className="relative z-10">
                  <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Tasks</h4>
                  <div className="flex items-end space-x-1 mb-2">
                    <span className="text-3xl font-bold text-pink-400">{allTaskCompleted}</span>
                    <span className="text-sm text-gray-500 mb-1">/{allTaskCount}</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500" style={{ width: `${taskPercent}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{allTaskCount - allTaskCompleted} Remaining</p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* 2. Wellness & Wealth Grid */}
        <section>
          <h3 className="text-lg font-bold text-gray-300 mb-3 px-1">Wellness & Wealth</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Health Card */}
            <Link href="/health" className="block group">
              <div className="bg-gradient-to-br from-emerald-900/40 to-gray-900 rounded-3xl p-5 border border-gray-800 h-full hover:border-emerald-500/50 transition">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-200">Health</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Energy</span>
                      <span>{stats.healthScore}/10</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.healthScore * 10}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Sleep</span>
                      <span>{stats.sleepHours}h</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(stats.sleepHours / 10) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Finance Card */}
            <Link href="/finance" className="block group">
              <div className="bg-gradient-to-br from-amber-900/40 to-gray-900 rounded-3xl p-5 border border-gray-800 h-full hover:border-amber-500/50 transition">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-200">Finance</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Spent Today</p>
                  <p className="text-2xl font-bold text-white mt-1">${stats.financeSpent}</p>
                  <p className="text-[10px] text-gray-500 mt-2 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span> Daily Tracked
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>


        {/* 3. 90-Day Challenge */}
        <section>
          <h3 className="text-lg font-bold text-gray-300 mb-3 px-1">90-Day Challenge</h3>
          <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800 relative overflow-hidden">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-3xl font-bold text-white">Day {challengeHeights.filter(h => h > 10).length}</p>
                <p className="text-sm text-gray-500">Tracked Days</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">Consistency</p>
                <div className="text-emerald-400 font-bold text-lg">
                  {Math.round((challengeHeights.filter(h => h > 10).length / 7) * 100)}%
                </div>
              </div>
            </div>

            {/* Visualizer */}
            <div className="flex justify-between items-end h-28 space-x-1.5">
              {[...Array(7)].map((_, i) => {
                const height = challengeHeights[i] || 5;
                const isToday = i === 6;
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end group cursor-pointer">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${height > 10
                        ? (isToday ? 'bg-gradient-to-t from-purple-600 to-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.5)]' : 'bg-indigo-900/50 group-hover:bg-indigo-800')
                        : 'bg-gray-800/50'
                        }`}
                      style={{ height: `${height}%` }}
                    ></div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-3 text-[10px] font-medium text-gray-500 uppercase tracking-widest">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span className="text-indigo-400">Sun</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
