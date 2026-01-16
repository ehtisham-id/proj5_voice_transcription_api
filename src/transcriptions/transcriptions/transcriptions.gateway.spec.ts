import { Test, TestingModule } from '@nestjs/testing';
import { TranscriptionsGateway } from './transcriptions.gateway';

describe('TranscriptionsGateway', () => {
  let gateway: TranscriptionsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TranscriptionsGateway],
    }).compile();

    gateway = module.get<TranscriptionsGateway>(TranscriptionsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
