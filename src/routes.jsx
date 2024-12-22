import { Home, SignIn, SignUp } from "@/pages";
import Dashboard from "./pages/dashboard";

export const routes = [
  {
    name: "home",
    path: "/home",
    element: <Home />,
  },
  {
    name: "Sign In",
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    name: "Sign Up",
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    element: <Dashboard></Dashboard>,
  },
];

export default routes;
