import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { from, map, Observable } from 'rxjs';
import { User } from 'src/user/models/interface/user.interface';
import { UserService } from 'src/user/service/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(UserService) private userService: UserService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return from(this.userService.findOne(user.email)).pipe(
      map((user: User) => {
        const hasRoles = () => requiredRoles.indexOf(user.role) > -1;
        let hasPermission = false;

        if (hasRoles()) {
          hasPermission = true;
        }

        return user && hasPermission;
      }),
    );
  }
}
