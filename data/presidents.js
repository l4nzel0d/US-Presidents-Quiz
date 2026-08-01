/* One record per presidency number.
 *
 * name       full name as normally used (always complete — middle names included)
 * givenName  full given name at birth, only when it differs from `name`
 * start/end   term boundaries; end === null means the term is ongoing
 *
 * Cleveland (22, 24) and Trump (45, 47) appear twice: nonconsecutive terms get
 * separate presidency numbers. Consecutive re-elections do not — Grant's two
 * terms are a single record, #18, spanning 1869-1877.
 */
window.PRESIDENTS = [
  { no: 1,  name: "George Washington",            start: 1789, end: 1797 },
  { no: 2,  name: "John Adams",                   start: 1797, end: 1801 },
  { no: 3,  name: "Thomas Jefferson",             start: 1801, end: 1809 },
  { no: 4,  name: "James Madison",                start: 1809, end: 1817 },
  { no: 5,  name: "James Monroe",                 start: 1817, end: 1825 },
  { no: 6,  name: "John Quincy Adams",            start: 1825, end: 1829 },
  { no: 7,  name: "Andrew Jackson",               start: 1829, end: 1837 },
  { no: 8,  name: "Martin Van Buren",             start: 1837, end: 1841 },
  { no: 9,  name: "William Henry Harrison",       start: 1841, end: 1841 },
  { no: 10, name: "John Tyler",                   start: 1841, end: 1845 },
  { no: 11, name: "James Knox Polk",              start: 1845, end: 1849 },
  { no: 12, name: "Zachary Taylor",               start: 1849, end: 1850 },
  { no: 13, name: "Millard Fillmore",             start: 1850, end: 1853 },
  { no: 14, name: "Franklin Pierce",              start: 1853, end: 1857 },
  { no: 15, name: "James Buchanan",               start: 1857, end: 1861 },
  { no: 16, name: "Abraham Lincoln",              start: 1861, end: 1865 },
  { no: 17, name: "Andrew Johnson",               start: 1865, end: 1869 },
  { no: 18, name: "Ulysses S. Grant",             start: 1869, end: 1877,
            givenName: "Hiram Ulysses Grant" },
  { no: 19, name: "Rutherford Birchard Hayes",    start: 1877, end: 1881 },
  { no: 20, name: "James Abram Garfield",         start: 1881, end: 1881 },
  { no: 21, name: "Chester Alan Arthur",          start: 1881, end: 1885 },
  { no: 22, name: "Stephen Grover Cleveland",     start: 1885, end: 1889 },
  { no: 23, name: "Benjamin Harrison",            start: 1889, end: 1893 },
  { no: 24, name: "Stephen Grover Cleveland",     start: 1893, end: 1897 },
  { no: 25, name: "William McKinley",             start: 1897, end: 1901 },
  { no: 26, name: "Theodore Roosevelt",           start: 1901, end: 1909 },
  { no: 27, name: "William Howard Taft",          start: 1909, end: 1913 },
  { no: 28, name: "Thomas Woodrow Wilson",        start: 1913, end: 1921 },
  { no: 29, name: "Warren Gamaliel Harding",      start: 1921, end: 1923 },
  { no: 30, name: "John Calvin Coolidge Jr.",     start: 1923, end: 1929 },
  { no: 31, name: "Herbert Clark Hoover",         start: 1929, end: 1933 },
  { no: 32, name: "Franklin Delano Roosevelt",    start: 1933, end: 1945 },
  { no: 33, name: "Harry S. Truman",              start: 1945, end: 1953 },
  { no: 34, name: "Dwight David Eisenhower",      start: 1953, end: 1961,
            givenName: "David Dwight Eisenhower" },
  { no: 35, name: "John Fitzgerald Kennedy",      start: 1961, end: 1963 },
  { no: 36, name: "Lyndon Baines Johnson",        start: 1963, end: 1969 },
  { no: 37, name: "Richard Milhous Nixon",        start: 1969, end: 1974 },
  { no: 38, name: "Gerald Rudolph Ford Jr.",      start: 1974, end: 1977,
            givenName: "Leslie Lynch King Jr." },
  { no: 39, name: "James Earl Carter Jr.",        start: 1977, end: 1981 },
  { no: 40, name: "Ronald Wilson Reagan",         start: 1981, end: 1989 },
  { no: 41, name: "George Herbert Walker Bush",   start: 1989, end: 1993 },
  { no: 42, name: "William Jefferson Clinton",    start: 1993, end: 2001,
            givenName: "William Jefferson Blythe III" },
  { no: 43, name: "George Walker Bush",           start: 2001, end: 2009 },
  { no: 44, name: "Barack Hussein Obama II",      start: 2009, end: 2017 },
  { no: 45, name: "Donald John Trump",            start: 2017, end: 2021 },
  { no: 46, name: "Joseph Robinette Biden Jr.",   start: 2021, end: 2025 },
  { no: 47, name: "Donald John Trump",            start: 2025, end: null },
];
