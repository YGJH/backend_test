export declare type Comparator = Parameters<typeof Array.prototype.sort>[0];
/**
 * The multiSortCompareFn function is used to
 * build a single comparator function for use
 * in Array.sort when multiple sort criteria
 * is needed on an object type. The indices of
 * specified array of SortCriteria indicate the
 * precedence of each comparator.
 *
 * @example
 * ```ts
 * type User = {
 *  firstName: string
 *  lastName: string
 * }
 * const localeCompare = (a: string, b: string) => a.localeCompare(b)
 * const comparators = [
 *  (a: User, b: User) => localeCompare(a.firstName, b.firstName),
 *  (a: User, b: User) => localeCompare(a.lastName, b.lastName)
 *  ]
 *
 * const users: User[] = [
 *  {fistName: 'Bill', lastName: 'Stevens'},
 *  {firstName: 'Jill', lastName: 'Ames'},
 *  {firstName: 'Bill', lastName: 'Bernard'},
 * ]
 * users.sort(multiSortCompareFn(comparators)) // Bill Bernard, Bill Stevens, Jill Ames
 * ```
 * @param comparators The array of Comparators whose indices indicate sort precedence
 * @returns Comparator
 */
export declare function multiSortCompareFn(comparators: Comparator[]): Comparator;
