/**
 * Converts bytes into gigabytes formatted to two decimal places.
 */
export const bytesToGB = (bytes: number): number => {
    if (!bytes) return 0;
    return Math.round((bytes / (1024 * 1024 * 1024)) * 100) / 100;
};
