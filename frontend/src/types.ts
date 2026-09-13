export type Role = 'admin' | 'manager' | 'member';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner: User;
  tasks?: Task[];
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  project?: Project;
  assignee: User | null;
  createdAt: string;
}