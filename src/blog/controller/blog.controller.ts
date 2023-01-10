import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path = require('path');
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/user/models/interface/user.interface';
import { BlogDto } from '../dto/blog.dto';
import { UpdateBlogDto } from '../dto/updateBlog.dto';
import { UserIsAuthorGuard } from '../guard/verify-user.guard';
import { Blog } from '../models/interface/blog.interface';
import { BlogService } from '../service/blog.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  // @Get()
  // getBlogs(@Query('userId') userId: number): Promise<Blog[]> {
  //   if (userId === undefined) {
  //     return this.blogService.getAllBlogs();
  //   } else {
  //     return this.blogService.getByUser(Number(userId));
  //   }
  // }

  @Get()
  index(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    limit = limit > 100 ? 100 : limit;
    return this.blogService.paginate({
      page,
      limit,
      route: 'http://localhost:3000/blog',
    });
  }

  @Get('user/:userId')
  indexByUser(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    limit = limit > 100 ? 100 : limit;
    return this.blogService.paginateByUser(
      {
        page,
        limit,
        route: 'http://localhost:3000/blog',
      },
      userId,
    );
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('headerImage', {
      storage: diskStorage({
        destination: './uploads/blogImages',
        filename: (req, file, cb) => {
          const filename: string =
            path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
          const extension: string = path.parse(file.originalname).ext;

          cb(null, `${filename}${extension}`);
        },
      }),
    }),
  )
  @UseGuards(new JwtAuthGuard())
  createBlog(
    @UploadedFile() file,
    @Body() blogDto: BlogDto,
    @GetUser() user: User,
  ): Promise<Blog> {
    blogDto.headerImage = file.filename;
    return this.blogService.createBlog(user, blogDto);
  }

  @Get(':slug')
  findOneBlog(@Param('slug') slug: string): Promise<Blog | void> {
    return this.blogService.findOneBlog(slug);
  }

  @Put(':id')
  @UseGuards(new JwtAuthGuard(), UserIsAuthorGuard)
  updateBlog(
    @Param('id', ParseIntPipe) blogId: number,
    @Body() updateBlogDto: UpdateBlogDto,
  ): Promise<Blog> {
    return this.blogService.updateBlog(blogId, updateBlogDto);
  }

  @Delete(':slug')
  @UseGuards(new JwtAuthGuard(), UserIsAuthorGuard)
  deleteBlog(@Param('slug') slug: string) {
    return this.blogService.deleteBlog(slug);
  }
}
