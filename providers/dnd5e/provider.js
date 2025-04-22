import { pdfProvider } from '../../scripts/lib/providers/PDFProvider.js';
import { dnd5eHelper } from '../../scripts/lib/helpers/DND5eHelper.js';
// import { semVer } from '../../scripts/lib/SemVer.js';

const mapper = new pdfProvider(actor);
mapper.defaultFont('MarkerFelt.ttf', 12, 14);
mapper.defaultFontColor('#01579b');
// mapper.debugProvider = true;

// Font definitions
const mf_default = {};
const mf_8 = { ...mf_default, ...{ size: 8, lineHeight: 10 } };
const mf_8_middle = { ...mf_8, ...{ valign: 'middle' } };
const mf_8_multiline = { ...mf_8, ...{ multiline: true, valign: 'top' } };
const mf_8_centered = { ...mf_8, ...{ halign: 'center' } };
const mf_8_centered_middle = { ...mf_8_centered, ...mf_8_middle };
const mf_12 = { ...mf_default, ...{ size: 12, lineHeight: 14 } };
const mf_12_multiline = { ...mf_12, ...{ multiline: true, valign: 'top' } };
const mf_12_middle = { ...mf_12, ...{ valign: 'middle' } };
const mf_12_centered = { ...mf_12, ...{ halign: 'center' } };
const mf_12_centered_middle = { ...mf_12_centered, ...mf_12_middle };
const mf_15 = { ...mf_default, ...{ size: 15, lineHeight: 17 } };
const mf_15_middle = { ...mf_15, ...{ valign: 'middle' } };
const mf_15_centered = { ...mf_15, ...{ halign: 'center' } };
const mf_15_centered_middle = { ...mf_15_centered, ...mf_15_middle };
const mf_17 = { ...mf_default, ...{ size: 17, lineHeight: 19 } };
const mf_17_middle = { ...mf_17, ...{ valign: 'middle' } };
const mf_17_centered = { ...mf_17, ...{ halign: 'center' } };
const mf_17_centered_middle = { ...mf_17_centered, ...mf_17_middle };
const mf_24 = { ...mf_default, ...{ size: 24, lineHeight: 26 } };
const mf_24_middle = { ...mf_24, ...{ valign: 'middle' } };
const mf_24_centered = { ...mf_24, ...{ halign: 'center' } };
const mf_24_centered_middle = { ...mf_24_centered, ...mf_24_middle };
const f_debug = { debug: true };
let ref;
let fileNames;

/**
 * Prints the skills to the sheet in the given order
 *
 * @param skills {number[]} the character's skills
 * @param verticalPositioning {number[]} the vertical offset for each skill as an array. With this parameter, you can control the skill ordering.
 * @param horizontalPositioning {number} the horizontal offset of the skills box
 */
function printSkills(skills, verticalPositioning, horizontalPositioning) {
    Object.values(skills)
        .sort((a, b) => a.slug.localeCompare(b.slug))
        .forEach((skill, idx) => {
            const skillY = verticalPositioning[idx];
            const ref = `${skill.label} skill`;
            const isProficient = dnd5eHelper.evalCheckMark(skill.isProficient);
            const skillModifier = dnd5eHelper.quantifyNumber(skill.modifier);
            mapper.textBox(ref, fileNames, 0, horizontalPositioning, skillY + 3, 7, 10, isProficient, mf_8_centered);
            mapper.textBox(ref, fileNames, 0, horizontalPositioning + 10, skillY, 16, 14, skillModifier, mf_12_centered);
        });
}

const character = dnd5eHelper.getActorObject(game, actor);
mapper.pdfTitle = character.name;

// ______      ______   _____        _____            _ _     _
// |  _  \___  |  _  \ |  ___|      |  ___|          | (_)   | |
// | | | ( _ ) | | | | |___ \  ___  | |__ _ __   __ _| |_ ___| |__
// | | | / _ \/\ | | |     \ \/ _ \ |  __| '_ \ / _` | | / __| '_ \
// | |/ / (_>  < |/ /  /\__/ /  __/ | |__| | | | (_| | | \__ \ | | |
// |___/ \___/\/___/   \____/ \___| \____/_| |_|\__, |_|_|___/_| |_|
//                                               __/ |
//                                              |___/

// D&D 5e CHaracter Sheet by WoTC
fileNames = ['CharacterSheetComplete.pdf'];
mapper.textBox('character name', fileNames, 0, 45, 55, 218, 24, character.name, mf_24);
const classLevels = character.classLevels.map((m) => m.displayName).join(', ');
mapper.textBox('class levels', fileNames, 0, 268, 49, 112.5, 14, classLevels, mf_12);
mapper.textBox('race', fileNames, 0, 268, 75, 112.5, 14, character.race.name, mf_12);

mapper.textBox('background', fileNames, 0, 384, 49, 95, 14, character.background.name, mf_12);
mapper.textBox('alignment', fileNames, 0, 384, 75, 95, 14, character.alignment.name, mf_12);

mapper.textBox('player name', fileNames, 0, 481, 49, 88, 14, character.ownerName, mf_12);
mapper.textBox('xp', fileNames, 0, 481, 75, 88, 14, character.xp, mf_12);

// Abilities and saving throws
let abilitiesY = [152, 224, 295, 367, 438, 510];
let savingThrowsY = [201, 214, 228, 241, 255, 268];
Object.values(character.abilities).forEach((a) => {
    const abilityY = abilitiesY[0];
    abilitiesY.shift();
    const saveY = savingThrowsY[0];
    savingThrowsY.shift();
    ref = `ability ${a.name}`;
    mapper.textBox(ref, fileNames, 0, 35, abilityY, 45, 24, a.value, mf_24_centered_middle);
    const modifier = dnd5eHelper.quantifyNumber(a.modifier);
    mapper.textBox(ref, fileNames, 0, 45, abilityY + 34, 25, 14, modifier, mf_12_centered_middle);
    ref = `saving throw ${a.name}`;
    const isProficient = dnd5eHelper.evalCheckMark(a.isProficient);
    mapper.textBox(ref, fileNames, 0, 101, saveY + 2, 7, 10, isProficient, mf_8_centered);
    mapper.textBox(ref, fileNames, 0, 112, saveY, 16, 14, dnd5eHelper.quantifyNumber(a.save), mf_12_centered);
});

