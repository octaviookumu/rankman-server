import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { SocketWithAuth } from 'src/shared/interfaces';
import { ServerOptions, Server } from 'socket.io';

export class SocketIOAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIOAdapter.name);
  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: any) {
    const clientPort = parseInt(this.configService.get<string>('CLIENT_PORT'));

    const cors = {
      origin: [
        `http://localhost:${clientPort}`,
        new RegExp(`/^http:\/\/192\.168\.1\.([1-9]|[1-9]\d):${clientPort}$/`),
      ],
    };

    this.logger.log('Configuring SocketIO server with custom CORS options', {
      cors,
    });

    const optionsWithCORS: ServerOptions = {
      ...options,
      cors,
    };

    const jwtService = this.app.get(JwtService);

    // we need to return this, even though the signature says it returns void
    const server: Server = super.createIOServer(port, optionsWithCORS);

    // get access to authorization before connecting
    server
      .of('poll')
      .use(createTokenMiddleware(jwtService, this.logger, this.configService));
    return server;
  }
}

// Gets authorization before one connects
// Wasn't able to add guards to handleConnect and handleDisconnect
const createTokenMiddleware =
  (jwtService: JwtService, logger: Logger, configService: ConfigService) =>
  (socket: SocketWithAuth, next) => {
    // for Postman testing support, fallback to token header
    const token =
      socket.handshake.auth.token || socket.handshake.headers['token'];

    logger.debug(`Validating auth token before connection: ${token}`);

    const secret = configService.get('JWT_SECRET');

    try {
      const payload = jwtService.verify(token, {
        secret,
      });
      socket.userID = payload.sub;
      socket.pollID = payload.pollID;
      socket.name = payload.name;
      next();
    } catch (e) {
      console.log('e', e);
      next(new Error('FORBIDDEN'));
    }
  };
