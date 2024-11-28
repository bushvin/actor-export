import { pdfProvider } from '../../scripts/lib/providers/PDFProvider.js';
import { pf2eHelper } from '../../scripts/lib/helpers/PF2eHelper.js';
import { semVer } from '../../scripts/lib/SemVer.js';

// actor is available as a global variable
// game is available as a global variable

const mapper = new pdfProvider(actor);
let ref;
mapper.defaultFont('MarkerFelt.ttf', 12, 12);
mapper.defaultFontColor('#01579b');
// mapper.debugProvider = true;

// Font definitions
const mf_default = {};
const mf_6 = { ...mf_default, ...{ size: 6, lineHeight: 8 } };
const mf_6_centered = { ...mf_6, ...{ halign: 'center' } };
const mf_6_multiline = { ...mf_6, ...{ multiline: true, valign: 'top' } };
const mf_8 = { ...mf_default, ...{ size: 8, lineHeight: 10 } };
const mf_8_centered = { ...mf_8, ...{ halign: 'center' } };
const mf_8_top = { ...mf_8, ...{ valign: 'top' } };
const mf_8_multiline = { ...mf_8, ...{ multiline: true, valign: 'top' } };
const mf_10 = { ...mf_default, ...{ size: 10, lineHeight: 12 } };
const mf_10_centered = { ...mf_10, ...{ halign: 'center' } };
const mf_10_centered_top = { ...mf_10_centered, ...{ valign: 'top' } };
const mf_10_multiline = { ...mf_10, ...{ multiline: true, valign: 'top' } };
const mf_12 = { ...mf_default, ...{ size: 12, lineHeight: 14 } };
const mf_12_centered = { ...mf_12, ...{ halign: 'center' } };
const mf_15 = { ...mf_default, ...{ size: 15, lineHeight: 17 } };
const mf_15_centered = { ...mf_15, ...{ halign: 'center' } };
const mf_15_middle = { ...mf_15, ...{ valign: 'middle' } };
const mf_15_centered_middle = { ...mf_15_centered, ...mf_15_middle };
const mf_17 = { ...mf_default, ...{ size: 17, lineHeight: 19 } };
const mf_17_centered = { ...mf_17, ...{ halign: 'center' } };
const f_debug = { debug: true };

const action_8 = {
    font: 'action_icons.ttf',
    size: 8,
    lineHeight: 8,
    color: '#01579b',
    overrideFont: false,
};
const action_8_right = { ...action_8, ...{ halign: 'right' } };

const action_8_centered = { ...action_8, ...{ halign: 'center' } };
const action_8_centered_top = { ...action_8_centered, ...{ valign: 'top' } };

const action_10 = { ...action_8, ...{ size: 10, lineHeight: 12 } };
const action_10_centered = { ...action_10, ...{ halign: 'center' } };
const action_10_centered_top = { ...action_10_centered, ...{ valign: 'top' } };

const action_12 = { ...action_8, ...{ size: 12, lineHeight: 14 } };
const action_12_centered = { ...action_12, ...{ halign: 'center' } };

const fileName = 'pf2e-remastered-fr.pdf';
// 595x842

// an abstraction of actor
const character = pf2eHelper.getActorObject(game, actor);
mapper.pdfTitle = character.name;

mapper.image(fileName, 2, 21, 65, actor.img, 174, 260);

/* PAGE 1 */
mapper.textBox('actor name', fileName, 0, 204, 65, 176, 18, character.name, mf_17);
mapper.textBox('player name', fileName, 0, 249, 94, 132, 10, character.ownerName, mf_10);
mapper.textBox('ancestry', fileName, 0, 19, 119, 177, 14, character.ancestry.name, mf_12);
mapper.textBox('heritage', fileName, 0, 19, 147, 144, 13, character.heritage.name, mf_12);
mapper.textBox('size', fileName, 0, 167, 147, 29, 13, character.size, mf_12);

// Background
mapper.textBox('background', fileName, 0, 204, 119, 176, 14, character.background.name, mf_12);
/* TODO: background notes */

// Class
mapper.textBox('class', fileName, 0, 388, 119, 177, 14, character.class.name, mf_12);
mapper.textBox('class notes', fileName, 0, 388, 147, 177, 13, character.class.subClass, mf_12);

// level
mapper.textBox('level', fileName, 0, 397, 76, 16, 16, character.level, mf_15_centered);
mapper.textBox('xp', fileName, 0, 429, 76, 44, 16, character.xp, mf_12);

// Hero points
const heroPoints = character.heroPoints;
mapper.textBox('heropoint', fileName, 0, 492, 63, 9, 13, pf2eHelper.evalCheckMark(heroPoints >= 1), mf_17_centered);
mapper.textBox('heropoint', fileName, 0, 515, 63, 9, 13, pf2eHelper.evalCheckMark(heroPoints >= 2), mf_17_centered);
mapper.textBox('heropoint', fileName, 0, 537, 63, 9, 13, pf2eHelper.evalCheckMark(heroPoints >= 3), mf_17_centered);

