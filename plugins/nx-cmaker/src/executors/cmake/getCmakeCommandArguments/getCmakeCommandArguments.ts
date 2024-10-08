import { join } from 'path';
import { logger } from '@/log';
import { isWindows } from '@/util';
import { CmakeExecutorSchema } from '../../executor';
import { getGcc, getCc } from '../../../config/getPrograms/getGcc/getGcc';
import { getMake } from '../../../config/getPrograms/getMake/getMake';

export const getCmakeCommandArguments = (
    workspaceRoot: string,
    projectRoot: string,
    options: CmakeExecutorSchema,
): string[] => {
    logger(`Getting cmake command arguments`);
    const { release, args } = options;
    const cCompiler = getCc();
    const cxxCompiler = getGcc(); 

    const make = getMake();
    const transformedCCompiler = cCompiler.replace(/\\/g, '/');
    const transformedCXXCompiler = cxxCompiler.replace(/\\/g, '/');
    const transformedMake = make.replace(/\\/g, '/');
    const cmakeArguments = [
        '-S',
        join(workspaceRoot, projectRoot),
        join(workspaceRoot, 'dist', projectRoot),
        ...(isWindows(process.platform)
            ? ['-G "MinGW Makefiles"']
            : ['-G "Unix Makefiles"']),
        ...(isWindows(process.platform)
            ? [`-DCMAKE_MAKE_PROGRAM=${transformedMake}`]
            : []),
        `-DCMAKE_C_COMPILER=${transformedCCompiler}`,
        `-DCMAKE_CXX_COMPILER=${transformedCXXCompiler}`,
        `-DCMAKE_BUILD_TYPE=${release ? 'Release' : 'Debug'}`,
        ...args,
    ];
    return cmakeArguments;
};
