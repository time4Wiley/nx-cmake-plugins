import { checkCommandExists } from './checkCommandExists';
import * as commandExistsModule from '../commandExists/commandExists';

describe('checkCommandExists', () => {
    let commandExistsMock: jest.SpyInstance;
    let command: string;

    beforeEach(() => {
        commandExistsMock = jest.spyOn(commandExistsModule, 'commandExists');
        command = 'command-to-test';
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should error if the does not command exist', () => {
        commandExistsMock.mockReturnValueOnce(false);
        const expectedError = `${command} is not installed but required for this executor to run.`;
        expect(() => checkCommandExists(command)).toThrowError(expectedError);
    });

    it('should return the command it it exists', () => {
        commandExistsMock.mockReturnValueOnce(true);
        const result = checkCommandExists(command);
        expect(result).toBe(command);
    });
});
