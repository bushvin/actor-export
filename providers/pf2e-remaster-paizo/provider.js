import { pdfProvider } from '../../scripts/lib/providers/PDFProvider.js';
import { pf2eHelper } from '../../scripts/lib/helpers/PF2eHelper.js';
import { semVer } from '../../scripts/lib/SemVer.js';

// actor is available as a global variable
// game is available as a global variable

// helper functions

class pf2ePDFProvider extends pdfProvider {
    constructor(actor) {
        super(actor);
        /*
         * pf2ePDFProvider expects % instead of pixels.
         * this provides the actual size in pixels of the PDF(s)
         */
        this.pageWidth = 612;
        this.pageHeight = 792;
    }

    /**
     * pf2ePDFProvider.defaultFont expects % instead of pixels.
     * this function converts pixels to % before committing them.
     * yes, I am lazy.
     */
    defaultFont(font, size, lineHeight = undefined) {
        if (!isNaN(Number(size))) {
            size = size / mapper.pageHeight;
        }
        if (!isNaN(Number(lineHeight))) {
            lineHeight = lineHeight / mapper.pageHeight;
        }

        super.defaultFont(font, size, lineHeight);
    }

    /**
     * pf2ePDFProvider.image expects % instead of pixels.
     * this function converts pixels to % before committing them.
     * yes, I am lazy.
     */
    image(file, page, x, y, path, maxWidth = -1, maxHeight = -1, options) {
        x = x / this.pageWidth;
        y = y / this.pageHeight;
        maxWidth = maxWidth > 0 ? maxWidth / this.pageWidth : maxWidth;
        maxHeight = maxHeight > 0 ? maxHeight / this.pageHeight : maxHeight;
        super.image(file, page, x, y, path, maxWidth, maxHeight, options);
    }

    /**
     * pf2ePDFProvider.textBox expects % instead of pixels.
     * this function converts pixels to % before committing them.
     * yes, I am lazy.
     */
    textBox(reference, file, page, x, y, width, height, text, options = {}) {
        x = x / this.pageWidth;
        y = y / this.pageHeight;
        width = width / this.pageWidth;
        height = height / this.pageHeight;
        super.textBox(reference, file, page, x, y, width, height, text, options);
    }

    /**
     * return the same for all checkboxes
     * @param {boolean} value logic operator to evaluate
     * @returns {string} x or an empty string.
     */
    checkMark(value) {
        if (value === true) {
            return 'x';
        }
        return '';
    }
}

const mapper = new pf2ePDFProvider(actor);
let ref;
mapper.defaultFont('MarkerFelt.ttf', 12, 12);
mapper.defaultFontColor('#01579b');

// Font definitions
const mf_default = {};
const mf_6 = { ...mf_default, ...{ size: 6 / mapper.pageHeight, lineHeight: 8 / mapper.pageHeight } };
const mf_6_centered = { ...mf_6, ...{ halign: 'center' } };
const mf_6_multiline = { ...mf_6, ...{ multiline: true, valign: 'top' } };
const mf_8 = { ...mf_default, ...{ size: 8 / mapper.pageHeight, lineHeight: 10 / mapper.pageHeight } };
const mf_8_centered = { ...mf_8, ...{ halign: 'center' } };
const mf_8_top = { ...mf_8, ...{ valign: 'top' } };
const mf_8_multiline = { ...mf_8, ...{ multiline: true, valign: 'top' } };
const mf_10 = { ...mf_default, ...{ size: 10 / mapper.pageHeight, lineHeight: 12 / mapper.pageHeight } };
const mf_10_centered = { ...mf_10, ...{ halign: 'center' } };
const mf_10_centered_top = { ...mf_10_centered, ...{ valign: 'top' } };
const mf_10_multiline = { ...mf_10, ...{ multiline: true, valign: 'top' } };
const mf_12 = { ...mf_default, ...{ size: 12 / mapper.pageHeight, lineHeight: 14 / mapper.pageHeight } };
const mf_12_centered = { ...mf_12, ...{ halign: 'center' } };
const mf_15 = { ...mf_default, ...{ size: 15 / mapper.pageHeight, lineHeight: 17 / mapper.pageHeight } };
const mf_15_centered = { ...mf_15, ...{ halign: 'center' } };
const mf_17 = { ...mf_default, ...{ size: 17 / mapper.pageHeight, lineHeight: 19 / mapper.pageHeight } };
const mf_17_centered = { ...mf_17, ...{ halign: 'center' } };
const f_debug = { debug: true };

const action_8 = {
    font: 'action_icons.ttf',
    size: 8 / mapper.pageHeight,
    lineHeight: 8 / mapper.pageHeight,
    color: '#01579b',
};
const action_8_right = { ...action_8, ...{ halign: 'right' } };

const action_8_centered = { ...action_8, ...{ halign: 'center' } };
const action_8_centered_top = { ...action_8_centered, ...{ valign: 'top' } };

const action_10 = { ...action_8, ...{ size: 10 / mapper.pageHeight, lineHeight: 12 / mapper.pageHeight } };
const action_10_centered = { ...action_10, ...{ halign: 'center' } };
const action_10_centered_top = { ...action_10_centered, ...{ valign: 'top' } };

const action_12 = { ...action_8, ...{ size: 12 / mapper.pageHeight, lineHeight: 14 / mapper.pageHeight } };
const action_12_centered = { ...action_12, ...{ halign: 'center' } };

const fileName = 'RemasterPlayerCoreCharacterSheet.pdf';

// an abstraction of actor
const character = pf2eHelper.getActorObject(game, actor);

mapper.image(fileName, 2, 29, 39, actor.img, 178, 265);

/* PAGE 1 */
mapper.textBox('actor name', fileName, 0, 217, 40, 178, 18, character.name, mf_17);
mapper.textBox('player name', fileName, 0, 260, 69, 135, 10, character.ownerName, mf_10);
mapper.textBox('ancestry', fileName, 0, 30, 98, 176, 8, character.ancestry.name, mf_12);
mapper.textBox('heritage', fileName, 0, 30, 114, 142, 22, character.heritage.name, mf_12);
mapper.textBox('size', fileName, 0, 180, 114, 26, 22, character.size, mf_12);

// Background
mapper.textBox('background', fileName, 0, 217, 98, 178, 8, character.background.name, mf_12);
/* TODO: background notes */

// Class
mapper.textBox('class', fileName, 0, 406, 98, 176, 8, character.class.name, mf_12);
mapper.textBox('class notes', fileName, 0, 406, 114, 176, 22, character.class.subClass, mf_12);

