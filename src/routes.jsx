import { Home, SignIn, SignUp, AboutUs, ContactUs, IDEPage} from "@/pages";
import Dashboard from "./pages/dashboard";
import { element } from "prop-types";
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
    element: <Dashboard></Dashboard>
  },
  {
    name:"IDEPage",
    path: "/idepage",
    element: <IDEPage></IDEPage>
  },
];

export default routes;
