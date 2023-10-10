import { Test, TestingModule } from '@nestjs/testing';
import { PollGateway } from './poll.gateway';
import { PollService } from './poll.service';

describe('PollGateway', () => {
  let gateway: PollGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PollGateway, PollService],
    }).compile();

    gateway = module.get<PollGateway>(PollGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
