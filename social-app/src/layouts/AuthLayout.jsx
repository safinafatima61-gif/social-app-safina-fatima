import Logo from '../components/ui/Logo';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function AuthLayout({ children, title = 'Welcome back' }) {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle className="bg-white/80 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/80 dark:ring-slate-700" />
      </div>

      <aside className="relative hidden flex-col justify-center bg-brand-600 px-12 py-16 text-white lg:flex xl:px-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(15,23,42,0.18),transparent_40%)]" />
        <div className="relative max-w-lg">
          <Logo light to="/login" className="mb-10" />
          <h1 className="text-4xl font-extrabold leading-tight xl:text-5xl">
            Share moments. Spark conversations. Stay connected.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-blue-100">
            A modern space to post updates, share photos, and engage with the people you care about.
          </p>
        </div>
      </aside>

      <section className="flex flex-col justify-center bg-white px-4 py-10 dark:bg-slate-950 sm:px-8">
        <div className="mb-8 flex justify-center lg:hidden">
          <Logo to="/login" />
        </div>
        <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-50">{title}</h2>
          {children}
        </div>
      </section>
    </div>
  );
}
