import { Toaster } from "@/components/ui/toaster";
import Sonner from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNav from "@/components/BottomNav";
import OnboardingLayout from "@/layouts/OnboardingLayout";
import Index from "./pages/Index";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import DevLogin from "./pages/DevLogin";
import Onboarding from "./pages/Onboarding";
import OnboardingRole from "./pages/OnboardingRole";
import OnboardingInterests from "./pages/OnboardingInterests";
import OnboardingAvailability from "./pages/OnboardingAvailability";
import Discovery from "./pages/Discovery.tsx";
import Profile from "./pages/Profile";
import Connections from "./pages/Connections";
import ConnectionSent from "./pages/ConnectionSent";
import Messages from "./pages/Messages";
import ProfileEdit from "./pages/ProfileEdit";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ErrorBoundary>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/dev-login" element={<DevLogin />} />

              {/* Onboarding routes — wrapped with OnboardingProvider via layout */}
              <Route path="/onboarding" element={<OnboardingLayout />}>
                <Route index element={<Onboarding />} />
                <Route path="role" element={<OnboardingRole />} />
                <Route path="interests" element={<OnboardingInterests />} />
                <Route path="availability" element={<OnboardingAvailability />} />
              </Route>

              {/* Protected routes — require auth + profile */}
              <Route path="/discovery" element={<ProtectedRoute><Discovery /></ProtectedRoute>} />
              <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/connections" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
              <Route path="/connection-sent/:name" element={<ProtectedRoute><ConnectionSent /></ProtectedRoute>} />
              <Route path="/messages/:connectionId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </BrowserRouter>
        </TooltipProvider>
      </ErrorBoundary>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
