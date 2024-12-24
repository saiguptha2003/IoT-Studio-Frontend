import React, { useState } from "react";
import { Input, Checkbox, Button, Typography } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";

export function SignUp() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Base URL from environment variables
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Navigate to the sign-in page upon successful registration
        navigate("/sign-in");
      } else {
        setErrorMessage(data.error || "An error occurred during signup.");
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again later.");
    }
  };

  return (
    <section className="m-8 flex">
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl"
        />
      </div>
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">
            Join Us Today
          </Typography>
          <Typography
            variant="paragraph"
            color="blue-gray"
            className="text-lg font-normal"
          >
            Enter your email and password to register.
          </Typography>
        </div>
        <form
          className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2"
          onSubmit={handleSignup}
        >
          <div className="mb-1 flex flex-col gap-6">
            <Typography
              variant="small"
              color="blue-gray"
              className="-mb-3 font-medium"
            >
              Your email
            </Typography>
            <Input
              size="lg"
              placeholder="name@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
            <Input
              size="lg"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
            />
            <Input
              type="password"
              size="lg"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
            />
          </div>
          {errorMessage && (
            <Typography variant="small" color="red" className="mt-2">
              {errorMessage}
            </Typography>
          )}
          <Checkbox
            label={
              <Typography
                variant="small"
                color="gray"
                className="flex items-center justify-start font-medium"
              >
                I agree to the&nbsp;
                <a
                  href="#"
                  className="font-normal text-black transition-colors hover:text-gray-900 underline"
                >
                  Terms and Conditions
                </a>
              </Typography>
            }
            containerProps={{ className: "-ml-2.5" }}
          />
          <Button type="submit" className="mt-6" fullWidth>
            Register Now
          </Button>

          <Typography
            variant="paragraph"
            className="text-center text-blue-gray-500 font-medium mt-4"
          >
            Already have an account?
            <Link to="/sign-in" className="text-gray-900 ml-1">
              Sign in
            </Link>
          </Typography>
        </form>
      </div>
    </section>
  );
}

export default SignUp;
