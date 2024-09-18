import { getProgram } from '../getProgram/getProgram';
import { GCC } from '../getPrograms';
import { isDarwin } from '@/util';

export const getGcc = () => {
    if (isDarwin(process.platform)) {
        return '/opt/homebrew/bin/gcc-14';
    }
    const gcc = getProgram(GCC);
    return gcc;
};

export const CXX_ON_DARWIN = '/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++';
export const CC_ON_DARWIN = '/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/cc';

export const getCc = () => {
    if (isDarwin(process.platform)) {
        return CC_ON_DARWIN;
    }
    const cc = getProgram(GCC);
    return cc;
};
