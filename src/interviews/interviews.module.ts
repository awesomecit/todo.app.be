import { Module } from '@nestjs/common';
import { CustomLogger } from '../common/logger/logger.service';
import { InterviewsService } from './interviews.service';

@Module({
  providers: [InterviewsService, CustomLogger],
  exports: [InterviewsService],
})
export class InterviewsModule {}
