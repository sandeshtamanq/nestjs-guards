import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { UserEntity } from 'src/user/models/entity/user.entity';
import { User } from 'src/user/models/interface/user.interface';
import { Repository } from 'typeorm';
import { BlogEntity } from '../models/entity/blog.entity';
import { Blog } from '../models/interface/blog.interface';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
  ) {}

  createBlog(user: User, blogDto: Blog): Promise<Blog> {
    blogDto.author = user;
    blogDto.slug = this.generateSlug(blogDto.title);
    return this.blogRepository.save(blogDto);
  }

  getByUser(userId: number): Promise<Blog[]> {
    const query = this.blogRepository.createQueryBuilder('blog');
    query
      .where('blog.authorId = :userId', { userId })
      .leftJoinAndSelect('blog.author', 'author');
    return query.getMany();
  }

  async findOneBlog(slug: string): Promise<Blog> {
    const blog = await this.blogRepository.findOne({
      where: { slug },
      relations: ['author'],
    });

    if (blog === null) throw new HttpException('Blog not found', 204);

    return blog;
  }

  async updateBlog(id: number, updateBlogDto: Blog): Promise<Blog> {
    if (updateBlogDto.title) {
      updateBlogDto.slug = this.generateSlug(updateBlogDto.title);
    }
    await this.blogRepository.update(id, updateBlogDto);
    return this.blogRepository.findOne({
      where: { id },
      relations: ['author'],
    });
  }

  deleteBlog(slug: string) {
    return this.blogRepository.delete({ slug });
  }

  getAllBlogs(): Promise<Blog[]> {
    return this.blogRepository.find({ relations: ['author'] });
  }

  generateSlug(title: string): string {
    return slugify(title, { lower: true });
  }
}
