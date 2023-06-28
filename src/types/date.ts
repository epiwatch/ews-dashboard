type oneToNine = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type d = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0;
type YYYY = `19${d}${d}` | `20${d}${d}`;
type MM = `0${oneToNine}` | `1${0 | 1 | 2}`;
type DD = `${0}${oneToNine}` | `${1 | 2}${d}` | `3${0 | 1}`;

// Strongly typed date string - YYYY-MM-DD
export type DateYMDString = `${YYYY}-${MM}-${DD}`;
