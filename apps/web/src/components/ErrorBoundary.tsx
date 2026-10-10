import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <div className="max-w-md text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                            <AlertTriangle className="w-8 h-8 text-destructive" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-3">
                            Something went wrong
                        </h1>
                        <p className="text-muted-foreground mb-6">
                            An unexpected error occurred. Please try again.
                        </p>
                        {this.state.error && (
                            <p className="text-xs text-muted-foreground bg-muted rounded-lg p-3 mb-6 font-mono text-left break-all">
                                {this.state.error.message}
                            </p>
                        )}
                        <div className="flex gap-3 justify-center">
                            <Button variant="hero" onClick={this.handleReset}>
                                Try Again
                            </Button>
                            <Button variant="outline" onClick={() => window.location.assign("/")}>
                                Go Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
