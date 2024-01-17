# Change log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [unreleased]

### Changed

- optimized all modules/classes/functions for jsdoc and jsdoc2md for the wiki

## [0.6.0] - 2024-01-15

### Added

- pf2e-scribe/actor-actions: add actions, reactions and free actions
- pf2eHelper: format individual traits
- ScribeProvider: improve description formatting
- ScribeProvider: add footer to scribeTableEntry
- ScribeProvider: add scribeStrike class to format melee and ranged strikes
- ScribeProvider: add scribeAction class to format actions, reactions and free actions

### Fixed

- ScribeProvider/scribeSpell: improve spell defense

## [0.5.0] - 2024-01-15

### Added

- add extra formatter
- module: scribe Table Entry class
- pf2e-scribe: Start new file for a character's actions

### Changed

- module: rename scribeItem class to scribeItemEntry to avoid confusion with PF2e Items
- pf2e-scribe: change provider icon
- module: allow overriding sourceFileURI  and destinationFileName from a provider definition

### Removed

- unused template

## [0.4.1] - 2024-01-13

### Fixed

- pf2e-scribe: provide default for `actor.system.crafting`
- module: pdfProvider: restore image buffer.

## [0.4.0] - 2024-01-13

### Added

- module: add @Compendium formatter to ScribeProvider, courtesy of *sjbehindthescreen*
- pf2e-scribe: Add new file to generate the character's ABC

### Changed

- module: cleanup ScribeProvider by replacing old functions with pf2eHelper functions

## [0.3.3] - 2024-01-13

### Added

- module: provide the calculation of the short ordinal of a number
- module: use createImageBitmap to render image in pdfProvider

### Changed

- module: scribeProvider offers the `scribe*`` classes as static classes now.
- pf2e-scribe provider: use static scribeProvider classes
- module: move PDFProvider.loadImage to baseProvider.loadImage
- module: use createImageBitmap to render image

### Fixed

- module: fix webp image embedding

## [0.3.2] - 2024-01-13

### Changed

- pf2e-scribe provider: provide text instead of scribe Objects

## [0.3.1] - 2024-01-13

### Fixed

- module: upload omitted ScribeProvider library

## [0.3.0] - 2024-01-13

### Added

- new provider: pf2e-scribe which exports in scribe.pf2.tools format

## [0.2.0] - 2024-01-12

### Added

- pf2e-remaster provider: add formulas to extra sheet
- module: new pf2eHelper function and glyph variables to format actions (pf2eHelper.formatActivity)
- module: new pf2eHelper function to resolve sizes (pf2eHelper.resolveSize)
- module: new pf2eHelper function to format spellcasting times (pf2eHelper.formatSpellCastingTime)

### Changed

- pf2e-remaster provider: replace pf2eHelper.actionsToSymbols with pf2eHelper.formatActivity and pf2eHelper.formatSpellCastingTime

### Fixed

- pf2e-remaster provider: worn item fields were wrong
- module: update pf2eHelper.formatTraits to detect alignment traits when separate

### Removed

- module: pf2eHelper.actionsToSymbols, which is replaced by pf2eHelper.formatActivity and pf2eHelper.formatSpellCastingTime

## [0.1.0] - 2024-01-12

### Changed

- pf2e-remaster provider: remove condition penalties/bonuses from class dc as they are temporary
- pf2e-remaster provider: remove condition penalties/bonuses from skills as they are temporary
- pf2e-remaster provider: remove condition penalties/bonuses from perception as they are temporary
- pf2e-remaster provider: remove condition penalties/bonuses from spell DCs as they are temporary
- pf2e-remaster provider: remove condition penalties/bonuses from armor class as they are temporary
- pf2e-remaster provider: remove condition penalties/bonuses from attacks as they are temporary
- pf2e-remaster provider: remove condition penalties/bonuses from saves as they are temporary
- pf2e-remaster provider: remove condition penalties/bonuses from saves as they are temporary

## [0.0.13] - 2024-01-11

### Fixed

- pf2e-remaster provider: fix defaults bug causing the +10 to be dropped.
- module: fix wrong handling of providers and files to download.

## [.0.12] - 2024-01-11

### Fixed

- pf2e-remaster provider: fix PDF ritual fields
- pf2e-remaster provider: add attacks to extra sheet
- pf2e-remaster provider: make variables robust by creating defaults
- pf2e-remaster provider: speed penalty when str matches requirements

## [0.0.11] - 2024-01-11

### Fixed

- pf2e-remaster provider: restore spell dcs

## [0.0.10] - 2024-01-11

### Fixed

- module: download the correct files

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