const hasInspiration = dnd5eHelper.evalCheckMark(character.hasInspiration);
const proficiencyBonus = dnd5eHelper.quantifyNumber(character.proficiencyBonus);
mapper.textBox('inspiration', fileNames, 0, 95, 130, 25, 19, hasInspiration, mf_12_centered_middle);
mapper.textBox('proficiency bonus', fileNames, 0, 95, 165, 25, 25, proficiencyBonus, mf_17_centered_middle);

// skills      acr  ani  arc  ath  dec  his  ins  inv  itm  med  nat  per  prc  prf  rel  slt  ste  sur
// english     acr  ani  arc  ath  dec  his  ins  itm  inv  med  nat  prc  prf  per  rel  slt  ste  sur
let skillsY = [316, 328, 343, 356, 370, 383, 397, 424, 410, 437, 451, 491, 464, 478, 505, 518, 532, 545];
printSkills(character.skills, skillsY, 101);

// AC
ref = 'AC';
mapper.textBox(ref, fileNames, 0, 228, 138, 39, 29, character.ac.value, mf_17_centered_middle);

// Initiative
ref = 'initiative';
const initiative = dnd5eHelper.quantifyNumber(character.initiative.total);
mapper.textBox(ref, fileNames, 0, 282, 138, 43, 29, initiative, mf_17_centered_middle);

// Speed
ref = 'movement';
let baseMovement;
if (character.movement.filter((f) => f.isPrimary).length > 0) {
    baseMovement = character.movement.filter((f) => f.isPrimary)[0];
} else {
    baseMovement = character.movement[0];
}
mapper.textBox(ref, fileNames, 0, 340, 138, 44, 29, baseMovement.value, mf_17_centered_middle);
if (baseMovement.slug !== 'walk') {
    mapper.textBox(ref, fileNames, 0, 340, 163, 44, 14, baseMovement.label, mf_12_centered_middle);
}

//Hit Points
ref = 'hit point';
mapper.textBox(ref, fileNames, 0, 290, 193, 91, 14, character.hp.max, mf_12);
mapper.textBox(ref, fileNames, 0, 228, 211, 91, 14, character.hp.value, mf_12);

mapper.textBox(ref, fileNames, 0, 228, 262, 91, 14, character.hp.temp, mf_12);

// Hid Dice
mapper.textBox(ref, fileNames, 0, 246, 313, 48, 14, character.hd.max, mf_12);
mapper.textBox(ref, fileNames, 0, 228, 329, 70, 14, character.hd.value, mf_12);

// Death Saves
const deathSuccesses = character.deathSave.successes;
const deathFails = character.deathSave.failures;
ref = 'death saves';
mapper.textBox(ref, fileNames, 0, 346, 322, 9, 9, dnd5eHelper.evalCheckMark(deathSuccesses >= 1), mf_12_centered);
mapper.textBox(ref, fileNames, 0, 359, 322, 9, 9, dnd5eHelper.evalCheckMark(deathSuccesses >= 2), mf_12_centered);
mapper.textBox(ref, fileNames, 0, 372, 322, 9, 9, dnd5eHelper.evalCheckMark(deathSuccesses >= 3), mf_12_centered);

mapper.textBox(ref, fileNames, 0, 346, 337, 9, 9, dnd5eHelper.evalCheckMark(deathFails >= 1), mf_12_centered);
mapper.textBox(ref, fileNames, 0, 359, 337, 9, 9, dnd5eHelper.evalCheckMark(deathFails >= 2), mf_12_centered);
mapper.textBox(ref, fileNames, 0, 372, 337, 9, 9, dnd5eHelper.evalCheckMark(deathFails >= 3), mf_12_centered);

// Personality Traits
ref = 'Personality Traits';
mapper.textBox(ref, fileNames, 0, 415, 137, 160, 61, character.details.traits, mf_8_multiline);

// ideals
ref = 'ideals';
mapper.textBox(ref, fileNames, 0, 415, 206, 160, 47, character.details.ideals, mf_8_multiline);

// Bonds
ref = 'Bonds';
mapper.textBox(ref, fileNames, 0, 415, 262, 160, 47, character.details.bonds, mf_8_multiline);

// flaws
ref = 'flaws';
mapper.textBox(ref, fileNames, 0, 415, 317, 160, 47, character.details.flaws, mf_8_multiline);

// Passive wisdom
ref = 'passive wisdom';
mapper.textBox(ref, fileNames, 0, 29, 588, 28, 23, character.skills.prc.passive, mf_17_centered_middle);

// Other Proficiencies and Languages
const otherProficienciesAndLanguages = [];

if (character.weaponProficiencies.length > 0) {
    otherProficienciesAndLanguages.push('Weapons: ' + character.weaponProficiencies.map((m) => m.label).join(', '));
}

if (character.armorProficiencies.length > 0) {
    otherProficienciesAndLanguages.push('Armor: ' + character.armorProficiencies.map((m) => m.label).join(', '));
}

if (character.toolProficiencies.length > 0) {
    otherProficienciesAndLanguages.push('Tools: ' + character.toolProficiencies.map((m) => m.label).join(', '));
}

