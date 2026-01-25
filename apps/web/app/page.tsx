import DashboardClient from "./dashboard-client";

export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Universal Booking Middleware</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Dashboard pre rezervácie</h1>
        <p className="max-w-2xl text-base text-slate-500">
          Spravujte dostupnosť, vytvárajte nové rezervácie a sledujte stav integrácií.
        </p>
      </header>
      <DashboardClient />
    </main>
  );
}