// level
mapper.textBox('level', fileName, 0, 412, 50, 19, 19, character.level, mf_15_centered);
mapper.textBox('xp', fileName, 0, 446, 52, 42, 15, character.xp, mf_12);

// Hero points
mapper.textBox('heropoint', fileName, 0, 510, 36, 9, 16, mapper.checkMark(character.heroPoints >= 1), mf_17_centered);
mapper.textBox('heropoint', fileName, 0, 533, 36, 9, 16, mapper.checkMark(character.heroPoints >= 2), mf_17_centered);
mapper.textBox('heropoint', fileName, 0, 556, 36, 9, 16, mapper.checkMark(character.heroPoints >= 3), mf_17_centered);

// Attributes
const attr_x = [29, 123, 217, 311, 405, 499];
Object.values(character.attributes).forEach((a, i) => {
    ref = `${a.name} attribute`;
    mapper.textBox(ref, fileName, 0, attr_x[i], 150, 21, 19, pf2eHelper.quantifyNumber(a.modifier), mf_15_centered);
    ref = `${a.name} attribute boost`;
    const checkMark = mapper.checkMark(a.isPartialBoost);
    mapper.textBox(ref, fileName, 0, attr_x[i] + 27, 168, 5, 5, checkMark, mf_12_centered);
});

// Defense
mapper.textBox('ac', fileName, 0, 51, 212, 25, 17, character.ac.modifier, mf_17_centered);
mapper.textBox('ac', fileName, 0, 46, 248, 17, 10, character.ac.attributeModifier, mf_10_centered);
mapper.textBox('ac', fileName, 0, 64, 248, 17, 10, character.ac.proficiencyModifier, mf_10_centered);
mapper.textBox('ac', fileName, 0, 82, 248, 18, 10, character.ac.itemModifier, mf_10_centered);

// Shield
if (character.hasShieldEquipped) {
    mapper.textBox('shield', fileName, 0, 104, 205, 15, 17, character.equippedShield.ac, mf_15);
    mapper.textBox('shield', fileName, 0, 127, 209, 21, 10, character.equippedShield.hardness, mf_10_centered);
    mapper.textBox('shield', fileName, 0, 153, 209, 17, 10, character.equippedShield.hpMax, mf_10_centered);
    mapper.textBox('shield', fileName, 0, 170, 209, 18, 10, character.equippedShield.bt, mf_10_centered);
    mapper.textBox('shield', fileName, 0, 192, 209, 16, 10, character.equippedShield.hpValue, mf_10_centered);
}
// Armor proficiencies
const armor_proficiency_x = [127, 152, 172, 194];
Object.values(character.defenseProficiencies)
    .filter((f) => !f.name.endsWith('-barding'))
    .forEach((d, i) => {
        ref = `${d.name} proficiency`;
        const x = armor_proficiency_x[i];
        mapper.textBox(ref, fileName, 0, x, 244, 7, 5, mapper.checkMark(d.rank >= 1), mf_10_centered);
        mapper.textBox(ref, fileName, 0, x, 250, 7, 5, mapper.checkMark(d.rank >= 2), mf_10_centered);
        mapper.textBox(ref, fileName, 0, x, 257, 7, 5, mapper.checkMark(d.rank >= 3), mf_10_centered);
        mapper.textBox(ref, fileName, 0, x, 264, 7, 5, mapper.checkMark(d.rank >= 4), mf_10_centered);
    });

// Saving Throws
const saves_x = [217, 279, 341];
Object.values(character.savingThrows).forEach((s, i) => {
    ref = `${s.name} save`;
    const x = saves_x[i];
    mapper.textBox(ref, fileName, 0, x, 202, 43, 18, pf2eHelper.quantifyNumber(s.modifier), mf_15_centered);
    mapper.textBox(ref, fileName, 0, x - 1, 228, 17, 10, s.attributeModifier, mf_10_centered);
    mapper.textBox(ref, fileName, 0, x + 17, 228, 17, 10, s.proficiencyModifier, mf_10_centered);
    mapper.textBox(ref, fileName, 0, x + 35, 228, 17, 10, s.itemModifier, mf_10_centered);

    ref = `${s.name} proficiency`;
    mapper.textBox(ref, fileName, 0, x + 47, 205, 5, 4, mapper.checkMark(s.rank >= 1), mf_10_centered);
    mapper.textBox(ref, fileName, 0, x + 47, 209, 5, 4, mapper.checkMark(s.rank >= 2), mf_10_centered);
    mapper.textBox(ref, fileName, 0, x + 47, 215, 5, 4, mapper.checkMark(s.rank >= 3), mf_10_centered);
    mapper.textBox(ref, fileName, 0, x + 47, 220, 5, 4, mapper.checkMark(s.rank >= 4), mf_10_centered);
});

/* Defense Notes */
let defense_notes = [];
let modifiers_types = ['ability', 'proficiency', 'item'];
let fortitude_bonus = actor.saves.fortitude.modifiers.filter((i) => !modifiers_types.includes(i.type));
let reflex_bonus = actor.saves.reflex.modifiers.filter((i) => !modifiers_types.includes(i.type));
let will_bonus = actor.saves.reflex.modifiers.filter((i) => !modifiers_types.includes(i.type));
let all_bonus_slugs = fortitude_bonus
    .concat(reflex_bonus)
    .concat(will_bonus)
    .map((i) => i.slug)
    .filter((v, i, a) => a.indexOf(v) === i);
all_bonus_slugs = all_bonus_slugs.filter(
    (i) =>
        fortitude_bonus.map((i) => i.slug).includes(i) &&
        reflex_bonus.map((i) => i.slug).includes(i) &&
        will_bonus.map((i) => i.slug).includes(i)
);
let all_bonus = fortitude_bonus.filter((i) => all_bonus_slugs.includes(i.slug));
fortitude_bonus = fortitude_bonus.filter((i) => !all_bonus_slugs.includes(i.slug));
reflex_bonus = reflex_bonus.filter((i) => !all_bonus_slugs.includes(i.slug));
will_bonus = will_bonus.filter((i) => !all_bonus_slugs.includes(i.slug));
all_bonus.forEach((b) => {
    defense_notes.push(`${b.label} ${pf2eHelper.quantifyNumber(b.modifier)} (saves)`);
});
fortitude_bonus.forEach((b) => {
    defense_notes.push(`${b.label} ${pf2eHelper.quantifyNumber(b.modifier)} (fort)`);
});
reflex_bonus.forEach((b) => {
    defense_notes.push(`${b.label} ${pf2eHelper.quantifyNumber(b.modifier)} (ref)`);
});
will_bonus.forEach((b) => {
    defense_notes.push(`${b.label} ${pf2eHelper.quantifyNumber(b.modifier)} (will)`);
});
mapper.textBox('defense notes', fileName, 0, 215, 251, 180, 25, ' '.repeat(28) + defense_notes.join(', '), {
    ...mf_8,
    ...{ valign: 'top', multiline: true },
});

