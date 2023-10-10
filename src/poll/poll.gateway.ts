import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { PollService } from './poll.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PollGateway {
  constructor(private readonly pollService: PollService) {}
}
