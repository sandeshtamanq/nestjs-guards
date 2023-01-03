import {
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  Body,
  Delete,
  Param,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common/decorators';
import {
  DefaultValuePipe,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common/pipes';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Observable } from 'rxjs';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { hasRoles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserDto } from '../dto/user.dot';
import { User, UserRole } from '../models/interface/user.interface';
import { UserService } from '../service/user.service';
import { v4 as uuidv4 } from 'uuid';
// import path from 'path';
import path = require('path');
import { Response } from 'express';
import { join } from 'path';
import { ValidateUser } from 'src/auth/guards/validateUser.guard';
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  index(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(1), ParseIntPipe) limit: number = 1,
    @Query('username') username: string,
  ): Observable<Pagination<User>> {
    limit = limit > 100 ? 100 : limit;
    if (username === null || username === undefined) {
      return this.userService.paginate({
        page,
        limit,
        route: 'http://localhost:3000/user',
      });
    } else {
      return this.userService.paginateFilterByUsername(
        { page, limit, route: 'http://localhost:3000/user' },
        username,
      );
    }
  }

  @Post()
  @UsePipes(new ValidationPipe())
  createUser(@Body() userDto: UserDto): Observable<User> {
    return this.userService.create(userDto);
  }

  @Put(':id')
  @UseGuards(new JwtAuthGuard(), new ValidateUser())
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() userDto: UserDto,
  ): Promise<User> {
    return this.userService.update(id, userDto);
  }

  @Delete(':id')
  @UseGuards(new JwtAuthGuard(), new ValidateUser())
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(id);
  }

  @Post('login')
  async login(@Body() userDto: UserDto): Promise<Object> {
    const accessToken = await this.userService.login(userDto);
    return { access_token: accessToken };
  }

  @Post('upload')
  @UseGuards(new JwtAuthGuard())
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profileImages',
        filename: (req, file, cb) => {
          const filename: string =
            path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
          const extension: string = path.parse(file.originalname).ext;

          cb(null, `${filename}${extension}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file, @GetUser() user: User) {
    const userUpadate = await this.userService.update(user.id, {
      profileImage: file.filename,
    });
    return { profileImage: userUpadate.profileImage };
  }

  @Get('profile-image/:imagename')
  findProfileImage(
    @Param('imagename') imageName: string,
    @Res() res: Response,
  ) {
    return res.sendFile(
      join(process.cwd(), `uploads/profileImages/${imageName}`),
    );
  }
}
