import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
// import { RequestWithAuth } from 'src/poll/interfaces';

@Injectable()
export class PollAuthGuard implements CanActivate {
  private readonly logger = new Logger(PollAuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // RequestWithAuth
    const request = context.switchToHttp().getRequest();
    this.logger.debug(`Checking for auth token on request body`, request.body);

    const { accessToken } = request.body;
    const secret = this.configService.get('JWT_SECRET');

    try {
      const payload = this.jwtService.verify(accessToken, {
        secret,
      });
      // verifies token and turns it into JS object
      // add details to the request
      request.userID = payload.sub;
      request.pollID = payload.pollID;
      request.name = payload.name;

      return true;
    } catch (error) {
      console.error('JWT verification error:', error);
      throw new ForbiddenException('Invalid Authorization Token');
    }
  }
}
