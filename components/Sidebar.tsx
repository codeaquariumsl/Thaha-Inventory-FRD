'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    ShoppingBag,
    TrendingUp,
    Menu,
    X,
    Sun,
    Moon,
    Users,
    UserCircle,
    LogOut,
    Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Sales', href: '/sales', icon: ShoppingCart },
    { name: 'Purchases', href: '/purchases', icon: ShoppingBag },
    { name: 'Stock', href: '/stock', icon: TrendingUp },
    { name: 'Users', href: '/users', icon: Users },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState<any>(null);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass-card"
            >
                {isMobileMenuOpen ? (
                    <X className="w-6 h-6 text-theme-primary" />
                ) : (
                    <Menu className="w-6 h-6 text-theme-primary" />
                )}
            </button>

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 glass-card p-6 flex flex-col gap-8 z-40
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="h-12 flex items-center justify-center overflow-hidden rounded-lg bg-white/5">
                        <Image
                            src="/assets/company_logo.jpeg"
                            alt="Logo"
                            width={48}
                            height={48}
                            className={`w-full h-full object-cover transition-all duration-300 ${theme === 'dark' ? 'invert contrast-125' : ''
                                }`}
                        />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold gradient-text">Inventory</h1>
                        <p className="text-xs text-theme-secondary">Management System</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 flex flex-col gap-2">
                    {navigation.filter(item => {
                        if (item.name === 'Users') {
                            return user?.role?.toLowerCase() === 'admin';
                        }
                        return true;
                    }).map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
                  ${isActive
                                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                                        : 'text-theme-secondary hover:bg-theme-hover hover:text-theme-primary'
                                    }
                `}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="pt-6 border-t border-theme-border space-y-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-theme-surface hover:bg-theme-hover transition-all duration-300 group"
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        <span className="text-sm font-medium text-theme-secondary group-hover:text-theme-primary transition-colors">
                            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </span>
                        <div className="relative w-12 h-6 bg-theme-hover rounded-full transition-all duration-300">
                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center transition-transform duration-300 ${theme === 'light' ? 'translate-x-6' : 'translate-x-0'}`}>
                                {theme === 'dark' ? (
                                    <Moon className="w-3 h-3 text-white" />
                                ) : (
                                    <Sun className="w-3 h-3 text-white" />
                                )}
                            </div>
                        </div>
                    </button>

                    {/* User Info */}
                    <div className="border-t border-theme-border pt-4 mt-2">
                        <Link href="/profile" className="flex items-center gap-3 hover:bg-theme-hover p-2 rounded-lg transition-colors mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                                <UserCircle className="w-6 h-6" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-theme-primary truncate">{user?.username || 'User'}</p>
                                <p className="text-xs text-theme-secondary truncate">{user?.email || 'View Profile'}</p>
                            </div>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-2 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    );
}
