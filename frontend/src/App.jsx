import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import AppErrorBoundary from "./components/AppErrorBoundary";

const App = () => (
  <BrowserRouter>
    <AppErrorBoundary>
      <AppRoutes />
    </AppErrorBoundary>
  </BrowserRouter>
);

export default App;
