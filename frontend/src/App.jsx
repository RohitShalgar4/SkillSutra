import "./App.css";
import Navbar from "./components/Navbar";
import { Button } from "./components/ui/button";
import HeroSection from "./pages/Student/heroscetion";
import Login from "./pages/Login";
import MainLayout from "./Layout/mainlayout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Courses from "./pages/Student/courses";

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
            <Courses/>
          </>
        ),
      },
      {
        path: "login",
        element: <Login />
      }
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