// Attributes
const attr_x = [20, 112, 205, 297, 389, 481];
Object.values(character.attributes).forEach((a, i) => {
    ref = `${a.name} attribute`;
    mapper.textBox(ref, fileName, 0, attr_x[i], 176, 21, 18, pf2eHelper.quantifyNumber(a.modifier), mf_15_centered);
    ref = `${a.name} attribute boost`;
    const checkMark = pf2eHelper.evalCheckMark(a.isPartialBoost);
    mapper.textBox(ref, fileName, 0, attr_x[i] + 26, 191, 6, 6, checkMark, mf_12_centered);
});

// Defense
mapper.textBox('ac', fileName, 0, 42, 235, 24, 17, character.ac.modifier, mf_17_centered);
mapper.textBox('ac', fileName, 0, 37, 270, 17, 10, character.ac.attributeModifier, mf_10_centered);
mapper.textBox('ac', fileName, 0, 55, 270, 17, 10, character.ac.proficiencyModifier, mf_10_centered);
mapper.textBox('ac', fileName, 0, 73, 270, 17, 10, character.ac.itemModifier, mf_10_centered);

// Shield
if (character.hasShieldEquipped) {
    mapper.textBox('shield', fileName, 0, 95, 228, 15, 17, character.equippedShield.ac, mf_15);
    mapper.textBox('shield', fileName, 0, 117, 232, 21, 10, character.equippedShield.hardness, mf_10_centered);
    mapper.textBox('shield', fileName, 0, 142, 232, 17, 10, character.equippedShield.hpMax, mf_10_centered);
    mapper.textBox('shield', fileName, 0, 159, 232, 17, 10, character.equippedShield.bt, mf_10_centered);
    mapper.textBox('shield', fileName, 0, 180, 232, 16, 10, character.equippedShield.hpValue, mf_10_centered);
}
// Armor proficiencies
const armor_proficiency_x = [117, 141, 161, 182];
Object.values(character.defenseProficiencies)
    .filter((f) => !f.name.endsWith('-barding'))
    .forEach((d, i) => {
        ref = `${d.name} proficiency`;
        const x = armor_proficiency_x[i];
        mapper.textBox(ref, fileName, 0, x, 266, 6, 5, pf2eHelper.evalCheckMark(d.rank >= 1), mf_10_centered);
        mapper.textBox(ref, fileName, 0, x, 273, 6, 5, pf2eHelper.evalCheckMark(d.rank >= 2), mf_10_centered);
        mapper.textBox(ref, fileName, 0, x, 279, 6, 5, pf2eHelper.evalCheckMark(d.rank >= 3), mf_10_centered);
        mapper.textBox(ref, fileName, 0, x, 286, 6, 5, pf2eHelper.evalCheckMark(d.rank >= 4), mf_10_centered);
    });

