import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CreatePollFields, JoinPollFields } from 'src/shared/interfaces';
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

  async createPoll(fields: CreatePollFields) {
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

  async joinPoll(fields: JoinPollFields) {
    return this.pollRepository.joinPoll(fields);
  }

  findAll() {
    return `This action returns all poll`;
  }

  remove(id: number) {
    return `This action removes a #${id} poll`;
  }
}
