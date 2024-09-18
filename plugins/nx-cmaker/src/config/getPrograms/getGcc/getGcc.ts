import { getProgram } from '../getProgram/getProgram';
import { GCC } from '../getPrograms';
import { isDarwin } from '@/util';

const OptHomebrewBinGcc_14 = '/opt/homebrew/bin/gcc-14';

export const getGcc = () => {
    if (isDarwin(process.platform)) {
        return OptHomebrewBinGcc_14;
    }
    const gcc = getProgram(GCC);
    return gcc;
};

export const CXX_ON_DARWIN = '/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++';
export const CC_ON_DARWIN = '/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/cc';

export const getCc = () => {
    if (isDarwin(process.platform)) {
        return OptHomebrewBinGcc_14;
    }
    const cc = getProgram(GCC);
    return cc;
};