if (character.languages.length > 0) {
    otherProficienciesAndLanguages.push('Languages: ' + character.languages.map((m) => m.label).join(', '));
}

ref = 'Other Proficiencies and Languages';
mapper.textBox(ref, fileNames, 0, 31, 624, 172, 142, otherProficienciesAndLanguages.join(';\n'), mf_8_multiline);

// coins
ref = 'coins';
mapper.textBox(ref, fileNames, 0, 223, 598, 40, 20, character.coins.cp, mf_15_centered_middle);
mapper.textBox(ref, fileNames, 0, 223, 624, 40, 20, character.coins.sp, mf_15_centered_middle);
mapper.textBox(ref, fileNames, 0, 223, 650, 40, 20, character.coins.ep, mf_15_centered_middle);
mapper.textBox(ref, fileNames, 0, 223, 676, 40, 20, character.coins.gp, mf_15_centered_middle);
mapper.textBox(ref, fileNames, 0, 223, 702, 40, 20, character.coins.pp, mf_15_centered_middle);

// equipment
ref = 'equipment';
const equipmentType = ['equipment', 'weapon'];
const equipment = character.equipment
    .filter((f) => equipmentType.includes(f.type))
    .map((m) => m.displayName)
    .join(', ');
mapper.textBox(ref, fileNames, 0, 268, 590, 124, 176, equipment, mf_8_multiline);

// features and traits
ref = 'features and traits';
const featuresAndTraits = [];
if (character.features.length > 0) {
    featuresAndTraits.push(
        'Features: ' +
            character.features
                .map((m) => m.name)
                .sort()
                .join(', ')
    );
}

if (character.traits.length > 0) {
    featuresAndTraits.push(
        'Features: ' +
            character.traits
                .map((m) => m.name)
                .sort()
                .join(', ')
    );
}
mapper.textBox(ref, fileNames, 0, 408, 382, 174, 384, featuresAndTraits.join('; '), mf_8_multiline);

// Attacks and Spellcasting
let attackY = 392;
ref = 'attacks';
character.attacks
    .sort((a, b) => a.label.localeCompare(b.label))
    .sort((a, b) => (a.isMelee < b.isMelee ? 1 : a.isMelee > b.isMelee ? -1 : 0))
    .forEach((a) => {
        mapper.textBox(ref, fileNames, 0, 223, attackY, 64, 16, a.label, mf_8_middle);
        const modifier = dnd5eHelper.quantifyNumber(a.modifier);
        mapper.textBox(ref, fileNames, 0, 292, attackY, 31, 16, modifier, mf_8_centered_middle);
        mapper.textBox(ref, fileNames, 0, 327, attackY, 62, 16, a.damageFormula, mf_8_middle);

        attackY = attackY + 21;
    });

// Page 2: Character details
mapper.image(fileNames, 1, 31, 126, actor.img, 172, 228);

mapper.textBox('character name', fileNames, 1, 45, 60, 218, 24, character.name, mf_24);
mapper.textBox('age', fileNames, 1, 265, 53, 113, 14, character.details.age, mf_12);
mapper.textBox('eyes', fileNames, 1, 265, 79, 113, 14, character.details.eyes, mf_12);

mapper.textBox('height', fileNames, 1, 379, 53, 97, 14, character.details.height, mf_12);
mapper.textBox('skin', fileNames, 1, 379, 79, 97, 14, character.details.skin, mf_12);

mapper.textBox('weight', fileNames, 1, 476, 53, 97, 14, character.details.weight, mf_12);
mapper.textBox('hair', fileNames, 1, 476, 79, 97, 14, character.details.hair, mf_12);

// Allies & Organizations
// TODO: Allies & Organizations

// Character backstory
mapper.textBox('backstory', fileNames, 1, 31, 382, 172, 384, character.details.backstory, mf_8_multiline);

// Treasure
const treasureType = ['backpack', 'consumable', 'container', 'loot'];
const treasure = character.equipment
    .filter((f) => treasureType.includes(f.type))
    .map((m) => m.displayName)
    .join(', ');

mapper.textBox('treasure', fileNames, 1, 220, 600, 361, 166, treasure, mf_8_multiline);

// Page 3: Spellcasting
// Spellcasting class
const spellCastingClass = character.classLevels
    .filter((f) => f.spellCastingClass)
    .map((m) => m.name)
    .join(', ');
mapper.textBox('character name', fileNames, 2, 45, 60, 218, 24, spellCastingClass, mf_24);

ref = 'spell casting ability';
mapper.textBox(ref, fileNames, 2, 282, 53, 69, 31, character.spellCastingAbility.shortName, mf_24_centered_middle);
mapper.textBox('spell save DC', fileNames, 2, 382, 53, 70, 31, character.spellSaveDC, mf_24_centered_middle);
ref = 'spell attack bonus';
const spellAttackBonus = dnd5eHelper.quantifyNumber(character.spellAttackBonus);
mapper.textBox(ref, fileNames, 2, 486, 53, 69, 31, spellAttackBonus, mf_24_centered_middle);

// Spell list
let spellList = {
    0: { x: 32, y: [184, 198, 212, 226, 240, 254, 268, 282] },
    1: { x: 41, y: [355, 369, 383, 397, 411, 425, 439, 453, 467, 481, 495, 509, 523] },
    2: { x: 41, y: [582, 596, 610, 624, 638, 652, 666, 680, 694, 708, 722, 736, 750] },
    3: { x: 230, y: [185, 199, 213, 227, 241, 255, 269, 283, 297, 311, 325, 339, 353] },
    4: { x: 230, y: [411, 425, 439, 453, 467, 481, 495, 509, 523, 537, 551, 565, 579] },
    5: { x: 230, y: [638, 652, 666, 680, 694, 708, 722, 736] },
    6: { x: 416, y: [185, 199, 213, 227, 241, 255, 269, 283, 297] },
    7: { x: 416, y: [355, 369, 383, 397, 411, 425, 439, 453] },
    8: { x: 416, y: [525, 539, 553, 567, 581, 595, 609] },
    9: { x: 416, y: [666, 680, 694, 708, 722, 736, 750] },
};

