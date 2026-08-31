/**
 * One component for both error and success messages, so every page reports
 * outcomes the same way.
 */
const Alert = ({ type = "error", message }) => {
  if (!message) return null;

  const styles =
    type === "success"
      ? "mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
      : "mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300";

  return (
    <p className={styles} role={type === "error" ? "alert" : "status"}>
      {message}
    </p>
  );
};

export default Alert;
