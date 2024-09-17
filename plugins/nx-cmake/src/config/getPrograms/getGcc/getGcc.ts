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
