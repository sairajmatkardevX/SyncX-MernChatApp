import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useDispatch } from 'react-redux';
import { userExists } from '@/redux/reducers/auth';
import { 
  Camera, 
  Eye, 
  EyeOff, 
  MessageCircle, 
  User,
  Lock,
  UserPlus,
  LogIn,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { server } from '../constants/config';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    username: '',
    password: '',
    avatar: null
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const { toast } = useToast();

  const dispatch = useDispatch();

  const toggleLogin = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', bio: '', username: '', password: '', avatar: null });
    setAvatarPreview('');
    setError('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image smaller than 5MB",
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, etc.)",
        });
        return;
      }

      setFormData(prev => ({ ...prev, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const validateForm = () => {
    if (!isLogin) {
      if (!formData.name.trim()) {
        setError('Please enter your full name');
        return false;
      }
      if (formData.name.length < 3) {
        setError('Name must be at least 3 characters long');
        return false;
      }
      if (!formData.bio.trim()) {
        setError('Please enter a bio');
        return false;
      }
    }

    if (!formData.username.trim()) {
      setError('Please enter your username');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }

    if (!formData.password) {
      setError('Please enter your password');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: error,
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await axios.post(
        `${server}/api/v1/user/login`,
        {
          username: formData.username,
          password: formData.password,
        },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      
      dispatch(userExists(data.user));
      toast({
        title: "Welcome back!",
        description: "Login successful",
      });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
      console.error('Login failed:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: error,
      });
      return;
    }

    setIsLoading(true);

    const formDataToSend = new FormData();
    if (formData.avatar) formDataToSend.append("avatar", formData.avatar);
    formDataToSend.append("name", formData.name);
    formDataToSend.append("bio", formData.bio);
    formDataToSend.append("username", formData.username);
    formDataToSend.append("password", formData.password);

    try {
      const { data } = await axios.post(
        `${server}/api/v1/user/new`,
        formDataToSend,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );

      dispatch(userExists(data.user));
      toast({
        title: "Account created!",
        description: "Welcome to Chattu",
      });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Sign up failed. Please try again.';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: errorMessage,
      });
      console.error('Sign up failed:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-card/95 backdrop-blur-sm border shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg"
            >
              <MessageCircle className="h-8 w-8 text-primary-foreground" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold text-card-foreground">
                {isLogin ? 'Welcome Back' : 'Join Chattu'}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                {isLogin ? 'Sign in to continue your conversations' : 'Create your account to get started'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.form
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                onSubmit={isLogin ? handleLogin : handleSignUp}
                className="space-y-4"
              >
                {/* Avatar Upload - Only for Sign Up */}
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center space-y-3"
                  >
                    <div className="relative">
                      <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
                        <AvatarImage src={avatarPreview} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 cursor-pointer">
                        <div className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-1.5 shadow-lg transition-colors">
                          <Camera className="h-3 w-3" />
                        </div>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">Click to upload profile picture</p>
                  </motion.div>
                )}

                {/* Name Field - Only for Sign Up */}
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-card-foreground">
                      Full Name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="pl-10"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {/* Bio Field - Only for Sign Up */}
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-medium text-card-foreground">
                      Bio *
                    </Label>
                    <Input
                      id="bio"
                      placeholder="Tell us about yourself"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                )}

                {/* Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-card-foreground">
                    Username *
                  </Label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-card-foreground">
                    Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {!isLogin && (
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-all duration-200 hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {isLogin ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                      <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    </div>
                  )}
                </Button>
              </motion.form>
            </AnimatePresence>

            {/* Toggle between Login/Sign Up */}
            <div className="text-center pt-2">
              <button
                onClick={toggleLogin}
                disabled={isLoading}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;