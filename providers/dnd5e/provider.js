import { pdfProvider } from '../../scripts/lib/providers/PDFProvider.js';
import { dnd5eHelper } from '../../scripts/lib/helpers/DND5eHelper.js';
// import { semVer } from '../../scripts/lib/SemVer.js';

class dnd5ePDFProvider extends pdfProvider {
    constructor(actor) {
        super(actor);
        this.pageWidth = 816;
        this.pageHeight = 1056;
    }

    defaultFont(font, size, lineHeight = undefined) {
        if (!isNaN(Number(size))) {
            size = size / mapper.pageHeight;
        }
        if (!isNaN(Number(lineHeight))) {
            lineHeight = lineHeight / mapper.pageHeight;
        }

        super.defaultFont(font, size, lineHeight);
    }

    image(file, page, x, y, path, maxWidth = -1, maxHeight = -1, options) {
        x = x / this.pageWidth;
        y = y / this.pageHeight;
        maxWidth = maxWidth > 0 ? maxWidth / this.pageWidth : maxWidth;
        maxHeight = maxHeight > 0 ? maxHeight / this.pageHeight : maxHeight;
        super.image(file, page, x, y, path, maxWidth, maxHeight, options);
    }

    textBox(reference, file, page, x, y, width, height, text, options = {}) {
        x = x / this.pageWidth;
        y = y / this.pageHeight;
        width = width / this.pageWidth;
        height = height / this.pageHeight;
        super.textBox(reference, file, page, x, y, width, height, text, options);
    }
}

const mapper = new dnd5ePDFProvider(actor);
mapper.defaultFont('MarkerFelt.ttf', 12, 14);
mapper.defaultFontColor('#01579b');

// Font definitions
const mf_default = {};
const mf_8 = { ...mf_default, ...{ size: 8 / mapper.pageHeight, lineHeight: 10 / mapper.pageHeight } };
const mf_8_multiline = { ...mf_8, ...{ multiline: true, valign: 'top' } };
const mf_8_centered = { ...mf_8, ...{ halign: 'center' } };
//const mf_8_centered_middle = { ...mf_8, ...{ halign: 'center' } };
const mf_12 = { ...mf_default, ...{ size: 12 / mapper.pageHeight, lineHeight: 14 / mapper.pageHeight } };
const mf_12_multiline = { ...mf_12, ...{ multiline: true, valign: 'top' } };
const mf_12_middle = { ...mf_12, ...{ valign: 'middle' } };
const mf_12_centered = { ...mf_12, ...{ halign: 'center' } };
const mf_12_centered_middle = { ...mf_12_centered, ...{ valign: 'middle' } };
const mf_15 = { ...mf_default, ...{ size: 15 / mapper.pageHeight, lineHeight: 17 / mapper.pageHeight } };
const mf_15_middle = { ...mf_15, ...{ valign: 'middle' } };
const mf_15_centered = { ...mf_15, ...{ halign: 'center' } };
const mf_15_centered_middle = { ...mf_15_centered, ...mf_15_middle };
const mf_17 = { ...mf_default, ...{ size: 17 / mapper.pageHeight, lineHeight: 19 / mapper.pageHeight } };
const mf_17_centered = { ...mf_17, ...{ halign: 'center' } };
const mf_17_centered_middle = { ...mf_17_centered, ...{ valign: 'middle' } };
const mf_24 = { ...mf_default, ...{ size: 24 / mapper.pageHeight, lineHeight: 26 / mapper.pageHeight } };
const mf_24_centered = { ...mf_24, ...{ halign: 'center' } };
const mf_24_centered_middle = { ...mf_24_centered, ...{ valign: 'middle' } };
const f_debug = { debug: true };
let ref;
let fileNames;

const character = dnd5eHelper.getActorObject(game, actor);