// Saving Throws
const saves_x = [204, 266, 327];
Object.values(character.savingThrows).forEach((s, i) => {
    ref = `${s.name} save`;
    const x = saves_x[i];
    mapper.textBox(ref, fileName, 0, x, 225, 43, 18, pf2eHelper.quantifyNumber(s.modifier), mf_15_centered);
    mapper.textBox(ref, fileName, 0, x - 0, 250, 17, 10, s.attributeModifier, mf_10_centered);
    mapper.textBox(ref, fileName, 0, x + 18, 250, 17, 10, s.proficiencyModifier, mf_10_centered);
    mapper.textBox(ref, fileName, 0, x + 35, 250, 17, 10, s.itemModifier, mf_10_centered);

    ref = `${s.name} proficiency`;
    mapper.textBox(ref, fileName, 0, x + 46, 228, 5, 4, pf2eHelper.evalCheckMark(s.rank >= 1), mf_10_centered);
    mapper.textBox(ref, fileName, 0, x + 46, 233, 5, 4, pf2eHelper.evalCheckMark(s.rank >= 2), mf_10_centered);
    mapper.textBox(ref, fileName, 0, x + 46, 238, 5, 4, pf2eHelper.evalCheckMark(s.rank >= 3), mf_10_centered);
    mapper.textBox(ref, fileName, 0, x + 46, 243, 5, 4, pf2eHelper.evalCheckMark(s.rank >= 4), mf_10_centered);
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
mapper.textBox('defense notes', fileName, 0, 204, 274, 177, 27, ' '.repeat(28) + defense_notes.join(', '), {
    ...mf_8,
    ...{ valign: 'top', multiline: true },
});

// Hit points
mapper.textBox('hitpoints', fileName, 0, 387, 224, 38, 20, character.hp.max, mf_15_centered);
mapper.textBox('hitpoints', fileName, 0, 428, 221, 84, 36, character.hp.value, { ...mf_10, ...{ valign: 'top' } });
mapper.textBox('hitpoints', fileName, 0, 516, 221, 49, 10, character.hp.temp, mf_10);

const dyingValue = character.dying.value;
mapper.textBox('dying', fileName, 0, 539, 236, 4, 4, pf2eHelper.evalCheckMark(dyingValue >= 1), mf_10_centered);
mapper.textBox('dying', fileName, 0, 546, 236, 4, 4, pf2eHelper.evalCheckMark(dyingValue >= 2), mf_10_centered);
mapper.textBox('dying', fileName, 0, 553, 236, 4, 4, pf2eHelper.evalCheckMark(dyingValue >= 3), mf_10_centered);
mapper.textBox('dying', fileName, 0, 561, 236, 4, 4, pf2eHelper.evalCheckMark(dyingValue >= 4), mf_10_centered);

const wounded = `${character.wounded.value}/${character.wounded.max}`;
mapper.textBox('wounds', fileName, 0, 548, 245, 17, 10, wounded, mf_10_centered);
const resistance_immunities = character.immunities + ', ' + character.resistance;
mapper.textBox('resistance', fileName, 0, 388, 261, 177, 16, resistance_immunities, mf_10);
mapper.textBox('conditions', fileName, 0, 388, 282, 177, 16, character.conditions, mf_10);

/* Skills */
const skill_y = [314, 340, 366, 392, 470, 496, 522, 548, 574, 601, 627, 653, 679, 705, 731, 757];
const lore_skill_y = [419, 444];

// TODO: Find a better way to do this
const skillNamesTranslation = {
    acrobaties: 'acrobatics',
    arcanes: 'arcana',
    athletisme: 'athletics',
    artisanat: 'crafting',
    duperie: 'deception',
    diplomatie: 'diplomacy',
    intimidation: 'intimidation',
    medecine: 'medicine',
    nature: 'nature',
    occultisme: 'occultism',
    representation: 'performance',
    religion: 'religion',
    societe: 'society',
    discretion: 'stealth',
    survie: 'survival',
    larcin: 'thievery',
};
const orderedSkills = Object.keys(character.skills)
    .filter((f) => !Object.values(skillNamesTranslation).includes(f))
    .concat(Object.keys(skillNamesTranslation))
    .sort();
orderedSkills.forEach((skillName) => {
    let skill;
    if (Object.keys(skillNamesTranslation).includes(skillName)) {
        skill = character.skills[skillNamesTranslation[skillName]];
    } else {
        skill = character.skills[skillName];
    }
    let y;
    let pdfLabelStyle;
    ref = `${skill.label} skill`;
    // FIXME: fix the lore skills in french as they are way too long
    if (skill.isLore && lore_skill_y.length > 0) {
        y = lore_skill_y[0];
        lore_skill_y.shift();
        pdfLabelStyle = mf_6;
        // if (skill.label.length > 7) {
        //     pdfLabelStyle = mf_8;
        // }
        let skillName = skill.label.trim();
        if (skillName.toLowerCase().endsWith('lore')) {
            skillName = skillName.slice(0, -4).trim();
        } else if (skillName.toLowerCase().startsWith('lore')) {
            skillName = skillName.slice(4).trim();
        }
        mapper.textBox(ref, fileName, 0, 45, y - 5, 38, 18, skillName, pdfLabelStyle);
    } else if (!skill.isLore && skill_y.length > 0) {
        y = skill_y[0];
        skill_y.shift();
    }
    if (typeof y !== 'undefined') {
        ref = `${skill.label} skill`;
        mapper.textBox(ref, fileName, 0, 85, y, 32, 15, pf2eHelper.quantifyNumber(skill.modifier), mf_15_centered);
        mapper.textBox(ref, fileName, 0, 136, y, 18, 11, skill.attributeModifier, mf_12_centered);
        mapper.textBox(ref, fileName, 0, 155, y, 19, 11, skill.proficiencyModifier, mf_12_centered);
        mapper.textBox(ref, fileName, 0, 175, y, 19, 11, skill.itemModifier, mf_12_centered);
        if (typeof skill.armorModifier !== 'undefined') {
            mapper.textBox(ref, fileName, 0, 195, y, 19, 11, skill.armorModifier, mf_12_centered);
        }
        ref = `${skill.label} proficiency`;
        const isTrained = pf2eHelper.evalCheckMark(skill.rank >= 1);
        const isExpert = pf2eHelper.evalCheckMark(skill.rank >= 2);
        const isMaster = pf2eHelper.evalCheckMark(skill.rank >= 3);
        const isLegendary = pf2eHelper.evalCheckMark(skill.rank >= 4);
        mapper.textBox(ref, fileName, 0, 122, y - 1, 5, 5, isTrained, mf_8_centered);
        mapper.textBox(ref, fileName, 0, 122, y + 5, 5, 5, isExpert, mf_8_centered);
        mapper.textBox(ref, fileName, 0, 122, y + 10, 5, 5, isMaster, mf_8_centered);
        mapper.textBox(ref, fileName, 0, 122, y + 16, 5, 5, isLegendary, mf_8_centered);
    }
});

// Skill Notes
const skillNotes = [];

const assurance = actor.items
    .filter((i) => i.slug === 'assurance')
    .map((i) => i.rules.filter((f) => f.prompt === 'PF2E.SpecificRule.Prompt.Skill').map((m) => m.selection))
    .flat(1)
    .map((i) => pf2eHelper.capitalize(i));
if (assurance.length > 0) {
    skillNotes.push('Assurance: ' + assurance.join(', '));
}
mapper.textBox('skill notes', fileName, 0, 220, 329, 68, 446, skillNotes.join('\n'), {
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
mapper.textBox('languages', fileName, 0, 296, 315, 84, 72, languages, {
    ...mf_8,
    ...{ valign: 'top', multiline: true },
});

// Perception
const perception = pf2eHelper.quantifyNumber(character.perception.modifier);
mapper.textBox('perception', fileName, 0, 388, 323, 19, 10, perception, mf_12_centered);
mapper.textBox('perception', fileName, 0, 420, 323, 17, 10, character.perception.attributeModifier, mf_10_centered);
mapper.textBox('perception', fileName, 0, 438, 323, 17, 10, character.perception.proficiencyModifier, mf_10_centered);
mapper.textBox('perception', fileName, 0, 456, 323, 17, 10, character.perception.itemModifier, mf_10_centered);
const pRank = character.perception.rank;
mapper.textBox('perception', fileName, 0, 408, 318, 5, 5, pf2eHelper.evalCheckMark(pRank >= 1), mf_8_centered);
mapper.textBox('perception', fileName, 0, 408, 324, 5, 5, pf2eHelper.evalCheckMark(pRank >= 2), mf_8_centered);
mapper.textBox('perception', fileName, 0, 408, 329, 5, 5, pf2eHelper.evalCheckMark(pRank >= 3), mf_8_centered);
mapper.textBox('perception', fileName, 0, 408, 334, 5, 5, pf2eHelper.evalCheckMark(pRank >= 4), mf_8_centered);

mapper.textBox('senses notes', fileName, 0, 388, 347, 85, 41, character.senses, mf_8_multiline);

// speed
const baseMovement = ((character.baseMovement.value / 5) * 1.5).toFixed(1);
mapper.textBox('speed', fileName, 0, 481, 320, 48, 14, baseMovement, mf_12_centered);

const specialMovement = character.movement
    .filter((f) => !f.isPrimary)
    .map((m) => m.displayName)
    .join(', ');
mapper.textBox('special movement', fileName, 0, 481, 347, 84, 41, specialMovement, {
    ...mf_8,
    ...{ valign: 'top', multiline: true },
});

// Strikes
const melee_strike_y = [424, 473, 521];
const ranged_strike_y = [583, 632];
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

        mapper.textBox(ref, fileName, 0, 296, y, 84, 16, strike.label, pdfNameStyle);
        mapper.textBox(ref, fileName, 0, 388, y, 26, 16, modifier, mf_12_centered);
        mapper.textBox(ref, fileName, 0, 420, y + 3, 17, 10, strike.attributeModifier, mf_10_centered);
        if (strike.isMelee && strike.attributeName !== 'str') {
            mapper.textBox(ref, fileName, 0, 424, y + 14, 10, 10, attributeName, mf_8);
        }
        mapper.textBox(ref, fileName, 0, 438, y + 3, 17, 10, strike.proficiencyModifier, mf_10_centered);
        mapper.textBox(ref, fileName, 0, 456, y + 3, 17, 10, strike.itemModifier, mf_10_centered);
        mapper.textBox(ref, fileName, 0, 481, y + 1, 74, 14, strike.damageFormula, {
            ...mf_10,
            ...{ valueParser: dmgParser },
        });

        mapper.textBox(ref, fileName, 0, 340, y + 23, 225, 10, traitsAndNotes, pdfTraitsStyle);
        mapper.textBox(
            ref,
            fileName,
            0,
            557,
            y + 2,
            5,
            5,
            pf2eHelper.evalCheckMark(hasBludgeoningDamage),
            mf_8_centered
        );
        mapper.textBox(ref, fileName, 0, 557, y + 8, 5, 5, pf2eHelper.evalCheckMark(hasPiercingDamage), mf_8_centered);
        mapper.textBox(ref, fileName, 0, 557, y + 15, 5, 5, pf2eHelper.evalCheckMark(hasSlashingDamage), mf_8_centered);
    }
});

// Weapon proficiencies
const wp_x = [300, 322, 345, 365];
['unarmed', 'simple', 'martial', 'advanced'].forEach((a) => {
    let x = wp_x[0];
    wp_x.shift();
    const wp = character.weaponProficiencies[a].rank;
    mapper.textBox('weapon proficiencies', fileName, 0, x, 687, 6, 6, pf2eHelper.evalCheckMark(wp >= 1), mf_8_centered);
    mapper.textBox('weapon proficiencies', fileName, 0, x, 694, 6, 6, pf2eHelper.evalCheckMark(wp >= 2), mf_8_centered);
    mapper.textBox('weapon proficiencies', fileName, 0, x, 700, 6, 6, pf2eHelper.evalCheckMark(wp >= 3), mf_8_centered);
    mapper.textBox('weapon proficiencies', fileName, 0, x, 707, 6, 6, pf2eHelper.evalCheckMark(wp >= 4), mf_8_centered);
});
// TODO: 'Other' weapon proficiencies
// TODO: Weapon proficiency notes
// TODO: Critical Specializations

// Class DC
mapper.textBox('class dc', fileName, 0, 305, 727, 68, 25, character.classDC.modifier, mf_15_centered_middle);
mapper.textBox('class dc', fileName, 0, 322, 757, 17, 10, character.classDC.attributeModifier, mf_10_centered);
mapper.textBox('class dc', fileName, 0, 340, 757, 16, 10, character.classDC.proficiencyModifier, mf_10_centered);
mapper.textBox('class dc', fileName, 0, 357, 757, 17, 10, character.classDC.itemModifier, mf_10_centered);

/* PAGE 2 */
// Ancestry and General Feats
// Ancestry and heritage Abilities
ref = 'Ancestry and heritage Abilities';
const ancestryAndHeritageAbilities = character.ancestryAndHeritageAbilities.map((m) => m.displayName).sort();
mapper.textBox(ref, fileName, 1, 51, 78, 159, 26, ancestryAndHeritageAbilities.join(', '), mf_8_multiline);

// Ancestry Feats
const ancestry_y = [110, 292, 415, 539, 662];
for (let level = 1; level <= 20; level = level + 4) {
    const ancestryFeats = character.ancestryFeats.filter((f) => f.level === level).map((m) => m.name);
    const skillFeats = character.skillFeats.filter((f) => f.level === level).map((m) => m.name);
    let feats = ancestryFeats.sort().join(', ');
    if (skillFeats.length > 0) {
        feats = feats + '; Skill Feat: ' + skillFeats.sort().join(', ');
    }
    if (ancestry_y.length > 0) {
        const y = ancestry_y[0];
        ancestry_y.shift();
        mapper.textBox('Ancestry feats', fileName, 1, 51, y, 159, 21, feats, mf_8_multiline);
    }
}

// Background Skill Feats
ref = 'background skill feats';
const backgroundSkillFeats = character.backgroundSkillFeats.map((m) => m.name);
mapper.textBox(ref, fileName, 1, 51, 148, 159, 40, backgroundSkillFeats.join(', '), mf_8_multiline);

// Skill feats
const skill_feats_y = [201, 262, 324, 386, 447, 509, 571, 633, 695, 757];
for (let level = 2; level <= 20; level = level + 2) {
    const feats = character.skillFeats.filter((f) => f.level === level).map((m) => m.name);
    if (skill_feats_y.length > 0) {
        const y = skill_feats_y[0];
        skill_feats_y.shift();
        mapper.textBox('skill feats', fileName, 1, 51, y, 159, 19, feats.sort().join(', '), mf_8_multiline);
    }
}

// General feats
const general_feats_y = [232, 355, 479, 602, 725];
for (let level = 3; level <= 20; level = level + 4) {
    const generalFeats = character.generalFeats.filter((f) => f.level === level).map((m) => m.name);
    const skillFeats = character.skillFeats.filter((f) => f.level === level).map((m) => m.name);
    let feats = generalFeats.sort().join(', ');
    if (skillFeats.length > 0) {
        feats = feats + '; Skill Feat: ' + skillFeats.sort().join(', ');
    }
    if (general_feats_y.length > 0) {
        const y = general_feats_y[0];
        general_feats_y.shift();
        mapper.textBox('general feats', fileName, 1, 51, y, 159, 19, feats, mf_8_multiline);
    }
}

// Attribute boosts
const boost_y = [292, 446, 601, 755];
for (let level = 5; level <= 20; level = level + 5) {
    const boosts = pf2eHelper.formatAttributeBoosts(
        character.attributeBoosts.filter((f) => f.level === level).map((m) => m.boost)
    );
    if (boost_y.length > 0) {
        const y = boost_y[0];
        boost_y.shift();
        mapper.textBox('attribute boosts', fileName, 1, 183, y, 27, 21, boosts, mf_6_multiline);
    }
}

// Class Feats and Features
// Class Features
const class_features_y = [77, 231, 293, 354, 416, 478, 540, 602, 663, 725];
let firstFeature = true;
for (let level = 1; level <= 20; level = level + 2) {
    const features = character.classFeatures.filter((f) => f.level === level).map((m) => m.name);
    ref = 'class features';
    if (class_features_y.length > 0) {
        const y = class_features_y[0];
        class_features_y.shift();
        let pdfHeight = 19;
        if (firstFeature) {
            firstFeature = false;
            pdfHeight = 111;
        }
        mapper.textBox(ref, fileName, 1, 215, y, 176, pdfHeight, features.sort().join(', '), mf_8_multiline);
    }
}

// Bonus Feats
if (character.bonusFeats.length > 0) {
    const bonusFeats = 'Bonus Feats:\n' + character.bonusFeats.map((m) => m.name).join(', ');
    mapper.textBox('Bonus Feats', fileName, 1, 215, 133, 176, 55, bonusFeats, mf_8_multiline);
}

// Class Feats
const class_feats_y = [200, 261, 323, 365, 386, 447, 509, 571, 633, 695];
for (let level = 2; level <= 20; level = level + 2) {
    const feats = character.classFeats.filter((f) => f.level === level).map((m) => m.name);
    if (class_feats_y.length > 0) {
        const y = class_feats_y[0];
        class_feats_y.shift();
        mapper.textBox('class feats', fileName, 1, 215, y, 176, 19, feats.sort().join(', '), mf_8_multiline);
    }
}

// Inventory
let y = 0;
// Held items
// item names shouldn't be longer than 50/45 characters
y = 76;
ref = 'held items';
character.flatItems(character.heldItems).forEach((item) => {
    if (y <= 215) {
        let pdfStyle = mf_8;
        if (item.isMagical) {
            pdfStyle = { ...pdfStyle, ...{ suffix: ' ‡' } };
        }
        let xOffset = item.containerLevel * 10;
        mapper.textBox(ref, fileName, 1, 401 + xOffset, y, 152 - xOffset, 10, item.displayName, pdfStyle);
        mapper.textBox(ref, fileName, 1, 554, y, 22, 10, item.bulk, mf_8_centered);
        y = y + 10;
    }
});

// Consumables
y = 227;
ref = 'consumables';
character.flatItems(character.consumables).forEach((item) => {
    if (y <= 373) {
        let pdfStyle = mf_8;
        if (item.isMagical) {
            pdfStyle = { ...pdfStyle, ...{ suffix: ' ‡' } };
        }
        let xOffset = item.containerLevel * 10;
        mapper.textBox(ref, fileName, 1, 401 + xOffset, y, 152 - xOffset, 10, item.displayName, pdfStyle);
        mapper.textBox(ref, fileName, 1, 554, y, 22, 10, item.bulk, mf_8_centered);
        y = y + 10;
    }
});

// Worn items
y = 385;
ref = 'worn items';
character.flatItems(character.wornItems).forEach((item) => {
    if (y <= 595) {
        let pdfStyle = mf_8;
        if (item.isMagical) {
            pdfStyle = { ...pdfStyle, ...{ suffix: ' ‡' } };
        }
        let xOffset = item.containerLevel * 10;
        mapper.textBox(ref, fileName, 1, 401 + xOffset, y, 117 - xOffset, 10, item.displayName, pdfStyle);
        mapper.textBox(ref, fileName, 1, 519, y, 34, 10, pf2eHelper.evalCheckMark(item.isInvested), mf_8_centered);
        mapper.textBox(ref, fileName, 1, 554, y, 22, 10, item.bulk, mf_8_centered);
        y = y + 10;
    }
});

// Bulk
mapper.textBox('bulk', fileName, 1, 407, 626, 26, 22, character.totalBulk, mf_15_centered);

// Wealth
mapper.textBox('wealth', fileName, 1, 410, 679, 28, 20, character.coins.cp || 0, mf_15_centered);
mapper.textBox('wealth', fileName, 1, 452, 679, 28, 20, character.coins.sp || 0, mf_15_centered);
mapper.textBox('wealth', fileName, 1, 495, 679, 28, 20, character.coins.gp || 0, mf_15_centered);
mapper.textBox('wealth', fileName, 1, 679, 679, 28, 20, character.coins.pp || 0, mf_15_centered);

// Gems and Artwork
ref = 'gems and artwork';
y = 725;
character.flatItems(character.gemsAndArtwork).forEach((item) => {
    if (y <= 775) {
        let pdfStyle = mf_8;
        if (item.isMagical) {
            pdfStyle = { ...pdfStyle, ...{ suffix: ' ‡' } };
        }
        let xOffset = item.containerLevel * 10;
        mapper.textBox(ref, fileName, 1, 401 + xOffset, y, 121 - xOffset, 10, item.displayName, pdfStyle);
        mapper.textBox(ref, fileName, 1, 523, y, 28, 10, item.price.join(' '), mf_8_centered);
        mapper.textBox(ref, fileName, 1, 552, y, 24, 10, item.bulk, mf_8_centered);
        y = y + 10;
    }
});

/* Page 3 */
// Origin and Appearance
mapper.textBox('ethnicity', fileName, 2, 205, 74, 60, 16, character.details.ethnicity, mf_10);
mapper.textBox('nationality', fileName, 2, 267, 74, 61, 16, character.details.nationality, mf_10);
mapper.textBox('birthplace', fileName, 2, 332, 74, 60, 16, character.details.biography.birthplace, mf_10);
mapper.textBox('age', fileName, 2, 394, 74, 24, 16, character.details.age, mf_10);
mapper.textBox('gender & pronouns', fileName, 2, 422, 74, 68, 16, character.details.gender, mf_10);
mapper.textBox('height', fileName, 2, 492, 74, 33, 16, character.details.height, mf_10);
mapper.textBox('weight', fileName, 2, 529, 74, 35, 16, character.details.weight, mf_10);

mapper.textBox('appearance', fileName, 2, 205, 79, 359, 15, character.details.biography.appearance, mf_10);

// Personality
mapper.textBox('attitude', fileName, 2, 205, 147, 177, 16, character.details.biography.attitude, mf_10);
mapper.textBox('deity or philosofy', fileName, 2, 387, 147, 177, 16, character.details.deity, mf_10);
const actorEdicts = character.details.biography.edicts;
mapper.textBox('edicts', fileName, 2, 205, 169, 177, 66, ' '.repeat(10) + actorEdicts, mf_10_multiline);

const actorAnathema = character.details.biography.anathema;
mapper.textBox('anathema', fileName, 2, 387, 169, 177, 66, ' '.repeat(15) + actorAnathema, mf_10_multiline);

mapper.textBox('likes', fileName, 2, 205, 248, 359, 16, character.details.biography.likes, mf_10);
const actorDislikes = character.details.biography.dislikes;
mapper.textBox('dislikes', fileName, 2, 205, 278, 359, 16, actorDislikes, mf_10);
const actorCatchPhrases = character.details.biography.catchphrases;
mapper.textBox('catchphrases', fileName, 2, 205, 309, 359, 16, actorCatchPhrases, mf_10);

// /* Campaign notes Section */
const actorNotes = character.details.biography.campaignNotes;
mapper.textBox('campaignNotes', fileName, 2, 21, 350, 266, 94, actorNotes, mf_8_multiline);
// allies and enemies are not really good at
const actorAllies = character.details.biography.allies;
mapper.textBox('allies', fileName, 2, 298, 348, 266, 23, actorAllies, mf_6_multiline);
const actorEnemies = character.details.biography?.enemies;
mapper.textBox('enemies', fileName, 2, 298, 385, 266, 23, actorEnemies, mf_6_multiline);
const actorOrganizations = character.details.biography.organizations;
mapper.textBox('organizations', fileName, 2, 298, 422, 266, 23, actorOrganizations, mf_8_multiline);

// Actions and activities
const actorActionsActivities_y = [470, 549, 628, 707];
const actorFreeActionsActivities_y = [470, 549, 628, 707];
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
        mapper.textBox(ref, fileName, 2, 21, y, 93, 21, a.name, mf_8_multiline);
        mapper.textBox(ref, fileName, 2, 114, y, 37, 21, a.glyph, action_10_centered_top);
        mapper.textBox(ref, fileName, 2, 151, y, 121, 21, traits, mf_8_multiline);
        mapper.textBox(ref, fileName, 2, 272, y, 16, 21, reference, mf_8_multiline);
        mapper.textBox(ref, fileName, 2, 21, y + 29, 267, 39, description, mf_6_multiline);
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
        mapper.textBox(ref, fileName, 2, 298, y, 94, 20, a.name, mf_8_multiline);
        mapper.textBox(ref, fileName, 2, 392, y - 5, 8, 8, pf2eHelper.evalCheckMark(a.type === 'free'), mf_8_centered);
        const isReaction = a.type === 'reaction';
        mapper.textBox(ref, fileName, 2, 392, y + 4, 8, 8, pf2eHelper.evalCheckMark(isReaction), mf_8_centered);
        mapper.textBox(ref, fileName, 2, 427, y, 122, 30, traits, mf_8_multiline);
        mapper.textBox(ref, fileName, 2, 549, y, 16, 20, reference, mf_8_multiline);
        mapper.textBox(ref, fileName, 2, 298, y + 27, 267, 16, trigger, mf_6_multiline);
        mapper.textBox(ref, fileName, 2, 298, y + 47, 267, 16, effect, mf_6_multiline);
    }
});

