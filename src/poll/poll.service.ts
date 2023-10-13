import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  AddNominationFields,
  AddParticipantFields,
  CreatePollFields,
  JoinPollFields,
  PollDBData,
  RejoinPollFields,
} from 'src/shared/interfaces';
import { createNominationID, createPollID, createUserID } from 'src/utils';
import { PollRepository } from './poll.repository';

@Injectable()
export class PollService {
  constructor(
    private pollRepository: PollRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private readonly logger = new Logger(PollService.name);
  secret = this.configService.get('JWT_SECRET');
  pollDuration = this.configService.get('POLL_DURATION');

  async createPoll(fields: CreatePollFields): Promise<{
    poll: PollDBData;
    accessToken: string;
  }> {
    this.logger.debug(`fields: `, fields);
    const pollID = createPollID();
    const userID = createUserID();

    const createdPoll = await this.pollRepository.createPoll({
      ...fields,
      pollID,
      userID,
    });

    this.logger.debug(
      `Creating token string for pollID: ${createdPoll.id} and userID: ${userID}`,
    );
    this.logger.debug('Created Poll:', createdPoll);

    const payload = {
      sub: userID,
      pollID: createdPoll.id,
      name: fields.name,
    };

    const signedString = await this.jwtService.signAsync(payload, {
      secret: this.secret,
      expiresIn: this.pollDuration,
    });

    return {
      poll: createdPoll,
      accessToken: signedString,
    };
  }

  async joinPoll(fields: JoinPollFields): Promise<{
    poll: PollDBData;
    accessToken: string;
  }> {
    const userID = createUserID();
    this.logger.debug(
      `Fetching poll with ID: ${fields.pollID} for user with ID: ${userID}`,
    );

    const joinedPoll = await this.pollRepository.getPoll(fields.pollID);

    this.logger.debug(
      `Creating token string for pollID: ${joinedPoll.id} and userID: ${userID}`,
    );

    const payload = {
      sub: userID,
      pollID: joinedPoll.id,
      name: fields.name,
    };

    const signedString = await this.jwtService.signAsync(payload, {
      secret: this.secret,
      expiresIn: this.pollDuration,
    });

    return {
      poll: joinedPoll,
      accessToken: signedString,
    };
  }

  async addParticipant(addParticipantFields: AddParticipantFields) {
    return this.pollRepository.addParticipant(addParticipantFields);
  }

  async removeParticipant(pollID: string, userID: string) {
    const poll = await this.pollRepository.getPoll(pollID);

    if (!poll.hasStarted) {
      const updatedPoll = await this.pollRepository.removeParticipant(
        pollID,
        userID,
      );
      return updatedPoll;
    }

    // TODO: Consider adding a notification if poll hasStarted
  }

  async rejoinPoll(fields: RejoinPollFields) {
    this.logger.debug(
      `Rejoining poll with ID: ${fields.pollID} for user with ID: ${fields.userID} with name: ${fields.name}`,
    );

    const rejoinedPoll = await this.pollRepository.addParticipant(fields);
    return rejoinedPoll;
  }

  async addNomination({
    pollID,
    userID,
    text,
  }: AddNominationFields): Promise<PollDBData> {
    return this.pollRepository.addNomination({
      pollID,
      nominationID: createNominationID(),
      nomination: {
        userID,
        text,
      },
    });
  }

  async getPoll(pollID: string) {
    return this.pollRepository.getPoll(pollID);
  }
}
