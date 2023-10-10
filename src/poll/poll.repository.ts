import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Poll } from 'src/shared';
import {
  CreatePollData,
  JoinPollFields,
  PollDBData,
} from 'src/shared/interfaces';

@Injectable()
export class PollRepository {
  private logger = new Logger(PollRepository.name);

  constructor(private prismaService: PrismaService) {}

  async createPoll({
    votesPerVoter,
    topic,
    pollID,
    userID,
  }: CreatePollData): Promise<PollDBData> {
    const initialPoll: PollDBData = {
      id: pollID,
      topic,
      votesPerVoter,
      adminID: userID,
      hasStarted: false,
    };

    this.logger.log(`Creating new poll, ${topic}`, process.env.JWT_SECRET);

    try {
      this.logger.log(`Run try`);
      const createdPoll = await this.prismaService.poll.create({
        data: initialPoll,
      });

      this.logger.log(`Created poll with ID: ${createdPoll.id}`);
      return createdPoll;
    } catch (error) {
      this.logger.error(`Error creating poll: ${error.message}`);
    }
  }

  async joinPoll(fields: JoinPollFields) {
    return 'Join poll';
  }
}
