import { User } from 'src/user/models/interface/user.interface';

export interface Blog {
  id?: number;
  title?: string;
  slug?: string;
  description?: string;
  body?: string;
  createdAt?: Date;
  updateAt?: Date;
  likes?: number;
  author?: User;
  headerImage?: string;
  publishedDate?: Date;
  isPublished?: boolean;
}
