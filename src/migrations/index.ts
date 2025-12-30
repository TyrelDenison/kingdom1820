import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20251215_160811 from './20251215_160811';
import * as migration_20251215_164007 from './20251215_164007';
import * as migration_20251215_180619 from './20251215_180619';
import * as migration_20251217_145316 from './20251217_145316';
import * as migration_20251229_224933 from './20251229_224933';
import * as migration_20251230_002230 from './20251230_002230';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20251215_160811.up,
    down: migration_20251215_160811.down,
    name: '20251215_160811',
  },
  {
    up: migration_20251215_164007.up,
    down: migration_20251215_164007.down,
    name: '20251215_164007',
  },
  {
    up: migration_20251215_180619.up,
    down: migration_20251215_180619.down,
    name: '20251215_180619',
  },
  {
    up: migration_20251217_145316.up,
    down: migration_20251217_145316.down,
    name: '20251217_145316',
  },
  {
    up: migration_20251229_224933.up,
    down: migration_20251229_224933.down,
    name: '20251229_224933',
  },
  {
    up: migration_20251230_002230.up,
    down: migration_20251230_002230.down,
    name: '20251230_002230'
  },
];