// Hit points
mapper.textBox('hitpoints', fileName, 0, 402, 201, 40, 20, character.hp.max, mf_15_centered);
mapper.textBox('hitpoints', fileName, 0, 442, 199, 87, 34, character.hp.value, { ...mf_10, ...{ valign: 'top' } });
mapper.textBox('hitpoints', fileName, 0, 535, 199, 48, 10, character.hp.temp, mf_10);

mapper.textBox('dying', fileName, 0, 555, 215, 4, 4, mapper.checkMark(character.dying.value >= 1), mf_10_centered);
mapper.textBox('dying', fileName, 0, 564, 215, 4, 4, mapper.checkMark(character.dying.value >= 2), mf_10_centered);
mapper.textBox('dying', fileName, 0, 572, 215, 4, 4, mapper.checkMark(character.dying.value >= 3), mf_10_centered);
mapper.textBox('dying', fileName, 0, 580, 215, 4, 4, mapper.checkMark(character.dying.value >= 4), mf_10_centered);

const wounded = `${character.wounded.value}/${character.wounded.max}`;
mapper.textBox('wounds', fileName, 0, 567, 222, 17, 11, wounded, mf_10_centered);
const resistance_immunities = character.immunities + ', ' + character.resistance;
mapper.textBox('resistance', fileName, 0, 405, 240, 179, 16, resistance_immunities, mf_10);
mapper.textBox('conditions', fileName, 0, 405, 262, 179, 16, character.conditions, mf_10);

/* Skills */
const skill_y = [291, 317, 344, 370, 397, 424, 450, 530, 556, 583, 609, 636, 663, 689, 716, 742];
const lore_skill_y = [477, 503];
Object.values(character.skills).forEach((skill) => {
    let y;
    let pdfLabelStyle;
    if (skill.isLore) {
        y = lore_skill_y[0];
        lore_skill_y.shift();
        pdfLabelStyle = { ...mf_12, ...{ halign: 'right' } };
        if (skill.label.length > 14) {
            pdfLabelStyle = { ...mf_10, ...{ halign: 'right' } };
        }
        let skillName = skill.label;
        if (skillName.toLowerCase().endsWith('lore')) {
            skillName = skillName.trim().slice(0, -4).trim();
        }
        mapper.textBox(ref, fileName, 0, 0, y - 3, 68, 18, skillName, pdfLabelStyle);
    } else {
        y = skill_y[0];
        skill_y.shift();
    }
    ref = `${skill.label} skill`;
    mapper.textBox(ref, fileName, 0, 95, y, 32, 18, pf2eHelper.quantifyNumber(skill.modifier), mf_15_centered);
    mapper.textBox(ref, fileName, 0, 146, y + 1, 19, 12, skill.attributeModifier, mf_12_centered);
    mapper.textBox(ref, fileName, 0, 166, y + 1, 19, 12, skill.proficiencyModifier, mf_12_centered);
    mapper.textBox(ref, fileName, 0, 187, y + 1, 19, 12, skill.itemModifier, mf_12_centered);
    if (typeof skill.armorModifier !== 'undefined') {
        mapper.textBox(ref, fileName, 0, 207, y + 1, 19, 12, skill.armorModifier, mf_12_centered);
    }
    ref = `${skill.label} proficiency`;
    mapper.textBox(ref, fileName, 0, 133, y, 5, 5, mapper.checkMark(skill.rank >= 1), mf_8_centered);
    mapper.textBox(ref, fileName, 0, 133, y + 5, 5, 5, mapper.checkMark(skill.rank >= 2), mf_8_centered);
    mapper.textBox(ref, fileName, 0, 133, y + 10, 5, 5, mapper.checkMark(skill.rank >= 3), mf_8_centered);
    mapper.textBox(ref, fileName, 0, 133, y + 15, 5, 5, mapper.checkMark(skill.rank >= 4), mf_8_centered);
});

// Skill Notes
let skill_notes = [];

const assurance = actor.items
    .filter((i) => i.slug === 'assurance')
    .map((i) => i.rules.filter((f) => f.prompt === 'PF2E.SpecificRule.Prompt.Skill').map((m) => m.selection))
    .flat(1)
    .map((i) => pf2eHelper.capitalize(i));
if (assurance.length > 0) {
    skill_notes.push('Assurance: ' + assurance.join(', '));
}
mapper.textBox('skill notes', fileName, 0, 233, 296, 68, 467, skill_notes.join('\n'), {
    ...mf_8,
    ...{ valign: 'top', multiline: true },
});

// Languages Section
let languages = '';

if (semVer.gte(game.system.version, '5.12.0')) {
    languages = actor.system.details.languages.value
        .filter(function (a) {
            return a.trim() != '';
        })
        .join(', ');
} else {
    // pre pf2e v5.12.0
    languages = actor.system.traits.languages.value
        .concat([actor.system.traits.languages.custom])
        .filter(function (a) {
            return a.trim() != '';
        })
        .join(', ');
}
mapper.textBox('languages', fileName, 0, 311, 294, 84, 73, languages, {
    ...mf_8,
    ...{ valign: 'top', multiline: true },
});

// Perception
const perception = pf2eHelper.quantifyNumber(character.perception.modifier);
mapper.textBox('perception', fileName, 0, 403, 302, 20, 10, perception, mf_12_centered);
mapper.textBox('perception', fileName, 0, 436, 302, 18, 10, character.perception.attributeModifier, mf_10_centered);
mapper.textBox('perception', fileName, 0, 455, 302, 17, 10, character.perception.proficiencyModifier, mf_10_centered);
mapper.textBox('perception', fileName, 0, 473, 302, 17, 10, character.perception.itemModifier, mf_10_centered);
const pRank = character.perception.rank;
mapper.textBox('perception', fileName, 0, 424, 297, 5, 5, mapper.checkMark(pRank >= 1), mf_8_centered);
mapper.textBox('perception', fileName, 0, 424, 302, 5, 5, mapper.checkMark(pRank >= 2), mf_8_centered);
mapper.textBox('perception', fileName, 0, 424, 308, 5, 5, mapper.checkMark(pRank >= 3), mf_8_centered);
mapper.textBox('perception', fileName, 0, 424, 313, 5, 5, mapper.checkMark(pRank >= 4), mf_8_centered);

