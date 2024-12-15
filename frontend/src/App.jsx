import "./App.css";
import HeroSection from "./pages/Student/HeroSection";
import Login from "./pages/Login";
import MainLayout from "./Layout/mainlayout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Courses from "./pages/Student/Courses";
import MyLearning from "./pages/Student/MyLearning";
import Profile from "./pages/Student/Profile";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: (
          <>
            <HeroSection />
            <Courses />
          </>
        ),
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "my-learning",
        element: <MyLearning />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
]);

function App() {
  return (
    <main>
      <RouterProvider router={appRouter} />
    </main>
  );
}

export default App;
