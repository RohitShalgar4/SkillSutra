import { Menu, School } from "lucide-react";
import React, { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import DarkMode from "@/DarkMode";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const [logoutUser, { isSuccess }] = useLogoutUserMutation();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Logged out successfully");
    }
  }, [isSuccess]);

  console.log(user);

  return (
    <div className="h-16 dark:bg-[#020817] bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 duration-300 z-10">
      {/* Desktop */}
      <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full">
        <div className="flex items-center gap-2">
          <School size={"30"} />
          <Link to="/">
            <img
              src="/SkillSutra Logo.jpg"
              alt="SkillSutra Logo"
              className="hidden md:block w-40 h-15"
            />
          </Link>
        </div>
        {/* User icons and dark mode icon  */}
        <div className="flex items-center gap-8">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage
                    src={user?.photoUrl || "https://github.com/shadcn.png"}
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Link to="my-learning">My learning</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="profile">Edit Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logoutHandler}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                {user?.role === "Instructor" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link to="/admin/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate("/validate")}
                className="px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 transition duration-300 shadow-md dark:from-indigo-700 dark:to-blue-800 dark:hover:from-indigo-800 dark:hover:to-blue-900"
              >
                Validate Certificate
              </Button>
              <Button variant="outline" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/login?tab=signup")}>
                Signup
              </Button>
            </div>
          )}
          <DarkMode />
        </div>
      </div>
      {/* Mobile device */}
      <div className="flex md:hidden items-center justify-between px-4 h-full">
        <h1 className="font-extrabold text-2xl">SkillSutra</h1>
        <MobileNavbar user={user} />
      </div>
    </div>
  );
};

export default Navbar;

const MobileNavbar = ({ user }) => {
  const [logoutUser, { isSuccess }] = useLogoutUserMutation();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Logged out successfully");
    }
  }, [isSuccess]);

  return (
    <div className="flex items-center gap-2">
      {!user ? (
        // If no user, show only Validate and Login buttons
        <>
          <Button
            onClick={() => navigate("/validate")}
            className="px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 transition duration-300 shadow-md dark:from-indigo-700 dark:to-blue-800 dark:hover:from-indigo-800 dark:hover:to-blue-900"
          >
            Validate
          </Button>
          <Button variant="outline" onClick={() => navigate("/login")}>
            Login
          </Button>
        </>
      ) : (
        // If user exists, show Avatar + Menu
        <>
          <Avatar>
            <AvatarImage
              src={user?.photoUrl || "https://github.com/shadcn.png"}
              alt="@shadcn"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                className="rounded-full hover:bg-gray-200"
                variant="outline"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
              <SheetHeader className="flex flex-row items-center justify-between mt-2">
                <SheetTitle>
                  <Link to="/">SkillSutra</Link>
                </SheetTitle>
                <DarkMode />
              </SheetHeader>
              <Separator className="mr-2" />
              <nav className="flex flex-col space-y-4">
                <Link to="/my-learning">My Learning</Link>
                <Link to="/profile">Edit Profile</Link>
                <Button onClick={logoutHandler}>Log out</Button>
              </nav>
              {user?.role === "Instructor" && (
                <SheetFooter>
                  <SheetClose asChild>
                    <Button
                      type="button"
                      onClick={() => navigate("/admin/dashboard")}
                    >
                      Dashboard
                    </Button>
                  </SheetClose>
                </SheetFooter>
              )}
            </SheetContent>
          </Sheet>
        </>
      )}
    </div>
  );
};
