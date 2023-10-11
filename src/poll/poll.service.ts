import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  CreatePollFields,
  JoinPollFields,
  PollDBData,
} from 'src/shared/interfaces';
import { createPollID, createUserID } from 'src/utils';
import { PollRepository } from './poll.repository';

@Injectable()
export class PollService {
  constructor(
    private pollRepository: PollRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private readonly logger = new Logger(PollService.name);

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

    const secret = this.configService.get('JWT_SECRET');

    const signedString = await this.jwtService.signAsync(payload, {
      expiresIn: '16',
      secret,
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

    const secret = this.configService.get('JWT_SECRET');

    const signedString = await this.jwtService.signAsync(
      {
        pollID: joinedPoll.id,
        name: fields.name,
      },
      {
        secret,
      },
    );

    return {
      poll: joinedPoll,
      accessToken: signedString,
    };
  }

  findAll() {
    return `This action returns all poll`;
  }

  remove(id: number) {
    return `This action removes a #${id} poll`;
  }
}
