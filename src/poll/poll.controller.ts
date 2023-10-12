import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PollAuthGuard } from 'src/auth/poll-auth.guard';
import { RequestWithAuth } from 'src/shared/interfaces';
import { CreatePollDto } from './dto/create-poll.dto';
import { JoinPollDto } from './dto/join-poll.dto';
import { PollService } from './poll.service';

@UsePipes(new ValidationPipe())
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

  @UseGuards(PollAuthGuard)
  @Post('/rejoin')
  async rejoinPoll(@Req() request: RequestWithAuth) {
    const { name, userID, pollID } = request;
    const result = this.pollService.rejoinPoll({
      name,
      pollID,
      userID,
    });

    return result;
  }
}
