import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "@/i18n";
import NotFound from "@/pages/not-found";

import { ThemeProvider } from "@/contexts/ThemeContext";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Settings from "@/pages/Settings";

// Facility Pages
import FacilityDashboard from "@/pages/facility/FacilityDashboard";
import FacilityStock from "@/pages/facility/FacilityStock";
import FacilityFootfall from "@/pages/facility/FacilityFootfall";
import FacilityBeds from "@/pages/facility/FacilityBeds";
import FacilityAttendance from "@/pages/facility/FacilityAttendance";
import FacilityTests from "@/pages/facility/FacilityTests";
import FacilityCalamity from "@/pages/facility/FacilityCalamity";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminFacilityView from "@/pages/admin/AdminFacilityView";
import AdminInsights from "@/pages/admin/AdminInsights";
import AdminRedistribution from "@/pages/admin/AdminRedistribution";
import AdminAlerts from "@/pages/admin/AdminAlerts";
import AdminAssistant from "@/pages/admin/AdminAssistant";

// Citizen Pages
import CitizenHome from "@/pages/citizen/CitizenHome";
import CitizenFacilityView from "@/pages/citizen/CitizenFacilityView";

const queryClient = new QueryClient();

function ProtectedRoute({
  component: Component,
  role,
}: {
  component: any;
  role: string;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        Loading application...
      </div>
    );

  if (!user) return <Redirect to="/login" />;

  if (user.role !== role) {
    if (user.role === "district_admin")
      return <Redirect to="/admin/dashboard" />;
    return <Redirect to="/facility/dashboard" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/settings" component={Settings} />

      {/* Facility Routes */}
      <Route path="/facility/dashboard">
        {() => (
          <ProtectedRoute component={FacilityDashboard} role="facility_staff" />
        )}
      </Route>
      <Route path="/facility/stock">
        {() => (
          <ProtectedRoute component={FacilityStock} role="facility_staff" />
        )}
      </Route>
      <Route path="/facility/footfall">
        {() => (
          <ProtectedRoute component={FacilityFootfall} role="facility_staff" />
        )}
      </Route>
      <Route path="/facility/beds">
        {() => (
          <ProtectedRoute component={FacilityBeds} role="facility_staff" />
        )}
      </Route>
      <Route path="/facility/attendance">
        {() => (
          <ProtectedRoute
            component={FacilityAttendance}
            role="facility_staff"
          />
        )}
      </Route>
      <Route path="/facility/tests">
        {() => (
          <ProtectedRoute component={FacilityTests} role="facility_staff" />
        )}
      </Route>
      <Route path="/facility/calamity">
        {() => (
          <ProtectedRoute component={FacilityCalamity} role="facility_staff" />
        )}
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/dashboard">
        {() => (
          <ProtectedRoute component={AdminDashboard} role="district_admin" />
        )}
      </Route>
      <Route path="/admin/facility/:id">
        {() => (
          <ProtectedRoute component={AdminFacilityView} role="district_admin" />
        )}
      </Route>
      <Route path="/admin/insights">
        {() => (
          <ProtectedRoute component={AdminInsights} role="district_admin" />
        )}
      </Route>
      <Route path="/admin/redistribution">
        {() => (
          <ProtectedRoute
            component={AdminRedistribution}
            role="district_admin"
          />
        )}
      </Route>
      <Route path="/admin/alerts">
        {() => <ProtectedRoute component={AdminAlerts} role="district_admin" />}
      </Route>
      <Route path="/admin/assistant">
        {() => (
          <ProtectedRoute component={AdminAssistant} role="district_admin" />
        )}
      </Route>

      {/* Public Routes */}
      <Route path="/citizen" component={CitizenHome} />
      <Route path="/citizen/facility/:id" component={CitizenFacilityView} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
