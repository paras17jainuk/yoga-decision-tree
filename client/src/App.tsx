import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router as WouterRouter } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Results from "./pages/Results";
import Explore from "./pages/Explore";
import Safety from "./pages/Safety";
import Session from "./pages/Session";
import SuryaNamaskar from "./pages/SuryaNamaskar";
import VinyasaFlows from "./pages/VinyasaFlows";
import AsanaDetail from "./pages/AsanaDetail";

// Detect base path from Vite's base config (for GitHub Pages)
const base = import.meta.env.BASE_URL.replace(/\/$/, "") || "";

function AppRouter() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/results"} component={Results} />
      <Route path={"/explore"} component={Explore} />
      <Route path={"/asana/:id"} component={AsanaDetail} />
      <Route path={"/safety"} component={Safety} />
      <Route path={"/session"} component={Session} />
      <Route path={"/surya-namaskar"} component={SuryaNamaskar} />
      <Route path={"/vinyasa"} component={VinyasaFlows} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <WouterRouter base={base}>
            <AppRouter />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
