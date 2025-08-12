export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: Date;
  mentions: string[];
}

export interface Card {
  id: string;
  title: string;
  description: string;
  assignedUsers: User[];
  comments: Comment[];
}