mapper.textBox('senses notes', fileName, 0, 405, 327, 84, 40, character.senses, mf_8_multiline);

// speed
mapper.textBox('speed', fileName, 0, 498, 298, 50, 14, character.baseMovement.value, mf_12_centered);

const specialMovement = character.movement
    .filter((f) => !f.isPrimary)
    .map((m) => m.displayName)
    .join(', ');
mapper.textBox('special movement', fileName, 0, 499, 327, 84, 40, specialMovement, {
    ...mf_8,
    ...{ valign: 'top', multiline: true },
});

// Strikes
const melee_strike_y = [408, 457, 506];
const ranged_strike_y = [570, 619];
character.strikes.forEach((strike) => {
    let y;
    if (strike.isMelee && melee_strike_y.length > 0) {
        y = melee_strike_y[0];
        melee_strike_y.shift();
    } else if (strike.isRanged && ranged_strike_y.length > 0) {
        y = ranged_strike_y[0];
        ranged_strike_y.shift();
    }
    if (typeof y !== 'undefined') {
        ref = 'strike';
        const modifier = pf2eHelper.quantifyNumber(strike.modifier);
        const attributeName = pf2eHelper.capitalize(strike.attributeName);
        const dmgParser = function (value) {
            return value.replace(/(piercing|bludgeoning|slashing)/gi, '').replace(/\s+/g, ' ');
        };
        const traitsAndNotes = pf2eHelper.formatTraits(strike.traits);
        const hasBludgeoningDamage = strike.hasBludgeoningDamage;
        const hasPiercingDamage = strike.hasPiercingDamage;
        const hasSlashingDamage = strike.hasSlashingDamage;

        let pdfNameStyle = mf_10;
        if (strike.label.length > 32) {
            pdfNameStyle = mf_6;
        } else if (strike.label.length > 20) {
            pdfNameStyle = mf_8;
        }
        let pdfTraitsStyle = mf_8;
        if (traitsAndNotes.length > 77) {
            pdfTraitsStyle = mf_6;
        }

        mapper.textBox(ref, fileName, 0, 311, y - 5, 84, 17, strike.label, pdfNameStyle);
        mapper.textBox(ref, fileName, 0, 404, y - 5, 26, 17, modifier, mf_12_centered);
        mapper.textBox(ref, fileName, 0, 436, y + 1, 18, 10, strike.attributeModifier, mf_10_centered);
        if (strike.isMelee && strike.attributeName !== 'str') {
            mapper.textBox(ref, fileName, 0, 440, y + 11, 10, 10, attributeName, mf_8);
        }
        mapper.textBox(ref, fileName, 0, 455, y + 1, 17, 10, strike.proficiencyModifier, mf_10_centered);
        mapper.textBox(ref, fileName, 0, 472, y + 1, 17, 10, strike.itemModifier, mf_10_centered);
        mapper.textBox(ref, fileName, 0, 499, y - 5, 74, 17, strike.damageFormula, {
            ...mf_10,
            ...{ valueParser: dmgParser },
        });

        mapper.textBox(ref, fileName, 0, 365, y + 22, 219, 10, traitsAndNotes, pdfTraitsStyle);
        mapper.textBox(ref, fileName, 0, 576, y, 5, 5, mapper.checkMark(hasBludgeoningDamage), mf_8_centered);
        mapper.textBox(ref, fileName, 0, 576, y + 6, 5, 5, mapper.checkMark(hasPiercingDamage), mf_8_centered);
        mapper.textBox(ref, fileName, 0, 576, y + 12, 5, 5, mapper.checkMark(hasSlashingDamage), mf_8_centered);
    }
});

// Weapon proficiencies
const wp_x = [314, 336, 360, 381];
['simple', 'martial', 'advanced', 'unarmed'].forEach((a) => {
    // Object.keys(actor.system.proficiencies?.attacks || []).forEach((a, i) => {
    //const wp = actor.system.proficiencies.attacks[a].rank || 0;
    let x = wp_x[0];
    wp_x.shift();
    const wp = character.weaponProficiencies[a].rank;
    mapper.textBox('weapon proficiencies', fileName, 0, x, 672, 6, 6, mapper.checkMark(wp >= 1), mf_8_centered);
    mapper.textBox('weapon proficiencies', fileName, 0, x, 679, 6, 6, mapper.checkMark(wp >= 2), mf_8_centered);
    mapper.textBox('weapon proficiencies', fileName, 0, x, 685, 6, 6, mapper.checkMark(wp >= 3), mf_8_centered);
    mapper.textBox('weapon proficiencies', fileName, 0, x, 692, 6, 6, mapper.checkMark(wp >= 4), mf_8_centered);
});
// TODO: 'Other' weapon proficiencies
// TODO: Weapon proficiency notes
// TODO: Critical Specializations

// Class DC
mapper.textBox('class dc', fileName, 0, 319, 705, 70, 25, character.classDC.modifier, mf_15_centered);
mapper.textBox('class dc', fileName, 0, 336, 746, 17, 10, character.classDC.attributeModifier, mf_10_centered);
mapper.textBox('class dc', fileName, 0, 354, 746, 17, 10, character.classDC.proficiencyModifier, mf_10_centered);
mapper.textBox('class dc', fileName, 0, 372, 746, 18, 10, character.classDC.itemModifier, mf_10_centered);

/* PAGE 2 */
// Ancestry and General Feats
// Ancestry and heritage Abilities
ref = 'Ancestry and heritage Abilities';
const ancestryAndHeritageAbilities = character.ancestryAndHeritageAbilities.map((m) => m.displayName).sort();
mapper.textBox(ref, fileName, 1, 49, 53, 162, 25, ancestryAndHeritageAbilities.join(', '), mf_8_multiline);

// Ancestry Feats
const ancestry_y = [86, 272, 398, 524, 650];

pf2eHelper
    .unique(character.ancestryFeats.map((m) => m.level))
    .sort()
    .forEach((level) => {
        const feats = character.ancestryFeats.filter((f) => f.level === level).map((m) => m.name);
        if (ancestry_y.length > 0) {
            const y = ancestry_y[0];
            ancestry_y.shift();
            mapper.textBox('Ancestry feats', fileName, 1, 49, y, 162, 20, feats.join(', '), mf_8_multiline);
        }
    });

