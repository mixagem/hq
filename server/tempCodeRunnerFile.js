export function savingsGraphSnapshot() {

  const YEAR = 2023

  const DATA_INI = new Date('2022-01-01T00:00:00.000Z'); DATA_INI.setFullYear(YEAR); const DATA_INI_MS = DATA_INI.getTime();
  const DATA_FINI = new Date('2022-01-01T00:00:00.000Z'); DATA_FINI.setFullYear(YEAR+1); const DATA_FINI_MS = DATA_FINI.getTime()-1;

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('[S1] generating savings graph snapshot');
  });

  let snapshotArray = [0];