/*  Page 4 */
// Magical Tradition

const hasArcaneTradition = character.hasArcaneTradition;
const hasOccultTradition = character.hasOccultTradition;
const hasPrimalTradition = character.hasPrimalTradition;
const hasDivineTradition = character.hasDivineTradition;
ref = 'magical tradition';
mapper.textBox(ref, fileName, 3, 62, 67, 13, 13, pf2eHelper.evalCheckMark(hasArcaneTradition), mf_10_centered);
mapper.textBox(ref, fileName, 3, 75, 67, 13, 13, pf2eHelper.evalCheckMark(hasOccultTradition), mf_10_centered);
mapper.textBox(ref, fileName, 3, 62, 80, 13, 13, pf2eHelper.evalCheckMark(hasPrimalTradition), mf_10_centered_top);
mapper.textBox(ref, fileName, 3, 75, 80, 13, 13, pf2eHelper.evalCheckMark(hasDivineTradition), mf_10_centered_top);

const isPreparedCaster = character.isPreparedCaster;
const isSpontaneousCaster = character.isSpontaneousCaster;
ref = 'magic preparation';
mapper.textBox(ref, fileName, 3, 128, 70, 8, 8, pf2eHelper.evalCheckMark(isPreparedCaster), mf_8_centered);
mapper.textBox(ref, fileName, 3, 128, 81, 8, 8, pf2eHelper.evalCheckMark(isSpontaneousCaster), mf_8_centered);

