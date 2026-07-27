export default function StatCard({ label, value }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
    </div>
  );
}