// ______      ______   _____        _____            _ _     _
// |  _  \___  |  _  \ |  ___|      |  ___|          | (_)   | |
// | | | ( _ ) | | | | |___ \  ___  | |__ _ __   __ _| |_ ___| |__
// | | | / _ \/\ | | |     \ \/ _ \ |  __| '_ \ / _` | | / __| '_ \
// | |/ / (_>  < |/ /  /\__/ /  __/ | |__| | | | (_| | | \__ \ | | |
// |___/ \___/\/___/   \____/ \___| \____/_| |_|\__, |_|_|___/_| |_|
//                                               __/ |
//                                              |___/

// D&D 5e CHaracter Sheet by WoTC
fileNames = ['CharacterSheet.pdf'];
mapper.textBox('character name', fileNames, 0, 60, 83, 291, 26, character.name, mf_24);
const classLevels = character.classLevels.map((m) => m.displayName).join(', ');
mapper.textBox('class levels', fileNames, 0, 360, 61, 150, 23, classLevels);
mapper.textBox('race', fileNames, 0, 360, 95, 150, 23, character.race.name);

mapper.textBox('background', fileNames, 0, 512, 61, 127, 23, character.background.name);
mapper.textBox('alignment', fileNames, 0, 512, 95, 127, 23, character.alignment.name);

mapper.textBox('player name', fileNames, 0, 641, 61, 117, 23, character.ownerName);
mapper.textBox('xp', fileNames, 0, 641, 95, 117, 23, character.xp);

// Abilities and saving throws
let abilitiesY = [202, 298, 392, 489, 583, 679];
let savingThrowsY = [272, 290, 308, 326, 344, 362];
Object.values(character.abilities).forEach((a) => {
    const abilityY = abilitiesY[0];
    abilitiesY.shift();
    const saveY = savingThrowsY[0];
    savingThrowsY.shift();
    ref = `ability ${a.name}`;
    mapper.textBox(ref, fileNames, 0, 46, abilityY, 60, 41, a.value, mf_24_centered_middle);
    const modifier = dnd5eHelper.quantifyNumber(a.modifier);
    mapper.textBox(ref, fileNames, 0, 59, abilityY + 45, 33, 19, modifier, mf_12_centered_middle);
    ref = `saving throw ${a.name}`;
    const isProficient = dnd5eHelper.evalCheckMark(a.isProficient);
    mapper.textBox(ref, fileNames, 0, 134, saveY + 3, 10, 10, isProficient, mf_8_centered);
    mapper.textBox(ref, fileNames, 0, 150, saveY, 19, 14, dnd5eHelper.quantifyNumber(a.save), mf_12_centered);
});

const hasInspiration = dnd5eHelper.evalCheckMark(character.hasInspiration);
const proficiencyBonus = dnd5eHelper.quantifyNumber(character.proficiencyBonus);
mapper.textBox('inspiration', fileNames, 0, 126, 172, 32, 26, hasInspiration, mf_12_centered_middle);
mapper.textBox('proficiency bonus', fileNames, 0, 126, 222, 32, 26, proficiencyBonus, mf_17_centered_middle);

// skills
let skillsY = [425, 443, 461, 479, 497, 515, 533, 551, 570, 587, 605, 623, 641, 659, 677, 695, 713, 731];
Object.values(character.skills).forEach((s) => {
    let skillY;
    if (skillsY.length > 0) {
        skillY = skillsY[0];
        skillsY.shift();
    }
    if (typeof skillY !== 'undefined') {
        ref = `${s.label} skill`;
        const isProficient = dnd5eHelper.evalCheckMark(s.isProficient);
        mapper.textBox(ref, fileNames, 0, 134, skillY + 3, 10, 10, isProficient, mf_8_centered);
        mapper.textBox(ref, fileNames, 0, 149, skillY, 20, 14, dnd5eHelper.quantifyNumber(s.modifier), mf_12_centered);
    }
});

// AC
ref = 'AC';
mapper.textBox(ref, fileNames, 0, 304, 183, 52, 39, character.ac.value, mf_17_centered_middle);