character.knownSpells.forEach((spell) => {
    let x;
    let y;
    if (spellList[spell.level].y.length > 0) {
        x = spellList[spell.level].x;
        y = spellList[spell.level].y.shift();
    }
    if (typeof x !== 'undefined') {
        if (spell.level > 0) {
            const checked = dnd5eHelper.evalCheckMark(spell.prepared);
            mapper.textBox('spells', fileNames, 2, x - 11, y - 10, 10, 10, checked, mf_8_centered_middle);
        }
        const displayName = spell.name + ' (' + spell.components.join('').toUpperCase() + ')';
        mapper.textBox('spells', fileNames, 2, x, y - 10, 164, 10, displayName, mf_8);
    }
});

let spellSlots = {
    1: { x: 50, y: 312 },
    2: { x: 50, y: 540 },
    3: { x: 239, y: 144 },
    4: { x: 239, y: 370 },
    5: { x: 239, y: 596 },
    6: { x: 498, y: 144 },
    7: { x: 498, y: 314 },
    8: { x: 498, y: 484 },
    9: { x: 498, y: 624 },
};

try {
    Object.keys(spellSlots).forEach((lvl) => {
        ref = `spell slots level ${lvl}`;
        const x = spellSlots[lvl].x;
        const y = spellSlots[lvl].y;
        const spellEntry = character.spellSlots.filter((f) => f.level === Number(lvl))[0];
        if (spellEntry.max > 0) {
            mapper.textBox(ref, fileNames, 2, x, y, 46, 24, spellEntry.max, mf_15_centered_middle);
            mapper.textBox(ref, fileNames, 2, x + 52, y + 3, 101, 18, spellEntry.expended, mf_15_middle);
        }
    });
} catch (error) {
    throw new Error(error.message);
}

// ______      ______   _____       ______          _
// |  _  \___  |  _  \ |  ___|      | ___ \        | |
// | | | ( _ ) | | | | |___ \  ___  | |_/ /__  _ __| |_ _   _  __ _ _   _  ___  ___  ___
// | | | / _ \/\ | | |     \ \/ _ \ |  __/ _ \| '__| __| | | |/ _` | | | |/ _ \/ __|/ _ \
// | |/ / (_>  < |/ /  /\__/ /  __/ | | | (_) | |  | |_| |_| | (_| | |_| |  __/\__ \  __/
// |___/ \___/\/___/   \____/ \___| \_|  \___/|_|   \__|\__,_|\__, |\__,_|\___||___/\___|
//                                                             __/ |
//                                                            |___/
// D&D 5e Charactersheet portuguese
// Page 1
fileNames = ['dnd_blankcharactersheet_pt-BR.pdf'];
mapper.textBox('character name', fileNames, 0, 45, 55, 218, 24, character.name, mf_24);
mapper.textBox('class levels', fileNames, 0, 263, 47, 111, 14, classLevels, mf_12);
mapper.textBox('race', fileNames, 0, 263, 73, 111, 14, character.race.name, mf_12);

mapper.textBox('background', fileNames, 0, 373, 47, 94, 14, character.background.name, mf_12);
mapper.textBox('alignment', fileNames, 0, 373, 73, 94, 14, character.alignment.name, mf_12);

mapper.textBox('player name', fileNames, 0, 467, 47, 85, 14, character.ownerName, mf_12);
mapper.textBox('xp', fileNames, 0, 467, 73, 85, 14, character.xp, mf_12);

// Abilities and saving throws
abilitiesY = [149, 220, 289, 359, 429, 498];
savingThrowsY = [195, 208, 221, 234, 247, 260];
Object.values(character.abilities).forEach((a) => {
    const abilityY = abilitiesY[0];
    abilitiesY.shift();
    const saveY = savingThrowsY[0];
    savingThrowsY.shift();
    ref = `ability ${a.name}`;
    mapper.textBox(ref, fileNames, 0, 35, abilityY, 43, 26, a.value, mf_24_centered_middle);
    const modifier = dnd5eHelper.quantifyNumber(a.modifier);
    mapper.textBox(ref, fileNames, 0, 43, abilityY + 28, 25, 17, modifier, mf_12_centered_middle);
    ref = `saving throw ${a.name}`;
    const isProficient = dnd5eHelper.evalCheckMark(a.isProficient);
    mapper.textBox(ref, fileNames, 0, 98, saveY + 4, 8, 10, isProficient, mf_8_centered_middle);
    mapper.textBox(ref, fileNames, 0, 110, saveY, 14, 14, dnd5eHelper.quantifyNumber(a.save), mf_12_centered);
});

mapper.textBox('inspiration', fileNames, 0, 92, 126, 25, 19, hasInspiration, mf_12_centered_middle);
mapper.textBox('proficiency bonus', fileNames, 0, 92, 160, 25, 24, proficiencyBonus, mf_17_centered_middle);

// skills  acr  ani  arc  ath  dec  his  ins  inv  itm  med  nat  per  prc  prf  rel  slt  ste  sur
// portug  acr  arc  ath  prf  dec  ste  his  itm  ins  inv  ani  med  nat  prc  per  slt  rel  sur
skillsY = [306, 438, 320, 333, 359, 385, 411, 424, 398, 451, 464, 490, 477, 346, 516, 503, 372, 529];
printSkills(character.skills, skillsY, 98);

// AC
ref = 'AC';
mapper.textBox(ref, fileNames, 0, 221, 147, 39, 31, character.ac.value, mf_17_centered_middle);

