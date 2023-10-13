import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsUnauthorizedException } from 'src/poll/exceptions/ws-exceptions';
import { PollService } from 'src/poll/poll.service';
import { AuthPayload, SocketWithAuth } from 'src/shared/interfaces';

@Injectable()
export class GatewayAdminGuard implements CanActivate {
  private readonly logger = new Logger(GatewayAdminGuard.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private pollService: PollService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket: SocketWithAuth = context.switchToWs().getClient();

    const token =
      socket.handshake.auth.token || socket.handshake.headers['token'];

    const secret = this.configService.get('JWT_SECRET');

    if (!token) {
      this.logger.error('No authorization token provided');
      throw new WsUnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify<AuthPayload & { sub: string }>(
        token,
        {
          secret,
        },
      );

      this.logger.debug(`Validating admin using token payload`, payload);

      const { sub, pollID } = payload;

      const poll = await this.pollService.getPoll(pollID);

      if (sub !== poll.adminID) {
        throw new WsUnauthorizedException('Admin privileges required');
      }

      return true;
    } catch (error) {
      this.logger.debug('Admin privileges required', error);
      throw new WsUnauthorizedException('Admin privileges required');
    }
  }
}