// Initiative
ref = 'initiative';
const initiative = dnd5eHelper.quantifyNumber(character.initiative.total);
mapper.textBox(ref, fileNames, 0, 376, 183, 58, 39, initiative, mf_17_centered_middle);

// Speed
ref = 'movement';
let baseMovement;
if (character.movement.filter((f) => f.isPrimary).length > 0) {
    baseMovement = character.movement.filter((f) => f.isPrimary)[0];
} else {
    baseMovement = character.movement[0];
}
mapper.textBox(ref, fileNames, 0, 454, 183, 58, 39, baseMovement.value, mf_17_centered_middle);
if (baseMovement.slug !== 'walk') {
    mapper.textBox(ref, fileNames, 0, 454, 241, 58, 14, baseMovement.label, mf_12_centered_middle);
}

//Hit Points
ref = 'hit point';
mapper.textBox(ref, fileNames, 0, 390, 262, 120, 14, character.hp.max, mf_12);
mapper.textBox(ref, fileNames, 0, 307, 279, 120, 14, character.hp.value, mf_12);

mapper.textBox(ref, fileNames, 0, 307, 349, 120, 14, character.hp.temp, mf_12);

// Hid Dice
mapper.textBox(ref, fileNames, 0, 329, 422, 64, 14, character.hd, mf_12);

// Death Saves
const deathSuccesses = character.deathSave.successes;
const deathFails = character.deathSave.failures;
ref = 'death saves';
mapper.textBox(ref, fileNames, 0, 461, 427, 12, 12, dnd5eHelper.evalCheckMark(deathSuccesses >= 1), mf_12_centered);
mapper.textBox(ref, fileNames, 0, 478, 427, 12, 12, dnd5eHelper.evalCheckMark(deathSuccesses >= 2), mf_12_centered);
mapper.textBox(ref, fileNames, 0, 496, 427, 12, 12, dnd5eHelper.evalCheckMark(deathSuccesses >= 3), mf_12_centered);

mapper.textBox(ref, fileNames, 0, 461, 447, 12, 12, dnd5eHelper.evalCheckMark(deathFails >= 1), mf_12_centered);
mapper.textBox(ref, fileNames, 0, 478, 447, 12, 12, dnd5eHelper.evalCheckMark(deathFails >= 2), mf_12_centered);
mapper.textBox(ref, fileNames, 0, 496, 447, 12, 12, dnd5eHelper.evalCheckMark(deathFails >= 3), mf_12_centered);

// Personality Traits
ref = 'Personality Traits';
mapper.textBox(ref, fileNames, 0, 552, 181, 216, 82, character.details.traits, mf_8_multiline);

// ideals
ref = 'ideals';
mapper.textBox(ref, fileNames, 0, 552, 275, 216, 63, character.details.ideals, mf_8_multiline);

// Bonds
ref = 'Bonds';
mapper.textBox(ref, fileNames, 0, 552, 349, 216, 63, character.details.bonds, mf_8_multiline);

// flaws
ref = 'flaws';
mapper.textBox(ref, fileNames, 0, 552, 422, 216, 63, character.details.flaws, mf_8_multiline);

// Passive wisdom
ref = 'passive wisdom';
mapper.textBox(ref, fileNames, 0, 39, 784, 37, 31, character.skills.prc.passive, mf_17_centered_middle);

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
mapper.textBox(ref, fileNames, 0, 44, 829, 224, 189, otherProficienciesAndLanguages.join(';\n'), {
    ...mf_12_multiline,
    ...{ lineHeight: 15 / mapper.pageHeight },
});

