import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

export class ValidateUser implements CanActivate {
  constructor() {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { user, params } = context.switchToHttp().getRequest();
    return user.id === parseInt(params.id);
  }
}
