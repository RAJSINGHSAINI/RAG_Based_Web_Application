/** Full-page placeholder shown while the session is being checked. */
const Spinner = ({ label = "Loading…" }) => (
  <div className="page-center" role="status" aria-live="polite">
    <div className="spinner" aria-hidden="true" />
    <p className="muted">{label}</p>
  </div>
);

export default Spinner;
