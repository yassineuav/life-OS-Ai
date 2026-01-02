'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Activity, Moon, Zap, Dumbbell, LayoutDashboard, CheckSquare, GraduationCap, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Link from 'next/link';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HealthPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Form
    const [sleep, setSleep] = useState(7);
    const [energy, setEnergy] = useState(5);
    const [gym, setGym] = useState(false);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/health/daily/');
            setLogs(res.data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const today = new Date().toISOString().split('T')[0];
            await api.post('/health/daily/', {
                date: today,
                sleep_hours: sleep,
                energy_level: energy,
                gym_session_completed: gym
            });
            fetchLogs();
            alert('Log saved!');
        } catch (err) {
            console.error(err);
            alert('Error or log already exists for today.');
        }
    };

    // Chart Data Preparation
    const last7Days = logs.slice(-7).map(l => ({
        date: l.date.slice(5), // mm-dd
        sleep: l.sleep_hours,
        energy: l.energy_level
    }));

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
            <header className="mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-teal-600 bg-clip-text text-transparent">Health Tracker</h1>
            </header>

            {/* Input Form */}
            <section className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center"><Activity className="w-5 h-5 mr-2 text-green-500" /> Today's Log</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="flex items-center text-sm text-gray-400 mb-2">
                            <Moon className="w-4 h-4 mr-2" /> Sleep Hours ({sleep}h)
                        </label>
                        <input
                            type="range" min="0" max="12" step="0.5"
                            value={sleep} onChange={e => setSleep(parseFloat(e.target.value))}
                            className="w-full accent-green-500"
                        />
                    </div>
                    <div>
                        <label className="flex items-center text-sm text-gray-400 mb-2">
                            <Zap className="w-4 h-4 mr-2" /> Energy Level ({energy}/10)
                        </label>
                        <input
                            type="range" min="1" max="10"
                            value={energy} onChange={e => setEnergy(parseInt(e.target.value))}
                            className="w-full accent-yellow-500"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="flex items-center text-sm text-gray-400">
                            <Dumbbell className="w-4 h-4 mr-2" /> Gym Session?
                        </label>
                        <button
                            type="button"
                            onClick={() => setGym(!gym)}
                            className={`px-4 py-2 rounded-lg font-bold transition ${gym ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-500'}`}
                        >
                            {gym ? 'YES' : 'NO'}
                        </button>
                    </div>
                    <button type="submit" className="w-full bg-gray-800 hover:bg-gray-700 py-3 rounded-xl font-bold border border-gray-700">
                        Save Entry
                    </button>
                </form>
            </section>

            {/* Charts */}
            <section className="space-y-6">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                    <h3 className="text-sm font-semibold text-gray-400 mb-4">Sleep Trend (Last 7 Days)</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={last7Days}>
                                <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
                                <YAxis stroke="#6b7280" fontSize={10} />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                <Bar dataKey="sleep" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                    <h3 className="text-sm font-semibold text-gray-400 mb-4">Energy Levels</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={last7Days}>
                                <defs>
                                    <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
                                <YAxis stroke="#6b7280" fontSize={10} />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                <Area type="monotone" dataKey="energy" stroke="#eab308" fillOpacity={1} fill="url(#colorEnergy)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

        </div>
    );
}