// Initiative
ref = 'initiative';
mapper.textBox(ref, fileNames, 0, 274, 147, 43, 31, initiative, mf_17_centered_middle);

// Speed
ref = 'movement';
mapper.textBox(ref, fileNames, 0, 331, 147, 43, 31, baseMovement.value, mf_17_centered_middle);
if (baseMovement.slug !== 'walk') {
    mapper.textBox(ref, fileNames, 0, 331, 172, 58, 14, baseMovement.label, mf_12_centered_middle);
}

//Hit Points
ref = 'hit point';
mapper.textBox(ref, fileNames, 0, 283, 187, 86, 14, character.hp.max, mf_12);
mapper.textBox(ref, fileNames, 0, 220, 203, 155, 14, character.hp.value, mf_12);

mapper.textBox(ref, fileNames, 0, 220, 254, 155, 14, character.hp.temp, mf_12);

// Hid Dice
mapper.textBox(ref, fileNames, 0, 240, 304, 46, 14, character.hd.max, mf_12);
mapper.textBox(ref, fileNames, 0, 221, 319, 70, 14, character.hd.value, mf_12);

// Death Saves
ref = 'death saves';
mapper.textBox(ref, fileNames, 0, 336, 313, 9, 9, dnd5eHelper.evalCheckMark(deathSuccesses >= 1), mf_12_centered);
mapper.textBox(ref, fileNames, 0, 349, 313, 9, 9, dnd5eHelper.evalCheckMark(deathSuccesses >= 2), mf_12_centered);
mapper.textBox(ref, fileNames, 0, 361, 313, 9, 9, dnd5eHelper.evalCheckMark(deathSuccesses >= 3), mf_12_centered);

mapper.textBox(ref, fileNames, 0, 336, 327, 9, 9, dnd5eHelper.evalCheckMark(deathFails >= 1), mf_12_centered);
mapper.textBox(ref, fileNames, 0, 349, 327, 9, 9, dnd5eHelper.evalCheckMark(deathFails >= 2), mf_12_centered);
mapper.textBox(ref, fileNames, 0, 361, 327, 9, 9, dnd5eHelper.evalCheckMark(deathFails >= 3), mf_12_centered);

// Personality Traits
ref = 'Personality Traits';
mapper.textBox(ref, fileNames, 0, 404, 133, 155, 60, character.details.traits, mf_8_multiline);

// ideals
ref = 'ideals';
mapper.textBox(ref, fileNames, 0, 404, 200, 155, 46, character.details.ideals, mf_8_multiline);

// Bonds
ref = 'Bonds';
mapper.textBox(ref, fileNames, 0, 404, 254, 155, 46, character.details.bonds, mf_8_multiline);

// flaws
ref = 'flaws';
mapper.textBox(ref, fileNames, 0, 404, 307, 155, 46, character.details.flaws, mf_8_multiline);

// Passive wisdom
ref = 'passive wisdom';
mapper.textBox(ref, fileNames, 0, 28, 571, 28, 22, character.skills.prc.passive, mf_17_centered_middle);

ref = 'Other Proficiencies and Languages';
mapper.textBox(ref, fileNames, 0, 30, 606, 167, 138, otherProficienciesAndLanguages.join(';\n'), mf_8_multiline);

// coins
ref = 'coins';
mapper.textBox(ref, fileNames, 0, 218, 580, 38, 20, character.coins.cp, mf_15_centered_middle);
mapper.textBox(ref, fileNames, 0, 218, 605, 38, 20, character.coins.sp, mf_15_centered_middle);
mapper.textBox(ref, fileNames, 0, 218, 631, 38, 20, character.coins.ep, mf_15_centered_middle);
mapper.textBox(ref, fileNames, 0, 218, 656, 38, 20, character.coins.gp, mf_15_centered_middle);
mapper.textBox(ref, fileNames, 0, 218, 681, 38, 20, character.coins.pp, mf_15_centered_middle);

// equipment
ref = 'equipment';
mapper.textBox(ref, fileNames, 0, 261, 572, 120, 172, equipment, mf_8_multiline);

// features and traits
ref = 'features and traits';

mapper.textBox(ref, fileNames, 0, 395, 371, 173, 373, featuresAndTraits.join('; '), mf_8_multiline);

// Attacks and Spellcasting
attackY = 381;
ref = 'attacks';
character.attacks
    .sort((a, b) => a.label.localeCompare(b.label))
    .sort((a, b) => (a.isMelee < b.isMelee ? 1 : a.isMelee > b.isMelee ? -1 : 0))
    .forEach((a) => {
        mapper.textBox(ref, fileNames, 0, 217, attackY, 62, 16, a.label, mf_8_middle);
        const modifier = dnd5eHelper.quantifyNumber(a.modifier);
        mapper.textBox(ref, fileNames, 0, 283, attackY, 30, 16, modifier, mf_8_centered_middle);
        mapper.textBox(ref, fileNames, 0, 318, attackY, 60, 16, a.damageFormula, mf_8_middle);

        attackY = attackY + 21;
    });

// page 2
mapper.image(fileNames, 1, 30, 122, actor.img, 168, 230);

mapper.textBox('character name', fileNames, 1, 45, 60, 218, 24, character.name, mf_24);
mapper.textBox('age', fileNames, 1, 259, 50, 109, 14, character.details.age, mf_12);
mapper.textBox('eyes', fileNames, 1, 259, 76, 109, 14, character.details.eyes, mf_12);

mapper.textBox('height', fileNames, 1, 505, 50, 94, 14, character.details.height, mf_12);
mapper.textBox('skin', fileNames, 1, 505, 76, 94, 14, character.details.skin, mf_12);

