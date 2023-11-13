import { Module } from '@nestjs/common';
import { PollService } from './poll.service';
import { PollGateway } from './poll.gateway';
import { PollController } from './poll.controller';
import { PollRepository } from './poll.repository';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  providers: [PollService, PollRepository, PollGateway],
  controllers: [PollController],
})
export class PollModule {}
