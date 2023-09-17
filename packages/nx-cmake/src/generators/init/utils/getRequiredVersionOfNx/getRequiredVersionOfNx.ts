import {
    REQUIRED_MAJOR_NX_VERSION,
    REQUIRED_MINOR_NX_VERSION,
} from '../../../../config/version';

export const getRequiredVersionOfNx = (): string => {
    const requiredVersionOfNx = [
        REQUIRED_MAJOR_NX_VERSION,
        REQUIRED_MINOR_NX_VERSION,
    ]
        .map(toString)
        .join('.');
    return requiredVersionOfNx;
};
