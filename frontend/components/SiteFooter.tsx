'use client';

import Link from 'next/link';

export default function SiteFooter() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
                <div className="grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <div className="mb-2 text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                            MedPredict
                        </div>
                        <p className="max-w-xs text-sm text-gray-400">
                            Turning Data Into Better Health Decisions
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-3 text-base font-bold text-white">Product</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/product/#catalog" className="transition hover:text-white">
                                    Catalog
                                </Link>
                            </li>
                            <li>
                                <Link href="/product/#pricing" className="transition hover:text-white">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/product/#FAQ" className="transition hover:text-white">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-3 text-base font-bold text-white">Company</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/about" className="transition hover:text-white">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/careers" className="transition hover:text-white">
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link href="/technology" className="transition hover:text-white">
                                    Technology
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-3 text-base font-bold text-white">Follow Us</h3>
                        <div className="flex flex-wrap gap-3 text-sm">
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition hover:text-blue-400">
                                Instagram
                            </a>
                            <a
                                href="https://www.linkedin.com/in/bao-nguyen-hoang/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition hover:text-blue-400">
                                LinkedIn
                            </a>
                            <a
                                href="https://github.com/BaoNHoang/MedPredict"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition hover:text-blue-400">
                                GitHub
                            </a>
                        </div>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-700 pt-5 text-center text-xs sm:text-sm text-gray-400">
                    <p>&copy; 2026 MedPredict. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}