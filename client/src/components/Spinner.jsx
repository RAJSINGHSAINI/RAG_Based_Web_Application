/** Full-page placeholder shown while the session is being checked. */
const Spinner = ({ label = "Loading…" }) => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3" role="status" aria-live="polite">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-500 dark:border-slate-700 dark:border-t-indigo-400" aria-hidden="true" />
    <p className="text-sm text-slate-600 dark:text-slate-300">{label}</p>
  </div>
);

export default Spinner;
