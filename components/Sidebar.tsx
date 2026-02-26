'use client';

import Link from 'next/link';
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
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [user, setUser] = useState<any>(null);

    // Load theme and user from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        }

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

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
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <Menu className="w-6 h-6 text-white" />
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
                        <img
                            src="/assets/company_logo.jpeg"
                            alt="Logo"
                            className={`w-full h-full object-cover transition-all duration-300 ${theme === 'dark' ? 'invert contrast-125' : ''
                                }`}
                        />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold gradient-text">Inventory</h1>
                        <p className="text-xs text-gray-400">Management System</p>
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
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
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
                <div className="pt-6 border-t border-white/10 space-y-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 group"
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </span>
                        <div className="relative w-12 h-6 bg-white/10 rounded-full transition-all duration-300">
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
                    <div className="border-t border-white/10 pt-4 mt-2">
                        <Link href="/profile" className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-lg transition-colors mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                                <UserCircle className="w-6 h-6" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-white truncate">{user?.username || 'User'}</p>
                                <p className="text-xs text-gray-400 truncate">{user?.email || 'View Profile'}</p>
                            </div>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-2 py-2 text-red-400 hover:bg-white/5 rounded-lg transition-colors"
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
