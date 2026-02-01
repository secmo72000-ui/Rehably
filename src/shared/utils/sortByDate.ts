/**
 * Sorts an array of objects by a date field.
 * Returns a new sorted array without mutating the original.
 *
 * @template T - The type of objects in the array
 * @param data - The array to sort
 * @param dateKey - The key of the date field to sort by
 * @param direction - 'asc' for oldest first, 'desc' for newest first
 * @returns A new sorted array
 */
export function sortByDate<T>(
  data: T[],
  dateKey: keyof T,
  direction: 'asc' | 'desc'
): T[] {
  return [...data].sort((a, b) => {
    const dateA = new Date(a[dateKey] as string).getTime();
    const dateB = new Date(b[dateKey] as string).getTime();

    if (direction === 'asc') {
      return dateA - dateB;
    }
    return dateB - dateA;
  });
}
