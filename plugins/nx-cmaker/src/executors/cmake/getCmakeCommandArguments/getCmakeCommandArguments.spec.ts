import { getCmakeCommandArguments } from './getCmakeCommandArguments';
import { join } from 'path';
import * as utilsModule from '@/util';
import { LINUX_GCC, WINDOWS_MAKE, WINDOWS_GCC } from '../../../config';
import * as getMakeModule from '../../../config/getPrograms/getMake/getMake';
import * as getGccModule from '../../../config/getPrograms/getGcc/getGcc';
import { CmakeExecutorSchema } from '../../../executors/executor';

describe('getCmakeCommandArguments', () => {
    let workspaceRoot: string;
    let projectRoot: string;
    let options: CmakeExecutorSchema;
    let isWindowsMock: jest.SpyInstance;
    let getMakeMock: jest.SpyInstance;
    let getGccMock: jest.SpyInstance;
    let getGccReturnMock: string;

    beforeEach(() => {
        workspaceRoot = 'workspaceRoot';
        projectRoot = 'projectRoot';
        getGccReturnMock = LINUX_GCC[0];
        options = {
            args: [],
            release: false,
        };
        isWindowsMock = jest
            .spyOn(utilsModule, 'isWindows')
            .mockReturnValue(false);
        getGccMock = jest
            .spyOn(getGccModule, 'getGcc')
            .mockReturnValue(getGccReturnMock);
        getMakeMock = jest.spyOn(getMakeModule, 'getMake');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test.skip('should get cmake command arguments on windows', () => {
        isWindowsMock.mockReturnValue(true);
        getMakeMock.mockReturnValue(WINDOWS_MAKE[0]);
        getGccMock.mockReturnValue(WINDOWS_GCC[0]);
        const cmakeArguments = getCmakeCommandArguments(
            workspaceRoot,
            projectRoot,
            options,
        );
        const expectedCmakeArguments = [
            '-S',
            join('workspaceRoot/projectRoot'),
            join('workspaceRoot/dist/projectRoot'),
            '-G "MinGW Makefiles"',
            '-DCMAKE_MAKE_PROGRAM=C:/msys64/ucrt64/bin/mingw32-make.exe',
            '-DCMAKE_C_COMPILER=C:/msys64/ucrt64/bin/gcc.exe',
            '-DCMAKE_CXX_COMPILER=C:/msys64/ucrt64/bin/gcc.exe',
            '-DCMAKE_BUILD_TYPE=Debug',
        ];
        expect(cmakeArguments).toStrictEqual(expectedCmakeArguments);
    });
});
