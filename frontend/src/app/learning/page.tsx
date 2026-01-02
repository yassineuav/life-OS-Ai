'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { BookOpen, Plus, LayoutDashboard, CheckSquare, Activity, GraduationCap, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';

interface Course {
    id: number;
    name: string;
    description: string;
    total_hours: number;
    hours_completed: number;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export default function LearningPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isAppOpen, setIsAddOpen] = useState(false);
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

    // Form States
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [totalHours, setTotalHours] = useState('');

    // Log Form States
    const [logHours, setLogHours] = useState('');
    const [logNotes, setLogNotes] = useState('');

    const fetchCourses = async () => {
        try {
            const res = await api.get('/learning/courses/');
            setCourses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/learning/courses/', {
                name,
                description: desc,
                total_hours: parseFloat(totalHours),
                hours_completed: 0,
                status: 'NOT_STARTED'
            });
            setIsAddOpen(false);
            setName('');
            setDesc('');
            setTotalHours('');
            fetchCourses();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteCourse = async (id: number) => {
        if (!confirm('Are you sure you want to delete this course?')) return;
        try {
            await api.delete(`/learning/courses/${id}/`);
            fetchCourses();
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogTime = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourseId) return;
        try {
            await api.post('/learning/logs/', {
                course: selectedCourseId,
                hours_spent: parseFloat(logHours),
                notes: logNotes,
                date: new Date().toISOString().split('T')[0]
            });
            setIsLogOpen(false);
            setLogHours('');
            setLogNotes('');
            fetchCourses(); // Refresh to see updated progress
        } catch (err) {
            console.error(err);
        }
    };

    const openLogModal = (id: number) => {
        setSelectedCourseId(id);
        setIsLogOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6 pb-24">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">Learning Path</h1>
                    <p className="text-gray-400 text-sm">{courses.length} Active Courses</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 p-2 rounded-full transition shadow-lg"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </header>

            {/* Courses List */}
            <div className="space-y-4">
                {courses.map(course => {
                    const progress = (course.hours_completed / course.total_hours) * 100;
                    return (
                        <div key={course.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-200">{course.name}</h3>
                                    <p className="text-xs text-gray-500">{course.description}</p>
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded bg-gray-800 border border-gray-700 ${course.status === 'COMPLETED' ? 'text-green-400' : 'text-indigo-400'
                                    }`}>
                                    {course.status.replace('_', ' ')}
                                </span>
                            </div>

                            {/* Digits */}
                            <div className="flex items-center text-xs text-gray-400 mb-3 space-x-4">
                                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {course.hours_completed}h / {course.total_hours}h</span>
                                <span>{Math.round(progress)}% Complete</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-4">
                                <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between items-center mt-2">
                                <button
                                    onClick={() => openLogModal(course.id)}
                                    className="text-xs bg-indigo-900/50 hover:bg-indigo-900 text-indigo-300 py-1 px-3 rounded transition"
                                >
                                    + Log Time
                                </button>
                                <button
                                    onClick={() => handleDeleteCourse(course.id)}
                                    className="text-xs text-red-900 hover:text-red-500 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
                {courses.length === 0 && <p className="text-gray-600 text-center py-10">No courses started. Add one!</p>}
            </div>

            {/* Add Modal */}
            {isAppOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 w-full max-w-md rounded-2xl p-6 border border-gray-700 animate-slide-up">
                        <h2 className="text-xl font-bold mb-4">Start New Course</h2>
                        <form onSubmit={handleCreateCourse} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Course Name</label>
                                <input
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 outline-none focus:border-indigo-500"
                                    value={name} onChange={e => setName(e.target.value)} required
                                    placeholder="Python, Design, etc."
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Description</label>
                                <input
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 outline-none focus:border-indigo-500"
                                    value={desc} onChange={e => setDesc(e.target.value)}
                                    placeholder="Short goal..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Total Hours Goal</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 outline-none focus:border-indigo-500"
                                    value={totalHours} onChange={e => setTotalHours(e.target.value)} required
                                    placeholder="10, 20, 100..."
                                />
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-3 bg-gray-800 rounded-lg font-medium">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-indigo-600 rounded-lg font-bold">Start</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Log Modal */}
            {isLogOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 w-full max-w-md rounded-2xl p-6 border border-gray-700 animate-slide-up">
                        <h2 className="text-xl font-bold mb-4">Log Learning Time</h2>
                        <form onSubmit={handleLogTime} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Hours Spent</label>
                                <input
                                    type="number" step="0.5"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 outline-none focus:border-indigo-500"
                                    value={logHours} onChange={e => setLogHours(e.target.value)} required
                                    placeholder="e.g. 1.5"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Notes (Optional)</label>
                                <textarea
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 outline-none focus:border-indigo-500"
                                    value={logNotes} onChange={e => setLogNotes(e.target.value)}
                                    placeholder="What did you learn today?"
                                />
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button type="button" onClick={() => setIsLogOpen(false)} className="flex-1 py-3 bg-gray-800 rounded-lg font-medium">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-indigo-600 rounded-lg font-bold">Save Log</button>
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
                <Link href="/learning" className="flex flex-col items-center text-indigo-500">
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