// coins
ref = 'coins';
mapper.textBox(ref, fileNames, 0, 299, 797, 53, 27, character.coins.cp, mf_15_centered_middle);
mapper.textBox(ref, fileNames, 0, 299, 831, 53, 27, character.coins.sp, mf_15_centered_middle);
mapper.textBox(ref, fileNames, 0, 299, 866, 53, 27, character.coins.ep, mf_15_centered_middle);
mapper.textBox(ref, fileNames, 0, 299, 900, 53, 27, character.coins.gp, mf_15_centered_middle);
mapper.textBox(ref, fileNames, 0, 299, 934, 53, 27, character.coins.pp, mf_15_centered_middle);

// equipment
ref = 'equipment';
const equipmentType = ['equipment', 'weapon'];
const equipment = character.equipment
    .filter((f) => equipmentType.includes(f.type))
    .map((m) => m.displayName)
    .join(', ');
mapper.textBox(ref, fileNames, 0, 356, 785, 161, 231, equipment, {
    ...mf_12_multiline,
    ...{ lineHeight: 15 / mapper.pageHeight },
});

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
mapper.textBox(ref, fileNames, 0, 545, 506, 230, 512, featuresAndTraits.join('; '), {
    ...mf_12_multiline,
    ...{ lineHeight: 15 / mapper.pageHeight },
});

// Attacks and Spellcasting
let attackY = 523;
ref = 'attacks';
character.attacks
    .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0))
    .sort((a, b) => (a.isMelee < b.isMelee ? 1 : a.isMelee > b.isMelee ? -1 : 0))
    .forEach((a) => {
        mapper.textBox(ref, fileNames, 0, 297, attackY, 85, 21, a.label, mf_12_middle);
        const modifier = dnd5eHelper.quantifyNumber(a.modifier);
        mapper.textBox(ref, fileNames, 0, 390, attackY, 38, 21, modifier, mf_12_centered_middle);
        mapper.textBox(ref, fileNames, 0, 437, attackY, 81, 21, a.damageFormula, mf_12_middle);

        attackY = attackY + 27;
    });

// D&D 5e Character details Sheet by WoTC
fileNames = ['CharacterDetails.pdf'];
mapper.image(fileNames, 0, 41, 168, actor.img, 229, 305);

mapper.textBox('character name', fileNames, 0, 60, 83, 291, 26, character.name, mf_24);
mapper.textBox('age', fileNames, 0, 353, 66, 152, 23, character.details.age);
mapper.textBox('eyes', fileNames, 0, 353, 99, 152, 23, character.details.eyes);

mapper.textBox('height', fileNames, 0, 505, 66, 130, 23, character.details.height);
mapper.textBox('skin', fileNames, 0, 505, 99, 130, 23, character.details.skin);

mapper.textBox('weight', fileNames, 0, 634, 66, 130, 23, character.details.weight);
mapper.textBox('hair', fileNames, 0, 634, 99, 130, 23, character.details.hair);

// Allies & Organizations
// TODO: Allies & Organizations

// Character backstory
mapper.textBox('backstory', fileNames, 0, 41, 506, 231, 500, character.details.backstory, {
    ...mf_12_multiline,
    ...{ lineHeight: 15 / mapper.pageHeight },
});

// Treasure
const treasureType = ['backpack', 'consumable', 'container', 'loot'];
const treasure = character.equipment
    .filter((f) => treasureType.includes(f.type))
    .map((m) => m.displayName)
    .join(', ');

mapper.textBox('treasure', fileNames, 0, 294, 798, 478, 219, treasure, {
    ...mf_12_multiline,
    ...{ lineHeight: 15 / mapper.pageHeight },
});

// D&D 5e Character Spellcasting Sheet by WoTC
fileNames = ['SpellcastingSheet.pdf'];

// Spellcasting class
const spellCastingClass = character.classLevels
    .filter((f) => f.spellCastingClass)
    .map((m) => m.name)
    .join(', ');
mapper.textBox('character name', fileNames, 0, 58, 85, 289, 32, spellCastingClass, mf_24_centered_middle);

