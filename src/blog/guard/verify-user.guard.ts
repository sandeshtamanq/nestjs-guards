import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { BlogService } from '../service/blog.service';

@Injectable()
export class UserIsAuthorGuard implements CanActivate {
  constructor(private blogService: BlogService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, params } = context.switchToHttp().getRequest();
    const blog = await this.blogService.findOneBlog(params.slug);

    return user.id === blog.author.id;
  }
}
