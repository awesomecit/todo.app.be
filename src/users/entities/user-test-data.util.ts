/**
 * Utility per dati di test degli utenti
 * Centralizza la creazione di dati di test consistenti ed evita duplicazione
 */

export const USER_TEST_DATA = {
  /**
   * Dati di base per un utente valido
   */
  VALID_BASE_USER: {
    firstName: 'Test',
    lastName: 'User',
    password: 'securepassword',
    birthDate: new Date('2000-01-01'),
  } as const,

  /**
   * Set di UUID pre-generati per test consistenti
   */
  UUIDS: {
    USER_1: '123e4567-e89b-12d3-a456-426614174000',
    USER_2: '123e4567-e89b-12d3-a456-426614174001',
    USER_3: '123e4567-e89b-12d3-a456-426614174002',
    USER_4: '123e4567-e89b-12d3-a456-426614174003',
    USER_5: '123e4567-e89b-12d3-a456-426614174004',
  } as const,

  /**
   * Set di email per test
   */
  EMAILS: {
    USER_1: 'test1@example.com',
    USER_2: 'test2@example.com',
    USER_3: 'test3@example.com',
    USER_4: 'test4@example.com',
    USER_5: 'test5@example.com',
  } as const,

  /**
   * Set di username per test
   */
  USERNAMES: {
    USER_1: 'testuser1',
    USER_2: 'testuser2',
    USER_3: 'testuser3',
    USER_4: 'testuser4',
    USER_5: 'testuser5',
  } as const,
} as const;

/**
 * Factory function per creare dati utente completi per i test
 * @param userNumber Numero dell'utente (1-5)
 * @param overrides Proprietà da sovrascrivere
 * @returns Oggetto con tutti i dati necessari per creare un utente
 */
export function createUserTestData(
  userNumber: 1 | 2 | 3 | 4 | 5 = 1,
  overrides: Partial<
    typeof USER_TEST_DATA.VALID_BASE_USER & {
      uuid: string;
      email: string;
      username: string;
    }
  > = {},
) {
  const userKey = `USER_${userNumber}` as keyof typeof USER_TEST_DATA.UUIDS;

  return {
    ...USER_TEST_DATA.VALID_BASE_USER,
    uuid: USER_TEST_DATA.UUIDS[userKey],
    email: USER_TEST_DATA.EMAILS[userKey],
    username: USER_TEST_DATA.USERNAMES[userKey],
    ...overrides,
  };
}

/**
 * Factory function per creare dati utente parziali (solo campi richiesti)
 * @param userNumber Numero dell'utente (1-5)
 * @param overrides Proprietà da sovrascrivere
 * @returns Oggetto con solo i campi minimi richiesti
 */
export function createMinimalUserTestData(
  userNumber: 1 | 2 | 3 | 4 | 5 = 1,
  overrides: Partial<{ uuid: string }> = {},
) {
  const userKey = `USER_${userNumber}` as keyof typeof USER_TEST_DATA.UUIDS;

  return {
    uuid: USER_TEST_DATA.UUIDS[userKey],
    ...overrides,
  };
}

/**
 * Factory function per creare dati utente non validi per test di validazione
 * @param invalidField Campo da rendere non valido
 * @param invalidValue Valore non valido da assegnare
 * @param baseUserNumber Numero dell'utente base da cui partire
 * @returns Oggetto utente con campo non valido
 */
export function createInvalidUserTestData(
  invalidField: string,
  invalidValue: any,
  baseUserNumber: 1 | 2 | 3 | 4 | 5 = 1,
) {
  const validData = createUserTestData(baseUserNumber);

  return {
    ...validData,
    [invalidField]: invalidValue,
  };
}
