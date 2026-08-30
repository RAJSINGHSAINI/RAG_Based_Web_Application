import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Home = () => {
  // The user comes from context, not from props passed down the tree.
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="card">
        <h1>Hello, {user?.fullName}</h1>
        <p className="muted">
          You are logged in with a JWT stored in an HTTP-only cookie. Refresh the
          page and you will stay logged in.
        </p>

        <dl className="detail-list">
          <div>
            <dt>Email</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt>Email status</dt>
            <dd>
              <span className={`badge ${user?.isVerified ? "badge-ok" : "badge-warn"}`}>
                {user?.isVerified ? "Verified" : "Not verified"}
              </span>
            </dd>
          </div>
        </dl>

        {!user?.isVerified && (
          <p className="muted">
            Your email is not verified yet. You can confirm it from your profile.
          </p>
        )}

        <Link to="/profile" className="btn btn-primary">
          Go to profile
        </Link>
      </div>
    </div>
  );
};

export default Home;
