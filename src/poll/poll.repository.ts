import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Poll } from 'src/shared';
import {
  AddNominationData,
  AddParticipantData,
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
    const initialPoll: Prisma.PollCreateInput = {
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

  async getPoll(pollID: string): Promise<PollDBData> {
    this.logger.log(`Attempting to get poll with: ${pollID}`);

    try {
      const currentPoll = await this.prismaService.poll.findUnique({
        where: {
          id: pollID,
        },
        include: {
          participants: true,
        },
      });

      console.log('currentPoll', currentPoll);
      return currentPoll;
    } catch (error) {
      console.log('error', error);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async addParticipant({
    pollID,
    userID,
    name,
  }: AddParticipantData): Promise<PollDBData> {
    this.logger.log(
      `Attempting to add a participant with userID/name: ${userID}/${name} to pollID: ${pollID}`,
    );

    const initialParticipant: Prisma.ParticipantCreateInput = {
      id: userID,
      name,
      poll: { connect: { id: pollID } },
    };

    try {
      const existingParticipant =
        await this.prismaService.participant.findUnique({
          where: {
            id: userID,
          },
        });

      if (!existingParticipant) {
        await this.prismaService.participant.create({
          data: initialParticipant,
        });
      }

      return this.getPoll(pollID);
    } catch (error) {
      this.logger.error(
        `Failed to add a participant with userID/name: ${userID}/${name} to pollID: ${pollID}`,
        error,
      );
      throw new InternalServerErrorException(
        `Failed to add a participant with userID/name: ${userID}/${name} to pollID: ${pollID}`,
      );
    }
  }

  async removeParticipant(pollID: string, userID: string): Promise<PollDBData> {
    this.logger.log(`removing userID: ${userID} from poll: ${pollID}`);

    try {
      await this.prismaService.participant.delete({
        where: {
          id: userID,
        },
      });
      return this.getPoll(pollID);
    } catch (error) {
      this.logger.error(
        `Failed to remove userID: ${userID} from poll: ${pollID}`,
        error,
      );
      throw new InternalServerErrorException('Failed to remove participant');
    }
  }

  async addNomination({
    pollID,
    nominationID,
    nomination,
  }: AddNominationData): Promise<PollDBData> {
    const initialNomination: Prisma.NominationCreateInput = {
      id: nominationID,
      pollID,
      nominationUserID: nomination.userID,
      nominationText: nomination.text,
    };

    this.logger.log(
      `Attempting to add a nomination with nominationID/nomination: ${nominationID}/${nomination.text} to pollID: ${pollID}`,
    );

    try {
      await this.prismaService.nomination.create({
        data: initialNomination,
      });

      return this.getPoll(pollID);
    } catch (error) {
      this.logger.error(
        `Failed to add a nomination with nominationID/text: ${nominationID}/${nomination.text} to pollID: ${pollID}`,
        error,
      );
      throw new InternalServerErrorException(
        `Failed to add a nomination with nominationID/text: ${nominationID}/${nomination.text} to pollID: ${pollID}`,
      );
    }
  }

  async removeNomination(
    pollID: string,
    nominationID: string,
  ): Promise<PollDBData> {
    this.logger.log(
      `Removing nominationID: ${nominationID} from pollID: ${pollID}`,
    );

    try {
      await this.prismaService.nomination.delete({
        where: {
          id: nominationID,
        },
      });
      return this.getPoll(pollID);
    } catch (error) {
      this.logger.error(
        `Failed to remove nominationID: ${nominationID} from pollID: ${pollID}`,
        error,
      );

      throw new InternalServerErrorException(
        `Failed to remove nominationID: ${nominationID} from pollID: ${pollID}`,
      );
    }
  }
}
