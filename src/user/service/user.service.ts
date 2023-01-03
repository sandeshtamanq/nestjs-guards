import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, throwError } from 'rxjs';
import { AuthService } from 'src/auth/service/auth.service';
import { Like, Repository } from 'typeorm';
import { UserEntity } from '../models/entity/user.entity';
import { User } from '../models/interface/user.interface';
import { switchMap, map, catchError } from 'rxjs/operators';
import { UserDto } from '../dto/user.dot';
import { HttpException } from '@nestjs/common/exceptions';
import { HttpStatus } from '@nestjs/common/enums';
import { Pagination } from 'nestjs-typeorm-paginate';
import { IPaginationOptions } from 'nestjs-typeorm-paginate/dist/interfaces';
import { paginate } from 'nestjs-typeorm-paginate/dist/paginate';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  //User Registration
  create(user: User): Observable<User> {
    return this.authService.hashPassword(user.password).pipe(
      switchMap((passwordHashed: string) => {
        const newUser = new UserEntity();
        newUser.email = user.email;
        newUser.password = passwordHashed;
        newUser.username = user.username;
        newUser.name = user.name;

        return from(this.userRepository.save(newUser)).pipe(
          map((user: User) => {
            const { password, ...result } = user;
            return result;
          }),
          catchError((err) => throwError(() => new Error(err))),
        );
      }),
    );
  }

  // Returns all the users
  getAll(): Observable<User[]> {
    return from(this.userRepository.find()).pipe(
      map((users: User[]) => {
        users.forEach((v) => {
          delete v.password;
        });
        return users;
      }),
    );
  }

  // Pagination
  paginate(options: IPaginationOptions): Observable<Pagination<User>> {
    return from(paginate<User>(this.userRepository, options)).pipe(
      map((userPagable: Pagination<User>) => {
        console.log(options);
        userPagable.items.forEach(function (v: User) {
          delete v.password;
        });
        return userPagable;
      }),
    );
  }

  // Filter by username
  paginateFilterByUsername(
    options: IPaginationOptions,
    user: string,
  ): Observable<Pagination<User>> {
    const { limit, page, route } = options;
    return from(
      this.userRepository.findAndCount({
        skip: Number(page) * Number(limit) || 0,
        take: Number(limit) || 10,
        order: { id: 'ASC' },
        select: ['id', 'email', 'username', 'name', 'role'],
        where: [{ username: Like(`%${user}%`) }],
      }),
    ).pipe(
      map(([users, totalUsers]) => {
        const userPagable: Pagination<User> = {
          items: users,
          links: {
            first: route + `?limit=${limit}`,
            previous: route + ``,
            next: route + `?limit=${limit}&page=${Number(page) + 1}`,
            last:
              route +
              `?limit=${limit}&page=${Math.ceil(totalUsers / Number(limit))}`,
          },
          meta: {
            currentPage: Number(page),
            itemCount: users.length,
            itemsPerPage: Number(limit),
            totalItems: totalUsers,
            totalPages: Math.ceil(totalUsers / Number(limit)),
          },
        };
        return userPagable;
      }),
    );
  }

  // Update the user
  async update(id: number, user: User): Promise<any> {
    delete user.email;
    delete user.password;
    delete user.role;
    await this.userRepository.update(id, user);
    const updatedUser: User = await this.userRepository.findOne({
      where: { id },
    });
    const { password, ...result } = updatedUser;
    return result;
  }

  // Delete One User
  delete(id: number): Observable<any> {
    return from(this.userRepository.delete(id));
  }

  // User Login
  async login(userDto: UserDto): Promise<string> {
    const user: User = await this.validateUser(userDto.email, userDto.password);

    return this.validateUser(userDto.email, userDto.password).then(
      (user: User) => {
        if (user) {
          return this.authService.generateJwt(user);
        } else {
          return 'Wrong Credentials';
        }
      },
    );
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user: User = await this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'name',
        'username',
        'role',
        'profileImage',
      ],
    });
    if (user) {
      const match = await this.authService.comparePassword(
        password,
        user.password,
      );
      if (match) {
        const { password, ...result } = user;
        return result;
      }
    }
    throw new HttpException('Invalid email or password', HttpStatus.FORBIDDEN);
  }

  async findOne(email: string): Promise<User> {
    const user: User = await this.userRepository.findOne({ where: { email } });
    const { password, ...result } = user;
    return result;
  }
}
