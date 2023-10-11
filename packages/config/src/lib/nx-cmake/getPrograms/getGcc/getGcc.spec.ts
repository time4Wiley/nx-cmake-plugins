import { getGcc } from './getGcc';
import * as fileModule from '@/file';
import * as isWindowsModule from '../../../isWindows/isWindows';
import * as isDarwinModule from '../../../isDarwin/isDarwin';
import { LINUX_GCC, DARWIN_GCC, WINDOWS_GCC, GCC } from '../getPrograms';

describe('getGcc', () => {
    let isWindowsMock: jest.SpyInstance;
    let isDarwinMock: jest.SpyInstance;
    let fileExistsMock: jest.SpyInstance;

    beforeEach(() => {
        isWindowsMock = jest
            .spyOn(isWindowsModule, 'isWindows')
            .mockReturnValue(false);
        isDarwinMock = jest
            .spyOn(isDarwinModule, 'isDarwin')
            .mockReturnValue(false);
        fileExistsMock = jest.spyOn(fileModule, 'fileExists');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should get GCC on Linux', () => {
        fileExistsMock.mockReturnValue(true);
        const gcc = getGcc();
        expect(gcc).toBe(LINUX_GCC[0]);
    });

    it('should get GCC on Darwin', () => {
        fileExistsMock.mockReturnValue(true);
        isDarwinMock.mockReturnValue(true);
        const gcc = getGcc();
        expect(gcc).toBe(DARWIN_GCC[0]);
    });

    it('should get GCC on Windows', () => {
        fileExistsMock.mockReturnValue(true);
        isWindowsMock.mockReturnValue(true);
        const gcc = getGcc();
        expect(gcc).toBe(WINDOWS_GCC[0]);
    });

    it('should error getting the program path when it doesnt exist', () => {
        fileExistsMock.mockReturnValue(false);
        expect(() => getGcc()).toThrowError(
            `${GCC} was not found on paths ${LINUX_GCC}`,
        );
    });
});