ref = 'spell casting ability';
mapper.textBox(ref, fileNames, 0, 374, 71, 93, 40, character.spellCastingAbility.shortName, mf_24_centered_middle);
mapper.textBox('spell save DC', fileNames, 0, 509, 71, 93, 40, character.spellSaveDC, mf_24_centered_middle);
ref = 'spell attack bonus';
const spellAttackBonus = dnd5eHelper.quantifyNumber(character.spellAttackBonus);
mapper.textBox(ref, fileNames, 0, 648, 71, 93, 40, spellAttackBonus, mf_24_centered_middle);

// Spell list
let spellList = {
    0: { x: 43, y: [246, 264, 283, 302, 320, 339, 358, 376] },
    1: { x: 54, y: [474, 491, 510, 529, 547, 566, 585, 603, 622, 641, 659, 678, 697] },
    2: { x: 54, y: [775, 794, 812, 831, 849, 868, 887, 905, 924, 944, 961, 980, 999] },
    3: { x: 306, y: [246, 265, 284, 302, 321, 340, 358, 377, 396, 414, 433, 452, 470] },
    4: { x: 306, y: [547, 566, 584, 603, 622, 640, 659, 678, 696, 715, 734, 752, 771] },
    5: { x: 306, y: [869, 888, 906, 925, 944, 962, 981, 1000] },
    6: { x: 555, y: [247, 266, 285, 303, 322, 341, 359, 378, 397] },
    7: { x: 555, y: [474, 492, 511, 530, 548, 567, 586, 604] },
    8: { x: 555, y: [700, 719, 737, 756, 775, 793, 812] },
    9: { x: 555, y: [888, 906, 925, 944, 962, 981, 1000] },
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
            mapper.textBox('spells', fileNames, 0, x - 12, y + 9, 10, 10, checked, mf_12_centered);
        }
        const displayName = spell.name + ' (' + spell.components.join('').toUpperCase() + ')';
        mapper.textBox('spells', fileNames, 0, x, y - 18, 217, 18, displayName, mf_12);
    }
});

let spellSlots = {
    1: { x: 67, y: 416 },
    2: { x: 67, y: 720 },
    3: { x: 318, y: 191 },
    4: { x: 318, y: 492 },
    5: { x: 318, y: 795 },
    6: { x: 568, y: 191 },
    7: { x: 568, y: 419 },
    8: { x: 568, y: 645 },
    9: { x: 568, y: 832 },
};

