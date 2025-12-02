import moment from "moment";
import { transformImage } from "../../lib/features";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  AtSign,
  Calendar,
  UserCircle,
  Shield,
} from "lucide-react";

const Profile = ({ user }) => {
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full text-center p-8">
        <div className="space-y-3">
          <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center">
            <UserCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            No profile data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Avatar & Name Section */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <Avatar className="h-32 w-32 border-4 border-background shadow-xl ring-2 ring-primary/10">
            <AvatarImage
              src={transformImage(user?.avatar?.url)}
              alt={user?.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-3xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {/* Online Status Indicator */}
          <div className="absolute bottom-1 right-1 h-6 w-6 bg-green-500 border-4 border-background rounded-full" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {user?.name || "Anonymous User"}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <AtSign className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-medium">
              {user?.username || "username"}
            </p>
          </div>
          <Badge variant="secondary" className="mt-2">
            <Shield className="h-3 w-3 mr-1" />
            Active Member
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Profile Information Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Profile Information
        </h3>

        {/* Bio Card */}
        {user?.bio && (
          <ProfileCard
            heading="Bio"
            text={user.bio}
            icon={<UserCircle className="h-4 w-4" />}
            fullText
          />
        )}

        {/* Username Card */}
        <ProfileCard
          heading="Username"
          text={user?.username || "Not provided"}
          icon={<AtSign className="h-4 w-4" />}
        />

        {/* Full Name Card */}
        <ProfileCard
          heading="Full Name"
          text={user?.name || "Not provided"}
          icon={<User className="h-4 w-4" />}
        />

        <Separator className="my-2" />

        {/* Member Since Card */}
        <ProfileCard
          heading="Member Since"
          text={
            user?.createdAt
              ? moment(user.createdAt).format("MMM DD, YYYY")
              : "Unknown"
          }
          icon={<Calendar className="h-4 w-4" />}
          subtext={user?.createdAt ? moment(user.createdAt).fromNow() : ""}
        />
      </div>

      {/* Stats Section - Optional */}
      {(user?.totalChats || user?.totalMessages) && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Activity Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {user?.totalChats !== undefined && (
                <Card className="border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {user.totalChats}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total Chats
                    </p>
                  </CardContent>
                </Card>
              )}
              {user?.totalMessages !== undefined && (
                <Card className="border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {user.totalMessages}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Messages Sent
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ProfileCard = ({ text, icon, heading, subtext, fullText, isLink }) => {
  const renderText = () => {
    if (isLink) {
      return (
        <a
          href={text.startsWith("http") ? text : `https://${text}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary hover:underline truncate"
        >
          {text}
        </a>
      );
    }

    return (
      <p
        className={`text-sm font-medium text-foreground ${
          !fullText && "truncate"
        }`}
      >
        {text || "Not provided"}
      </p>
    );
  };

  return (
    <Card className="border-border hover:shadow-sm hover:border-primary/20 transition-all duration-200">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary flex-shrink-0 mt-0.5">
            {icon}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {heading}
            </p>
            {renderText()}
            {subtext && (
              <p className="text-xs text-muted-foreground italic">{subtext}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Profile;
