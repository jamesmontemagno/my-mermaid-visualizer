export default function ToastContainer({ toasts }) {
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.kind}`}>
          <span className="toast-icon">
            {toast.kind === "success" ? "✓" : toast.kind === "error" ? "✗" : "ℹ"}
          </span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
