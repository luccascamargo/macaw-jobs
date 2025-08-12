"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useRef, useState } from "react";

interface User {
  id: string;
  name: string;
}

const users: User[] = [
  { id: "1", name: "Walter White" },
  { id: "2", name: "Jesse Pinkman" },
  { id: "3", name: "Saul Goodman" },
  { id: "4", name: "Skyler White" },
];

export function MentionsTextarea() {
  const [value, setValue] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionActive, setMentionActive] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const word = value.slice(0, cursorPosition).split(/\s/).pop() || "";
    if (word.startsWith("@")) {
      const q = word.slice(1).toLowerCase();
      setMentionQuery(q);
      setFilteredUsers(users.filter((u) => u.name.toLowerCase().includes(q)));
      setMentionActive(true);
    } else {
      setMentionActive(false);
      setMentionQuery("");
    }
    setHighlightIndex(0);
  }, [value, cursorPosition]);

  const handleSelect = (user: User) => {
    const before = value.slice(0, cursorPosition);
    const after = value.slice(cursorPosition);
    const updated = before.replace(/@\w*$/, `@${user.name}`) + " " + after;
    setValue(updated);

    // Move o cursor
    const newPos = before.replace(/@\w*$/, `@${user.name}`).length + 1;
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(newPos, newPos);
      setCursorPosition(newPos);
    }, 0);

    setMentionActive(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionActive) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((prev) => (prev + 1) % filteredUsers.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev === 0 ? filteredUsers.length - 1 : prev - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSelect(filteredUsers[highlightIndex]);
      } else if (e.key === "Escape") {
        setMentionActive(false);
      }
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <textarea
        ref={textareaRef}
        className="w-full min-h-[100px] p-2 border rounded resize-none"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setCursorPosition(e.target.selectionStart);
        }}
        onClick={(e) => {
          const target = e.target as HTMLTextAreaElement;
          setCursorPosition(target.selectionStart);
        }}
        onKeyUp={(e) => {
          setCursorPosition(e.currentTarget.selectionStart);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Digite algo com @ para mencionar alguém"
      />

      {mentionActive && filteredUsers.length > 0 && (
        <Select
          onValueChange={(userId) => {
            const user = users.find((u) => u.id === userId);
            if (user) handleSelect(user);
          }}
        >
          <SelectTrigger className="absolute left-0 top-1/2 mt-2 w-full z-40">
            <SelectValue placeholder="Selecione um usuário..." />
          </SelectTrigger>
          <SelectContent className="z-50">
            {filteredUsers.map((user, index) => (
              <SelectItem
                key={user.id}
                value={user.id}
                className={
                  index === highlightIndex
                    ? "bg-gray-100 font-bold cursor-pointer"
                    : "cursor-pointer"
                }
              >
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
