/**
 * One component for both error and success messages, so every page reports
 * outcomes the same way.
 */
const Alert = ({ type = "error", message }) => {
  if (!message) return null;

  return (
    <p className={`alert alert-${type}`} role={type === "error" ? "alert" : "status"}>
      {message}
    </p>
  );
};

export default Alert;
