import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AddNominationData,
  AddParticipantData,
  AddParticipantRankingsData,
  AddResultData,
  CreatePollData,
  FormattedNominations,
  FormattedRankings,
  Poll,
} from './interfaces';

@Injectable()
export class PollRepository {
  private logger = new Logger(PollRepository.name);

  constructor(private prismaService: PrismaService) {}

  async createPoll({
    votesPerVoter,
    topic,
    pollID,
    userID,
  }: CreatePollData): Promise<Poll> {
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

  async getPoll(pollID: string): Promise<Poll> {
    this.logger.log(`Attempting to get poll with: ${pollID}`);

    try {
      const currentPoll = await this.prismaService.poll.findUnique({
        where: {
          id: pollID,
        },
        include: {
          participants: true,
          nominations: true,
        },
      });

      console.log('currentPoll', currentPoll);

      return currentPoll;
    } catch (error) {
      console.log('error', error);
    }
  }

  async addParticipant({
    pollID,
    userID,
    name,
  }: AddParticipantData): Promise<Poll> {
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

  async removeParticipant(pollID: string, userID: string): Promise<Poll> {
    this.logger.log(`removing userID: ${userID} from poll: ${pollID}`);

    try {
      // Find and delete associated rankings
      await this.prismaService.ranking.deleteMany({
        where: {
          participantID: userID,
        },
      });

      // Now delete the participant
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
  }: AddNominationData): Promise<Poll> {
    // About connect: Prisma associates this new Nomination with the Poll record whose ID matches the pollID provided

    const initialNomination: Prisma.NominationCreateInput = {
      id: nominationID,
      nominationUserID: nomination.userID,
      nominationText: nomination.text,
      poll: {
        connect: {
          id: pollID,
        },
      },
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

  async removeNomination(pollID: string, nominationID: string): Promise<Poll> {
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

  async startPoll(pollID: string): Promise<Poll> {
    this.logger.log(`Setting hasStarted for poll: ${pollID}`);

    try {
      await this.prismaService.poll.update({
        where: {
          id: pollID,
        },
        data: {
          hasStarted: true,
        },
      });
      return this.getPoll(pollID);
    } catch (error) {}
  }

  async addParticipantRankings({
    pollID,
    userID,
    rankings,
  }: AddParticipantRankingsData): Promise<Poll> {
    this.logger.log(
      `Attempting to add rankings for userID/name: ${userID} to pollID: ${pollID}`,
      rankings,
    );

    const initialRanking: Prisma.RankingCreateInput = {
      pollID: pollID,
      participantRankings: rankings,
      participant: {
        connect: {
          id: userID,
        },
      },
    };

    try {
      await this.prismaService.ranking.create({
        data: initialRanking,
      });
      return this.getPoll(pollID);
    } catch (error) {}
  }

  async addResults(pollID: string, results: AddResultData[]): Promise<Poll> {
    this.logger.log(
      `Attempting to add results to results table`,
      JSON.stringify(results),
    );

    try {
      await this.prismaService.result.createMany({
        data: results.map((result) => ({
          nominationID: result.nominationID,
          nominationText: result.nominationText,
          score: result.score,
          pollID: pollID,
        })),
      });
      return this.getPoll(pollID);
    } catch (error) {
      this.logger.error(
        `Failed to add result for pollID: ${pollID}`,
        results,
        error,
      );

      throw new InternalServerErrorException(
        `Failed to add result for pollID: ${pollID}`,
      );
    }
  }

  async deletePoll(pollID: string): Promise<void> {
    this.logger.log(`Deleting poll: ${pollID}`);

    try {
      await this.prismaService.result.deleteMany({
        where: {
          pollID: pollID,
        },
      });

      await this.prismaService.nomination.deleteMany({
        where: {
          pollID: pollID,
        },
      });

      await this.prismaService.ranking.deleteMany({
        where: {
          pollID: pollID,
        },
      });

      await this.prismaService.participant.deleteMany({
        where: {
          pollID: pollID,
        },
      });

      await this.prismaService.poll.delete({
        where: {
          id: pollID,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to delete poll: ${pollID}`, error);

      throw new InternalServerErrorException(
        `Failed to delete poll: ${pollID}`,
      );
    }
  }

  async getRankings(pollID: string): Promise<FormattedRankings> {
    this.logger.log(`Get rankings of poll: ${pollID}`);

    try {
      const pollRankings = await this.prismaService.ranking.findMany({
        where: {
          pollID: pollID,
        },
        select: {
          participantID: true,
          participantRankings: true,
        },
      });

      const formattedRankings = pollRankings.reduce((result, item) => {
        result[item.participantID] = item.participantRankings;
        return result;
      }, {});
      return formattedRankings;
    } catch (error) {
      this.logger.error(`Failed to get rankings: ${pollID}`, error);

      throw new InternalServerErrorException(
        `Failed to get rankings: ${pollID}`,
      );
    }
  }

  async getNominations(pollID: string): Promise<FormattedNominations> {
    this.logger.log(`Get nominations of poll: ${pollID}`);

    try {
      const pollNominations = await this.prismaService.nomination.findMany({
        where: {
          pollID: pollID,
        },
        select: {
          id: true,
          nominationUserID: true,
          nominationText: true,
        },
      });

      const formattedNominations = pollNominations.reduce((result, item) => {
        result[item.id] = {
          userID: item.nominationUserID,
          text: item.nominationText,
        };
        return result;
      }, {});
      console.log('formattedNominations', formattedNominations);
      return formattedNominations;
    } catch (error) {
      this.logger.error(`Failed to get nominations: ${pollID}`, error);

      throw new InternalServerErrorException(
        `Failed to get nominations: ${pollID}`,
      );
    }
  }
}
