import { useInputValidation } from "6pp";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { adminLogin } from "../../redux/thunks/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Shield, Key, LogIn, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const AdminLogin = () => {
  const dispatch = useDispatch();

  // 🟢 Redux auth error
  const { isAdmin, error } = useSelector((state) => state.auth);

  const secretKey = useInputValidation("");
  const [showPassword, setShowPassword] = useState(false);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(adminLogin(secretKey.value));
  };

  if (isAdmin) return <Navigate to="/admin/dashboard" />;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-card-foreground">
              Admin Access
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Enter secret key to access admin panel
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={submitHandler} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secretKey" className="text-sm font-medium text-card-foreground">
                Secret Key
              </Label>

              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />

                <Input
                  id="secretKey"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin secret key"
                  value={secretKey.value}
                  onChange={secretKey.changeHandler}
                  className="pl-10 pr-10 bg-background"
                  required
                />

                {/* 👁️ Show / Hide Password Toggle */}
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Access Admin Panel
            </Button>
          </form>

          {/* ❌ Invalid Credentials Message */}
          {error && (
            <p className="mt-4 text-sm text-red-500 text-center font-medium">
              {error || "Invalid admin key"}
            </p>
          )}

          {/* Security Note */}
          <div className="mt-6 p-3 bg-muted/50 border border-border rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              🔒 Restricted access - Authorized personnel only
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
