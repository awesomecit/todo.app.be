import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../common/logger/logger.service';

export interface Interview {
  id: number;
  title: string;
  description: string;
  duration: number;
  createdAt: Date;
}

export interface CreateInterviewDto {
  title: string;
  description: string;
  duration: number;
}

export interface UpdateInterviewDto {
  title?: string;
  description?: string;
  duration?: number;
}

@Injectable()
export class InterviewsService {
  private interviews: Interview[] = [];
  private idCounter = 1;

  constructor(private readonly logger: CustomLogger) {}

  /**
   * Get all interviews
   * @returns Array of all interviews
   */
  getAll(): Interview[] {
    this.logger.log('Fetching all interviews', 'InterviewsService');
    return [...this.interviews];
  }

  /**
   * Get interview by ID
   * @param id Interview ID
   * @returns Interview or undefined if not found
   */
  getById(id: number): Interview | undefined {
    this.logger.log(`Fetching interview with id: ${id}`, 'InterviewsService');

    if (id < 0) {
      return undefined;
    }

    return this.interviews.find(interview => interview.id === id);
  }

  /**
   * Create a new interview
   * @param createInterviewDto Data for creating interview
   * @returns Created interview
   */
  create(createInterviewDto: CreateInterviewDto): Interview {
    if (!createInterviewDto) {
      throw new Error('Invalid interview data provided');
    }

    this.logger.log('Creating new interview', 'InterviewsService');

    const newInterview: Interview = {
      id: this.idCounter++,
      ...createInterviewDto,
      createdAt: new Date(),
    };

    this.interviews.push(newInterview);
    return newInterview;
  }

  /**
   * Update an existing interview
   * @param id Interview ID
   * @param updateInterviewDto Data for updating interview
   * @returns Updated interview or undefined if not found
   */
  update(
    id: number,
    updateInterviewDto: UpdateInterviewDto,
  ): Interview | undefined {
    this.logger.log(`Updating interview with id: ${id}`, 'InterviewsService');

    if (id < 0) {
      return undefined;
    }

    const interviewIndex = this.interviews.findIndex(
      interview => interview.id === id,
    );

    if (interviewIndex === -1) {
      return undefined;
    }

    const updatedInterview = {
      ...this.interviews[interviewIndex],
      ...updateInterviewDto,
    };

    this.interviews[interviewIndex] = updatedInterview;
    return updatedInterview;
  }

  /**
   * Delete an interview
   * @param id Interview ID
   * @returns true if deleted, false if not found
   */
  delete(id: number): boolean {
    this.logger.log(`Deleting interview with id: ${id}`, 'InterviewsService');

    if (id < 0) {
      return false;
    }

    const initialLength = this.interviews.length;
    this.interviews = this.interviews.filter(interview => interview.id !== id);

    return this.interviews.length < initialLength;
  }
}