// Background Skill Feats
ref = 'background skill feats';
const backgroundSkillFeats = character.backgroundSkillFeats.map((m) => m.name);
mapper.textBox(ref, fileName, 1, 49, 123, 162, 43, backgroundSkillFeats.join(', '), mf_8_multiline);

// Skill feats
const skill_feats_y = [176, 239, 302, 365, 428, 491, 554, 617, 680, 742];
pf2eHelper
    .unique(character.skillFeats.map((m) => m.level))
    .sort()
    .forEach((level) => {
        const feats = character.skillFeats.filter((f) => f.level === level).map((m) => m.name);
        if (skill_feats_y.length > 0) {
            const y = skill_feats_y[0];
            skill_feats_y.shift();
            mapper.textBox('skill feats', fileName, 1, 49, y, 162, 20, feats.sort().join(', '), mf_8_multiline);
        }
    });

// General feats
const general_feats_y = [208, 333, 460, 586, 712];
pf2eHelper
    .unique(character.generalFeats.map((m) => m.level))
    .sort()
    .forEach((level) => {
        const feats = character.generalFeats.filter((f) => f.level === level).map((m) => m.name);
        if (general_feats_y.length > 0) {
            const y = general_feats_y[0];
            general_feats_y.shift();
            mapper.textBox('general feats', fileName, 1, 49, y, 162, 20, feats.sort().join(', '), mf_8_multiline);
        }
    });

// Attribute boosts
const boost_y = [271, 428, 586, 743];
pf2eHelper
    .unique(character.attributeBoosts.map((m) => m.level))
    .sort()
    .forEach((level) => {
        const boosts = pf2eHelper.formatAttributeBoosts(
            character.attributeBoosts.filter((f) => f.level === level).map((m) => m.boost)
        );
        if (boost_y.length > 0) {
            const y = boost_y[0];
            boost_y.shift();
            mapper.textBox('attribute boosts', fileName, 1, 184, y, 27, 20, boosts, mf_6_multiline);
        }
    });

// Class Feats and Features
// Class Features
const class_features_y = [53, 208, 272, 333, 398, 460, 524, 586, 650, 712];
let firstFeature = true;
pf2eHelper
    .unique(character.classFeatures.map((m) => m.level))
    .sort()
    .forEach((level) => {
        const features = character.classFeatures.filter((f) => f.level === level).map((m) => m.name);
        ref = 'class features';
        if (class_features_y.length > 0) {
            const y = class_features_y[0];
            class_features_y.shift();
            let pdfHeight = 20;
            if (firstFeature) {
                firstFeature = false;
                pdfHeight = 113;
            }
            mapper.textBox(ref, fileName, 1, 216, y, 179, pdfHeight, features.sort().join(', '), mf_8_multiline);
        }
    });

// Class Feats
const class_feats_y = [176, 239, 302, 365, 428, 491, 554, 617, 680, 742];
pf2eHelper
    .unique(character.classFeats.map((m) => m.level))
    .sort()
    .forEach((level) => {
        const feats = character.classFeats.filter((f) => f.level === level).map((m) => m.name);
        if (class_feats_y.length > 0) {
            const y = class_feats_y[0];
            class_feats_y.shift();
            mapper.textBox('class feats', fileName, 1, 216, y, 179, 20, feats.sort().join(', '), mf_8_multiline);
        }
    });

// Inventory
let y = 0;
// Held items
// item names shouldn't be longer than 50/45 characters
y = 48;
ref = 'held items';
character.heldItems.forEach((item) => {
    if (y < 180) {
        let pdfStyle = mf_8;
        if (item.isMagical) {
            pdfStyle = { ...pdfStyle, ...{ suffix: ' ‡' } };
        }
        mapper.textBox(ref, fileName, 1, 406, y, 153, 10, item.displayName, pdfStyle);
        mapper.textBox(ref, fileName, 1, 566, y, 14, 10, item.bulk, mf_8_centered);
    }
    y = y + 10;
});

// Consumables
y = 203;
ref = 'consumables';
character.consumables.forEach((item) => {
    if (y < 340) {
        let pdfStyle = mf_8;
        if (item.isMagical) {
            pdfStyle = { ...pdfStyle, ...{ suffix: ' ‡' } };
        }
        mapper.textBox(ref, fileName, 1, 406, y, 153, 10, item.displayName, pdfStyle);
        mapper.textBox(ref, fileName, 1, 566, y, 14, 10, item.bulk, mf_8_centered);
    }
    y = y + 10;
});

// Worn items
y = 365;
ref = 'worn items';
character.wornItems.forEach((container) => {
    if (y <= 568) {
        let pdfStyle = mf_8;
        if (container.isMagical) {
            pdfStyle = { ...pdfStyle, ...{ suffix: ' ‡' } };
        }
        mapper.textBox(ref, fileName, 1, 406, y, 120, 10, container.displayName, pdfStyle);
        mapper.textBox(ref, fileName, 1, 530, y, 27, 10, mapper.checkMark(container.isInvested), mf_8_centered);
        mapper.textBox(ref, fileName, 1, 566, y, 14, 10, container.bulk, mf_8_centered);
        y = y + 10;

        container.items.forEach((item) => {
            if (y <= 568) {
                let pdfStyle = mf_8;
                if (container.isMagical) {
                    pdfStyle = { ...pdfStyle, ...{ suffix: ' ‡' } };
                }
                mapper.textBox(ref, fileName, 1, 416, y, 110, 10, item.displayName, pdfStyle);
                mapper.textBox(ref, fileName, 1, 530, y, 27, 10, mapper.checkMark(item.isInvested), mf_8_centered);
                mapper.textBox(ref, fileName, 1, 566, y, 14, 10, item.bulk, mf_8_centered);
                y = y + 10;
            }
        });
    }
});

// Bulk
mapper.textBox('bulk', fileName, 1, 413, 610, 25, 22, character.totalBulk, mf_15_centered);

// Wealth
mapper.textBox('wealth', fileName, 1, 415, 665, 28, 20, character.coins.cp || 0, mf_15_centered);
mapper.textBox('wealth', fileName, 1, 458, 665, 28, 20, character.coins.sp || 0, mf_15_centered);
mapper.textBox('wealth', fileName, 1, 501, 665, 28, 20, character.coins.gp || 0, mf_15_centered);
mapper.textBox('wealth', fileName, 1, 544, 665, 28, 20, character.coins.pp || 0, mf_15_centered);

