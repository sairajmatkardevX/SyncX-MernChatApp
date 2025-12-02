import { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectRoute from "./components/auth/ProtectRoute";
import { LayoutLoader } from "./components/layouts/Loaders";
import axios from "axios";
import { server } from "./constants/config";
import { useDispatch, useSelector } from "react-redux";
import { userExists, userNotExists } from "./redux/reducers/auth";
import { getAdmin } from "./redux/thunks/admin"; 
import { Toaster } from "@/components/ui/toaster";
import SocketProvider from "./providers/SocketProvider";
import { ThemeProvider } from "next-themes";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Chat = lazy(() => import("./pages/Chat"));
const Groups = lazy(() => import("./pages/Groups"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const ChatManagement = lazy(() => import("./pages/admin/ChatManagement"));
const MessagesManagement = lazy(() =>
  import("./pages/admin/MessageManagement")
);

const App = () => {
  const { user, isAdmin, loader } = useSelector((state) => state.auth);
  const [authChecked, setAuthChecked] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    
    axios
      .get(`${server}/api/v1/user/me`, { withCredentials: true })
      .then(({ data }) => {
        dispatch(userExists(data.user));
      })
      .catch((err) => {
        dispatch(userNotExists());
      })
      .finally(() => {
        setAuthChecked(true);
      });

    
    dispatch(getAdmin());
  }, [dispatch]);

  if (!authChecked || loader) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LayoutLoader />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <Suspense fallback={
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <LayoutLoader />
          </ThemeProvider>
        }>
          <Routes>
            
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            
            <Route 
              path="/admin" 
              element={isAdmin ? <Navigate to="/admin/dashboard" /> : <AdminLogin />} 
            />
            
          
            <Route 
              path="/admin/dashboard" 
              element={isAdmin ? <Dashboard /> : <Navigate to="/admin" />} 
            />
            <Route 
              path="/admin/users" 
              element={isAdmin ? <UserManagement /> : <Navigate to="/admin" />} 
            />
            <Route 
              path="/admin/chats" 
              element={isAdmin ? <ChatManagement /> : <Navigate to="/admin" />} 
            />
            <Route 
              path="/admin/messages" 
              element={isAdmin ? <MessagesManagement /> : <Navigate to="/admin" />} 
            />

       
            <Route path="/" element={
              user ? (
                <SocketProvider>
                  <ProtectRoute user={user}>
                    <Home />
                  </ProtectRoute>
                </SocketProvider>
              ) : (
                <Navigate to="/login" />
              )
            } />
            
            <Route path="/chat/:chatId" element={
              user ? (
                <SocketProvider>
                  <ProtectRoute user={user}>
                    <Chat />
                  </ProtectRoute>
                </SocketProvider>
              ) : (
                <Navigate to="/login" />
              )
            } />
            
            <Route path="/groups" element={
              user ? (
                <SocketProvider>
                  <ProtectRoute user={user}>
                    <Groups />
                  </ProtectRoute>
                </SocketProvider>
              ) : (
                <Navigate to="/login" />
              )
            } />

            <Route path="/profile" element={
              user ? (
                <SocketProvider>
                  <ProtectRoute user={user}>
                    <Profile />
                  </ProtectRoute>
                </SocketProvider>
              ) : (
                <Navigate to="/login" />
              )
            } />

            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>

        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;