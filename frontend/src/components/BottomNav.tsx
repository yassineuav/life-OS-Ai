'use client';

import { LayoutDashboard, CheckSquare, Activity, GraduationCap, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
    const pathname = usePathname();

    // Hide nav on login and register pages
    if (['/login', '/register'].includes(pathname)) return null;

    const navItems = [
        { href: '/', label: 'Home', icon: LayoutDashboard },
        { href: '/tasks', label: 'Tasks', icon: CheckSquare },
        { href: '/health', label: 'Health', icon: Activity },
        { href: '/learning', label: 'Learn', icon: GraduationCap },
        { href: '/finance', label: 'Finance', icon: DollarSign },
    ];

    return (
        <nav className="fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-800 flex justify-around py-2 pb-5 sm:py-4 z-50">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="text-[10px] mt-1">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