try {
    Object.keys(spellSlots).forEach((lvl) => {
        ref = `spell slots level ${lvl}`;
        const x = spellSlots[lvl].x;
        const y = spellSlots[lvl].y;
        const spellEntry = character.spellSlots.filter((f) => f.level === Number(lvl))[0];
        if (spellEntry.max > 0) {
            mapper.textBox(ref, fileNames, 0, x, y, 61, 32, spellEntry.max, mf_15_centered_middle);
            mapper.textBox(ref, fileNames, 0, x + 75, y + 3.5, 135, 25, spellEntry.expended, mf_15_middle);
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
mapper.textBox('character name', fileNames, 0, 60, 83, 291, 26, character.name, mf_24);
mapper.textBox('class levels', fileNames, 0, 360, 61, 150, 23, classLevels);
mapper.textBox('race', fileNames, 0, 360, 95, 150, 23, character.race.name);

mapper.textBox('background', fileNames, 0, 512, 61, 127, 23, character.background.name);
mapper.textBox('alignment', fileNames, 0, 512, 95, 127, 23, character.alignment.name);

mapper.textBox('player name', fileNames, 0, 641, 61, 117, 23, character.ownerName);
mapper.textBox('xp', fileNames, 0, 641, 95, 117, 23, character.xp);

// Abilities and saving throws
abilitiesY = [202, 298, 392, 489, 583, 679];
savingThrowsY = [272, 290, 308, 326, 344, 362];
Object.values(character.abilities).forEach((a) => {
    const abilityY = abilitiesY[0];
    abilitiesY.shift();
    const saveY = savingThrowsY[0];
    savingThrowsY.shift();
    ref = `ability ${a.name}`;
    mapper.textBox(ref, fileNames, 0, 46, abilityY, 60, 41, a.value, mf_24_centered_middle);
    const modifier = dnd5eHelper.quantifyNumber(a.modifier);
    mapper.textBox(ref, fileNames, 0, 59, abilityY + 45, 33, 19, modifier, mf_12_centered_middle);
    ref = `saving throw ${a.name}`;
    const isProficient = dnd5eHelper.evalCheckMark(a.isProficient);
    mapper.textBox(ref, fileNames, 0, 134, saveY + 3, 10, 10, isProficient, mf_8_centered);
    mapper.textBox(ref, fileNames, 0, 150, saveY, 19, 14, dnd5eHelper.quantifyNumber(a.save), mf_12_centered);
});

mapper.textBox('inspiration', fileNames, 0, 126, 172, 32, 26, hasInspiration, mf_12_centered_middle);
mapper.textBox('proficiency bonus', fileNames, 0, 126, 222, 32, 26, proficiencyBonus, mf_17_centered_middle);

// skills
skillsY = [425, 443, 461, 479, 497, 515, 533, 551, 570, 587, 605, 623, 641, 659, 677, 695, 713, 731];
Object.values(character.skills).forEach((s) => {
    let skillY;
    if (skillsY.length > 0) {
        skillY = skillsY[0];
        skillsY.shift();
    }
    if (typeof skillY !== 'undefined') {
        ref = `${s.label} skill`;
        const isProficient = dnd5eHelper.evalCheckMark(s.isProficient);
        mapper.textBox(ref, fileNames, 0, 134, skillY + 3, 10, 10, isProficient, mf_8_centered);
        mapper.textBox(ref, fileNames, 0, 149, skillY, 20, 14, dnd5eHelper.quantifyNumber(s.modifier), mf_12_centered);
    }
});

// AC
ref = 'AC';
mapper.textBox(ref, fileNames, 0, 304, 183, 52, 39, character.ac.value, mf_17_centered_middle);

// Initiative
ref = 'initiative';
mapper.textBox(ref, fileNames, 0, 376, 183, 58, 39, initiative, mf_17_centered_middle);

// Speed
ref = 'movement';
mapper.textBox(ref, fileNames, 0, 454, 183, 58, 39, baseMovement.value, mf_17_centered_middle);
if (baseMovement.slug !== 'walk') {
    mapper.textBox(ref, fileNames, 0, 454, 241, 58, 14, baseMovement.label, mf_12_centered_middle);
}

//Hit Points
ref = 'hit point';
mapper.textBox(ref, fileNames, 0, 390, 262, 120, 14, character.hp.max, mf_12);
mapper.textBox(ref, fileNames, 0, 307, 279, 120, 14, character.hp.value, mf_12);

mapper.textBox(ref, fileNames, 0, 307, 349, 120, 14, character.hp.temp, mf_12);

// Hid Dice
mapper.textBox(ref, fileNames, 0, 329, 422, 64, 14, character.hd, mf_12);

// Death Saves
ref = 'death saves';
mapper.textBox(ref, fileNames, 0, 461, 427, 12, 12, dnd5eHelper.evalCheckMark(deathSuccesses >= 1), mf_12_centered);
mapper.textBox(ref, fileNames, 0, 478, 427, 12, 12, dnd5eHelper.evalCheckMark(deathSuccesses >= 2), mf_12_centered);
mapper.textBox(ref, fileNames, 0, 496, 427, 12, 12, dnd5eHelper.evalCheckMark(deathSuccesses >= 3), mf_12_centered);

mapper.textBox(ref, fileNames, 0, 461, 447, 12, 12, dnd5eHelper.evalCheckMark(deathFails >= 1), mf_12_centered);
mapper.textBox(ref, fileNames, 0, 478, 447, 12, 12, dnd5eHelper.evalCheckMark(deathFails >= 2), mf_12_centered);
mapper.textBox(ref, fileNames, 0, 496, 447, 12, 12, dnd5eHelper.evalCheckMark(deathFails >= 3), mf_12_centered);

// Personality Traits
ref = 'Personality Traits';
mapper.textBox(ref, fileNames, 0, 552, 181, 216, 82, character.details.traits, mf_8_multiline);

// ideals
ref = 'ideals';
mapper.textBox(ref, fileNames, 0, 552, 275, 216, 63, character.details.ideals, mf_8_multiline);

// Bonds
ref = 'Bonds';
mapper.textBox(ref, fileNames, 0, 552, 349, 216, 63, character.details.bonds, mf_8_multiline);

// flaws
ref = 'flaws';
mapper.textBox(ref, fileNames, 0, 552, 422, 216, 63, character.details.flaws, mf_8_multiline);

// Passive wisdom
ref = 'passive wisdom';
mapper.textBox(ref, fileNames, 0, 39, 784, 37, 31, character.skills.prc.passive, mf_17_centered_middle);

ref = 'Other Proficiencies and Languages';
mapper.textBox(ref, fileNames, 0, 44, 829, 224, 189, otherProficienciesAndLanguages.join('; '), {
    ...mf_12_multiline,
    ...{ lineHeight: 15 / mapper.pageHeight },
});

// coins
ref = 'coins';
mapper.textBox(ref, fileNames, 0, 299, 797, 53, 27, character.coins.cp, mf_15_centered_middle);
mapper.textBox(ref, fileNames, 0, 299, 831, 53, 27, character.coins.sp, mf_15_centered_middle);
mapper.textBox(ref, fileNames, 0, 299, 866, 53, 27, character.coins.ep, mf_15_centered_middle);
mapper.textBox(ref, fileNames, 0, 299, 900, 53, 27, character.coins.gp, mf_15_centered_middle);
mapper.textBox(ref, fileNames, 0, 299, 934, 53, 27, character.coins.pp, mf_15_centered_middle);

// equipment
ref = 'equipment';
mapper.textBox(ref, fileNames, 0, 356, 785, 161, 231, equipment, {
    ...mf_12_multiline,
    ...{ lineHeight: 15 / mapper.pageHeight },
});

// features and traits
ref = 'features and traits';

mapper.textBox(ref, fileNames, 0, 545, 506, 230, 512, featuresAndTraits.join('; '), {
    ...mf_12_multiline,
    ...{ lineHeight: 15 / mapper.pageHeight },
});

// Attacks and Spellcasting
attackY = 523;
ref = 'attacks';
character.attacks
    .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0))
    .sort((a, b) => (a.isMelee < b.isMelee ? 1 : a.isMelee > b.isMelee ? -1 : 0))
    .forEach((a) => {
        mapper.textBox(ref, fileNames, 0, 297, attackY, 85, 21, a.label, mf_12_middle);
        const modifier = dnd5eHelper.quantifyNumber(a.modifier);
        mapper.textBox(ref, fileNames, 0, 390, attackY, 38, 21, modifier, mf_12_centered_middle);
        mapper.textBox(ref, fileNames, 0, 437, attackY, 81, 21, a.damageFormula, mf_12_middle);

        attackY = attackY + 27;
    });

// page 2
mapper.image(fileNames, 1, 41, 168, actor.img, 229, 305);

mapper.textBox('character name', fileNames, 1, 60, 83, 291, 26, character.name, mf_24);
mapper.textBox('age', fileNames, 1, 353, 66, 152, 23, character.details.age);
mapper.textBox('eyes', fileNames, 1, 353, 99, 152, 23, character.details.eyes);

mapper.textBox('height', fileNames, 1, 505, 66, 130, 23, character.details.height);
mapper.textBox('skin', fileNames, 1, 505, 99, 130, 23, character.details.skin);

mapper.textBox('weight', fileNames, 1, 634, 66, 130, 23, character.details.weight);
mapper.textBox('hair', fileNames, 1, 634, 99, 130, 23, character.details.hair);

// Allies & Organizations
// TODO: Allies & Organizations

// Character backstory
mapper.textBox('backstory', fileNames, 1, 41, 506, 231, 500, character.details.backstory, {
    ...mf_12_multiline,
    ...{ lineHeight: 15 / mapper.pageHeight },
});

// Treasure
mapper.textBox('treasure', fileNames, 1, 294, 798, 478, 219, treasure, {
    ...mf_12_multiline,
    ...{ lineHeight: 15 / mapper.pageHeight },
});

// page 3

// Spellcasting class
mapper.textBox('character name', fileNames, 2, 58, 85, 289, 32, spellCastingClass, mf_24_centered_middle);

ref = 'spell casting ability';
mapper.textBox(ref, fileNames, 2, 374, 71, 93, 40, character.spellCastingAbility.shortName, mf_24_centered_middle);
mapper.textBox('spell save DC', fileNames, 2, 509, 71, 93, 40, character.spellSaveDC, mf_24_centered_middle);
ref = 'spell attack bonus';
mapper.textBox(ref, fileNames, 2, 648, 71, 93, 40, spellAttackBonus, mf_24_centered_middle);

// Spell list
spellList = {
    0: { x: 43, y: [246, 264, 283, 302, 320, 339, 358, 376] },
    1: { x: 54, y: [474, 491, 510, 529, 547, 566, 585, 603, 622, 641, 659, 678, 697] },
    2: { x: 54, y: [775, 794, 812, 831, 849, 868, 887, 905, 924, 944, 961, 980, 999] },
    3: { x: 306, y: [246, 265, 284, 302, 321, 340, 358, 377, 396, 414, 433, 452, 470] },
    4: { x: 306, y: [547, 566, 584, 603, 622, 640, 659, 678, 696, 715, 734, 752, 771] },
    5: { x: 306, y: [869, 888, 906, 925, 944, 962, 981, 1000] },
    6: { x: 555, y: [247, 266, 285, 303, 322, 341, 359, 378, 397] },
    7: { x: 555, y: [474, 492, 511, 530, 548, 567, 586, 604] },
    8: { x: 555, y: [700, 719, 737, 756, 775, 793, 812] },
    9: { x: 555, y: [888, 906, 925, 944, 962, 981, 1000] },
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
            mapper.textBox('spells', fileNames, 2, x - 12, y + 9, 10, 10, checked, mf_12_centered);
        }
        const displayName = spell.name + ' (' + spell.components.join('').toUpperCase() + ')';
        mapper.textBox('spells', fileNames, 2, x, y - 18, 217, 18, displayName, mf_12);
    }
});

spellSlots = {
    1: { x: 67, y: 416 },
    2: { x: 67, y: 720 },
    3: { x: 318, y: 191 },
    4: { x: 318, y: 492 },
    5: { x: 318, y: 795 },
    6: { x: 568, y: 191 },
    7: { x: 568, y: 419 },
    8: { x: 568, y: 645 },
    9: { x: 568, y: 832 },
};

try {
    Object.keys(spellSlots).forEach((lvl) => {
        ref = `spell slots level ${lvl}`;
        const x = spellSlots[lvl].x;
        const y = spellSlots[lvl].y;
        const spellEntry = character.spellSlots.filter((f) => f.level === Number(lvl))[0];
        if (spellEntry.max > 0) {
            mapper.textBox(ref, fileNames, 2, x, y, 61, 32, spellEntry.max, mf_15_centered_middle);
            mapper.textBox(ref, fileNames, 2, x + 75, y + 3.5, 135, 25, spellEntry.expended, mf_15_middle);
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

// WIP.
export { mapper };
