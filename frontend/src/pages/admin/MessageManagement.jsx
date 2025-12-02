import moment from "moment";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/layouts/AdminLayout";
import { server } from "../../constants/config";
import { useErrors } from "../../hooks/hook";
import { fileFormat, transformImage } from "../../lib/features";
import axios from "axios";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  MessageSquare,
  Download,
  User,
  Users,
  File,
  Image as ImageIcon,
  Video,
  Music,
  Paperclip,
  Search,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MessageManagement = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ FETCH MESSAGES ON MOUNT
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await axios.get(`${server}/api/v1/admin/messages`, {
          withCredentials: true,
        });

        if (data.messages && Array.isArray(data.messages)) {
          const transformedMessages = data.messages.map((message) => ({
            ...message,
            id: message._id,
            sender: {
              name: message.sender?.name || "Unknown",
              avatar: message.sender?.avatar
                ? transformImage(message.sender.avatar, 50)
                : null,
            },
            createdAt: moment(message.createdAt).format("MMM DD, YYYY h:mm A"),
            createdAtRelative: moment(message.createdAt).fromNow(),
          }));

          setMessages(transformedMessages);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error("❌ Error fetching messages:", err);
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch messages";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  useErrors([{ isError: !!error, error }]);

  const filteredMessages = messages.filter(
    (msg) =>
      msg.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.sender.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAttachmentIcon = (fileType) => {
    switch (fileType) {
      case "image":
        return <ImageIcon className="h-4 w-4 text-pink-500" />;
      case "video":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "audio":
        return <Music className="h-4 w-4 text-green-500" />;
      default:
        return <File className="h-4 w-4 text-violet-500" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Messages</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage all platform messages
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        {!loading && messages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Messages"
              value={messages.length}
              icon={<MessageSquare className="h-4 w-4" />}
              color="blue"
            />
            <StatCard
              title="With Attachments"
              value={messages.filter((m) => m.attachments?.length > 0).length}
              icon={<Paperclip className="h-4 w-4" />}
              color="green"
            />
            <StatCard
              title="Group Messages"
              value={messages.filter((m) => m.groupChat).length}
              icon={<Users className="h-4 w-4" />}
              color="purple"
            />
            <StatCard
              title="Direct Messages"
              value={messages.filter((m) => !m.groupChat).length}
              icon={<User className="h-4 w-4" />}
              color="orange"
            />
          </div>
        )}

        {/* Messages Table */}
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : messages.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No messages yet
                </h3>
                <p className="text-muted-foreground">
                  Messages will appear here as they are sent by users
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                All Messages
                {searchQuery && (
                  <Badge variant="secondary">
                    {filteredMessages.length} results
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Complete overview of all messages in the system (Total:{" "}
                {messages.length})
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur">
                    <TableRow>
                      <TableHead className="w-[40%]">Message</TableHead>
                      <TableHead className="w-[20%]">Sender</TableHead>
                      <TableHead className="w-[15%]">Type</TableHead>
                      <TableHead className="w-[15%]">Attachments</TableHead>
                      <TableHead className="w-[10%] text-right">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMessages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-64">
                          <div className="flex flex-col items-center justify-center text-center">
                            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                              No messages found
                            </h3>
                            <p className="text-muted-foreground">
                              Try adjusting your search query
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMessages.map((message) => (
                        <TableRow
                          key={message.id}
                          className="hover:bg-muted/50"
                        >
                          {/* Message Content */}
                          <TableCell className="py-4">
                            {message.content ? (
                              <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                                {message.content}
                              </p>
                            ) : (
                              <span className="text-sm text-muted-foreground italic flex items-center gap-2">
                                <Paperclip className="h-3 w-3" />
                                Attachment only
                              </span>
                            )}
                          </TableCell>

                          {/* Sender */}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border border-border">
                                <AvatarImage
                                  src={message.sender.avatar}
                                  alt={message.sender.name}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                  {message.sender.name
                                    ?.charAt(0)
                                    ?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {message.sender.name}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Chat Type */}
                          <TableCell>
                            <Badge
                              variant={
                                message.groupChat ? "default" : "secondary"
                              }
                              className="gap-1"
                            >
                              {message.groupChat ? (
                                <>
                                  <Users className="h-3 w-3" />
                                  Group
                                </>
                              ) : (
                                <>
                                  <User className="h-3 w-3" />
                                  Direct
                                </>
                              )}
                            </Badge>
                          </TableCell>

                          {/* Attachments */}
                          <TableCell>
                            {message.attachments?.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {message.attachments.map(
                                  (attachment, index) => {
                                    const fileType = fileFormat(attachment.url);
                                    return (
                                      <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-2 gap-1"
                                        asChild
                                      >
                                        <a
                                          href={attachment.url}
                                          download
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {getAttachmentIcon(fileType)}
                                          <span className="text-xs">
                                            {fileType}
                                          </span>
                                          <Download className="h-3 w-3" />
                                        </a>
                                      </Button>
                                    );
                                  }
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                —
                              </span>
                            )}
                          </TableCell>

                          {/* Time */}
                          <TableCell className="text-right">
                            <div className="text-xs text-muted-foreground">
                              <p className="font-medium">
                                {message.createdAtRelative}
                              </p>
                              <p className="text-xs">
                                {moment(message.createdAt).format("MMM DD")}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

// ✅ STAT CARD COMPONENT
const StatCard = ({ title, value, icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    green: "bg-green-500/10 text-green-600 dark:text-green-400",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2 text-foreground">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageManagement;
