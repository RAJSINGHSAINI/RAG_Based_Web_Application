import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Home = () => {
  // The user comes from context, not from props passed down the tree.
  const { user } = useAuth();

  return (
    <div className="w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_20px_50px_rgba(2,6,23,0.7)] sm:p-7">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Hello, {user?.fullName}</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          You are logged in with a JWT stored in an HTTP-only cookie. Refresh the
          page and you will stay logged in.
        </p>

        <dl className="mt-6 space-y-5">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Email</dt>
            <dd className="mt-2 text-base text-slate-800 dark:text-slate-100">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Email status</dt>
            <dd className="mt-2">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${user?.isVerified ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"}`}>
                {user?.isVerified ? "Verified" : "Not verified"}
              </span>
            </dd>
          </div>
        </dl>

        {!user?.isVerified && (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            Your email is not verified yet. You can confirm it from your profile.
          </p>
        )}

        <Link to="/profile" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(79,70,229,0.3)] transition hover:translate-y-[-1px]">
          Go to profile
        </Link>
      </div>
    </div>
  );
};

export default Home;
