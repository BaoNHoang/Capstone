'use client';

export default function SiteFooter() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="mx-auto max-w-7xl px-6 py-5">
                <div className="grid gap-8 md:grid-cols-4">
                    <div>
                        <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-1">
                            MedPredict
                        </div>
                        <p className="text-xs">Turning Data Into Better Health Decisions</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-white mb-4">Product</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="/product/#catalog" className="hover:text-white">
                                    Catalog
                                </a>
                            </li>
                            <li>
                                <a href="/product/#pricing" className="hover:text-white">
                                    Pricing
                                </a>
                            </li>
                            <li>
                                <a href="/product/#FAQ" className="hover:text-white">
                                    FAQ
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-white mb-4">Company</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="/about" className="hover:text-white">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="/careers" className="hover:text-white">
                                    Careers
                                </a>
                            </li>
                            <li>
                                <a href="/technology" className="hover:text-white">
                                    Technology
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-white mb-4">Follow Us</h3>
                        <div className="flex gap-4">
                            <a href="#"
                                target="_blank"
                                rel="noopener noreferrer" 
                                className="hover:text-blue-400">
                                Instagram
                            </a>
                            <a href="https://www.linkedin.com/in/bao-nguyen-hoang/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-400">
                                LinkedIn
                            </a>
                            <a
                                href="https://github.com/BaoNHoang/MedPredict://github.com/BaoNHoang/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-400">
                                GitHub
                            </a>
                        </div>
                    </div>
                </div>
                <div className="mt-5 border-t border-gray-700 pt-5 text-center text-sm">
                    <p>&copy; 2026 MedPredict. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}