mapper.textBox('weight', fileNames, 1, 634, 50, 94, 14, character.details.weight, mf_12);
mapper.textBox('hair', fileNames, 1, 634, 76, 94, 14, character.details.hair, mf_12);

// Allies & Organizations
// TODO: Allies & Organizations

// Character backstory
mapper.textBox('backstory', fileNames, 1, 29, 370, 167, 374, character.details.backstory, mf_8_multiline);

// Treasure
mapper.textBox('treasure', fileNames, 1, 214, 582, 351, 162, treasure, mf_8_multiline);

// page 3

// Spellcasting class
mapper.textBox('character name', fileNames, 2, 42, 62, 212, 26, spellCastingClass, mf_24_centered_middle);

ref = 'spell casting ability';
mapper.textBox(ref, fileNames, 2, 274, 51, 67, 31, character.spellCastingAbility.shortName, mf_24_centered_middle);
mapper.textBox('spell save DC', fileNames, 2, 372, 51, 67, 31, character.spellSaveDC, mf_24_centered_middle);
ref = 'spell attack bonus';
mapper.textBox(ref, fileNames, 2, 473, 51, 67, 31, spellAttackBonus, mf_24_centered_middle);

// Spell list
spellList = {
    0: { x: 31, y: [179, 192, 206, 220, 233, 247, 260, 274] },
    1: { x: 39, y: [345, 358, 372, 386, 399, 413, 426, 440, 454, 467, 481, 494, 508] },
    2: { x: 39, y: [565, 578, 592, 605, 619, 633, 646, 660, 674, 687, 701, 714, 728] },
    3: { x: 223, y: [180, 194, 207, 221, 234, 248, 261, 275, 289, 302, 316, 330, 343] },
    4: { x: 223, y: [399, 413, 426, 440, 454, 467, 481, 494, 508, 521, 534, 549, 562] },
    5: { x: 223, y: [619, 633, 646, 660, 674, 687, 701, 714] },
    6: { x: 344, y: [180, 194, 207, 221, 234, 248, 261, 275, 289] },
    7: { x: 344, y: [345, 358, 372, 386, 399, 413, 426, 440] },
    8: { x: 344, y: [510, 523, 537, 551, 564, 578, 591] },
    9: { x: 344, y: [646, 660, 674, 687, 701, 714, 728] },
};

character.knownSpells.forEach((spell) => {
    let x;
    let y;
    if (spellList[spell.level].y.length > 0) {
        x = spellList[spell.level].x;
        y = spellList[spell.level].y.shift();
    }
    if (typeof x !== 'undefined') {
        if (spell.level > 0) {
            const checked = dnd5eHelper.evalCheckMark(spell.prepared);
            mapper.textBox('spells', fileNames, 2, x - 8, y - 9, 7, 10, checked, mf_8_centered_middle);
        }
        const displayName = spell.name + ' (' + spell.components.join('').toUpperCase() + ')';
        mapper.textBox('spells', fileNames, 2, x, y - 10, 159, 10, displayName, mf_8);
    }
});

spellSlots = {
    1: { x: 48, y: 303 },
    2: { x: 48, y: 525 },
    3: { x: 232, y: 140 },
    4: { x: 232, y: 359 },
    5: { x: 232, y: 579 },
    6: { x: 568, y: 140 },
    7: { x: 414, y: 305 },
    8: { x: 414, y: 470 },
    9: { x: 414, y: 606 },
};

try {
    Object.keys(spellSlots).forEach((lvl) => {
        ref = `spell slots level ${lvl}`;
        const x = spellSlots[lvl].x;
        const y = spellSlots[lvl].y;
        const spellEntry = character.spellSlots.filter((f) => f.level === Number(lvl))[0];
        if (spellEntry.max > 0) {
            mapper.textBox(ref, fileNames, 2, x, y, 46, 24, spellEntry.max, mf_15_centered_middle);
            mapper.textBox(ref, fileNames, 2, x + 51, y + 2, 99, 19, spellEntry.expended, mf_15_middle);
        }
    });
} catch (error) {
    throw new Error(error.message);
}

// ______      ______   _____        _____
// |  _  \___  |  _  \ |  ___|      |  __ \
// | | | ( _ ) | | | | |___ \  ___  | |  \/ ___ _ __ _ __ ___   __ _ _ __
// | | | / _ \/\ | | |     \ \/ _ \ | | __ / _ \ '__| '_ ` _ \ / _` | '_ \
// | |/ / (_>  < |/ /  /\__/ /  __/ | |_\ \  __/ |  | | | | | | (_| | | | |
// |___/ \___/\/___/   \____/ \___|  \____/\___|_|  |_| |_| |_|\__,_|_| |_|

// D&D 5e Charactersheet german
// Page 1
fileNames = ['dnd_blankcharactersheet_de.pdf'];

mapper.textBox('character name', fileNames, 0, 35, 74, 216, 24, character.name, mf_24);
mapper.textBox('class levels', fileNames, 0, 263, 63, 111, 14, classLevels, mf_12);
mapper.textBox('race', fileNames, 0, 263, 89, 111, 14, character.race.name, mf_12);

mapper.textBox('background', fileNames, 0, 373, 63, 98, 14, character.background.name, mf_12);
mapper.textBox('alignment', fileNames, 0, 373, 89, 98, 14, character.alignment.name, mf_12);

mapper.textBox('player name', fileNames, 0, 467, 63, 88, 14, character.ownerName, mf_12);
mapper.textBox('xp', fileNames, 0, 467, 89, 88, 14, character.xp, mf_12);

