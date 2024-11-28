# Change log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [CalVer](https://calver.org/about.html) versioning.

## [unreleased]

### Added

- `PF2eHelper.pf2ePlayer.bonusFeats` to provide a list of bonus feats

### Fixed

- Include heritage bonus feats in ancestry and heritage abilities (`PF2eHelper.pf2ePlayer.ancestryAndHeritageAbilities`)
- pf2e-remaster-bushvin provider to show bonus feats
- pf2e-remaster-paizo provider to show bonus feats
- pf2e-black-book-editions provider to show bonus feats
- pf2e-scribe provider to show bonus feats
- `PF2eHelper` invalid actor references

## [2024.11.3] 2024-11-27

### Added

- Functionality to override the font used in PDFs ([Feature 13](https://github.com/bushvin/actor-export/issues/13)).
  Go to *Game Settings* >> *Configure Settings* >> toggle **Override PDF fonts** and select **Override PDF font selection**

## [2024.11.2] 2024-11-13

### Added

- `ScribeProvider.scribeCreature.otherActivities` to provide activities which are neither `offensive` nor `defensive` (thank you master of old)

### Fixed

- `PF2eHelper.pf2ePlayer.background` the description should have a default value (thank you master of old)

## [2024.11.1] 2024-11-12

### Added

- `actor.type` which allows to show/hide export options based on the actor's type (character, npc, familiar)

### Fixed

- `.prepareFinalAttributes()` causes issues when called multiple times. fixed by calling `.reset()` see [this](https://github.com/foundryvtt/dnd5e/issues/3630) issue for more info. (thank you yoriik and twarx)

## [2024.7.4] 2024-07-30

### Changed

- pfrpg-paizo provider: Game system must be at least 10.0
- pfrpg-paizo provider: correct naming and description.

### Fixed

- pfrpg-paizo provider: actions without conditionals are now handled better (thank you frazhuz)
- pfrpg-paizo provider: actions without damage are now handled better (thank you frazhuz)
- pfrpg-paizo provider: languages are arrays, not strings. (thank you frazhuz)

## [2024.7.3] 2024-07-30

### Added

- 'Black Book Éditions Feuilles de personnage en français' provider for French Charactersheets (thank you Morgul)

### Changed

- pf2e-remaster-bushvin provider: correct naming and description.
- pf2e-remaster-paizo provider: correct naming and description.

### Fixed

- pf2e-remaster-bushvin provider: Gems and Artworks show correct information
- pf2e-remaster-bushvin provider: Fix position of spell type title
- pf2e-remaster-bushvin provider: Fix equipment tables
- pf2e-remaster-paizo provider: Gems and Artworks show correct information
- pf2e-remaster-paizo provider: Fix position of spell type title
- pf2e-remaster-paizo provider: Fix equipment tables
- `PDFProvider.pdfProvider.embedTextBox`: multiline text should not overflow textbox if overflow is disabled.

## [2024.7.2] 2024-07-22

### Fixed

- `ScribeProvider.scribeCharacterFeat.scribify`: check if `this._feat.prerequisites` exists to avoid errors (thank you, murgol)
- `PF2eHelper.pf2eActor.ancestryFeats` add names of feats granted by this feat
- `PF2eHelper.pf2eActor.skillFeats` add names of feats granted by this feat
- `PF2eHelper.pf2eActor.generalFeats` add names of feats granted by this feat
- pf2e-remaster-bushvin provider: enum feats/features by predefined levels to avoid missing levels which are not defined by the actor owner
- pf2e-remaster-paizo provider: enum feats/features by predefined levels to avoid missing levels which are not defined by the actor owner

## [2024.7.1] - 2024-07-08

### Added

- Support for Foundry VTT v12.325
- Support Foundry VTT version check in providers
- Improved A`PI Documentation

### Fixed

- pf2e-remaster-bushvin provider: fix weapon proficiency order (thank you @OnlineCaveman)
- pf2e-remaster-paizo provider: fix weapon proficiency order (thank you @OnlineCaveman)
- dnd5e provider: fix order of investigation and intimidation skills (thank you Surb)

## [2024.6.3] - 2021-06-03

### Added

- `PDFProvider.pdfProvider.embedFont` supports pdf-lib.StandardFonts
- `PDFProvider.pdfProvider.saveFile` include document metadata
- dnd5e provider: pdf title
- pf2e-remaster-bushvin provider: pdf title
- pf2e-remaster-paizo provider: pdf title

### Changed

- `PDFProvider.pdfProvider.embedImage` simplify method
- `PDFProvider.pdfProvider.embedFont` simplify method
- `PDFProvider.pdfProvider.embedTextBox` simplify method
- `PDFProvider.pdfProvider.embedTextBox` make font name case insensitive to lookup

### Fixed

- `PF2eHelper.pf2eActorPropertyError` had a typo in the name

## [2024.6.2] - 2024-06-03

### Fixed

- dnd5e provider: fix total hit dice and current hit dice
- `DND5eHelper.dnd5eHelper.hd` only current and max value is needed
- `DND5eHelper.dnd5eHelper.background` work around issue with background not defined

## [2024.6.1] - 2024-06-03

### Changed

- `PDFProvider.pdfProvider.saveFile` prints a PDF field schema of fields found in the pdf file
- `PF2eHelper.pf2eHelper.ancestryFeats` gets ancestry feats for each level, instead of every 4 levels
- `PF2eHelper.pf2eHelper.skillFeats` gets skill feats for each level, instead of every 2 levels
- `PF2eHelper.pf2eHelper.generalFeats` gets general feats for each level, instead of every 4 levels

### Fixed

- pf2e-paizo-bushvin provider: More than 2 lore skills no longer raise an error
- pf2e-paizo-bushvin provider: Lore skill name is shortened when it starts with "lore"
- pf2e-paizo-bushvin provider: Add skill feats for each level
- pf2e-paizo-paizo provider: More than 2 lore skills no longer raise an error
- pf2e-paizo-paizo provider: Lore skill name is shortened when it starts with "lore"
- pf2e-paizo-paizo provider: Add skill feats for each level

## [2024.5.8] - 2024-05-27

### Fixed

- dnd5e provider: the german charactersheet pdf was never included

## [2024.5.7] - 2024-05-27

### Changed

- dnd5e provider: english charactersheet is now 1 pdf

## [2024.5.6] - 2024-05-24

### Added

- dnd5e provider: Official German charactersheet
- pfrpg provider: the original Pathfinder RPG Character Sheet by Paizo

### Changed

- move `PDFProvider.pdfProvider.embedTextBox` page dimension debug to `PDFProvider.pdfProvider.saveFile`
- `PDFProvider.pdfProvider` relative sizes are absolute now in pixels
- dnd5e provider uses absolute sizes
- pf2e-remaster-paizo provider uses absolute sizes
- pf2e-remaster-bushvin provider uses absolute sizes

### Removed

- the original pf2e-remaster provider which started this all is now removed.

## [2024.5.5] - 2024-05-17

### Added

- new function `DND5eHelper.dnd5eActor.removeSecrets` to remove secrets from texts
- `PF2eHelper.pf2ePlayer.knownFormulas` error trapping

### Changed

- `BaseProvider.baseProvider.cleanFoundryMarkup` add a newline character to horizontal rulers
- `BaseProvider.baseProvider.cleanFoundryMarkup` clean up `section` elements
- `DND5eHelper.dnd5eActor.details` use `DND5eHelper.dnd5eActor.removeSecrets` to cleanup the backstory

### Fixed

- `providers/dnd5e/provider.js` align spell preparation checkmarks with spellname

## [2024.5.4] - 2024-05-08

### Added

- `BaseProvider.providerError` error class

### Changed

- add information to `convert-pdf-export.py`

### Fixed

- Issue with `DND5eHelper.dnd5eActor.languages`
- Issue with `DND5eHelper.dnd5ePlayer.background`
- Issue with `DND5eHelper.dnd5ePlayer.race`

## [2024.5.3] - 2024-05-03

### Added

- an upload button for the custom provider
- custom provider file upload support for `BaseProvider.baseProvider`
- custom provider file upload support for `PDFProvider.pdfProvider`
- a python script to convert pdf-export mappings to actor-export custom provider

### Changed

- improve `PDFProvider.pdfProvider.getField()` error reporting

### Fixed

- `PDFProvider.pdfProvider.updateFile()` fieldExists syntax was wrong

## [2024.5.2] - 2024-05-03

### Added

- `BaseProvider.baseProvider.clone` to properly deep clone the object

### Changed

- `BaseProvider.baseProvider.providerFullFilePath` allow an external file to be loaded by the provider
- `PDFProvider.pdfProvider.embedFont` font cache detection

### Fixed

- Issue causing the MarkerFelt font to scramble the output (thank you @BDimi)

## [2024.5.1] - 2024-05-02

### Added

- implicit font definitions

## [2024.4.6] - 2024-04-29

### Added

- Dungeons and Dragons 5th edition provider and standard character sheet in Portuguese
- `DND5eHelper` has localization support for relevant text fields
- dnd5e provider: added biography

### Changed

- `PDFProvider.pdfProvider.image` supports an array for both file name and page number
- `PDFProvider.pdfProvider.textBox` supports an array for both file name and page number
- `BaseProvider.baseProvider.cleanFoundryMarkup` strip `a` html tags

### Fixed

- `PDFProvider.pdfProvider.embedTextBox` should respect newline characters
- `PDFProvider.pdfProvider.embedImage` correctly counts pdf pages
- `PDFProvider.pdfProvider.embedTextBox` correctly counts pdf pages

## [2024.4.5] 2024-04-27

### Added

- Dungeons and Dragons 5th edition provider and standard character sheet
- Created `GenericHelper.genericPropertyError` base class for all actor property errors

### Changed

- modified `PF2eHelper.f2eActorPropertyError` to use `GenericHelper.genericPropertyError` as a base class

### Fixed

- PF2eHelper documentation (JSDOC)

## [2024.4.4] 2024-04-18

### Deprecated

- *Bushvin's PF2e Remaster Character sheet* (pf2e-remaster) will be removed 2024-05-01

### Added

- `pf2e-scribe` provider inventory
- `ScribeProvider.scribeBreak` a class to generate a scribe formatted break
- `ScribeProvider.scribeCharacterItem` a class to generate a scribe formatted character item
- `ScribeProvider.scribeTable.setFooter` allow the table footer to be specified outside of the initialization of the object

### Changed

- pf2e lore skills should not be stripped of 'lore'
- `PF2eHelper.pf2eActor` item list generation

### Fixed

- `ScribeProvider.scribeBase.label` fix label generation when label starts with a + sign
- `ScribeProvider.scribeItem.scribify` rank should always be a number.
- `ScribeProvider.scribeItem.scribify` fix invalid reference
- `ScribeProvider.scribeItem.scribify` hide traits when there really is nothing to show
- `ScribeProvider.scribeTable` each line of the footer should be prefixed with a dot

## [2024.4.3] 2024-04-14

### Fixed

- selecting multiple sheets from the s  ame provider will render all of them

## [2024.4.2] 2024-04-12

### Added

- documentation for genericHelper.unique
- genericHelper.evalCheckMark to standardize text-based checkmarks

### Fixed

- ScribeProvider module scribeCreature.acSaves AC modifier
- PF2eHelper fix pf2eActorPropertyError name
- PDFProvider vertical middle alignment of textBox contents
- pf2e-remaster-bushvin pf2e-remaster.pdf Action Icons fix (thank you @spookymonster)

## [2024.4.1] 2024-04-03

### Added

- Deprecation message for pf2e-remaster (the original). The provider will be removed 2024-05-01.
- Wiki for pf2e-remaster-bushvin
- Wiki for pf2e-remaster-paizo

### Changed

- pf2eHelper: 'lore' is removed from the end of lore skill labels.

### Fixed

- pf2e-remaster-bushvin: quantify attributes and skills
- pf2e-remaster-paizo: quantify attributes

## [2024.3.6] 2024-03-29

## Added

- source of the pf2e-remaster-bushvin pf2e-remaster.pdf (pf2e-remaster.svg), created by Inkscape

## Changed

- improve abstraction of FoundryVTT actor (pf2eActor, pf2ePlayer, pf2eNPC)
- improve the scribeProvider class and related helper with standardized interfaces
- improved the pf2e-scribe provider
- improved the pf2e-remaster-bushvin provider
- improved the pf2e-remaster-paizo provider

## [2024.3.5] 2024-03-27

### Fixed

- Players have access to the export function now (thank you ksignorini)

## [2024.3.4] 2024-03-26

### Added

- Bushvin's Remastered PDF using the new text embedding

## [2024.3.3] 2024-03-26

### Added

- actor abstraction classes to simplify actor properties and provide error trapping

### Changed

- standardize naming
- improved error trapping

## [2024.3.2] 2024-03-21

### Changed

- genericHelper.stripHTMLtag: remove additional spaces before/after opening/closing tags
- pf2eHelper.damageFormula: damage calculation for NPCs is done differently
- scribeBase._parse_description: filter more and better
- pf2e-scribe provider: item( needs to be followed by a newline

## [2024.3.1] - 2024-03-21

### Added

- baseProvider.cleanFoundryMarkup: a function to cleanup Foundry text
- pdfProvider.convertHexColorToRgb: convert html color to rgb
- pdfProvider.defaultFont: set the default font for text boxes in the PDF
- pdfProvider.defaultFontColor: set the default font color for text boxes in the PDF
- pdfProvider.embedFont: embed a font file into a PDF
- pdfProvider.embedTextBox: embed a text box into a PDF
- pdfProvider.parseValue: parse a value using a parser function
- pdfProvider.textBox: Add PDF textbox information
- actorExport.providerPath: Provide the path to the provider
- fonts

### Changed

- baseProvider.download functionality is changed to include the path to the provider
- baseProvider.loadImage handles errors better
- baseProvider.notify improvements
- pdfProvider.download to align with baseProvider.download and improve error handling
- pdfProvider.embedImage improve code and error handling
- pdfProvider.field code improvements
- pdfProvider.getFieldValue use pdfProvider.parseValue method
- pdfProvider.image code improvements
- pdfProvider.parseFile better error handling
- scribeProvider.download to align with baseProvider.download.
- actorExport.parseFilePath use actorExport.providerPath
- actorExport.downloadFiles to provide the providerpath to the mapper download method

## [2024.2.3] - 2024-02-28

### Added

- provider documentation which is imported in the wiki
- show heightened signature spells for spontaneous casters

### Fixed

- removed graphical objects which were not needed

## [2024.2.2] - 2024-02-07

### Fixed

- restored the pf2e-remaster provider as it got somehow deleted

## [2024.2.1] - 2024-02-07 [YANKED]

Release versioning will from now on adhere to CalVer: `YYYY.MM.MICRO`

Where:

- `YYYY`: Full year - 2006, 2016, 2106
- `MM` - Short month - 1, 2 ... 11, 12
- `MICRO` - release number of the month - 1, 2, 3 ...

### Changed

- Release versioning to CalVer
- Remove warning about 0-level characters

### Fixed

- Show cantrips for 0-level characters
- No class entry needed

## [1.4.1]

### Changed

- documentation for pdfProvider.field

### Fixed

- pf2e-remaster: add 1st level class feat to "Class Feats and Features" field

## [1.4.0] - 2024-02-03

### Added

- PDFProvider library: support asynchronous values

### Changed

- module: include the ScribeProvider in the example code section of the custom provider dialog
- module: include a link to the wiki to the custom provider dialog
- pf2e-remaster: get damage formula as generated by the pf2e system

## [1.3.0] - 2024-01-31

### Added

- PF2eHelper: new functions to strip html code from text (stripHTMLtag, stripNestedHTMLtag)
- pf2e-remaster: show sub class in class notes

### Changed

- pf2e-remaster: updated PDF to better format character information
- pf2e-remaster: format character background information
- pf2e-scribe: replace legacy functions with helper functions
- module: improve error handling of custom and regular providers

### Fixed

- module: fix custom provider updating the progress (thank you Peter G)

## [1.2.0] - 2024-01-25

### Added

- pf2e-remaster: add granted feats to ABC level features (thank you MrOleThalund)

### Changed

- PF2eHelper: use dex attribute modifier for damage when higher than str attribute modifier and actor is a thief.
- pf2e-remaster: use options instead of domains to determine strike category
- pf2e-remaster: simplify ABC level feats and features
- pf2e-remaster: improve on held and worn items (thank you MrOleThalund)

### Fixed

- pf2e-remaster: Perception item bonus was taking the proficiency bonus (thank you MrOleThalund)
- pf2e-remaster: remove coins from treasure list (thank you MrOleThalund)
- PF2eHelper: damage should use dex attribute when character is a thief and the weapon has finesse (thank you MrOleThalund)
- pf2e-remaster: Use Dex attribute for ranged weapons (thank you MrOleThalund)
- pf2e-remaster: consumables were not displayed correctly (thank you MrOleThalund)
- pf2e-remaster: center Perception Proficiency modifier on PDF sheet (thank you MrOleThalund)

## [1.1.0] - 2024-01-24

### Added

- PF2eHelper: universal helper to calculate a strike's damage
- PF2eHelper: universal helper to calculate a strike's damage formula
- pf2e-remaster: hero points

### Changed

- PF2eHelper.formatTrait: improve trait detection and generation
- ScribeProvider: use damage formula helper
- ScribeProvider: detect melee and ranged strikes for NPCs and PCs properly
- ScribeProvider: standardize strike output
- pf2e-remaster: use new helper functions

### Fixed

- ScribeProvider: properly separate spells for spellcasters
- pf2e-scribe provider: fix rangedActions detection
- pf2e-scribe provider: updated class usage
- PF2eProvider: use dex attribute modifier if strike has finesse and the modifier is higher than the str attribute

## [1.0.0] - 2024-01-19

### Added

- pf2e-remaster: added greater weapon specialization
- module: provide a download progress spinner

### Changed

- PDFProvider: simplify image handling

### Fixed

- pf2e-remaster: weapon specialization is for all strike types

## [0.8.1] - 2024-01-18

Faulty pieline

## [0.8.0] - 2024-01-18

### Changed

- pf2e-remaster: added archetype feats to level progression table
- pf2e-remaster: calculation of background feats
- pf2e-remaster: show all ancestry, general, skill, feats gained by level instead of just one
- pf2e-remaster: increase size of lore skill fields
- pf2e-remaster: support finesse and apply ability where needed
- pf2e-remaster: move items which are in a container to the `extra` sheet
- pf2e-remaster: Weapon Specialization bonus to melee attacks
- pf2e-remaster: revert spell enumeration to the maximum rank of spells a character can cast

## [0.7.1] - 2024-01-17

forgot to push the commits

## [0.7.0] - 2024-01-17 [YANKED]

### Added

- PDFProvider: warn if image cannot be found, and skip gracefully
- pf2e-remastered: warn the user when the character has 0 levels

### Changed

- optimized all modules/classes/functions for jsdoc and jsdoc2md for the wiki
- PDFProvider: throw an error if the PDF form cannot be read
- pf2e-remastered: enumerate all spell ranks from 1 to 10 instead of up to the caster spell rank
- pf2e-remastered: only add ability modifiers to melee attacks

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

## [0.0.12] - 2024-01-11

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
