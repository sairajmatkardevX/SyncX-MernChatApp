import { useFetchData } from "../../hooks/hook";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/layouts/AdminLayout";
import { server } from "../../constants/config";
import { useErrors } from "../../hooks/hook";
import { transformImage } from "../../lib/features";
import {
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../../redux/api/api";
import { useToast } from "@/hooks/use-toast";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Users,
  User,
  Users2,
  MessageSquare,
  Edit,
  Trash2,
  Search,
  Loader2,
} from "lucide-react";

const UserManagement = () => {
  const { loading, data, error, refetch } = useFetchData(
    `${server}/api/v1/admin/users`,
    "dashboard-users"
  );
  const { toast } = useToast();

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  useErrors([{ isError: error, error: error }]);

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    bio: "",
  });

  useEffect(() => {
    if (data) {
      setUsers(
        data.users.map((user) => ({
          ...user,
          id: user._id,
          avatar: transformImage(user.avatar, 50),
        }))
      );
    }
  }, [data]);

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      username: user.username,
      bio: user.bio || "",
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      const res = await updateUser({
        userId: selectedUser.id,
        data: editForm,
      }).unwrap();

      setUsers(
        users.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                name: editForm.name,
                username: editForm.username,
                bio: editForm.bio,
              }
            : u
        )
      );

      toast({
        title: "Success",
        description: res.message || "User updated successfully",
      });

      setEditDialogOpen(false);
      setTimeout(() => refetch(), 100);
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    try {
      const res = await deleteUser(selectedUser.id).unwrap();

      setUsers(users.filter((u) => u.id !== selectedUser.id));

      toast({
        title: "Success",
        description: res.message || "User deleted successfully",
      });

      setDeleteDialogOpen(false);
      setTimeout(() => refetch(), 100);
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users</h1>
            <p className="text-muted-foreground mt-1">
              Manage all registered users
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {!loading && users.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value={users.length}
              icon={<Users className="h-4 w-4" />}
              color="blue"
            />
            <StatCard
              title="Total Friends"
              value={users.reduce((acc, user) => acc + (user.friends || 0), 0)}
              icon={<User className="h-4 w-4" />}
              color="green"
            />
            <StatCard
              title="Total Groups"
              value={users.reduce((acc, user) => acc + (user.groups || 0), 0)}
              icon={<Users2 className="h-4 w-4" />}
              color="purple"
            />
            <StatCard
              title="Avg Friends/User"
              value={
                Math.round(
                  users.reduce((acc, user) => acc + (user.friends || 0), 0) /
                    users.length
                ) || 0
              }
              icon={<MessageSquare className="h-4 w-4" />}
              color="orange"
            />
          </div>
        )}

        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Users
                {searchQuery && (
                  <Badge variant="secondary">
                    {filteredUsers.length} results
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Manage user accounts and view their statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <div className="min-w-full">
                <Table className="w-full">
                  <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur">
                    <TableRow>
                      <TableHead className="min-w-max">User</TableHead>
                      <TableHead className="min-w-max">Username</TableHead>
                      <TableHead className="min-w-max text-center">
                        Friends
                      </TableHead>
                      <TableHead className="min-w-max text-center">
                        Groups
                      </TableHead>
                      <TableHead className="min-w-max text-right px-8">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-64">
                          <div className="flex flex-col items-center justify-center text-center">
                            <Users className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                              {searchQuery ? "No users found" : "No users yet"}
                            </h3>
                            <p className="text-muted-foreground">
                              {searchQuery
                                ? "Try adjusting your search query"
                                : "Users will appear here once registered"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/50">
                          <TableCell className="py-4 w-32">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border border-border">
                                <AvatarImage
                                  src={user.avatar}
                                  alt={user.name}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                  {user.name?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-foreground truncate">
                                  {user.name}
                                </p>
                                {user.bio && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {user.bio}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="w-28">
                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono whitespace-nowrap">
                              @{user.username}
                            </code>
                          </TableCell>

                          <TableCell className="w-20 text-center">
                            <Badge variant="outline" className="gap-1">
                              <User className="h-3 w-3" />
                              {user.friends || 0}
                            </Badge>
                          </TableCell>

                          <TableCell className="w-20 text-center">
                            <Badge variant="outline" className="gap-1">
                              <Users2 className="h-3 w-3" />
                              {user.groups || 0}
                            </Badge>
                          </TableCell>

                          <TableCell className="flex-1 text-right pr-4">
                            <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                      onClick={() => handleEditClick(user)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit user</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={() => handleDeleteClick(user)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete user</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="Enter name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                  placeholder="Enter bio"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} disabled={isUpdating}>
                {isUpdating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete{" "}
                <span className="font-semibold text-foreground">
                  {selectedUser?.name}
                </span>
                's account and remove them from all chats. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

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

export default UserManagement;