const spellProficiency = character.highestSpellProficiency;

// Spell Attack
if (typeof spellProficiency !== 'undefined') {
    ref = 'spell attack';
    mapper.textBox(ref, fileName, 3, 29, 120, 25, 21, spellProficiency.attack.modifier, mf_15_centered);

    mapper.textBox(ref, fileName, 3, 72, 125, 16, 10, spellProficiency.attack.attributeModifier, mf_12_centered);
    mapper.textBox(ref, fileName, 3, 89, 125, 17, 10, spellProficiency.attack.proficiencyModifier, mf_12_centered);
    const spellAttackRank = spellProficiency.attack.rank;
    mapper.textBox(ref, fileName, 3, 58, 124, 6, 6, pf2eHelper.evalCheckMark(spellAttackRank >= 1), mf_8_centered);
    mapper.textBox(ref, fileName, 3, 58, 130, 6, 6, pf2eHelper.evalCheckMark(spellAttackRank >= 2), mf_8_centered);
    mapper.textBox(ref, fileName, 3, 58, 136, 6, 6, pf2eHelper.evalCheckMark(spellAttackRank >= 3), mf_8_centered);
    mapper.textBox(ref, fileName, 3, 58, 142, 6, 6, pf2eHelper.evalCheckMark(spellAttackRank >= 4), mf_8_centered);

    ref = 'spell attack';
    mapper.textBox(ref, fileName, 3, 117, 120, 17, 21, spellProficiency.spell.modifier, mf_15_centered);

    mapper.textBox(ref, fileName, 3, 172, 125, 17, 10, spellProficiency.spell.attributeModifier, mf_12_centered);
    mapper.textBox(ref, fileName, 3, 190, 125, 17, 10, spellProficiency.spell.proficiencyModifier, mf_12_centered);

    const spellSaveRank = spellProficiency.spell.rank;
    mapper.textBox(ref, fileName, 3, 141, 124, 5, 5, pf2eHelper.evalCheckMark(spellSaveRank >= 1), mf_8_centered);
    mapper.textBox(ref, fileName, 3, 141, 130, 5, 5, pf2eHelper.evalCheckMark(spellSaveRank >= 2), mf_8_centered);
    mapper.textBox(ref, fileName, 3, 141, 136, 5, 5, pf2eHelper.evalCheckMark(spellSaveRank >= 3), mf_8_centered);
    mapper.textBox(ref, fileName, 3, 141, 142, 5, 5, pf2eHelper.evalCheckMark(spellSaveRank >= 4), mf_8_centered);
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
mapper.textBox('cantrips per day', fileName, 3, 90, 168, 26, 15, cantripSlots, mf_12_centered);

// cantrip rank
if (cantripSlots !== '') {
    mapper.textBox('cantrip rank', fileName, 3, 183, 168, 25, 15, character.cantripRank, mf_12_centered);
}
// Cantrips
let cantripsY = 199;
const cantripsMaxY = 471;
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
                mapper.textBox(ref, fileName, 3, 31, y, 175, 12, cantrip.type, mf_10);
                sceType = cantrip.type;
                y = cantripsY;
                cantripsY = cantripsY + 10;
                endingWhiteSpace = true;
            }
            mapper.textBox(ref, fileName, 3, 31, y, 132, 10, cantrip.name, mf_8);
            mapper.textBox(ref, fileName, 3, 159, y, 32, 10, cantrip.glyph, action_8_centered);
            // mapper.textBox(ref, fileName, 3, 164, y, 25, 10, cantrip.glyph, action_8_centered);
            mapper.textBox(ref, fileName, 3, 190, y, 17, 10, 'O'.repeat(cantrip.prepared), mf_8_centered);
        }
    });

