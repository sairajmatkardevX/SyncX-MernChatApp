import { useInputValidation } from "6pp";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { adminLogin } from "../../redux/thunks/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Shield, Key, LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AdminLogin = () => {
  const dispatch = useDispatch();
  const { isAdmin } = useSelector((state) => state.auth);

  const secretKey = useInputValidation("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const { toast } = useToast();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLocalError("");

    // Validation
    if (!secretKey.value.trim()) {
      const msg = "Please enter the admin secret key";
      setLocalError(msg);
      toast({ variant: "destructive", title: "Validation Error", description: msg });
      return;
    }

    if (secretKey.value.length < 6) {
      const msg = "Secret key must be at least 6 characters";
      setLocalError(msg);
      toast({ variant: "destructive", title: "Validation Error", description: msg });
      return;
    }

    setIsLoading(true);

    try {
      await dispatch(adminLogin(secretKey.value)).unwrap(); // ⬅ FIX: instantly returns real error
    } catch (err) {
      setLocalError(err);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: err || "Invalid admin secret key",
      });
      setIsLoading(false);
      return;
    }

    // Success (loader will be removed by redirect)
    toast({
      title: "Welcome Admin!",
      description: "Successfully authenticated",
    });
  };

  if (isAdmin) return <Navigate to="/admin/dashboard" />;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <Card className="bg-card/95 backdrop-blur-sm border shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold text-card-foreground">Admin Access</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">Enter secret key to access admin panel</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <AnimatePresence>
              {localError && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{localError}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={submitHandler} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="secretKey">Secret Key *</Label>

                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />

                  <Input
                    id="secretKey"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin secret key"
                    value={secretKey.value}
                    onChange={secretKey.changeHandler}
                    className="pl-10 pr-10 bg-background"
                  />

                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((p) => !p)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <p className="text-xs text-muted-foreground">Secret key must be at least 6 characters</p>
              </div>

              <Button disabled={isLoading} type="submit" className="w-full">
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Access Admin Panel</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-4 p-3 bg-muted/50 border rounded-lg">
              <p className="text-xs text-muted-foreground text-center">🔒 Restricted access - Authorized personnel only</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