// Gems and Artwork
ref = 'gems and artwork';
y = 711;
character.gemsAndArtwork.forEach((item) => {
    if (y < 752) {
        let pdfStyle = mf_8;
        if (item.isMagical) {
            pdfStyle = { ...pdfStyle, ...{ suffix: ' ‡' } };
        }
        mapper.textBox(ref, fileName, 1, 406, y, 153, 10, item.displayName, pdfStyle);
        mapper.textBox(ref, fileName, 1, 530, y, 27, 10, item.price.join(' '), mf_8_centered);
        mapper.textBox(ref, fileName, 1, 566, y, 14, 10, item.bulk, mf_8_centered);
        y = y + 10;
    }
});

/* Page 3 */
// Origin and Appearance
mapper.textBox('ethnicity', fileName, 2, 218, 48, 59, 15, character.details.ethnicity, mf_10);
mapper.textBox('nationality', fileName, 2, 283, 48, 59, 15, character.details.nationality, mf_10);
mapper.textBox('birthplace', fileName, 2, 348, 48, 59, 15, character.details.biography.birthplace, mf_10);
mapper.textBox('age', fileName, 2, 413, 48, 22, 15, character.details.age, mf_10);
mapper.textBox('gender & pronouns', fileName, 2, 440, 48, 67, 15, character.details.gender, mf_10);
mapper.textBox('height', fileName, 2, 512, 48, 31, 15, character.details.height, mf_10);
mapper.textBox('weight', fileName, 2, 549, 48, 33, 15, character.details.weight, mf_10);

mapper.textBox('appearance', fileName, 2, 218, 79, 364, 15, character.details.biography.appearance, mf_10);

// Personality
mapper.textBox('attitude', fileName, 2, 218, 123, 178, 15, character.details.biography.attitude, mf_10);
mapper.textBox('deity or philosofy', fileName, 2, 404, 123, 178, 15, character.details.deity, mf_10);
const actorEdicts = character.details.biography.edicts;
mapper.textBox('edicts', fileName, 2, 218, 141, 178, 70, ' '.repeat(10) + actorEdicts, mf_10_multiline);

const actorAnathema = character.details.biography.anathema;
mapper.textBox('edicts', fileName, 2, 404, 141, 178, 70, ' '.repeat(15) + actorAnathema, mf_10_multiline);

mapper.textBox('likes', fileName, 2, 218, 226, 364, 15, character.details.biography.likes, mf_10);
const actorDislikes = character.details.biography.dislikes;
mapper.textBox('dislikes', fileName, 2, 218, 257, 364, 15, actorDislikes, mf_10);
const actorCatchPhrases = character.details.biography.catchphrases;
mapper.textBox('catchphrases', fileName, 2, 218, 289, 364, 15, actorCatchPhrases, mf_10);

// /* Campaign notes Section */
const actorNotes = character.details.biography.campaignNotes;
mapper.textBox('campaignNotes', fileName, 2, 30, 329, 270, 96, actorNotes, mf_8_multiline);
// allies and enemies are not really good at
const actorAllies = character.details.biography.allies;
mapper.textBox('allies', fileName, 2, 312, 329, 270, 22, actorAllies, mf_6_multiline);
const actorEnemies = character.details.biography?.enemies;
mapper.textBox('enemies', fileName, 2, 312, 366, 270, 22, actorEnemies, mf_6_multiline);
const actorOrganizations = character.details.biography.organizations;
mapper.textBox('organizations', fileName, 2, 312, 403, 270, 22, actorOrganizations, mf_8_multiline);

// Actions and activities
const actorActionsActivities_y = [454, 534, 615, 694];
const actorFreeActionsActivities_y = [454, 534, 615, 694];
// FIXME: trigger and effect doesn't work somehow
character.activities.forEach((a) => {
    let y;
    if (a.type === 'action' && actorActionsActivities_y.length > 0) {
        y = actorActionsActivities_y[0];
        actorActionsActivities_y.shift();
    } else if (a.type === 'free' && actorFreeActionsActivities_y.length > 0) {
        y = actorFreeActionsActivities_y[0];
        actorFreeActionsActivities_y.shift();
    } else if (a.type === 'reaction' && actorFreeActionsActivities_y.length > 0) {
        y = actorFreeActionsActivities_y[0];
        actorFreeActionsActivities_y.shift();
    }
    if (typeof y !== 'undefined' && a.type === 'action') {
        ref = 'action';
        const traits = pf2eHelper.formatTraits(a.traits);
        const reference = pf2eHelper.abbreviateSource(a.reference);
        const description = a.frequency + '\n' + a.description;
        mapper.textBox(ref, fileName, 2, 30, y, 92, 20, a.name, mf_8_multiline);
        mapper.textBox(ref, fileName, 2, 124, y, 35, 20, a.glyph, action_10_centered_top);
        mapper.textBox(ref, fileName, 2, 161, y, 116, 30, traits, mf_8_multiline);
        mapper.textBox(ref, fileName, 2, 279, y, 21, 20, reference, mf_8_multiline);
        mapper.textBox(ref, fileName, 2, 30, y + 26, 271, 43, description, mf_6_multiline);
    } else if (typeof y !== 'undefined' && (a.type === 'free' || a.type === 'reaction')) {
        ref = 'free/re -action';
        const traits = pf2eHelper.formatTraits(a.traits);
        const reference = pf2eHelper.abbreviateSource(a.reference);
        const description = a.frequency + '\n' + a.description;
        let trigger = 'blah';
        let effect = 'blah';
        if (a.type === 'reaction') {
            trigger = (description.split('<hr />').length > 0 ? description.split('<hr />')[0] : '').replace(
                /<strong>Trigger<\/strong>/i,
                ''
            );
            effect = description.split('<hr />').length > 1 ? description.split('<hr />').slice(1).join('<hr />') : '';
        }
        mapper.textBox(ref, fileName, 2, 312, y, 94, 20, a.name, mf_8_multiline);
        mapper.textBox(ref, fileName, 2, 408, y - 8, 8, 8, mapper.checkMark(a.type === 'free'), mf_8_centered);
        mapper.textBox(ref, fileName, 2, 408, y + 2, 8, 8, mapper.checkMark(a.type === 'reaction'), mf_8_centered);
        mapper.textBox(ref, fileName, 2, 444, y, 115, 30, traits, mf_8_multiline);
        mapper.textBox(ref, fileName, 2, 561, y, 21, 20, reference, mf_8_multiline);
        mapper.textBox(ref, fileName, 2, 312, y + 26, 270, 16, trigger, mf_6_multiline);
        mapper.textBox(ref, fileName, 2, 312, y + 49, 270, 16, effect, mf_6_multiline);
    }
});

