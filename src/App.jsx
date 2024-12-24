import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "@/widgets/layout";
import routes from "@/routes";
import { useEffect, useState } from "react";
import IoTConnect from "./pages/iotconnect";

function App() {
  const { pathname } = useLocation();
  const authToken = localStorage.getItem('authToken');
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    if (authToken) {
      setIsAuthChecked(true); // Only set auth check state after component mounts
    } else {
      setIsAuthChecked(true); // Proceed without blocking UI if no authToken
    }
  }, [authToken]);

  if (!isAuthChecked) {
    return <div>Loading...</div>; // Optional: Show loading while checking authentication
  }

  // Redirect to dashboard if token exists
  if (authToken && pathname === "/home") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      {!(pathname === '/sign-in' || pathname === '/sign-up') && (
        <div className="container absolute left-2/4 z-10 mx-auto -translate-x-2/4 p-4">
          <Navbar routes={routes} />
        </div>
      )}
      <Routes>
        {routes.map(
          ({ path, element }, key) =>
            element && <Route key={key} exact path={path} element={element} />
        )}
        <Route path="*" element={<Navigate to="/home" replace />} />
        <Route path="/iotconnect" element={<IoTConnect></IoTConnect>} />
      </Routes>
    </>
  );
}

export default App;
