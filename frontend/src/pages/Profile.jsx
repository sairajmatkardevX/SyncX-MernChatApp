// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { useSelector,useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ProfileComponent from "../components/specific/Profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUpdateProfileMutation } from "@/redux/api/api";
import { Loader2, Upload, X, ArrowLeft } from "lucide-react";
import { updateUserData } from "@/redux/reducers/auth";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const [updateUser, { isLoading }] = useUpdateProfileMutation();
const dispatch = useDispatch();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);


  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        bio: user.bio || "",
      });
      setAvatarPreview(user.avatar);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
     
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload JPG, PNG, or WebP image",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleSave = async () => {
    try {
      
      if (!formData.name.trim()) {
        toast({
          title: "Validation error",
          description: "Name is required",
          variant: "destructive",
        });
        return;
      }

      if (!formData.username.trim()) {
        toast({
          title: "Validation error",
          description: "Username is required",
          variant: "destructive",
        });
        return;
      }

      const updateFormData = new FormData();
      updateFormData.append("name", formData.name);
      updateFormData.append("username", formData.username);
      updateFormData.append("bio", formData.bio);

    
      if (avatarFile) {
        updateFormData.append("avatar", avatarFile);
      }

       const res = await updateUser(updateFormData).unwrap();

      dispatch(updateUserData(res.user));


      toast({
        title: "Success",
        description: res.message || "Profile updated successfully",
      });

      setIsEditMode(false);
      setAvatarFile(null);
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    setFormData({
      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || "",
    });
    setAvatarFile(null);
    setAvatarPreview(user?.avatar || null);
    setIsEditMode(false);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-2xl px-4">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>

          <Button
            onClick={() => setIsEditMode(!isEditMode)}
            variant={isEditMode ? "destructive" : "default"}
            className="w-20"
          >
            {isEditMode ? "Cancel" : "Edit"}
          </Button>
        </div>

        {isEditMode ? (
          // Edit Mode
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Profile Photo</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-24 w-24 border-2 border-border">
                    <AvatarImage src={avatarPreview} alt="Preview" />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                      {formData.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <label htmlFor="avatar-input" className="cursor-pointer">
                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2"
                          asChild
                        >
                          <span>
                            <Upload className="h-4 w-4" />
                            Upload Photo
                          </span>
                        </Button>
                      </label>
                      <input
                        id="avatar-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />

                      {avatarFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleRemoveAvatar}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or WebP up to 5MB
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="text-base"
                />
              </div>

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  className="text-base"
                />
              </div>

              {/* Bio Field */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  rows={4}
                  className="text-base resize-none"
                />
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // View Mode
          <Card className="border-border">
            <CardContent className="pt-6">
              <ProfileComponent user={user} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;