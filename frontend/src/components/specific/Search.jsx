import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useLazySearchUserQuery,
  useSendFriendRequestMutation,
  useRemoveFriendMutation,
  useMyChatsQuery,
  useLazyGetUserByIdQuery,
} from "../../redux/api/api";
import { setIsSearch } from "../../redux/reducers/misc";
import UserItem from "../shared/UserItem";
import { toast } from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Search as SearchIcon,
  Loader2,
  Users,
  UserX,
  UserPlus,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

const getAvatarUrl = (avatar, name) => {
  if (avatar && typeof avatar === "string" && avatar !== "undefined") {
    return avatar;
  }
  const initials = name ? name.charAt(0).toUpperCase() : "U";
  return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff`;
};

const Search = () => {
  const { isSearch } = useSelector((state) => state.misc);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [searchUser, { isLoading: isSearching }] = useLazySearchUserQuery();
  const [sendFriendRequest] = useSendFriendRequestMutation();
  const [removeFriend, { isLoading: isRemovingFriend }] =
    useRemoveFriendMutation();
  const { data: myChatsData, refetch: refetchChats } = useMyChatsQuery("");
  const [getUserById] = useLazyGetUserByIdQuery();

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [sentRequests, setSentRequests] = useState(new Set());
  const [activeTab, setActiveTab] = useState("search");
  const [friendToRemove, setFriendToRemove] = useState(null);
  const [friendsWithDetails, setFriendsWithDetails] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  const friendIds = useMemo(() => {
    if (!myChatsData?.chats) return [];

    return myChatsData.chats
      .filter((chat) => !chat.groupChat)
      .map((chat) => {
        const friendId = chat.members?.find((member) => {
          const memberId = typeof member === "object" ? member._id : member;
          return memberId !== user._id;
        });

        return friendId
          ? {
              id: typeof friendId === "object" ? friendId._id : friendId,
              chatId: chat._id,
            }
          : null;
      })
      .filter(Boolean);
  }, [myChatsData, user._id]);

  // Fetch full friend details when friendIds change
  useEffect(() => {
    const fetchFriendDetails = async () => {
      if (friendIds.length === 0) {
        setFriendsWithDetails([]);
        return;
      }

      setLoadingFriends(true);
      try {
        const friendPromises = friendIds.map(async (friend) => {
          try {
            const { data } = await getUserById(friend.id);
            if (data?.user) {
              return {
                ...data.user,
                chatId: friend.chatId,
                _id: friend.id,
              };
            }
            return null;
          } catch (error) {
            console.error(`Failed to fetch user ${friend.id}:`, error);
            return null;
          }
        });

        const friends = await Promise.all(friendPromises);
        setFriendsWithDetails(friends.filter(Boolean));
      } catch (error) {
        console.error("Error fetching friend details:", error);
        toast.error("Failed to load friends");
      } finally {
        setLoadingFriends(false);
      }
    };

    if (activeTab === "friends") {
      fetchFriendDetails();
    }
  }, [friendIds, getUserById, activeTab]);

  const existingFriends = useMemo(() => {
    if (!myChatsData?.chats) return [];

    return myChatsData.chats
      .filter((chat) => !chat.groupChat)
      .map((chat) => {
        const friend = chat.members?.[0];
        return friend
          ? {
              ...friend,
              chatId: chat._id,
            }
          : null;
      })
      .filter(Boolean);
  }, [myChatsData]);

  const addFriendHandler = async (id) => {
    setLoadingUserId(id);
    try {
      await sendFriendRequest({ userId: id }).unwrap();
      toast.success("Friend request sent!");
      setSentRequests((prev) => new Set(prev.add(id)));
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send request");
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleRemoveFriendClick = (friend) => {
    setFriendToRemove({
      id: friend._id,
      name: friend.name,
      avatar: friend.avatar,
      chatId: friend.chatId,
    });
  };

  const confirmRemoveFriend = async () => {
    if (!friendToRemove) return;

    setLoadingUserId(friendToRemove.id);

    try {
      const response = await removeFriend({
        friendId: friendToRemove.id,
      }).unwrap();
      console.log("✅ Remove friend response:", response);

      toast.success(`${friendToRemove.name} removed successfully!`);

      // Refetch chats to update the friends list
      await refetchChats();

      // Update local state immediately
      setFriendsWithDetails((prev) =>
        prev.filter((friend) => friend._id !== friendToRemove.id)
      );

      setFriendToRemove(null);
    } catch (error) {
      console.error("❌ Remove friend error:", error);
      toast.error(error?.data?.message || "Failed to remove friend");
    } finally {
      setLoadingUserId(null);
    }
  };

  const searchCloseHandler = () => {
    dispatch(setIsSearch(false));
    setSearch("");
    setUsers([]);
    setLoadingUserId(null);
    setActiveTab("search");
    setSentRequests(new Set());
    setFriendToRemove(null);
  };

  // ===== EFFECTS =====

  // Debounce search input
  useEffect(() => {
    const timeOutId = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timeOutId);
  }, [search]);

  // Perform search when debounced value changes
  useEffect(() => {
    if (debouncedSearch.trim() && activeTab === "search") {
      searchUser(debouncedSearch)
        .then(({ data }) => setUsers(data?.users || []))
        .catch((error) => {
          console.error("Search error:", error);
          toast.error("Failed to search users");
        });
    } else {
      setUsers([]);
    }
  }, [debouncedSearch, searchUser, activeTab]);

  return (
    <>
      {/* ===== MAIN SEARCH DIALOG ===== */}
      <Dialog
        open={isSearch}
        onOpenChange={(open) => !open && searchCloseHandler()}
      >
        <DialogContent className="sm:max-w-[450px] p-0 gap-0">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b border-border">
            <DialogTitle className="text-center text-card-foreground flex items-center justify-center gap-2">
              <Users className="h-5 w-5" />
              Manage Friends
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Connect with new people or manage existing friendships
            </DialogDescription>
          </DialogHeader>

          {/* Tabs */}
          <div className="px-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <SearchIcon className="h-4 w-4" />
                  Search
                </TabsTrigger>
                <TabsTrigger
                  value="friends"
                  className="flex items-center gap-2"
                >
                  <UserCheck className="h-4 w-4" />
                  Friends ({existingFriends.length})
                </TabsTrigger>
              </TabsList>

              {/* ===== SEARCH TAB - Find New Friends ===== */}
              <TabsContent value="search" className="space-y-4 mt-2">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-background"
                    autoFocus
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>

                <ScrollArea className="h-80">
                  <div className="space-y-3 pr-4 pb-4">
                    {users.length > 0 ? (
                      users.map((user) => (
                        <UserItem
                          key={user._id}
                          user={user}
                          handler={addFriendHandler}
                          handlerIsLoading={loadingUserId === user._id}
                          isAdded={sentRequests.has(user._id)}
                          buttonText={
                            sentRequests.has(user._id)
                              ? "Request Sent"
                              : "Add Friend"
                          }
                          buttonVariant={
                            sentRequests.has(user._id) ? "secondary" : "default"
                          }
                          buttonIcon={
                            sentRequests.has(user._id) ? (
                              <UserCheck className="h-4 w-4" />
                            ) : (
                              <UserPlus className="h-4 w-4" />
                            )
                          }
                          disabled={sentRequests.has(user._id)}
                        />
                      ))
                    ) : search ? (
                      <div className="text-center py-12 text-muted-foreground">
                        {isSearching ? (
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span className="text-sm font-medium">
                              Searching users...
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            <Users className="h-12 w-12 opacity-50" />
                            <div>
                              <p className="text-sm font-medium mb-1">
                                No users found
                              </p>
                              <p className="text-xs">
                                Try searching with different keywords
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center gap-3">
                          <SearchIcon className="h-12 w-12 opacity-50" />
                          <div>
                            <p className="text-sm font-medium mb-1">
                              Search for users
                            </p>
                            <p className="text-xs">
                              Enter a name to find people to connect with
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* ===== FRIENDS TAB - Manage Existing Friends ===== */}
              <TabsContent value="friends" className="mt-2">
                <ScrollArea className="h-80">
                  <div className="space-y-3 pr-4 pb-4">
                    {loadingFriends ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="h-8 w-8 animate-spin" />
                          <span className="text-sm font-medium">
                            Loading friends...
                          </span>
                        </div>
                      </div>
                    ) : existingFriends.length > 0 ? (
                      existingFriends.map((friend) => (
                        <div
                          key={friend._id}
                          className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                        >
                          {/* Friend Info */}
                          <div className="flex items-center gap-3 flex-1">
                            <img
                              src={getAvatarUrl(friend.avatar, friend.name)}
                              alt={friend.name}
                              className="w-10 h-10 rounded-full object-cover border border-border"
                              onError={(e) => {
                                e.target.src = getAvatarUrl(null, friend.name);
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {friend.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {friend.username || "Friend"}
                              </p>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveFriendClick(friend)}
                            disabled={
                              loadingUserId === friend._id || isRemovingFriend
                            }
                            className="gap-2"
                          >
                            {loadingUserId === friend._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserX className="h-4 w-4" />
                            )}
                            Remove
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center gap-3">
                          <UserCheck className="h-12 w-12 opacity-50" />
                          <div>
                            <p className="text-sm font-medium mb-1">
                              No friends yet
                            </p>
                            <p className="text-xs">
                              Search for users and send friend requests to get
                              started
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab("search")}
                            className="mt-2"
                          >
                            <SearchIcon className="h-4 w-4 mr-2" />
                            Find Friends
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-muted/20">
            <Button
              variant="outline"
              className="w-full"
              onClick={searchCloseHandler}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== REMOVE FRIEND CONFIRMATION DIALOG ===== */}
      <AlertDialog
        open={!!friendToRemove}
        onOpenChange={(open) => !open && setFriendToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle>Remove Friend?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              {friendToRemove ? (
                <div className="space-y-3">
                  {/* Friend Avatar & Name */}
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <img
                      src={getAvatarUrl(
                        friendToRemove.avatar,
                        friendToRemove.name
                      )}
                      alt={friendToRemove.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-border"
                      onError={(e) => {
                        e.target.src = getAvatarUrl(null, friendToRemove.name);
                      }}
                    />
                    <div>
                      <p className="font-semibold text-foreground">
                        {friendToRemove.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Will be removed from your friends
                      </p>
                    </div>
                  </div>

                  <p className="text-sm">
                    Are you sure you want to remove this friend? This action
                    cannot be undone.
                  </p>
                </div>
              ) : (
                <p className="text-sm">Loading friend information...</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
            <p>
              💡 <strong>Note:</strong> Your chat history will be deleted
              permanently. You'll need to send a new friend request to
              reconnect.
            </p>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <AlertDialogCancel disabled={isRemovingFriend}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveFriend}
              disabled={isRemovingFriend}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRemovingFriend ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Remove Friend
                </>
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Search;
