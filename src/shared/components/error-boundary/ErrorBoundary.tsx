import { Component, ErrorInfo, ReactNode } from "react";
import "./ErrorBoundary.scss";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    if (error.name === 'ChunkLoadError' || error.message.includes('dynamically imported module') || error.message.includes('Failed to fetch dynamically imported module')) {
      // Auto reload on chunk load error
      window.location.reload();
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Упс! Что-то пошло не так.</h2>
          <p>Произошла ошибка при загрузке страницы.</p>
          <button onClick={() => window.location.reload()} className="error-boundary-btn">
            Перезагрузить страницу
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