// Abilities and saving throws
abilitiesY = [169, 241, 312, 384, 456, 527];
savingThrowsY = [215, 228, 242, 255, 269, 282];
Object.values(character.abilities).forEach((a) => {
    const abilityY = abilitiesY[0];
    abilitiesY.shift();
    const saveY = savingThrowsY[0];
    savingThrowsY.shift();
    ref = `ability ${a.name}`;
    mapper.textBox(ref, fileNames, 0, 28, abilityY, 43, 26, a.value, mf_24_centered_middle);
    const modifier = dnd5eHelper.quantifyNumber(a.modifier);
    mapper.textBox(ref, fileNames, 0, 37, abilityY + 28, 25, 17, modifier, mf_12_centered_middle);
    ref = `saving throw ${a.name}`;
    const isProficient = dnd5eHelper.evalCheckMark(a.isProficient);
    mapper.textBox(ref, fileNames, 0, 93, saveY + 4, 8, 10, isProficient, mf_8_centered_middle);
    mapper.textBox(ref, fileNames, 0, 106, saveY, 14, 14, dnd5eHelper.quantifyNumber(a.save), mf_12_centered);
});

mapper.textBox('inspiration', fileNames, 0, 88, 144, 25, 19, hasInspiration, mf_12_centered_middle);
mapper.textBox('proficiency bonus', fileNames, 0, 88, 179, 25, 24, proficiencyBonus, mf_17_centered_middle);

// skills  acr  ani  arc  ath  dec  his  ins  inv  itm  med  nat  per  prc  prf  rel  slt  ste  sur
// german  acr  arc  ath  prf  itm  slt  his  med  ste  ani  ins  inv  nat  rel  dec  sur  per  prc
skillsY = [330, 452, 344, 357, 519, 411, 465, 479, 384, 425, 492, 546, 560, 371, 506, 398, 438, 533];
printSkills(character.skills, skillsY, 94);

// AC
ref = 'AC';
mapper.textBox(ref, fileNames, 0, 221, 147, 39, 31, character.ac.value, mf_17_centered_middle);

// Initiative
ref = 'initiative';
mapper.textBox(ref, fileNames, 0, 274, 147, 43, 31, initiative, mf_17_centered_middle);

// Speed
ref = 'movement';
mapper.textBox(ref, fileNames, 0, 331, 147, 43, 31, baseMovement.value, mf_17_centered_middle);
if (baseMovement.slug !== 'walk') {
    mapper.textBox(ref, fileNames, 0, 331, 172, 58, 14, baseMovement.label, mf_12_centered_middle);
}

//Hit Points
ref = 'hit point';
mapper.textBox(ref, fileNames, 0, 284, 208, 86, 14, character.hp.max, mf_12);
mapper.textBox(ref, fileNames, 0, 218, 225, 160, 14, character.hp.value, mf_12);

mapper.textBox(ref, fileNames, 0, 218, 275, 160, 14, character.hp.temp, mf_12);

// Hid Dice
mapper.textBox(ref, fileNames, 0, 243, 328, 46, 14, character.hd.max, mf_12);
mapper.textBox(ref, fileNames, 0, 221, 343, 70, 14, character.hd.value, mf_12);

// Death Saves
ref = 'death saves';
mapper.textBox(ref, fileNames, 0, 339, 336, 9, 9, dnd5eHelper.evalCheckMark(deathSuccesses >= 1), mf_12_centered);
mapper.textBox(ref, fileNames, 0, 352, 336, 9, 9, dnd5eHelper.evalCheckMark(deathSuccesses >= 2), mf_12_centered);
mapper.textBox(ref, fileNames, 0, 364, 336, 9, 9, dnd5eHelper.evalCheckMark(deathSuccesses >= 3), mf_12_centered);

mapper.textBox(ref, fileNames, 0, 339, 327, 9, 9, dnd5eHelper.evalCheckMark(deathFails >= 1), mf_12_centered);
mapper.textBox(ref, fileNames, 0, 352, 327, 9, 9, dnd5eHelper.evalCheckMark(deathFails >= 2), mf_12_centered);
mapper.textBox(ref, fileNames, 0, 364, 327, 9, 9, dnd5eHelper.evalCheckMark(deathFails >= 3), mf_12_centered);

// Personality Traits
ref = 'Personality Traits';
mapper.textBox(ref, fileNames, 0, 408, 151, 160, 61, character.details.traits, mf_8_multiline);

// ideals
ref = 'ideals';
mapper.textBox(ref, fileNames, 0, 408, 220, 160, 46, character.details.ideals, mf_8_multiline);

// Bonds
ref = 'Bonds';
mapper.textBox(ref, fileNames, 0, 408, 276, 160, 46, character.details.bonds, mf_8_multiline);

// flaws
ref = 'flaws';
mapper.textBox(ref, fileNames, 0, 408, 331, 160, 46, character.details.flaws, mf_8_multiline);

// Passive wisdom
ref = 'passive wisdom';
mapper.textBox(ref, fileNames, 0, 22, 602, 29, 23, character.skills.prc.passive, mf_17_centered_middle);

ref = 'Other Proficiencies and Languages';
mapper.textBox(ref, fileNames, 0, 24, 638, 172, 142, otherProficienciesAndLanguages.join(';\n'), mf_8_multiline);

// coins
ref = 'coins';
mapper.textBox(ref, fileNames, 0, 217, 612, 41, 20, character.coins.cp, mf_15_centered_middle);
mapper.textBox(ref, fileNames, 0, 217, 638, 41, 20, character.coins.sp, mf_15_centered_middle);
mapper.textBox(ref, fileNames, 0, 217, 664, 41, 20, character.coins.ep, mf_15_centered_middle);
mapper.textBox(ref, fileNames, 0, 217, 690, 41, 20, character.coins.gp, mf_15_centered_middle);
mapper.textBox(ref, fileNames, 0, 217, 716, 41, 20, character.coins.pp, mf_15_centered_middle);

// equipment
ref = 'equipment';
mapper.textBox(ref, fileNames, 0, 261, 603, 124, 177, equipment, mf_8_multiline);

