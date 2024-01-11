# Change log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.10] - 2024-01-11

### Fixed

- download the correct files

## [0.0.9] - 2024-01-11

### Fixed

- pf2e-remaster provider: there can be more than 1 level dependent feature/feat
- pf2e-remaster provider: spelllists (cantrip, focus, spells) have been overhauled to show all

## [0.0.8] - 2024-01-11

### Fixed

- pf2e-remaster provider: fix deprecated shield information

## [0.0.7] - 2024-01-10

### Changed

- pf2e-remaster provider: hide Spell Casting Entity title if there are no cantrips or spells

### Fixed

- pf2e-remaster provider: fix destination filename when selecting multiple files to download
- pf2e-remaster provider: wait for PDF to be saved before going to the next one

## [0.0.6] - 2024-01-10

### Changed

- improve content detection and fall back on extension for image parsing

### Fixed

- avoid caching when importing `provider.js`
- remove `getRoute` as it prefixes all paths with `/`
- pf2e-remaster provider: catch deprecated properties < 5.12.0
- pf2e-remaster provider: backgrounds should not fail when none is selected

## [0.0.5] - 2024-01-09

### Fixed

- complete manifest with manifest URL and download

## [0.0.4] - 2024-01-09

### Changed

- Version bump

## [0.0.2] - 2024-01-09

### Fixed

- pipeline issue

## [0.0.1] - 2024-01-08

Happy new year!
A new year, a new exporter for FoundryVTT

### Added

- support for PDF export
- support for custom sheet definitions
- export PF2e remaster
