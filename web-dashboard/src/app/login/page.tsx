"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Loader2, Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (session) {
          router.replace("/");
        }
      } catch (e) {
        console.error("Error checking auth:", e);
      } finally {
        setAuthChecking(false);
      }
    };
    checkUser();
  }, [router, supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ text: error.message, type: "error" });
        return;
      }

      router.refresh();
      router.replace("/");
    } catch (error) {
      setMessage({ text: "An unexpected error occurred", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    // Optional: Redirect to signup or handle it
    setMessage({
      text: "Sign up is currently restricted to administrators.",
      type: "error",
    });
  };

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Visual & Branding */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 relative items-center justify-center overflow-hidden">
        {/* Abstract Background shapes */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/20 blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/20 blur-[100px]" />

        <div className="relative z-10 p-12 text-white max-w-xl">
          <div className="mb-8 relative h-16 w-16 overflow-hidden rounded-2xl bg-white shadow-xl flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="UrbanCycle Logo"
              fill
              className="object-contain p-1"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-6 leading-tight">
            Manage your city&apos;s waste efficiently with{" "}
            <span className="text-emerald-400">UrbanCycle</span>
          </h1>

          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            A comprehensive dashboard for monitoring reports, assigning tasks,
            and analyzing waste management data in real-time.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Real-time Analytics</h3>
                <p className="text-sm text-gray-400">
                  Monitor collection efficiency instantly
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Map Visualization</h3>
                <p className="text-sm text-gray-400">
                  Track issues geographically
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="relative h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center overflow-hidden">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-contain p-1"
              />
            </div>
          </div>

          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center pb-8 p-0">
              <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">
                Welcome back
              </CardTitle>
              <CardContent className="text-gray-500 mt-2 text-base">
                Sign in to your account to continue
              </CardContent>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="email"
                  >
                    Email address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      id="email"
                      type="email"
                      placeholder="admin@urbancycle.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn(
                        "flex h-12 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm",
                      )}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      className="text-sm font-medium text-gray-700"
                      htmlFor="password"
                    >
                      Password
                    </label>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn(
                        "flex h-12 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 pl-10 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm",
                      )}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {message && (
                  <div
                    className={cn(
                      "p-4 rounded-xl text-sm flex items-center gap-2",
                      message.type === "error"
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : "bg-green-50 text-green-600 border border-green-100",
                    )}
                  >
                    {message.type === "error" && (
                      <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                    )}
                    {message.type === "success" && (
                      <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                    )}
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "group relative inline-flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-gray-900 px-8 py-3 font-medium text-white transition-all duration-300 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 disabled:opacity-50 disabled:hover:bg-gray-900",
                    "shadow-lg shadow-gray-900/20 hover:shadow-emerald-600/30",
                  )}
                >
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-disabled:opacity-100">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </span>
                  <span className="flex items-center gap-2 transition-transform group-disabled:translate-y-[-150%] group-hover:translate-x-1">
                    {loading ? "Signing in..." : "Sign in"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </span>
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
