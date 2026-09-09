
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            setMessage("Email and password are required");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Login failed"
                );
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            router.push("/");

        } catch (error) {
            setMessage(
                error.message || "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">

            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">

                <h1 className="mb-2 text-3xl font-bold text-gray-900">
                    Login
                </h1>

                <p className="mb-6 text-gray-600">
                    Login to your AI Interview Prep Kit
                </p>

                <form onSubmit={handleLogin}>

                    <div className="mb-4">
                        <label className="mb-2 block font-medium">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="Enter your email"
                            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="mb-2 block font-medium">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Enter your password"
                            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                {message && (
                    <p className="mt-4 text-center text-sm text-red-600">
                        {message}
                    </p>
                )}

                <p className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <button
                        onClick={() => router.push("/register")}
                        className="font-medium text-blue-600 hover:underline"
                    >
                        Register
                    </button>
                </p>

            </div>

        </main>
    );
}