// Focus points
ref = 'focus points';
const focusPointsMax = character.focusPoints.max;
mapper.textBox(ref, fileName, 3, 82, 488, 11, 11, pf2eHelper.evalCheckMark(focusPointsMax >= 1), mf_10_centered);
mapper.textBox(ref, fileName, 3, 94, 488, 11, 11, pf2eHelper.evalCheckMark(focusPointsMax >= 2), mf_10_centered);
mapper.textBox(ref, fileName, 3, 107, 488, 11, 11, pf2eHelper.evalCheckMark(focusPointsMax >= 3), mf_10_centered);

// focus rank
mapper.textBox('focus spell rank', fileName, 3, 183, 488, 25, 15, character.focusSpellRank, mf_12_centered);

// Focus spells
let focusY = 531;
const focusMaxY = 664;
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
                mapper.textBox(ref, fileName, 3, 31, y, 175, 12, spell.type, mf_10);
                sceType = spell.type;
                y = focusY;
                focusY = focusY + 10;
                endingWhiteSpace = true;
            }
            mapper.textBox(ref, fileName, 3, 31, y, 144, 10, spell.name, mf_8);
            mapper.textBox(ref, fileName, 3, 177, y, 32, 10, spell.glyph, action_8_centered);
            // mapper.textBox(ref, fileName, 3, 179, y, 28, 10, spell.glyph, action_8_centered);
        }
    });

