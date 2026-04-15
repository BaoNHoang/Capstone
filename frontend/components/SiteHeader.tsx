'use client';

import Link from 'next/link';
import { useState } from 'react';

type SiteHeaderProps = {
    authed?: boolean;
    displayName?: string;
    onLoginClick?: () => void;
    onLogoutClick?: () => void;
};

export default function SiteHeader({
    authed = false,
    onLoginClick,
    onLogoutClick,
}: SiteHeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/30 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
                <Link
                    href="/"
                    className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                    MedPredict
                </Link>
                <nav className="hidden md:flex items-center gap-8 lg:gap-20">
                    <Link href="/dashboard" className="text-sm lg:text-base font-semibold text-white/80 hover:text-white transition">
                        Dashboard
                    </Link>
                    <Link href="/about" className="text-sm lg:text-base font-semibold text-white/80 hover:text-white transition">
                        About
                    </Link>
                    <Link href="/product" className="text-sm lg:text-base font-semibold text-white/80 hover:text-white transition">
                        Product
                    </Link>
                    <Link href="/technology" className="text-sm lg:text-base font-semibold text-white/80 hover:text-white transition">
                        Technology
                    </Link>
                    <Link href="/careers" className="text-sm lg:text-base font-semibold text-white/80 hover:text-white transition">
                        Careers
                    </Link>
                </nav>
                <div className="hidden md:flex items-center gap-3">
                    {authed ? (
                        <button
                            className="cursor-pointer rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15 transition"
                            onClick={onLogoutClick}
                            type="button">
                            Logout
                        </button>
                    ) : (
                        <button
                            className="cursor-pointer rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15 transition"
                            onClick={onLoginClick}
                            type="button">
                            Login
                        </button>
                    )}
                </div>
                <button
                    type="button"
                    aria-label="Toggle menu"
                    onClick={() => setMenuOpen((toggle) => !toggle)}
                    className="md:hidden rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white hover:bg-white/15 transition">
                    <span className="block text-lg font-bold leading-none">
                        {menuOpen ? 'X' : '='}
                    </span>
                </button>
            </div>
            {menuOpen && (
                <div className="border-t border-white/10 bg-black/50 backdrop-blur-md md:hidden">
                    <nav className="mx-auto flex max-w-7xl flex-col px-4 sm:px-6 py-4">
                        <Link
                            href="/dashboard"
                            className="py-3 text-sm font-semibold text-white/80 hover:text-white"
                            onClick={() => setMenuOpen(false)}>
                            Dashboard
                        </Link>
                        <Link
                            href="/about"
                            className="py-3 text-sm font-semibold text-white/80 hover:text-white"
                            onClick={() => setMenuOpen(false)}>
                            About
                        </Link>
                        <Link
                            href="/product"
                            className="py-3 text-sm font-semibold text-white/80 hover:text-white"
                            onClick={() => setMenuOpen(false)}>
                            Product
                        </Link>
                        <Link
                            href="/technology"
                            className="py-3 text-sm font-semibold text-white/80 hover:text-white"
                            onClick={() => setMenuOpen(false)}>
                            Technology
                        </Link>
                        <Link
                            href="/careers"
                            className="py-3 text-sm font-semibold text-white/80 hover:text-white"
                            onClick={() => setMenuOpen(false)}>
                            Careers
                        </Link>
                        <div className="pt-3">
                            {authed ? (
                                <button
                                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/15 transition"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onLogoutClick?.();
                                    }}
                                    type="button">
                                    Logout
                                </button>
                            ) : (
                                <button
                                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/15 transition"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onLoginClick?.();
                                    }}
                                    type="button">
                                    Login
                                </button>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}