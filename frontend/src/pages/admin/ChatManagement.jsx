
import { useFetchData } from "../../hooks/hook";
import  { useEffect, useState } from "react";
import AdminLayout from "../../components/layouts/AdminLayout";
import { server } from "../../constants/config";
import { useErrors } from "../../hooks/hook";
import { transformImage } from "../../lib/features";


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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ChatManagement = () => {
  const { loading, data, error } = useFetchData(
    `${server}/api/v1/admin/chats`,
    "dashboard-chats"
  );

  useErrors([
    {
      isError: error,
      error: error,
    },
  ]);

  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (data) {
      setChats(
        data.chats.map((chat) => ({
          ...chat,
          id: chat._id,
          avatar: chat.avatar.map((img) => transformImage(img, 50)),
          members: chat.members.map((member) => transformImage(member.avatar, 50)),
          creator: {
            name: chat.creator.name,
            avatar: transformImage(chat.creator.avatar, 50),
          },
        }))
      );
    }
  }, [data]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chat Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage all group chats and their members
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Chats ({chats.length})</CardTitle>
              <CardDescription>
                Overview of all group chats in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chat</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>Created By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chats.map((chat) => (
                    <TableRow key={chat.id}>
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={chat.avatar[0]} alt={chat.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {chat.name?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{chat.name}</TableCell>
                      <TableCell>
                        <Badge variant={chat.groupChat ? "default" : "secondary"}>
                          {chat.groupChat ? "Group" : "Direct"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {chat.totalMembers}
                          </span>
                          <div className="flex -space-x-2">
                            {chat.members.slice(0, 3).map((avatar, index) => (
                              <Avatar key={index} className="h-6 w-6 border-2 border-white">
                                <AvatarImage src={avatar} />
                                <AvatarFallback className="text-xs">U</AvatarFallback>
                              </Avatar>
                            ))}
                            {chat.totalMembers > 3 && (
                              <div className="h-6 w-6 bg-gray-100 border-2 border-white rounded-full flex items-center justify-center">
                                <span className="text-xs text-gray-600">+{chat.totalMembers - 3}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {chat.totalMessages} messages
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={chat.creator.avatar} alt={chat.creator.name} />
                            <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                              {chat.creator.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{chat.creator.name}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {chats.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 dark:text-gray-500">
                    <p className="text-lg">No chats found</p>
                    <p className="text-sm">There are no chats in the system yet.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default ChatManagement;