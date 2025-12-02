import { Suspense, lazy, memo, useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LayoutLoader } from "../components/layouts/Loaders";
import { useDispatch, useSelector } from "react-redux";
import { useAsyncMutation, useErrors } from "../hooks/hook";
import {
  useChatDetailsQuery,
  useMyChatsQuery,
  useRemoveGroupMemberMutation,
  useDeleteGroupMutation,
  useRenameGroupMutation,
  useLeaveGroupMutation,
} from "../redux/api/api";
import { X } from "lucide-react";
import { setIsAddMember } from "../redux/reducers/misc";
import {
  openGroupSettings,
  openManageMembers,
  openConfirmLeave,
  openConfirmDelete,
  setSelectedGroup,
} from "../redux/reducers/chat";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Trash2,
  Edit,
  Check,
  ArrowLeft,
  Menu,
  Users,
  UserPlus,
  MessageSquare,
  Crown,
  LogOut,
  MoreVertical,
  Pencil,
} from "lucide-react";

const GroupSettingsDialog = lazy(() =>
  import("../components/dialogs/GroupSettingsDialog")
);
const ManageMembersDialog = lazy(() =>
  import("../components/dialogs/ManageMembersDialog")
);
const ConfirmLeaveGroupDialog = lazy(() =>
  import("../components/dialogs/ConfirmLeaveGroup")
);
const ConfirmDeleteGroupDialog = lazy(() =>
  import("../components/dialogs/ConfirmDeleteGroupDialog")
);
const AddMemberDialog = lazy(() =>
  import("../components/dialogs/AddMemberDialog")
);

