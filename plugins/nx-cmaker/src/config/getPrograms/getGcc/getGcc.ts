import { getProgram } from '../getProgram/getProgram';
import { GCC } from '../getPrograms';
import { isDarwin } from '@/util';
export const CXX_ON_DARWIN = '/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++';

export const getGcc = () => {
    if (isDarwin(process.platform)) {
        return CXX_ON_DARWIN;
    }
    const gcc = getProgram(GCC);
    return gcc;
};
