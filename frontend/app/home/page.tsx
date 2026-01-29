'use client';

export default function LoginPage() {

    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <form className="w-full max-w-sm rounded-2xl bg-white p-8 shadow">
                <h1 className="text-2xl font-extrabold text-gray-900">Login</h1>
                <label className="mt-6 block text-sm font-bold text-gray-800">Email</label>
                <input
                    className="mt-2 w-full text-center rounded-lg border p-2"
                />
                <label className="mt-4 block text-sm font-bold text-gray-800">Password</label>
                <input
                    className="mt-2 w-full rounded-lg border p-2"
                    type="password"
                />
                <button className="mt-6 w-full rounded-xl bg-blue-500 py-3 font-bold text-white hover:bg-blue-700">
                    Sign in
                </button>
            </form>
        </main>
    );
}
