'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/register/', {
                username,
                email,
                password,
                password_confirm: confirmPassword
            });
            alert('Registration successful! Please log in.');
            router.push('/login');
        } catch (err: any) {
            console.error(err);
            if (err.response?.data) {
                const data = err.response.data;
                // Handle DRF error format: {"field": ["Error 1"], "non_field_errors": ["Error 2"]}
                let msg = '';
                if (typeof data === 'object') {
                    Object.keys(data).forEach(key => {
                        const errors = data[key]; // Array of strings
                        if (Array.isArray(errors)) {
                            msg += `${key}: ${errors.join(' ')}\n`;
                        } else {
                            msg += `${key}: ${errors}\n`;
                        }
                    });
                } else {
                    msg = 'Registration failed. Please check your details.';
                }
                setError(msg);
            } else {
                setError('Registration failed. Server may be down.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-6 text-purple-500">Create Account</h2>
                {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded font-bold transition duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Register'}
                    </button>
                    <p className="text-center text-sm text-gray-400 mt-4">
                        Already have an account? <Link href="/login" className="text-purple-400 hover:text-purple-300">Log In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
