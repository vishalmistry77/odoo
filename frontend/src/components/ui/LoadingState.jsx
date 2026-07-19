const LoadingState = ({ label = 'Loading...' }) => (
  <div className="app-state app-state-loading">
    <div className="loading-spinner" aria-hidden="true" />
    <span>{label}</span>
  </div>
);

export default LoadingState;
