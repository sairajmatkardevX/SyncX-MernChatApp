import { useEffect } from "react";
import { useSelector } from "react-redux";
import { setIsDeleteMenu } from "../../redux/reducers/misc";
import { useNavigate } from "react-router-dom";
import { useAsyncMutation } from "../../hooks/hook";
import {
  useDeleteChatMutation,
  useLeaveGroupMutation,
} from "../../redux/api/api";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { LogOut, Trash2 } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const DeleteChatMenu = ({ dispatch, deleteMenuAnchor }) => {
  const navigate = useNavigate();

  const { isDeleteMenu, selectedDeleteChat } = useSelector(
    (state) => state.misc
  );

  const [deleteChat, , deleteChatData] = useAsyncMutation(useDeleteChatMutation);
  const [leaveGroup, , leaveGroupData] = useAsyncMutation(useLeaveGroupMutation);

  const isGroup = selectedDeleteChat.groupChat;

  const closeHandler = () => {
    dispatch(setIsDeleteMenu(false));
    deleteMenuAnchor.current = null;
  };

  const leaveGroupHandler = () => {
   
    closeHandler();
   
    leaveGroup("Leaving Group...", selectedDeleteChat.chatId);
  };

  const deleteChatHandler = () => {
    closeHandler();
    deleteChat("Deleting Chat...", selectedDeleteChat.chatId);
  };

  useEffect(() => {
    if (deleteChatData || leaveGroupData) {
    
      navigate("/");
    }
  }, [deleteChatData, leaveGroupData, navigate]);

  return (
    <DropdownMenu open={isDeleteMenu} onOpenChange={(open) => !open && closeHandler()}>
      <DropdownMenuContent
        align="end"
        className="w-48"
        ref={(ref) => {
          if (ref && deleteMenuAnchor.current) {
            const rect = deleteMenuAnchor.current.getBoundingClientRect();
            ref.style.position = 'fixed';
            ref.style.left = `${rect.left}px`;
            ref.style.top = `${rect.bottom}px`;
          }
        }}
      >
        <VisuallyHidden>Delete Chat Menu</VisuallyHidden>

        <DropdownMenuItem
          onClick={isGroup ? leaveGroupHandler : deleteChatHandler}
          className="cursor-pointer flex items-center gap-2 text-sm"
        >
          {isGroup ? (
            <>
              <LogOut className="h-4 w-4" />
              <span>Leave Group</span>
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              <span>Delete Chat</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DeleteChatMenu;
