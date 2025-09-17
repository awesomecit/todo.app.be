import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { CustomLogger } from '../logger/logger.service';
import { AllExceptionsFilter } from './all-exceptions.filter';

// Mock di fs per non scrivere effettivamente nei file durante i test
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  appendFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let logger: CustomLogger;

  // Mock per ArgumentsHost
  const mockArgumentsHost = {
    switchToHttp: jest.fn().mockReturnValue({
      getResponse: jest.fn(),
      getRequest: jest.fn(),
    }),
    getType: jest.fn(),
    getArgs: jest.fn(),
  } as unknown as ArgumentsHost;

  // Mock per Request
  const mockRequest = {
    url: '/api/test',
    method: 'GET',
    ip: '127.0.0.1',
    get: jest.fn().mockReturnValue('Test User Agent'),
    headers: {
      'user-agent': 'Test User Agent',
      'content-type': 'application/json',
    },
    body: {},
    query: {},
    params: {},
    secure: false,
  } as unknown as Request;

  // Mock per Response
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllExceptionsFilter,
        {
          provide: CustomLogger,
          useFactory: () => ({
            error: jest.fn(),
            warn: jest.fn(),
            log: jest.fn(),
            debug: jest.fn(),
          }),
        },
        {
          provide: ConfigService,
          useFactory: () => ({
            get: jest.fn(),
          }),
        },
      ],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
    logger = module.get<CustomLogger>(CustomLogger);

    // Reset mocks before each test
    jest.clearAllMocks();

    // Configurazione dei mock per argumentsHost
    (mockArgumentsHost.switchToHttp().getResponse as jest.Mock).mockReturnValue(
      mockResponse,
    );
    (mockArgumentsHost.switchToHttp().getRequest as jest.Mock).mockReturnValue(
      mockRequest,
    );
  });

  describe('catch', () => {
    it('dovrebbe gestire una HttpException', () => {
      // Arrange
      const httpException = new HttpException(
        'Test message',
        HttpStatus.BAD_REQUEST,
      );

      // Act
      filter.catch(httpException, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Test message',
          path: '/api/test',
          method: 'GET',
        }),
      );
      expect(logger.warn).toHaveBeenCalled();
    });

    it('dovrebbe gestire una eccezione generica come errore interno del server', () => {
      // Arrange
      const error = new Error('Generic error');

      // Act
      filter.catch(error, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Generic error',
          path: '/api/test',
          method: 'GET',
        }),
      );
      expect(logger.error).toHaveBeenCalled();
    });

    it('dovrebbe registrare errori di server (status >= 500)', () => {
      // Arrange
      const serverError = new HttpException(
        'Server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      // Act
      filter.catch(serverError, mockArgumentsHost);

      // Assert
      expect(logger.error).toHaveBeenCalled();
      expect(fs.appendFileSync).toHaveBeenCalled();
    });

    it('dovrebbe registrare avvisi per errori client (status < 500)', () => {
      // Arrange
      const clientError = new HttpException(
        'Client error',
        HttpStatus.BAD_REQUEST,
      );

      // Act
      filter.catch(clientError, mockArgumentsHost);

      // Assert
      expect(logger.warn).toHaveBeenCalled();
      expect(fs.appendFileSync).not.toHaveBeenCalled();
    });

    it('dovrebbe includere lo stack trace nella risposta quando in modalità development', () => {
      // Arrange
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const error = new Error('Development error');

      // Act
      filter.catch(error, mockArgumentsHost);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String),
        }),
      );

      // Cleanup
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('dovrebbe gestire oggetti eccezione con struttura complessa', () => {
      // Arrange
      const complexException = new HttpException(
        {
          message: ['Validation error 1', 'Validation error 2'],
          errors: {
            field1: 'Error in field1',
            field2: 'Error in field2',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

      // Act
      filter.catch(complexException, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: ['Validation error 1', 'Validation error 2'],
          errors: {
            field1: 'Error in field1',
            field2: 'Error in field2',
          },
        }),
      );
    });
  });

  describe('generateCurlCommand', () => {
    it('dovrebbe generare un comando curl corretto per una richiesta GET', () => {
      // Questa è una chiamata a un metodo privato, quindi dobbiamo usare un piccolo trucco
      const result = (filter as any).generateCurlCommand(mockRequest);

      expect(result).toContain(`curl -X GET 'http://localhost/api/test'`);
      expect(result).toContain(`-H 'user-agent: Test User Agent'`);
      expect(result).toContain(`-H 'content-type: application/json'`);
    });

    it('dovrebbe generare un comando curl con body per richieste con corpo', () => {
      // Arrange
      const postRequest = {
        ...mockRequest,
        method: 'POST',
        body: { username: 'testuser', password: 'password123' },
      };

      // Act
      const result = (filter as any).generateCurlCommand(postRequest);

      // Assert
      expect(result).toContain(`curl -X POST 'http://localhost/api/test'`);
      expect(result).toContain(`-H 'content-type: application/json'`);
      expect(result).toContain(
        `-d '{"username":"testuser","password":"password123"}'`,
      );
    });

    it('dovrebbe gestire correttamente richieste senza headers', () => {
      // Arrange
      const minimalRequest = {
        ...mockRequest,
        headers: {},
      };

      // Act
      const result = (filter as any).generateCurlCommand(minimalRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result).toContain(`curl -X GET 'http://localhost/api/test'`);
    });

    it('dovrebbe gestire correttamente errori nella serializzazione del body', () => {
      // Arrange
      const circularReference: any = { name: 'circular' };
      circularReference.self = circularReference;

      const requestWithCircularBody = {
        ...mockRequest,
        method: 'POST',
        body: circularReference,
      };

      // Act & Assert
      expect(() => {
        (filter as any).generateCurlCommand(requestWithCircularBody);
      }).not.toThrow();
    });
  });

  describe('logToSentryFile', () => {
    beforeEach(() => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
    });

    it('dovrebbe creare la directory di log se non esiste', () => {
      // Arrange
      const error = new Error('Test error');

      // Act
      (filter as any).logToSentryFile(
        error,
        mockRequest,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Test error',
      );

      // Assert
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.mkdirSync).toHaveBeenCalled();
    });

    it("dovrebbe appendere l'errore al file di log", () => {
      // Arrange
      const error = new Error('Test error');

      // Act
      (filter as any).logToSentryFile(
        error,
        mockRequest,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Test error',
      );

      // Assert
      expect(fs.appendFileSync).toHaveBeenCalled();
      const [filePath, content] = (fs.appendFileSync as jest.Mock).mock
        .calls[0];

      expect(filePath).toMatch(/sentry-\d{4}-\d{2}-\d{2}\.log$/);
      expect(content).toContain('Test error');
      expect(content).toContain('/api/test');
      expect(content).toContain('GET');
    });

    it('dovrebbe gestire gracefully i fallimenti nella scrittura del file', () => {
      // Arrange
      const error = new Error('Test error');
      (fs.appendFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Disk full');
      });

      // Act & Assert
      expect(() => {
        (filter as any).logToSentryFile(
          error,
          mockRequest,
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Test error',
        );
      }).not.toThrow();

      expect(logger.error).toHaveBeenCalled();
    });
  });
});