/*  Page 4 */
// Magical Tradition

const hasArcaneTradition = character.hasArcaneTradition;
const hasOccultTradition = character.hasOccultTradition;
const hasPrimalTradition = character.hasPrimalTradition;
const hasDivineTradition = character.hasDivineTradition;
ref = 'magical tradition';
mapper.textBox(ref, fileName, 3, 64, 41, 10, 10, mapper.checkMark(hasArcaneTradition), mf_10_centered);
mapper.textBox(ref, fileName, 3, 72, 41, 10, 10, mapper.checkMark(hasOccultTradition), mf_10_centered);
mapper.textBox(ref, fileName, 3, 64, 51, 10, 10, mapper.checkMark(hasPrimalTradition), mf_10_centered_top);
mapper.textBox(ref, fileName, 3, 72, 51, 10, 10, mapper.checkMark(hasDivineTradition), mf_10_centered_top);

const isPreparedCaster = character.isPreparedCaster;
const isSpontaneousCaster = character.isSpontaneousCaster;
ref = 'magic preparation';
mapper.textBox(ref, fileName, 3, 129, 46, 5, 5, mapper.checkMark(isPreparedCaster), mf_8_centered);
mapper.textBox(ref, fileName, 3, 129, 56, 5, 5, mapper.checkMark(isSpontaneousCaster), mf_8_centered);

const spellProficiency = character.highestSpellProficiency;

// Spell Attack
if (typeof spellProficiency !== 'undefined') {
    ref = 'spell attack';
    mapper.textBox(ref, fileName, 3, 29, 95, 21, 21, spellProficiency.attack.modifier, mf_15_centered);

    mapper.textBox(ref, fileName, 3, 70, 101, 17, 10, spellProficiency.attack.attributeModifier, mf_12_centered);
    mapper.textBox(ref, fileName, 3, 88, 101, 17, 10, spellProficiency.attack.proficiencyModifier, mf_12_centered);
    mapper.textBox(ref, fileName, 3, 57, 100, 5, 5, mapper.checkMark(spellProficiency.attack.rank >= 1), mf_8_centered);
    mapper.textBox(ref, fileName, 3, 57, 105, 5, 5, mapper.checkMark(spellProficiency.attack.rank >= 2), mf_8_centered);
    mapper.textBox(ref, fileName, 3, 57, 111, 5, 5, mapper.checkMark(spellProficiency.attack.rank >= 3), mf_8_centered);
    mapper.textBox(ref, fileName, 3, 57, 116, 5, 5, mapper.checkMark(spellProficiency.attack.rank >= 4), mf_8_centered);

    ref = 'spell attack';
    mapper.textBox(ref, fileName, 3, 114, 95, 21, 21, spellProficiency.spell.modifier, mf_15_centered);

    mapper.textBox(ref, fileName, 3, 173, 101, 17, 10, spellProficiency.spell.attributeModifier, mf_12_centered);
    mapper.textBox(ref, fileName, 3, 191, 101, 17, 10, spellProficiency.spell.proficiencyModifier, mf_12_centered);

    mapper.textBox(ref, fileName, 3, 142, 100, 5, 5, mapper.checkMark(spellProficiency.spell.rank >= 1), mf_8_centered);
    mapper.textBox(ref, fileName, 3, 142, 105, 5, 5, mapper.checkMark(spellProficiency.spell.rank >= 2), mf_8_centered);
    mapper.textBox(ref, fileName, 3, 142, 111, 5, 5, mapper.checkMark(spellProficiency.spell.rank >= 3), mf_8_centered);
    mapper.textBox(ref, fileName, 3, 142, 116, 5, 5, mapper.checkMark(spellProficiency.spell.rank >= 4), mf_8_centered);
}
// cantrips
// cantrips per day
let cantripSlots = character.spellSlots
    .filter((f) => f.rank === 0)
    .map((m) => m.max)
    .sort()
    .slice(-1)
    .join();
if (cantripSlots === '0') {
    cantripSlots = 'U';
}
mapper.textBox('cantrips per day', fileName, 3, 90, 142, 24, 15, cantripSlots, mf_12_centered);

// cantrip rank
if (cantripSlots !== '') {
    mapper.textBox('cantrip rank', fileName, 3, 184, 142, 24, 15, character.cantripRank, mf_12_centered);
}
// Cantrips
let cantripsY = 176;
const cantripsMaxY = 444;
ref = 'cantrips';
let sceType;
const sceCantripCount = pf2eHelper.unique(
    character.knownSpells.filter((f) => f.isCantrip && !f.isInnateSpell).map((m) => m.type)
).length;
let endingWhiteSpace = false;
character.knownSpells
    .filter((f) => f.isCantrip && !f.isInnateSpell)
    .forEach((cantrip) => {
        let y;
        if (cantripsY < cantripsMaxY) {
            y = cantripsY;
            cantripsY = cantripsY + 10;
        }
        if (typeof y !== 'undefined') {
            if (sceCantripCount > 1 && sceType !== cantrip.type) {
                if (endingWhiteSpace) {
                    y = y + 5;
                    cantripsY = cantripsY + 5;
                }
                mapper.textBox(ref, fileName, 3, 30, y, 169, 12, cantrip.type, mf_10);
                sceType = cantrip.type;
                y = cantripsY;
                cantripsY = cantripsY + 10;
                endingWhiteSpace = true;
            }
            mapper.textBox(ref, fileName, 3, 30, y, 132, 10, cantrip.name, mf_8);
            mapper.textBox(ref, fileName, 3, 155, y, 32, 10, cantrip.glyph, action_8_centered);
            mapper.textBox(ref, fileName, 3, 192, y, 13, 10, 'O'.repeat(cantrip.prepared), mf_8_centered);
        }
    });

// Focus points
ref = 'focus points';
mapper.textBox(ref, fileName, 3, 80, 467, 12, 12, mapper.checkMark(character.focusPoints.max >= 1), mf_10_centered);
mapper.textBox(ref, fileName, 3, 93, 467, 12, 12, mapper.checkMark(character.focusPoints.max >= 2), mf_10_centered);
mapper.textBox(ref, fileName, 3, 106, 467, 12, 12, mapper.checkMark(character.focusPoints.max >= 3), mf_10_centered);

// focus rank
mapper.textBox('focus spell rank', fileName, 3, 184, 467, 24, 15, character.focusSpellRank, mf_12_centered);

