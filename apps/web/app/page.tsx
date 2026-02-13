"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Apple, Fingerprint, Github, Globe, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const services = [
  { id: "haircut", name: "Haircut", duration: "45 min", price: "$45" },
  { id: "manicure", name: "Manicure", duration: "50 min", price: "$38" },
  { id: "consultation", name: "Consultation", duration: "30 min", price: "$25" }
];

const slots = ["09:00", "09:45", "10:30", "11:15", "12:00", "13:30", "14:15"];

export default function Page() {
  const { isAuthenticated, loading, login, loginWithOAuth, logout, user, setupBiometric } = useAuth();
  const [email, setEmail] = useState("demo@booking.local");
  const [password, setPassword] = useState("DemoPass123!");
  const [twoFaCode, setTwoFaCode] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [biometricState, setBiometricState] = useState<string | null>(null);
  const [pushState, setPushState] = useState<string | null>(null);

  const selectedService = useMemo(
    () => services.find((item) => item.id === serviceId) ?? null,
    [serviceId]
  );

  useEffect(() => {
    const onInstalled = () => {
      console.log("App installed");
    };

    window.addEventListener("appinstalled", onInstalled);

    if ("launchQueue" in window) {
      const queue = (window as Window & {
        launchQueue?: {
          setConsumer: (consumer: (launchParams: { files?: FileSystemFileHandle[] }) => void) => void;
        };
      }).launchQueue;

      queue?.setConsumer((launchParams) => {
        const files = launchParams.files ?? [];
        if (files.length) {
          console.log("Launched with files", files.length);
        }
      });
    }

    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  const requestPushPermission = async () => {
    if (!("Notification" in window)) {
      setPushState("Notifications are not supported in this browser.");
      return;
    }

    const permission = await Notification.requestPermission();
    setPushState(`Push permission: ${permission}`);
  };

  if (loading) {
    return <main className="p-10">Loading auth...</main>;
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-100 p-6 dark:bg-black">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-center">
            <Image src="/icon-512.svg" alt="Booking app icon" width={72} height={72} priority sizes="72px" />
          </div>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Production auth flow with MFA and social login</p>

          <div className="mt-5 space-y-3">
            <input
              className="h-12 w-full rounded-xl bg-slate-100 px-4 outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
            />
            <input
              className="h-12 w-full rounded-xl bg-slate-100 px-4 outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
            />
            <input
              className="h-12 w-full rounded-xl bg-slate-100 px-4 outline-none focus:ring-2 focus:ring-blue-500"
              value={twoFaCode}
              onChange={(event) => setTwoFaCode(event.target.value)}
              placeholder="2FA code (optional)"
            />
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            Remember me
          </label>

          <button
            className="mt-4 h-12 w-full rounded-xl bg-blue-500 font-semibold text-white active:scale-95 active:opacity-70"
            onClick={async () => {
              try {
                setError(null);
                await login({ email, password, rememberMe, twoFaCode: twoFaCode || undefined });
              } catch {
                setError("Login failed. Check credentials or 2FA code.");
              }
            }}
          >
            <span className="inline-flex items-center gap-2">
              <Lock size={16} /> Login
            </span>
          </button>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              onClick={() => void loginWithOAuth("google")}
              className="h-12 min-h-[44px] rounded-xl bg-slate-100 active:scale-95 active:opacity-70"
            >
              <Globe className="mx-auto" size={16} />
            </button>
            <button
              onClick={() => void loginWithOAuth("github")}
              className="h-12 min-h-[44px] rounded-xl bg-slate-100 active:scale-95 active:opacity-70"
            >
              <Github className="mx-auto" size={16} />
            </button>
            <button
              onClick={() => void loginWithOAuth("apple")}
              className="h-12 min-h-[44px] rounded-xl bg-slate-100 active:scale-95 active:opacity-70"
            >
              <Apple className="mx-auto" size={16} />
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F2F7] p-4 dark:bg-black dark:text-white">
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-[#1C1C1E]">
          <p className="text-sm text-slate-500">Authenticated as</p>
          <p className="font-semibold">{user?.email}</p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={async () => {
                const result = await setupBiometric();
                setBiometricState(`Biometric ready (${result.fallback} fallback)`);
              }}
              className="h-12 min-h-[44px] rounded-xl bg-emerald-500 px-4 text-white active:scale-95 active:opacity-70"
            >
              <span className="inline-flex items-center gap-2">
                <Fingerprint size={16} /> Setup Biometric
              </span>
            </button>
            <button
              onClick={() => void logout()}
              className="h-12 min-h-[44px] rounded-xl bg-red-500 px-4 text-white active:scale-95 active:opacity-70"
            >
              Logout
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => void requestPushPermission()}
              className="h-12 min-h-[44px] rounded-xl bg-slate-900 px-4 text-white active:scale-95 active:opacity-70"
            >
              Enable push
            </button>
          </div>
          {biometricState && <p className="mt-2 text-xs text-slate-500">{biometricState}</p>}
          {pushState && <p className="mt-1 text-xs text-slate-500">{pushState}</p>}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-[#1C1C1E]">
          <h2 className="text-lg font-semibold">Book service</h2>
          <div className="mt-3 space-y-2">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setServiceId(service.id)}
                className={`flex w-full items-center justify-between rounded-xl p-3 text-left active:scale-95 active:opacity-70 ${
                  serviceId === service.id ? "bg-blue-500 text-white" : "bg-slate-100"
                }`}
              >
                <span>{service.name}</span>
                <span>{service.price}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {slots.map((time) => (
              <button
                key={time}
                onClick={() => setSlot(time)}
                className={`rounded-full px-3 py-2 text-sm active:scale-95 active:opacity-70 ${
                  slot === time ? "bg-blue-500 text-white" : "bg-slate-100"
                }`}
              >
                {time}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-slate-100 p-3 text-sm">
            <p className="font-medium">Session security</p>
            <p className="mt-1 inline-flex items-center gap-1 text-slate-600">
              <ShieldCheck size={14} /> JWT + refresh + CSRF + rate limiting active
            </p>
          </div>

          <button
            disabled={!selectedService || !slot}
            className="mt-4 h-12 w-full rounded-xl bg-blue-500 text-white disabled:opacity-40"
          >
            Confirm {selectedService?.name ?? "booking"} at {slot ?? "--:--"}
          </button>
        </div>
      </div>
    </main>
  );
}
