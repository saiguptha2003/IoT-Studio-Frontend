import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import {
  FireIcon,
  CloudIcon,
  BoltIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";

const services = [
  {
    name: "Temperature Monitoring",
    description: "Track and monitor temperature data in real-time.",
    path: "/temperature",
    icon: FireIcon,
  },
  {
    name: "Humidity Control",
    description: "Control and monitor humidity levels.",
    path: "/humidity",
    icon: CloudIcon,
  },
  {
    name: "Energy Usage",
    description: "Monitor and analyze energy consumption.",
    path: "/energy",
    icon: BoltIcon,
  },
  {
    name: "Device Management",
    description: "Manage and control all IoT devices.",
    path: "/devices",
    icon: DevicePhoneMobileIcon,
  },
  {
    name: "Security Alerts",
    description: "Receive real-time security alerts and notifications.",
    path: "/security",
    icon: ShieldCheckIcon,
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    if (!authToken) {
      navigate("/sign-in"); // Redirect to sign-in page if no authToken
    }
  }, [authToken, navigate]);

  return (
    <>
      <div className="relative flex h-screen content-center items-center justify-center pt-16 pb-32">
        <div className="absolute top-0 h-full w-full bg-[url('/img/background-3.png')] bg-cover bg-center" />
        <div className="absolute top-0 h-full w-full bg-black/60 bg-cover bg-center" />
        <div className="max-w-8xl container relative mx-auto text-center">
          <Typography variant="h1" color="white" className="mb-6 font-black">
            IoT Dashboard
          </Typography>
          <Typography variant="lead" color="white" className="opacity-80">
            Monitor and manage your IoT services in real-time.
          </Typography>
        </div>
      </div>

      <section className="-mt-32 bg-white px-4 pb-20 pt-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardBody>
                  <div className="flex items-center mb-4">
                    <service.icon className="w-8 h-8 text-black mr-4" /> {/* Black Icon */}
                    <Typography variant="h5" className="font-bold text-black">
                      {service.name}
                    </Typography>
                  </div>
                  <Typography className="text-gray-700 mb-4">
                    {service.description}
                  </Typography>
                </CardBody>
                <CardFooter className="flex justify-end">
                  <Link to={service.path}>
                    <Button variant="filled" color="black" className="text-white hover:bg-black">
                      View Service
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Dashboard;