// features and traits
ref = 'features and traits';

mapper.textBox(ref, fileNames, 0, 399, 396, 178, 385, featuresAndTraits.join('; '), mf_8_multiline);

// Attacks and Spellcasting
attackY = 406;
ref = 'attacks';
character.attacks
    .sort((a, b) => a.label.localeCompare(b.label))
    .sort((a, b) => (a.isMelee < b.isMelee ? 1 : a.isMelee > b.isMelee ? -1 : 0))
    .forEach((a) => {
        mapper.textBox(ref, fileNames, 0, 216, attackY, 64, 16, a.label, mf_8_middle);
        const modifier = dnd5eHelper.quantifyNumber(a.modifier);
        mapper.textBox(ref, fileNames, 0, 284, attackY, 32, 16, modifier, mf_8_centered_middle);
        mapper.textBox(ref, fileNames, 0, 320, attackY, 62, 16, a.damageFormula, mf_8_middle);

        attackY = attackY + 21;
    });

// page 2
mapper.image(fileNames, 1, 24, 135, actor.img, 172, 228);

mapper.textBox('character name', fileNames, 1, 35, 74, 216, 24, character.name, mf_24);
mapper.textBox('age', fileNames, 1, 259, 61, 112, 14, character.details.age, mf_12);
mapper.textBox('eyes', fileNames, 1, 259, 87, 112, 14, character.details.eyes, mf_12);

mapper.textBox('height', fileNames, 1, 372, 61, 98, 14, character.details.height, mf_12);
mapper.textBox('skin', fileNames, 1, 372, 87, 98, 14, character.details.skin, mf_12);

mapper.textBox('weight', fileNames, 1, 470, 61, 96, 14, character.details.weight, mf_12);
mapper.textBox('hair', fileNames, 1, 470, 87, 96, 14, character.details.hair, mf_12);

// Allies & Organizations
// TODO: Allies & Organizations

// Character backstory
mapper.textBox('backstory', fileNames, 1, 24, 390, 172, 385, character.details.backstory, mf_8_multiline);

// Treasure
mapper.textBox('treasure', fileNames, 1, 212, 608, 362, 167, treasure, mf_8_multiline);

// page 3

// Spellcasting class
mapper.textBox('character name', fileNames, 2, 35, 74, 216, 24, spellCastingClass, mf_24_centered_middle);

ref = 'spell casting ability';
mapper.textBox(ref, fileNames, 2, 274, 67, 68, 31, character.spellCastingAbility.shortName, mf_24_centered_middle);
mapper.textBox('spell save DC', fileNames, 2, 375, 67, 68, 31, character.spellSaveDC, mf_24_centered_middle);
ref = 'spell attack bonus';
mapper.textBox(ref, fileNames, 2, 479, 67, 68, 31, spellAttackBonus, mf_24_centered_middle);

// Spell list
// 179 -> 198 =
spellList = {
    0: { x: 24, y: [198, 212, 226, 240, 254, 268, 282, 296] },
    1: { x: 33, y: [370, 384, 397, 412, 426, 440, 454, 468, 482, 496, 510, 523, 538] },
    2: { x: 33, y: [595, 610, 624, 637, 651, 666, 679, 694, 707, 721, 735, 749, 764] },
    3: { x: 222, y: [199, 214, 227, 241, 256, 270, 283, 297, 312, 325, 339, 353, 367] },
    4: { x: 222, y: [425, 439, 453, 467, 481, 495, 509, 523, 537, 551, 566, 579, 593] },
    5: { x: 222, y: [651, 666, 679, 694, 707, 721, 735, 749] },
    6: { x: 409, y: [199, 214, 227, 241, 256, 270, 283, 297, 312] },
    7: { x: 409, y: [370, 384, 397, 412, 425, 439, 453, 467] },
    8: { x: 409, y: [538, 553, 567, 581, 595, 609, 623] },
    9: { x: 409, y: [680, 694, 707, 721, 735, 749, 764] },
};

character.knownSpells.forEach((spell) => {
    let x;
    let y;
    if (spellList[spell.level].y.length > 0) {
        x = spellList[spell.level].x;
        y = spellList[spell.level].y.shift();
    }
    if (typeof x !== 'undefined') {
        if (spell.level > 0) {
            const checked = dnd5eHelper.evalCheckMark(spell.prepared);
            mapper.textBox('spells', fileNames, 2, x - 8, y - 9, 7, 10, checked, mf_8_centered_middle);
        }
        const displayName = spell.name + ' (' + spell.components.join('').toUpperCase() + ')';
        mapper.textBox('spells', fileNames, 2, x, y - 10, 159, 10, displayName, mf_8);
    }
});

spellSlots = {
    1: { x: 42, y: 326 },
    2: { x: 42, y: 555 },
    3: { x: 231, y: 158 },
    4: { x: 231, y: 384 },
    5: { x: 231, y: 611 },
    6: { x: 418, y: 158 },
    7: { x: 418, y: 328 },
    8: { x: 418, y: 498 },
    9: { x: 418, y: 638 },
};

try {
    Object.keys(spellSlots).forEach((lvl) => {
        ref = `spell slots level ${lvl}`;
        const x = spellSlots[lvl].x;
        const y = spellSlots[lvl].y;
        const spellEntry = character.spellSlots.filter((f) => f.level === Number(lvl))[0];
        if (spellEntry.max > 0) {
            mapper.textBox(ref, fileNames, 2, x, y, 46, 24, spellEntry.max, mf_15_centered_middle);
            mapper.textBox(ref, fileNames, 2, x + 51, y + 2, 99, 19, spellEntry.expended, mf_15_middle);
        }
    });
} catch (error) {
    throw new Error(error.message);
}

export { mapper };
