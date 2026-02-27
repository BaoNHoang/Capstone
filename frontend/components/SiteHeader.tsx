'use client';

import Link from 'next/link';

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
    return (
        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/30">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Link
                    href="/"
                    className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
                    MedPredict
                </Link>
                <nav className="hidden items-center gap-25 md:flex">
                    <Link href="/about" className="text-1xl font-semibold text-white/80 hover:text-white">
                        About
                    </Link>
                    <Link href="/product" className="text-1xl font-semibold text-white/80 hover:text-white">
                        Product
                    </Link>
                    <Link href="/technology" className="text-1xl font-semibold text-white/80 hover:text-white">
                        Technology
                    </Link>
                    <Link href="/careers" className="text-1xl font-semibold text-white/80 hover:text-white">
                        Careers
                    </Link>
                </nav>
                <div className="flex items-center gap-3">
                    {authed ? (
                        <>
                            <button
                                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15"
                                onClick={onLogoutClick}
                                type="button">
                                Log out
                            </button>
                        </>
                    ) : (
                        <button
                            className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15"
                            onClick={onLoginClick}
                            type="button">
                            Log in
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}