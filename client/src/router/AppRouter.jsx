import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import TaskDetailPage from "../pages/TaskDetailPage";
import CalendarPage from "../pages/CalendarPage";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/",
            element: <DashboardPage />,
          },
          {
            path: "/task/:id",
            element: <TaskDetailPage />,
          },
          {
            path: "/calendar",
            element: <CalendarPage />,
          },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
