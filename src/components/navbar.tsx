import { useState } from "react";
import { useUsers, User } from "@/hooks/useUsers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLogout } from "@/hooks/useLogout";

interface NavbarProps {
  boardId: string;
  onAddColumn: () => void;
  onInviteUser: (userId: string) => void;
  boardUsers: User[];
}

export function Navbar({
  boardId,
  onAddColumn,
  onInviteUser,
  boardUsers,
}: NavbarProps) {
  const { data: users } = useUsers(boardId);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleInvite = () => {
    if (selectedUser) {
      onInviteUser(selectedUser);
      setSelectedUser(null); // Reset selection after inviting
    }
  };

  return (
    <nav className="p-4 flex justify-end items-center">
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1 overflow-hidden">
          {boardUsers.map((user) => (
            <Avatar
              key={user.id}
              className="h-8 w-8 border-2 border-primary text-sm"
            >
              <AvatarFallback>
                {`${getInitials(user.name)}${getInitials(user.lastname)}`}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        {users && users.length > 0 && (
          <>
            <Select onValueChange={setSelectedUser} value={selectedUser || ""}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Convidar usuário" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user: User) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleInvite} disabled={!selectedUser}>
              Convidar
            </Button>
          </>
        )}
        <Button onClick={onAddColumn}>+ Nova Coluna</Button>
      </div>
    </nav>
  );
}
