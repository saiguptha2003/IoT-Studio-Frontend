import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  Navbar as MTNavbar,
  MobileNav,
  Typography,
  Button
} from "@material-tailwind/react";

export function Navbar({ brandName, routes }) {
  const [openNav, setOpenNav] = React.useState(false);
  const authToken = localStorage.getItem('authToken');
  const [timeLeft, setTimeLeft] = React.useState(0);

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false)
    );

    if (authToken) {
      // Retrieve session time from localStorage
      const sessionTime = localStorage.getItem('sessionTime');
      const startTime = localStorage.getItem('sessionStartTime');
      const currentTime = Math.floor(Date.now() / 1000);

      if (!sessionTime || !startTime) {
        // If no session time or start time is found, reset session
        localStorage.removeItem('authToken');
        localStorage.removeItem('sessionTime');
        localStorage.removeItem('sessionStartTime');
        window.location.href = "/";
      } else {
        const elapsedTime = currentTime - startTime;
        const remainingTime = sessionTime * 60 - elapsedTime;

        if (remainingTime <= 0) {
          // If the session has expired
          localStorage.removeItem('authToken');
          localStorage.removeItem('sessionTime');
          localStorage.removeItem('sessionStartTime');
          window.location.href = "/";
        } else {
          setTimeLeft(remainingTime);
        }

        // Timer interval to update time left
        const timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              // Session expired, clear auth token and session time
              clearInterval(timer);
              localStorage.removeItem('authToken');
              localStorage.removeItem('sessionTime');
              localStorage.removeItem('sessionStartTime');
              window.location.href = "/";
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Cleanup on component unmount
        return () => clearInterval(timer);
      }
    }
  }, [authToken]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('sessionTime');
    localStorage.removeItem('sessionStartTime');
    window.location.reload();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 text-inherit lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      {!authToken && routes.map(({ name, path, icon, href, target }) => (
        <Typography
          key={name}
          as="li"
          variant="small"
          color="inherit"
          className="capitalize"
        >
          {href ? (
            <a
              href={href}
              target={target}
              className="flex items-center gap-1 p-1 font-bold"
            >
              {icon &&
                React.createElement(icon, {
                  className: "w-[18px] h-[18px] opacity-75 mr-1",
                })}
              {name}
            </a>
          ) : (
            <Link
              to={path}
              target={target}
              className="flex items-center gap-1 p-1 font-bold"
            >
              {icon &&
                React.createElement(icon, {
                  className: "w-[18px] h-[18px] opacity-75 mr-1",
                })}
              {name}
            </Link>
          )}
        </Typography>
      ))}
      {authToken && (
        <Typography
          as="li"
          variant="medium"
          color="inherit"
          className="capitalize flex items-center gap-4"
        >
          {/* Display the session timer */}
          <span className="text-red-700 font-bold">{formatTime(timeLeft)}</span>
          <Button
            color="transparent"
            onClick={handleLogout}
            className="flex items-center gap-1 p-1 font-bold hover:bg-transparent hover:text-red-700"
          >
            Logout
          </Button>
        </Typography>
      )}
    </ul>
  );

  return (
    <MTNavbar color="transparent" className="p-3">
      <div className="container mx-auto flex items-center justify-between text-white">
        <Link to="/">
          <Typography className="mr-4 ml-2 cursor-pointer py-1.5 font-bold">
            {brandName}
          </Typography>
        </Link>
        <div className="hidden lg:block">{navList}</div>
      </div>
      <MobileNav
        className="rounded-xl bg-white px-4 pt-2 pb-4 text-blue-gray-900"
        open={openNav}
      >
      </MobileNav>
    </MTNavbar>
  );
}

Navbar.defaultProps = {
  brandName: "IOT Dashboard",
  action: (
    <a
      href="https://www.creative-tim.com/product/material-tailwind-kit-react"
      target="_blank"
    >
    </a>
  ),
};

Navbar.propTypes = {
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
  action: PropTypes.node,
};

Navbar.displayName = "/src/widgets/layout/navbar.jsx";

export default Navbar;
