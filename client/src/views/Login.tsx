import React from "react";
import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  FormikHelpers,
  FormikProps,
  FormikErrors,
} from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { checkAuthStatus } from "../redux/authslice"; // Adjust the import path as necessary
import { AppDispatch } from "../redux/store";

// Validation schema for the login form
const loginSchema = Yup.object().shape({
  username: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters long")
    .required("Required"),
});

interface LoginFormValues {
  username: string;
  password: string;
  general?: string;
}
interface LoginFormErrors extends FormikErrors<LoginFormValues> {
  general?: string;
}
const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleSubmit = async (
    values: LoginFormValues,
    actions: FormikHelpers<LoginFormValues>
  ) => {
    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
        credentials: "include",
      });

      if (response.ok) {
        dispatch(checkAuthStatus());
        navigate("/home");
        localStorage.setItem("login", Date.now().toString());
      } else {
        const errorData = await response.json();
        actions.setFieldError("general", errorData.error || "Login failed");
      }
    } catch (error) {
      actions.setFieldError("general", "An error occurred. Please try again.");
    }
    actions.setSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full  max-w-md">
        <Formik<LoginFormValues>
          initialValues={{
            username: "",
            password: "",
          }}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({
            isSubmitting,
            errors,
          }: FormikProps<LoginFormValues> & { errors: LoginFormErrors }) => (
            <Form className="bg-white shadow-lg rounded px-8 pt-6 pb-8 mb-4">
              <div className="text-center font-bold mb-5">Login Form</div>

              {errors.general && (
                <div className="text-red-500 text-xs italic mb-4">
                  {errors.general}
                </div>
              )}

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  Username
                </label>
                <Field
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Username"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="text-red-500 text-xs italic"
                />
              </div>

              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="password"
                >
                  Password
                </label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-xs italic"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Login
                </button>
              </div>

              <div className="text-center mt-4">
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Create an account
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;
