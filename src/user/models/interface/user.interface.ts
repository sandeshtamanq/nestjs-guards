import { Blog } from 'src/blog/models/interface/blog.interface';

export interface User {
  id?: number;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  profileImage?: string;
  blogs?: Blog[];
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}
