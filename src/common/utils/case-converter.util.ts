import { Injectable } from '@nestjs/common';

// Constants to avoid string duplication
const OBJECT_TYPE = 'object';
const STRING_TYPE = 'string';

/**
 * Case Converter Utility for automatic snake_case to camelCase conversion
 * Handles database/code mapping with support for nested objects and arrays
 */
@Injectable()
export class CaseConverter {
  /**
   * Converts object properties from snake_case to camelCase
   * @param obj Object with snake_case properties
   * @returns Object with camelCase properties
   */
  static toCamelCase(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => CaseConverter.toCamelCase(item));
    }

    if (typeof obj === OBJECT_TYPE && obj.constructor === Object) {
      const converted: any = {};

      for (const [key, value] of Object.entries(obj)) {
        const camelKey = CaseConverter.propertyToCamelCase(key);
        converted[camelKey] = CaseConverter.toCamelCase(value);
      }

      return converted;
    }

    // Return primitive values as-is
    return obj;
  }

  /**
   * Converts object properties from camelCase to snake_case
   * @param obj Object with camelCase properties
   * @returns Object with snake_case properties
   */
  static toSnakeCase(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => CaseConverter.toSnakeCase(item));
    }

    if (typeof obj === OBJECT_TYPE && obj.constructor === Object) {
      const converted: any = {};

      for (const [key, value] of Object.entries(obj)) {
        const snakeKey = CaseConverter.propertyToSnakeCase(key);
        converted[snakeKey] = CaseConverter.toSnakeCase(value);
      }

      return converted;
    }

    // Return primitive values as-is
    return obj;
  }

  /**
   * Converts single property name from snake_case to camelCase
   * @param property Property name in snake_case
   * @returns Property name in camelCase
   */
  static propertyToCamelCase(property: string): string {
    if (!property || typeof property !== STRING_TYPE) {
      return property;
    }

    return property.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Converts single property name from camelCase to snake_case
   * @param property Property name in camelCase
   * @returns Property name in snake_case
   */
  static propertyToSnakeCase(property: string): string {
    if (!property || typeof property !== STRING_TYPE) {
      return property;
    }

    return property.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Instance method for toCamelCase (for DI usage)
   */
  toCamelCase(obj: any): any {
    return CaseConverter.toCamelCase(obj);
  }

  /**
   * Instance method for toSnakeCase (for DI usage)
   */
  toSnakeCase(obj: any): any {
    return CaseConverter.toSnakeCase(obj);
  }

  /**
   * Instance method for propertyToCamelCase (for DI usage)
   */
  propertyToCamelCase(property: string): string {
    return CaseConverter.propertyToCamelCase(property);
  }

  /**
   * Instance method for propertyToSnakeCase (for DI usage)
   */
  propertyToSnakeCase(property: string): string {
    return CaseConverter.propertyToSnakeCase(property);
  }

  /**
   * Converts database query result to API response format
   * @param dbResult Database result with snake_case fields
   * @returns API response with camelCase fields
   */
  dbToApi(dbResult: any): any {
    return CaseConverter.toCamelCase(dbResult);
  }

  /**
   * Converts API request to database format
   * @param apiData API request with camelCase fields
   * @returns Database format with snake_case fields
   */
  apiToDb(apiData: any): any {
    return CaseConverter.toSnakeCase(apiData);
  }

  /**
   * Validates conversion integrity by round-trip test
   * @param original Original object
   * @returns boolean true if conversion is reversible
   */
  validateConversion(original: any): boolean {
    try {
      const converted = CaseConverter.toCamelCase(original);
      const reverted = CaseConverter.toSnakeCase(converted);

      return JSON.stringify(original) === JSON.stringify(reverted);
    } catch {
      return false;
    }
  }

  /**
   * Bulk converts array of objects
   * @param objects Array of objects to convert
   * @param direction 'toCamel' or 'toSnake'
   * @returns Array of converted objects
   */
  bulkConvert(objects: any[], direction: 'toCamel' | 'toSnake'): any[] {
    if (!Array.isArray(objects)) {
      throw new Error('Input must be an array');
    }

    const converter =
      direction === 'toCamel'
        ? CaseConverter.toCamelCase
        : CaseConverter.toSnakeCase;

    return objects.map(obj => converter(obj));
  }
}
