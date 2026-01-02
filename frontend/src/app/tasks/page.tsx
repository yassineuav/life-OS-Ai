'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Trash2, CheckCircle, Circle, Repeat } from 'lucide-react';
import Link from 'next/link';
import { LayoutDashboard, CheckSquare, Activity, GraduationCap, DollarSign } from 'lucide-react';

interface Task {
    id: number;
    name: string;
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
    category: string;
    frequency: string;
    start_date: string;
}

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function TasksPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Form State
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState('CUSTOM');
    const [newTaskFrequency, setNewTaskFrequency] = useState('ONCE');

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks/');
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/tasks/', {
                name: newTaskName,
                category: newTaskCategory,
                frequency: newTaskFrequency,
                start_date: new Date().toISOString().split('T')[0],
                status: 'ACTIVE'
            });
            setIsModalOpen(false);
            setNewTaskName('');
            fetchTasks();
        } catch (err) {
            console.error(err);
        }
    };

    const toggleStatus = async (task: Task) => {
        const newStatus = task.status === 'COMPLETED' ? 'ACTIVE' : 'COMPLETED';
        // Optimistic update
        setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
        try {
            await api.patch(`/tasks/${task.id}/`, { status: newStatus });
        } catch (err) {
            console.error(err);
            fetchTasks(); // Revert on error
        }
    };

    const deleteTask = async (id: number) => {
        if (!confirm('Delete this task?')) return;
        try {
            await api.delete(`/tasks/${id}/`);
            setTasks(tasks.filter(t => t.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const activeTasks = tasks.filter(t => t.status !== 'COMPLETED');
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Tasks</h1>
                    <p className="text-gray-400 text-sm">{activeTasks.length} pending</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-lg transition"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </header>

            {/* Active List */}
            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Active</h2>
                {activeTasks.map(task => (
                    <div key={task.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between group">
                        <div className="flex items-center space-x-3">
                            <button onClick={() => toggleStatus(task)} className="text-gray-500 hover:text-purple-500 transition">
                                <Circle className="w-6 h-6" />
                            </button>
                            <div>
                                <h3 className="font-medium text-gray-200">{task.name}</h3>
                                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                    <span className="px-2 py-0.5 bg-gray-800 rounded-full">{task.category}</span>
                                    {task.frequency !== 'ONCE' && (
                                        <span className="flex items-center"><Repeat className="w-3 h-3 mr-1" /> {task.frequency}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => deleteTask(task.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </section>

            {/* Completed List */}
            {completedTasks.length > 0 && (
                <section className="mt-8 space-y-3">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Completed</h2>
                    {completedTasks.map(task => (
                        <div key={task.id} className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 flex items-center justify-between opacity-70">
                            <div className="flex items-center space-x-3">
                                <button onClick={() => toggleStatus(task)} className="text-green-500">
                                    <CheckCircle className="w-6 h-6" />
                                </button>
                                <span className="font-medium text-gray-400 line-through">{task.name}</span>
                            </div>
                            <button onClick={() => deleteTask(task.id)} className="text-gray-600 hover:text-red-500">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </section>
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 w-full max-w-md rounded-2xl p-6 border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">New Task</h2>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Name</label>
                                <input
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:border-purple-500 outline-none"
                                    value={newTaskName}
                                    onChange={e => setNewTaskName(e.target.value)}
                                    required
                                    placeholder="Gym, Read, etc."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Category</label>
                                    <select
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 outline-none"
                                        value={newTaskCategory}
                                        onChange={e => setNewTaskCategory(e.target.value)}
                                    >
                                        <option value="CUSTOM">Custom</option>
                                        <option value="LEARNING">Learning</option>
                                        <option value="GYM">Gym</option>
                                        <option value="SLEEP">Sleep</option>
                                        <option value="FINANCE">Finance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Frequency</label>
                                    <select
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 outline-none"
                                        value={newTaskFrequency}
                                        onChange={e => setNewTaskFrequency(e.target.value)}
                                    >
                                        <option value="ONCE">Once</option>
                                        <option value="DAILY">Daily</option>
                                        <option value="WEEKLY">Weekly</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-800 rounded-lg font-medium">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-purple-600 rounded-lg font-bold">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