// Innate spells
let innateSpellsY = 686;
const innateSpellsMaxY = 776;
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
                mapper.textBox(ref, fileName, 3, 30, y, 175, 12, spell.type, mf_10);
                sceType = spell.type;
                y = innateSpellsY;
                innateSpellsY = innateSpellsY + 10;
                endingWhiteSpace = true;
            }
            mapper.textBox(ref, fileName, 3, 31, y, 116, 10, spell.name, mf_8);
            mapper.textBox(ref, fileName, 3, 153, y, 34, 10, spell.glyph, action_8_centered);
            // TODO: frequency of innate spells
            // mapper.textBox(ref, fileName, 3, 186, y, 20, 10, spell.frequency, action_8_centered);
        }
    });

// Spell Slots
// Spells per day
const spellsPerDayX = [274, 304, 335, 366, 397, 428, 459, 490, 521, 552];
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
        mapper.textBox('focus spell rank', fileName, 3, x, 66, 25, 15, rankSlots.join('/'), pdfStyle);
    }
}

// Spells
let spellX = 217;
const spellMinY = 141;
let spellY = spellMinY;
const spellMaxY = 697;
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
                mapper.textBox(ref, fileName, 3, x, y, 175, 12, spell.type, mf_10);
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
            mapper.textBox(ref, fileName, 3, x + 132, y, 23, 10, spell.rank, mf_8_centered);
            mapper.textBox(ref, fileName, 3, x + 156, y, 19, 10, 'O'.repeat(spell.prepared), mf_8_centered);
            if (spellY >= spellMaxY && spellX === 217) {
                spellY = spellMinY;
                spellX = 401;
            }
        }
    });

// Rituals
const ritualX = 217;
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
        mapper.textBox(ref, fileName, 3, x, y, 131, 10, ritual.name, mf_8);
        mapper.textBox(ref, fileName, 3, x + 132, y, 23, 10, ritual.rank, mf_8_centered);
        mapper.textBox(ref, fileName, 3, x + 156, y, 19, 10, ritual.cost, mf_8);
    }
    if (ritualY >= ritualMaxY && ritualX === 217) {
        ritualY = ritualMinY;
        ritualX = 401;
    }
});

export { mapper };