const Groups = () => {
  const chatId = useSearchParams()[0].get("group");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAddMember } = useSelector((state) => state.misc);
  const { user } = useSelector((state) => state.auth);
  const { modals, selectedGroup } = useSelector((state) => state.chat);

  const myChats = useMyChatsQuery("");
  const myGroups = useMemo(() => {
    const groups = myChats.data?.chats?.filter((chat) => chat.groupChat) || [];
    return groups;
  }, [myChats.data]);

  const groupDetails = useChatDetailsQuery(
    { chatId, populate: true },
    { skip: !chatId }
  );

  const [updateGroup, isLoadingGroupName] = useAsyncMutation(
    useRenameGroupMutation
  );
  const [removeMember, isLoadingRemoveMember] = useAsyncMutation(
    useRemoveGroupMemberMutation
  );
  const [deleteGroup, isLoadingDeleteGroup] = useAsyncMutation(
    useDeleteGroupMutation
  );
  const [leaveGroup, isLoadingLeaveGroup] = useAsyncMutation(
    useLeaveGroupMutation
  );

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupNameUpdatedValue, setGroupNameUpdatedValue] = useState("");
  const [members, setMembers] = useState([]);

  const errors = [
    { isError: myChats.isError, error: myChats.error },
    { isError: groupDetails.isError, error: groupDetails.error },
  ];

  useErrors(errors);

  const isGroupAdmin = useMemo(() => {
    if (!chatId || !groupDetails.data) return false;
    return groupDetails.data.chat.groupAdmin._id === user._id;
  }, [chatId, groupDetails.data, user._id]);

  const isOnlyAdmin = useMemo(() => {
    if (!isGroupAdmin || !members.length) return false;
    const otherMembers = members.filter((m) => m._id !== user._id);
    return otherMembers.length === 0;
  }, [isGroupAdmin, members, user._id]);

  useEffect(() => {
    if (chatId) {
      const currentGroup = myGroups.find((group) => group._id === chatId);
      if (currentGroup) {
        setGroupName(currentGroup.name);
        setGroupNameUpdatedValue(currentGroup.name);
      }
    }
  }, [chatId, myGroups]);

  useEffect(() => {
    const groupData = groupDetails.data;
    if (groupData) {
      setMembers(groupData.chat.members);
      dispatch(
        setSelectedGroup({
          _id: groupData.chat._id,
          name: groupData.chat.name,
          groupAdmin: groupData.chat.groupAdmin,
          members: groupData.chat.members,
          groupImage: groupData.chat.groupImage,
          groupDescription: groupData.chat.groupDescription,
        })
      );
    }
  }, [groupDetails.data, dispatch]);

  const navigateBack = () => navigate("/");
  const handleMobile = () => setIsMobileMenuOpen((prev) => !prev);
  const handleMobileClose = () => setIsMobileMenuOpen(false);

  const updateGroupName = () => {
    setIsEdit(false);
    updateGroup("Updating Group Name...", {
      chatId,
      name: groupNameUpdatedValue,
    });
  };

  const handleEditGroup = () => {
    dispatch(openGroupSettings(chatId));
  };

  const handleManageMembers = () => {
    dispatch(openManageMembers(chatId));
  };

  const handleLeaveGroup = () => {
    dispatch(openConfirmLeave({ groupId: chatId, isOnlyAdmin }));
  };

  const handleDeleteGroup = () => {
    dispatch(openConfirmDelete(chatId));
  };

  const handleOpenAddMember = () => {
    dispatch(setIsAddMember(true));
  };

  const removeMemberHandler = (userId) => {
    removeMember("Removing Member...", { chatId, userId });
  };

  return myChats.isLoading ? (
    <LayoutLoader />
  ) : (
    <div className="flex h-screen bg-gradient-to-br from-background to-background/80">
      {/* Groups List Sidebar */}
      <div className="hidden md:block w-80 bg-sidebar/95 backdrop-blur-sm border-r border-border/50">
        <div className="h-16 border-b border-border/50 flex items-center px-6">
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            My Groups
          </h1>
        </div>
        <GroupsList myGroups={myGroups} chatId={chatId} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={navigateBack}
                    className="hover:bg-accent"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Back to Chats</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Group Management
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your group chats
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleMobile}
            className="md:hidden hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {chatId ? (
              <>
                {/* Group Header Card */}
                <Card className="bg-gradient-to-r from-card to-card/80 border-border/50 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/20">
                          <AvatarImage
                            src={
                              selectedGroup?.groupImage?.url ||
                              myGroups.find((g) => g._id === chatId)?.avatar
                            }
                          />
                          <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                            {groupName?.charAt(0)?.toUpperCase() || "G"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            {isEdit ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={groupNameUpdatedValue}
                                  onChange={(e) =>
                                    setGroupNameUpdatedValue(e.target.value)
                                  }
                                  placeholder="Enter group name"
                                  className="bg-background border-border"
                                />
                                <Button
                                  onClick={updateGroupName}
                                  disabled={isLoadingGroupName}
                                  size="icon"
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-foreground">
                                  {groupName}
                                </h2>
                                {isGroupAdmin && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={isLoadingGroupName}
                                    onClick={() => setIsEdit(true)}
                                    className="text-muted-foreground hover:text-foreground hover:bg-accent"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {members.length} members
                            </span>
                            <span>•</span>
                            {isGroupAdmin && (
                              <span className="flex items-center gap-1 text-amber-600">
                                <Crown className="h-4 w-4" />
                                You are admin
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Menu */}
                      {isGroupAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleEditGroup}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Group
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleManageMembers}>
                              <Users className="h-4 w-4 mr-2" />
                              Manage Members
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={handleDeleteGroup}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Group
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Members Section */}
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-4 flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-primary" />
                      Group Members ({members.length})
                    </CardTitle>
                    {isGroupAdmin && (
                      <Button
                        size="sm"
                        onClick={handleManageMembers}
                        variant="outline"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {isLoadingRemoveMember ? (
                          <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                              <Skeleton
                                key={i}
                                className="h-16 w-full bg-muted/50"
                              />
                            ))}
                          </div>
                        ) : members.length > 0 ? (
                          members.map((member) => (
                            <div
                              key={member._id}
                              className="flex items-center justify-between p-3 bg-accent/50 rounded-lg border border-border/50"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={member.avatar?.url} />
                                  <AvatarFallback>
                                    {member.name?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{member.name}</p>
                                  {selectedGroup?.groupAdmin?._id ===
                                    member._id && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs mt-1"
                                    >
                                      <Crown className="h-3 w-3 mr-1" />
                                      Admin
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {isGroupAdmin &&
                                selectedGroup?.groupAdmin?._id !==
                                  member._id && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      removeMemberHandler(member._id)
                                    }
                                    disabled={isLoadingRemoveMember}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">
                              No members yet
                            </p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {isGroupAdmin ? (
                    <>
                      <Button
                        size="lg"
                        onClick={handleEditGroup}
                        className="flex-1 h-12"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Group
                      </Button>
                      <Button
                        size="lg"
                        onClick={handleManageMembers}
                        className="flex-1 h-12"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Manage Members
                      </Button>
                      <Button
                        variant="destructive"
                        size="lg"
                        onClick={handleDeleteGroup}
                        disabled={isLoadingDeleteGroup}
                        className="flex-1 h-12"
                      >
                        {isLoadingDeleteGroup ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Group
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={handleLeaveGroup}
                      disabled={isLoadingLeaveGroup}
                      className="w-full h-12"
                    >
                      {isLoadingLeaveGroup ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                          Leaving...
                        </>
                      ) : (
                        <>
                          <LogOut className="mr-2 h-4 w-4" />
                          Leave Group
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </>
            ) : (
              /* Empty State */
              <Card className="text-center border-border/50 shadow-sm">
                <CardContent className="p-12">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Group Selected
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Select a group from the sidebar to manage its settings and
                    members
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={handleMobileClose}>
        <SheetContent
          side="left"
          className="w-80 p-0 bg-sidebar/95 backdrop-blur-sm border-r border-border/50"
        >
          <div className="h-16 border-b border-border/50 flex items-center px-6">
            <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              My Groups
            </h1>
          </div>
          <GroupsList myGroups={myGroups} chatId={chatId} />
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      <Suspense
        fallback={
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        }
      >
        <GroupSettingsDialog />
        <ManageMembersDialog />
        <ConfirmLeaveGroupDialog />
        <ConfirmDeleteGroupDialog />
        {isAddMember && <AddMemberDialog chatId={chatId} />}
      </Suspense>
    </div>
  );
};

// GroupsList Component
const GroupsList = ({ myGroups = [], chatId }) => (
  <ScrollArea className="h-[calc(100vh-4rem)]">
    <div className="p-4 space-y-2">
      {myGroups.length > 0 ? (
        myGroups.map((group) => (
          <GroupListItem group={group} chatId={chatId} key={group._id} />
        ))
      ) : (
        <Card className="border-border/50 bg-card/50 text-center p-8">
          <CardContent className="p-0">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground mb-1">
              No groups yet
            </p>
            <p className="text-xs text-muted-foreground">
              Create your first group to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  </ScrollArea>
);

// GroupListItem Component
const GroupListItem = memo(({ group, chatId }) => {
  const { name, avatar, _id } = group;
  const navigate = useNavigate();
  const isActive = chatId === _id;

  const handleClick = () => {
    if (!isActive) {
      navigate(`/groups?group=${_id}`);
    }
  };

  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      onClick={handleClick}
      className={`w-full justify-start p-4 h-auto transition-all duration-200 ${
        isActive
          ? "bg-primary/10 text-foreground border border-primary/20 shadow-sm"
          : "text-foreground hover:bg-accent hover:text-foreground border border-transparent"
      }`}
    >
      <div className="flex items-center gap-3 w-full">
        <Avatar className="h-10 w-10 flex-shrink-0 border border-border/50">
          <AvatarImage src={avatar} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {name?.charAt(0)?.toUpperCase() || "G"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 text-left">
          <p className="font-medium truncate">{name}</p>
        </div>
        {isActive && (
          <Badge
            variant="default"
            className="ml-auto flex-shrink-0 bg-primary text-primary-foreground"
          >
            Active
          </Badge>
        )}
      </div>
    </Button>
  );
});

GroupListItem.displayName = "GroupListItem";

export default Groups;
