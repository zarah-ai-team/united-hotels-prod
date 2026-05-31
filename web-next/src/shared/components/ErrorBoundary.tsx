import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  label?: string;
}

interface State {
  error: Error | null;
}

// Class boundary catches errors thrown during render in any descendant. We use
// it to wrap the whole RouterProvider in App.tsx as a last line of defence.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", this.props.label, error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return <ErrorScreen error={this.state.error} onRetry={this.reset} />;
  }
}

// Route-level error element — react-router calls this when a loader/action
// throws or a component inside the route renders an uncaught error. Without
// this, react-router falls back to its built-in "Hey developer 👋" screen.
export function RouteErrorBoundary() {
  const error = useRouteError();
  const normalised: Error =
    error instanceof Error
      ? error
      : isRouteErrorResponse(error)
      ? Object.assign(new Error(`${error.status} ${error.statusText}`), {
          stack: typeof error.data === "string" ? error.data : JSON.stringify(error.data, null, 2),
        })
      : Object.assign(new Error("Unknown error"), { stack: String(error) });

  return <ErrorScreen error={normalised} />;
}

interface ErrorScreenProps {
  error: Error;
  onRetry?: () => void;
}

// The shared visual — a frosted card matching the rest of the site.
function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div className="glass-section-bg min-h-screen flex items-center justify-center px-6 py-16">
      <div className="hero-glass rounded-2xl p-8 md:p-10 max-w-[640px] w-full">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/15 text-red-500 mb-4">
          <AlertTriangle className="w-6 h-6" strokeWidth={2} />
        </div>

        <div className="font-['Inter:Medium',sans-serif] text-[10px] tracking-[0.26em] uppercase text-[#2F80ED] dark:text-[#5DA0F8] mb-2">
          Something went wrong
        </div>
        <h2 className="font-['Poppins:Bold',sans-serif] text-[24px] md:text-[28px] tracking-[-0.018em] text-[#1f2937] dark:text-white mb-2">
          We couldn't load this page.
        </h2>
        <p className="font-['Inter:Regular',sans-serif] text-[14.5px] leading-[1.6] text-[#6b7280] dark:text-white/70 mb-6">
          A tiny bug crept in while rendering. Try reloading — and if the page keeps misbehaving, our team has already been notified through the console.
        </p>

        {isDev && error?.message && (
          <pre className="text-left text-[12px] leading-[1.55] text-[#ef4444] dark:text-red-300 bg-red-500/[0.06] dark:bg-red-500/[0.08] border border-red-500/20 rounded-xl p-3 overflow-auto max-h-[220px] mb-6 whitespace-pre-wrap font-mono">
{error.message}
{error.stack ? "\n\n" + error.stack : ""}
          </pre>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-5 h-11 rounded-full bg-gradient-to-r from-[#2F80ED] to-[#5DA0F8] text-white font-['Inter:SemiBold',sans-serif] text-[13px] shadow-[0_10px_28px_-8px_rgba(47, 128, 237,0.55)] hover:shadow-[0_14px_34px_-8px_rgba(47, 128, 237,0.75)] transition-shadow"
            >
              <RefreshCw className="w-4 h-4" /> Try again
            </button>
          )}
          <Link
            to="/"
            reloadDocument
            className="inline-flex items-center gap-2 px-5 h-11 rounded-full border border-[#2F80ED]/35 dark:border-[#5DA0F8]/35 text-[#2F80ED] dark:text-[#5DA0F8] font-['Inter:SemiBold',sans-serif] text-[13px] hover:bg-[#2F80ED]/[0.08] dark:hover:bg-[#5DA0F8]/[0.08] transition-colors"
          >
            <Home className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
