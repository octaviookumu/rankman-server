import { Body, Controller, Post } from '@nestjs/common';
import { CreatePollDto } from './dto/create-poll.dto';
import { JoinPollDto } from './dto/join-poll.dto';
import { PollService } from './poll.service';

@Controller('poll')
export class PollController {
  constructor(private pollService: PollService) {}

  @Post('/create')
  async createPoll(@Body() createPollDto: CreatePollDto) {
    const result = await this.pollService.createPoll(createPollDto);
    return result;
  }

  @Post('/join')
  async joinPoll(@Body() joinPollDto: JoinPollDto) {
    const result = await this.pollService.joinPoll(joinPollDto);
    return result;
  }
}
