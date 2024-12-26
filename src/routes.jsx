import { Home, SignIn, SignUp, AboutUs, ContactUs} from "@/pages";
import Dashboard from "./pages/dashboard";
// import AboutUs from "./pages/about-us"

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
    name: "About us",
    path: "/about-us",
    element: <AboutUs />,
  },
  {
    name: "Contact us",
    path: "/contact-us",
    element: <ContactUs />,
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    element: <Dashboard></Dashboard>,
  },
];

export default routes;