// Focus spells
let focusY = 514;
const focusMaxY = 648;
sceType = undefined;
const sceFocusCount = pf2eHelper.unique(character.knownSpells.filter((f) => f.isFocusSpell).map((m) => m.type)).length;
endingWhiteSpace = false;

character.knownSpells
    .filter((f) => f.isFocusSpell)
    .forEach((spell) => {
        let y;
        if (focusY < focusMaxY) {
            y = focusY;
            focusY = focusY + 10;
        }
        if (typeof y !== 'undefined') {
            if (sceFocusCount > 1 && sceType !== spell.type) {
                if (endingWhiteSpace) {
                    y = y + 5;
                    cantripsY = cantripsY + 5;
                }
                mapper.textBox(ref, fileName, 3, 30, y, 169, 12, spell.type, mf_10);
                sceType = spell.type;
                y = focusY;
                focusY = focusY + 10;
                endingWhiteSpace = true;
            }
            mapper.textBox(ref, fileName, 3, 30, y, 146, 10, spell.name, mf_8);
            mapper.textBox(ref, fileName, 3, 181, y, 25, 10, spell.glyph, action_8_centered);
        }
    });

// Innate spells
let innateSpellsY = 672;
const innateSpellsMaxY = 752;
ref = 'innate spell';
sceType = undefined;
const sceInnateSpellCount = pf2eHelper.unique(
    character.knownSpells.filter((f) => f.isInnateSpell).map((m) => m.type)
).length;
endingWhiteSpace = false;
character.knownSpells
    .filter((f) => f.isInnateSpell)
    .forEach((spell) => {
        let y;
        if (innateSpellsY < innateSpellsMaxY) {
            y = innateSpellsY;
            innateSpellsY = innateSpellsY + 10;
        }
        if (typeof y !== 'undefined') {
            if (sceInnateSpellCount > 1 && sceType !== spell.type) {
                if (endingWhiteSpace) {
                    y = y + 5;
                    innateSpellsY = innateSpellsY + 5;
                }
                mapper.textBox(ref, fileName, 3, 30, y, 169, 12, spell.type, mf_10);
                sceType = spell.type;
                y = innateSpellsY;
                innateSpellsY = innateSpellsY + 10;
                endingWhiteSpace = true;
            }
            mapper.textBox(ref, fileName, 3, 30, y, 146, 10, spell.name, mf_8);
            mapper.textBox(ref, fileName, 3, 153, y, 25, 10, spell.glyph, action_8_centered);
            // TODO: frequency of innate spells
            // mapper.textBox(ref, fileName, 3, 186, y, 20, 10, spell.frequency, action_8_centered);
        }
    });

// Spell Slots
// Spells per day
const spellsPerDayX = [277, 308, 340, 371, 403, 434, 466, 497, 529, 560];
for (let i = 1; i <= character.maximumSpellRank; i++) {
    let x;
    if (spellsPerDayX.length > 0) {
        x = spellsPerDayX[0];
        spellsPerDayX.shift();
    }
    if (typeof x !== 'undefined') {
        const rankSlots = character.spellSlots.filter((f) => f.rank === i).map((m) => m.max);
        let pdfStyle = mf_12_centered;
        if (rankSlots.length > 2) {
            pdfStyle = mf_10_centered;
        } else if (rankSlots.length > 6) {
            pdfStyle = mf_8_centered;
        } else if (rankSlots.length > 4) {
            pdfStyle = mf_6_centered;
        }
        mapper.textBox('focus spell rank', fileName, 3, x, 41, 23, 15, rankSlots.join('/'), pdfStyle);
    }
}

// Spells
let spellX = 218;
const spellMinY = 116;
let spellY = spellMinY;
const spellMaxY = 671;
ref = 'spell';
sceType = undefined;
let spellRank;
const sceSpellCount = pf2eHelper.unique(
    character.knownSpells.filter((f) => !f.isInnateSpell && !f.isCantrip && !f.isFocusSpell).map((m) => m.type)
).length;
endingWhiteSpace = false;
// TODO: we need to make sure they are sorted by type // rank // name
character.knownSpells
    .filter((f) => !f.isInnateSpell && !f.isCantrip && !f.isFocusSpell)
    .forEach((spell) => {
        let y;
        let x = spellX;
        if (spellY < spellMaxY) {
            y = spellY;
            spellY = spellY + 10;
        }
        if (typeof y !== 'undefined') {
            if (sceSpellCount > 1 && sceType !== spell.type) {
                if (endingWhiteSpace) {
                    y = y + 5;
                    spellY = spellY + 5;
                }
                mapper.textBox(ref, fileName, 3, 30, y, 169, 12, spell.type, mf_10);
                sceType = spell.type;
                y = spellY;
                spellY = spellY + 10;
                spellRank = undefined;
                // endingWhiteSpace = true;
                endingWhiteSpace = false;
            }
            if (spellRank !== spell.rank) {
                if (endingWhiteSpace) {
                    y = y + 5;
                    spellY = spellY + 5;
                }
                spellRank = spell.rank;
                endingWhiteSpace = true;
            }
            mapper.textBox(ref, fileName, 3, x, y, 105, 10, spell.name, mf_8);
            mapper.textBox(ref, fileName, 3, x + 100, y, 32, 10, spell.glyph, action_8_centered);
            mapper.textBox(ref, fileName, 3, x + 139, y, 16, 10, spell.rank, mf_8_centered);
            mapper.textBox(ref, fileName, 3, x + 162, y, 14, 10, 'O'.repeat(spell.prepared), mf_8_centered);
            if (spellY >= spellMaxY && spellX === 218) {
                spellY = spellMinY;
                spellX = 406;
            }
        }
    });

// Rituals
const ritualX = 218;
const ritualMinY = 709;
let ritualY = ritualMinY;
const ritualMaxY = 752;
ref = 'rituals';
character.knownRituals.forEach((ritual) => {
    let y;
    let x = ritualX;
    if (ritualY < ritualMaxY) {
        y = ritualY;
        ritualY = ritualY + 10;
    }
    if (typeof y !== 'undefined') {
        mapper.textBox(ref, fileName, 3, x, y, 132, 10, ritual.name, mf_8);
        mapper.textBox(ref, fileName, 3, x + 137, y, 19, 10, ritual.rank, mf_8_centered);
        mapper.textBox(ref, fileName, 3, x + 162, y, 24, 10, ritual.cost, mf_8);
    }
    if (ritualY >= ritualMaxY && ritualX === 218) {
        ritualY = ritualMinY;
        ritualX = 406;
    }
});

export { mapper };
