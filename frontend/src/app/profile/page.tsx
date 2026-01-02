'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { User, Mail, FileText, Save, ArrowLeft, Camera, Shield, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        bio: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/profile/');
            setProfile(res.data);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setMessage({ type: 'error', text: 'Failed to load profile details.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await api.patch('/auth/profile/', profile);
            setProfile(res.data);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white font-sans">
            {/* Header */}
            <header className="px-6 py-8 flex items-center justify-between sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md border-b border-gray-900">
                <div className="flex items-center space-x-4">
                    <Link href="/" className="p-2 hover:bg-gray-800 rounded-full transition">
                        <ArrowLeft className="w-6 h-6 text-gray-400" />
                    </Link>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        User Profile
                    </h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-10 space-y-10">
                {/* Profile Header Card */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative bg-gray-900 rounded-3xl p-8 border border-gray-800 flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                                {profile.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-gray-800 border border-gray-700 rounded-full hover:bg-gray-700 transition text-indigo-400 shadow-xl">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-100 italic">@{profile.username}</h2>
                        <p className="text-gray-400 text-sm mt-1">{profile.email}</p>

                        <div className="mt-4 flex space-x-3">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20 flex items-center">
                                <Shield className="w-3 h-3 mr-1" /> Verified Member
                            </span>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleUpdate} className="space-y-6">
                    {message.text && (
                        <div className={`p-4 rounded-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            <span className="text-sm font-medium">{message.text}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">First Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={profile.first_name}
                                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                    placeholder="Enter first name"
                                    className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-3 pl-11 pr-4 text-gray-200 focus:outline-none focus:border-indigo-500 transition shadow-inner"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Last Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={profile.last_name}
                                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                                    placeholder="Enter last name"
                                    className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-3 pl-11 pr-4 text-gray-200 focus:outline-none focus:border-indigo-500 transition shadow-inner"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                                <Mail className="w-4 h-4" />
                            </div>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                placeholder="Enter email address"
                                className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-3 pl-11 pr-4 text-gray-200 focus:outline-none focus:border-indigo-500 transition shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Biography</label>
                        <div className="relative group">
                            <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                                <FileText className="w-4 h-4" />
                            </div>
                            <textarea
                                value={profile.bio}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                placeholder="Tell us about yourself..."
                                rows={4}
                                className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-3 pl-11 pr-4 text-gray-200 focus:outline-none focus:border-indigo-500 transition shadow-inner resize-none"
                            ></textarea>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </form>
            </main>
        </div>
    );
}
