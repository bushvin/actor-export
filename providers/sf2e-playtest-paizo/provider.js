import { pdfProvider } from '../../scripts/lib/providers/PDFProvider.js';
// import { sf2eHelper } from '../../scripts/lib/helpers/sf2eHelper.js';
import { sf2eHelper } from '../../scripts/lib/helpers/SF2eHelper.js';
import { semVer } from '../../scripts/lib/SemVer.js';

// Make sure the Starfinder module is activated
if (
    !game.modules
        .filter((f) => f.active)
        .map((m) => m.id)
        .includes('starfinder-field-test-for-pf2e')
) {
    ui.notifications.error(
        'Starfinder 2nd Edition Playtest module could not be detected. Please make sure it is installed before using this Character Sheet!<br /><a href="https://foundryvtt.com/packages/starfinder-field-test-for-pf2e" target="_blank">Starfinder 2nd Edition Playtest module</a>',
        { permanent: true }
    );
    throw new Error(
        'Starfinder 2nd Edition Playtest module could not be detected. Please make sure it is installed before using this Character Sheet!'
    );
}
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

const fileName = 'sf2e-playtest-paizo.pdf';

// an abstraction of actor
const character = sf2eHelper.getActorObject(game, actor);
mapper.pdfTitle = character.name;

mapper.image(fileName, 2, 29, 39, actor.img, 178, 265);

/* PAGE 1 */
mapper.textBox('actor name', fileName, 0, 217, 30, 179, 23, character.name, mf_17);
mapper.textBox('player name', fileName, 0, 260, 60, 137, 10, character.ownerName, mf_10);
mapper.textBox('ancestry', fileName, 0, 29, 85, 179, 14, character.ancestry.name, mf_12);
mapper.textBox('heritage', fileName, 0, 29, 113, 147, 13, character.heritage.name, mf_12);
mapper.textBox('size', fileName, 0, 178, 113, 31, 16, character.size, mf_12);

// Background
mapper.textBox('background', fileName, 0, 217, 85, 179, 14, character.background.name, mf_12);
/* TODO: background notes */

// Class
mapper.textBox('class', fileName, 0, 405, 85, 180, 14, character.class.name, mf_12);
mapper.textBox('class notes', fileName, 0, 405, 113, 180, 13, character.class.subClass, mf_12);

// level
mapper.textBox('level', fileName, 0, 412, 40, 19, 19, character.level, mf_15_centered);
mapper.textBox('xp', fileName, 0, 446, 42, 42, 15, character.xp, mf_12);

// Hero points
const heroPoints = character.heroPoints;
mapper.textBox('heropoint', fileName, 0, 510, 29, 9, 16, sf2eHelper.evalCheckMark(heroPoints >= 1), mf_17_centered);
mapper.textBox('heropoint', fileName, 0, 533, 29, 9, 16, sf2eHelper.evalCheckMark(heroPoints >= 2), mf_17_centered);
mapper.textBox('heropoint', fileName, 0, 556, 29, 9, 16, sf2eHelper.evalCheckMark(heroPoints >= 3), mf_17_centered);

// Attributes
const attr_x = [29, 123, 217, 311, 405, 499];
Object.values(character.attributes).forEach((a, i) => {
    ref = `${a.name} attribute`;
    mapper.textBox(ref, fileName, 0, attr_x[i], 143, 21, 19, sf2eHelper.quantifyNumber(a.modifier), mf_15_centered);
    ref = `${a.name} attribute boost`;
    const checkMark = sf2eHelper.evalCheckMark(a.isPartialBoost);
    mapper.textBox(ref, fileName, 0, attr_x[i] + 27, 159, 5, 5, checkMark, mf_12_centered);
});

// Defense
mapper.textBox('ac', fileName, 0, 51, 202, 25, 17, character.ac.modifier, mf_17_centered);
mapper.textBox('ac', fileName, 0, 46, 240, 17, 10, character.ac.attributeModifier, mf_10_centered);
mapper.textBox('ac', fileName, 0, 64, 240, 17, 10, character.ac.proficiencyModifier, mf_10_centered);
mapper.textBox('ac', fileName, 0, 82, 240, 18, 10, character.ac.itemModifier, mf_10_centered);

// Shield
if (character.hasShieldEquipped) {
    mapper.textBox('shield', fileName, 0, 104, 197, 15, 17, character.equippedShield.ac, mf_15);
    mapper.textBox('shield', fileName, 0, 127, 201, 21, 10, character.equippedShield.hardness, mf_10_centered);
    mapper.textBox('shield', fileName, 0, 153, 201, 17, 10, character.equippedShield.hpMax, mf_10_centered);
    mapper.textBox('shield', fileName, 0, 170, 201, 18, 10, character.equippedShield.bt, mf_10_centered);
    mapper.textBox('shield', fileName, 0, 192, 201, 16, 10, character.equippedShield.hpValue, mf_10_centered);
}
// Armor proficiencies
const armor_proficiency_x = [127, 152, 172, 194];
Object.values(character.defenseProficiencies)
    .filter((f) => !f.name.endsWith('-barding'))
    .forEach((d, i) => {
        ref = `${d.name} proficiency`;
        const x = armor_proficiency_x[i];
        mapper.textBox(ref, fileName, 0, x, 235, 7, 5, sf2eHelper.evalCheckMark(d.rank >= 1), mf_10_centered);
        mapper.textBox(ref, fileName, 0, x, 242, 7, 5, sf2eHelper.evalCheckMark(d.rank >= 2), mf_10_centered);
        mapper.textBox(ref, fileName, 0, x, 249, 7, 5, sf2eHelper.evalCheckMark(d.rank >= 3), mf_10_centered);
        mapper.textBox(ref, fileName, 0, x, 255, 7, 5, sf2eHelper.evalCheckMark(d.rank >= 4), mf_10_centered);
    });

// Saving Throws
const saves_x = [217, 279, 341];
Object.values(character.savingThrows).forEach((s, i) => {
    ref = `${s.name} save`;
    const x = saves_x[i];
    mapper.textBox(ref, fileName, 0, x, 196, 38, 18, sf2eHelper.quantifyNumber(s.modifier), mf_15_centered);
    mapper.textBox(ref, fileName, 0, x - 1, 219, 17, 10, s.attributeModifier, mf_10_centered);
    mapper.textBox(ref, fileName, 0, x + 17, 219, 17, 10, s.proficiencyModifier, mf_10_centered);
    mapper.textBox(ref, fileName, 0, x + 35, 219, 17, 10, s.itemModifier, mf_10_centered);

    ref = `${s.name} proficiency`;
    mapper.textBox(ref, fileName, 0, x + 47, 197, 5, 4, sf2eHelper.evalCheckMark(s.rank >= 1), mf_10_centered);
    mapper.textBox(ref, fileName, 0, x + 47, 202, 5, 4, sf2eHelper.evalCheckMark(s.rank >= 2), mf_10_centered);
    mapper.textBox(ref, fileName, 0, x + 47, 207, 5, 4, sf2eHelper.evalCheckMark(s.rank >= 3), mf_10_centered);
    mapper.textBox(ref, fileName, 0, x + 47, 212, 5, 4, sf2eHelper.evalCheckMark(s.rank >= 4), mf_10_centered);
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
    defense_notes.push(`${b.label} ${sf2eHelper.quantifyNumber(b.modifier)} (saves)`);
});
fortitude_bonus.forEach((b) => {
    defense_notes.push(`${b.label} ${sf2eHelper.quantifyNumber(b.modifier)} (fort)`);
});
reflex_bonus.forEach((b) => {
    defense_notes.push(`${b.label} ${sf2eHelper.quantifyNumber(b.modifier)} (ref)`);
});
will_bonus.forEach((b) => {
    defense_notes.push(`${b.label} ${sf2eHelper.quantifyNumber(b.modifier)} (will)`);
});
mapper.textBox('defense notes', fileName, 0, 215, 242, 180, 25, ' '.repeat(28) + defense_notes.join(', '), {
    ...mf_8,
    ...{ valign: 'top', multiline: true },
});

// Hit points
mapper.textBox('hitpoints', fileName, 0, 402, 191, 40, 20, character.hp.max, mf_15_centered);
mapper.textBox('hitpoints', fileName, 0, 442, 189, 87, 34, character.hp.value, { ...mf_10, ...{ valign: 'top' } });
mapper.textBox('hitpoints', fileName, 0, 535, 189, 48, 10, character.hp.temp, mf_10);

const dyingValue = character.dying.value;
mapper.textBox('dying', fileName, 0, 555, 204, 4, 4, sf2eHelper.evalCheckMark(dyingValue >= 1), mf_10_centered);
mapper.textBox('dying', fileName, 0, 564, 204, 4, 4, sf2eHelper.evalCheckMark(dyingValue >= 2), mf_10_centered);
mapper.textBox('dying', fileName, 0, 572, 204, 4, 4, sf2eHelper.evalCheckMark(dyingValue >= 3), mf_10_centered);
mapper.textBox('dying', fileName, 0, 580, 204, 4, 4, sf2eHelper.evalCheckMark(dyingValue >= 4), mf_10_centered);

const wounded = `${character.wounded.value}/${character.wounded.max}`;
mapper.textBox('wounds', fileName, 0, 567, 214, 17, 11, wounded, mf_10_centered);
const resistance_immunities = character.immunities + ', ' + character.resistance;
mapper.textBox('resistance', fileName, 0, 405, 229, 179, 16, resistance_immunities, mf_10);
mapper.textBox('conditions', fileName, 0, 405, 251, 179, 16, character.conditions, mf_10);

/* Skills */
const skill_y = [282, 306, 329, 353, 377, 400, 424, 448, 520, 543, 567, 592, 614, 638, 662, 686, 710, 735];
const lore_skill_y = [474, 498];
Object.values(character.skills).forEach((skill) => {
    let y;
    let pdfLabelStyle;
    ref = `${skill.label} skill`;
    if (skill.isLore && lore_skill_y.length > 0) {
        y = lore_skill_y[0];
        lore_skill_y.shift();
        pdfLabelStyle = { ...mf_12, ...{ halign: 'right' } };
        if (skill.label.length > 14) {
            pdfLabelStyle = { ...mf_10, ...{ halign: 'right' } };
        }
        let skillName = skill.label.trim();
        if (skillName.toLowerCase().endsWith('lore')) {
            skillName = skillName.slice(0, -4).trim();
        } else if (skillName.toLowerCase().startsWith('lore')) {
            skillName = skillName.slice(4).trim();
        }
        mapper.textBox(ref, fileName, 0, 0, y - 3, 68, 18, skillName, pdfLabelStyle);
    } else if (!skill.isLore && skill_y.length > 0) {
        y = skill_y[0];
        skill_y.shift();
    }
    if (typeof y !== 'undefined') {
        ref = `${skill.label} skill`;
        mapper.textBox(ref, fileName, 0, 95, y, 32, 18, sf2eHelper.quantifyNumber(skill.modifier), mf_15_centered);
        mapper.textBox(ref, fileName, 0, 146, y + 1, 19, 12, skill.attributeModifier, mf_12_centered);
        mapper.textBox(ref, fileName, 0, 166, y + 1, 19, 12, skill.proficiencyModifier, mf_12_centered);
        mapper.textBox(ref, fileName, 0, 187, y + 1, 19, 12, skill.itemModifier, mf_12_centered);
        if (typeof skill.armorModifier !== 'undefined') {
            mapper.textBox(ref, fileName, 0, 207, y + 1, 19, 12, skill.armorModifier, mf_12_centered);
        }
        ref = `${skill.label} proficiency`;
        mapper.textBox(ref, fileName, 0, 133, y, 5, 5, sf2eHelper.evalCheckMark(skill.rank >= 1), mf_8_centered);
        mapper.textBox(ref, fileName, 0, 133, y + 5, 5, 5, sf2eHelper.evalCheckMark(skill.rank >= 2), mf_8_centered);
        mapper.textBox(ref, fileName, 0, 133, y + 10, 5, 5, sf2eHelper.evalCheckMark(skill.rank >= 3), mf_8_centered);
        mapper.textBox(ref, fileName, 0, 133, y + 15, 5, 5, sf2eHelper.evalCheckMark(skill.rank >= 4), mf_8_centered);
    }
});

// Skill Notes

// Languages Section
let languages = '';

languages = actor.system.details.languages.value
    .filter(function (a) {
        return a.trim() != '';
    })
    .join(', ');
mapper.textBox('languages', fileName, 0, 236, 285, 108, 74, languages, {
    ...mf_8,
    ...{ valign: 'top', multiline: true },
});

// Perception
const perception = sf2eHelper.quantifyNumber(character.perception.modifier);
mapper.textBox('perception', fileName, 0, 355, 293, 20, 10, perception, mf_12_centered);
mapper.textBox('perception', fileName, 0, 388, 293, 17, 10, character.perception.attributeModifier, mf_10_centered);
mapper.textBox('perception', fileName, 0, 406, 293, 17, 10, character.perception.proficiencyModifier, mf_10_centered);
mapper.textBox('perception', fileName, 0, 424, 293, 17, 10, character.perception.itemModifier, mf_10_centered);
const pRank = character.perception.rank;
mapper.textBox('perception', fileName, 0, 375, 289, 5, 5, sf2eHelper.evalCheckMark(pRank >= 1), mf_8_centered);
mapper.textBox('perception', fileName, 0, 375, 294, 5, 5, sf2eHelper.evalCheckMark(pRank >= 2), mf_8_centered);
mapper.textBox('perception', fileName, 0, 375, 300, 5, 5, sf2eHelper.evalCheckMark(pRank >= 3), mf_8_centered);
mapper.textBox('perception', fileName, 0, 375, 305, 5, 5, sf2eHelper.evalCheckMark(pRank >= 4), mf_8_centered);

mapper.textBox('senses notes', fileName, 0, 355, 318, 110, 41, character.senses, mf_8_multiline);

// speed
mapper.textBox('speed', fileName, 0, 476, 290, 50, 14, character.baseMovement.value, mf_12_centered);

const specialMovement = character.movement
    .filter((f) => !f.isPrimary)
    .map((m) => m.displayName)
    .join(', ');
mapper.textBox('special movement', fileName, 0, 476, 318, 109, 41, specialMovement, {
    ...mf_8,
    ...{ valign: 'top', multiline: true },
});

// Strikes
const melee_strike_y = [400, 450];
const ranged_strike_y = [512, 562, 611];
character.strikes.forEach((strike) => {
    let y;
    let label_width;
    let bonus_x;
    let bonus_width;
    let modifiers_x;
    let damage_x;
    let damage_width;
    let magazine_x;
    let expend_x;
    if (strike.isMelee && melee_strike_y.length > 0) {
        y = melee_strike_y[0];
        melee_strike_y.shift();
        label_width = 148;
        bonus_x = 391;
        bonus_width = 42;
        modifiers_x = 440;
        damage_x = 499;
        damage_width = 86;
    } else if (strike.isRanged && ranged_strike_y.length > 0) {
        y = ranged_strike_y[0];
        ranged_strike_y.shift();
        label_width = 114;
        bonus_x = 358;
        bonus_width = 29;
        modifiers_x = 395;
        damage_x = 506;
        damage_width = 79;
        // magazine_x = 456;
        expend_x = 478;
    }
    if (typeof y !== 'undefined') {
        ref = 'strike';
        const modifier = sf2eHelper.quantifyNumber(strike.modifier);
        const attributeName = sf2eHelper.capitalize(strike.attributeName);
        const dmgParser = function (value) {
            return value.replace(/(piercing|bludgeoning|slashing)/gi, '').replace(/\s+/g, ' ');
        };
        const traitsAndNotes = sf2eHelper.formatTraits(strike.traits);

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

        mapper.textBox(ref, fileName, 0, 236, y - 3, label_width, 16, strike.label, pdfNameStyle);
        mapper.textBox(ref, fileName, 0, bonus_x, y - 3, bonus_width, 17, modifier, mf_12_centered);

        if (typeof magazine_x !== 'undefined') {
            mapper.textBox(ref, fileName, 0, magazine_x, y + 1, 21, 12, strike.magazine, mf_10_centered);
        }
        if (typeof expend_x !== 'undefined') {
            mapper.textBox(ref, fileName, 0, expend_x, y + 1, 22, 12, strike.expend, mf_10_centered);
        }

        mapper.textBox(ref, fileName, 0, modifiers_x, y - 1, 17, 12, strike.attributeModifier, mf_10_centered);
        if (strike.isMelee && strike.attributeName !== 'str') {
            mapper.textBox(ref, fileName, 0, modifiers_x + 4, y + 11, 10, 10, attributeName, mf_8);
        }
        mapper.textBox(ref, fileName, 0, modifiers_x + 18, y - 1, 17, 12, strike.proficiencyModifier, mf_10_centered);
        mapper.textBox(ref, fileName, 0, modifiers_x + 36, y - 1, 18, 12, strike.itemModifier, mf_10_centered);
        mapper.textBox(ref, fileName, 0, damage_x, y - 3, damage_width, 16, strike.damageFormula, {
            ...mf_10,
            ...{ valueParser: dmgParser },
        });

        mapper.textBox(ref, fileName, 0, 289, y + 22, 295, 11, traitsAndNotes, pdfTraitsStyle);
    }
});

// Weapon proficiencies
const wp_x = [244, 277, 309, 341];
['unarmed', 'simple', 'martial', 'advanced'].forEach((a) => {
    let x = wp_x[0];
    wp_x.shift();
    const wp = character.weaponProficiencies[a].rank;
    mapper.textBox('weapon proficiencies', fileName, 0, x, 664, 6, 6, sf2eHelper.evalCheckMark(wp >= 1), mf_8_centered);
    mapper.textBox('weapon proficiencies', fileName, 0, x, 671, 6, 6, sf2eHelper.evalCheckMark(wp >= 2), mf_8_centered);
    mapper.textBox('weapon proficiencies', fileName, 0, x, 678, 6, 6, sf2eHelper.evalCheckMark(wp >= 3), mf_8_centered);
    mapper.textBox('weapon proficiencies', fileName, 0, x, 684, 6, 6, sf2eHelper.evalCheckMark(wp >= 4), mf_8_centered);
});
// TODO: 'Other' weapon proficiencies
// TODO: Weapon proficiency notes
// TODO: Critical Specializations

// Class DC
mapper.textBox('class dc', fileName, 0, 237, 705, 70, 20, character.classDC.modifier, mf_15_centered);
mapper.textBox('class dc', fileName, 0, 254, 735, 17, 12, character.classDC.attributeModifier, mf_10_centered);
mapper.textBox('class dc', fileName, 0, 272, 735, 17, 12, character.classDC.proficiencyModifier, mf_10_centered);
mapper.textBox('class dc', fileName, 0, 290, 735, 17, 12, character.classDC.itemModifier, mf_10_centered);

/* PAGE 2 */
// Ancestry and General Feats
// Ancestry and heritage Abilities
ref = 'Ancestry and heritage Abilities';
const ancestryAndHeritageAbilities = character.ancestryAndHeritageAbilities.map((m) => m.displayName).sort();
mapper.textBox(ref, fileName, 1, 40, 44, 162, 25, ancestryAndHeritageAbilities.join(', '), mf_8_multiline);

// Ancestry Feats
const ancestry_y = [78, 263, 389, 516, 642];
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
        mapper.textBox('Ancestry feats', fileName, 1, 40, y, 162, 20, feats, mf_8_multiline);
    }
}

// Background Skill Feats
ref = 'background skill feats';
const backgroundSkillFeats = character.backgroundSkillFeats.map((m) => m.name);
mapper.textBox(ref, fileName, 1, 40, 114, 162, 43, backgroundSkillFeats.join(', '), mf_8_multiline);

// Skill feats
const skill_feats_y = [168, 231, 294, 357, 420, 483, 546, 609, 672, 734];
for (let level = 2; level <= 20; level = level + 2) {
    const feats = character.skillFeats.filter((f) => f.level === level).map((m) => m.name);
    if (skill_feats_y.length > 0) {
        const y = skill_feats_y[0];
        skill_feats_y.shift();
        mapper.textBox('skill feats', fileName, 1, 40, y, 162, 20, feats.sort().join(', '), mf_8_multiline);
    }
}

// General feats
const general_feats_y = [199, 324, 451, 577, 703];
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
        mapper.textBox('general feats', fileName, 1, 40, y, 162, 20, feats, mf_8_multiline);
    }
}

// Attribute boosts
const boost_y = [262, 419, 577, 734];
for (let level = 5; level <= 20; level = level + 5) {
    const boosts = sf2eHelper.formatAttributeBoosts(
        character.attributeBoosts.filter((f) => f.level === level).map((m) => m.boost)
    );
    if (boost_y.length > 0) {
        const y = boost_y[0];
        boost_y.shift();
        mapper.textBox('attribute boosts', fileName, 1, 174, y, 27, 20, boosts, mf_6_multiline);
    }
}

// Class Feats and Features
// Class Features
const class_features_y = [44, 199, 263, 324, 389, 451, 515, 577, 641, 703];
let firstFeature = true;
for (let level = 1; level <= 20; level = level + 2) {
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
        mapper.textBox(ref, fileName, 1, 206, y, 179, pdfHeight, features.sort().join(', '), mf_8_multiline);
    }
}

// Bonus Feats
if (character.bonusFeats.length > 0) {
    const bonusFeats = 'Bonus Feats:\n' + character.bonusFeats.map((m) => m.name).join(', ');
    mapper.textBox('Bonus Feats', fileName, 1, 206, 99, 179, 58, bonusFeats, mf_8_multiline);
}

// Class Feats
const class_feats_y = [167, 230, 294, 356, 419, 482, 545, 608, 671, 733];
for (let level = 2; level <= 20; level = level + 2) {
    const feats = character.classFeats.filter((f) => f.level === level).map((m) => m.name);
    if (class_feats_y.length > 0) {
        const y = class_feats_y[0];
        class_feats_y.shift();
        mapper.textBox('class feats', fileName, 1, 206, y, 179, 20, feats.sort().join(', '), mf_8_multiline);
    }
}

// Inventory
let y = 0;
// Held items
// item names shouldn't be longer than 50/45 characters
y = 41;
ref = 'held items';
character.flatItems(character.heldItems).forEach((item) => {
    if (y <= 183) {
        let pdfStyle = mf_8;
        if (item.isMagical) {
            pdfStyle = { ...pdfStyle, ...{ suffix: ' ‡' } };
        }
        let xOffset = item.containerLevel * 10;
        mapper.textBox(ref, fileName, 1, 396 + xOffset, y, 155 - xOffset, 10, item.displayName, pdfStyle);
        mapper.textBox(ref, fileName, 1, 552, y, 23, 10, item.bulk, mf_8_centered);
        y = y + 10;
    }
});

// Consumables
y = 195;
ref = 'consumables';
character.flatItems(character.consumables).forEach((item) => {
    if (y <= 344) {
        let pdfStyle = mf_8;
        if (item.isMagical) {
            pdfStyle = { ...pdfStyle, ...{ suffix: ' ‡' } };
        }
        let xOffset = item.containerLevel * 10;
        mapper.textBox(ref, fileName, 1, 396 + xOffset, y, 155 - xOffset, 10, item.displayName, pdfStyle);
        mapper.textBox(ref, fileName, 1, 552, y, 23, 10, item.bulk, mf_8_centered);
        y = y + 10;
    }
});

// Worn items
y = 357;
ref = 'worn items';
character.flatItems(character.wornItems).forEach((item) => {
    if (y <= 459) {
        let pdfStyle = mf_8;
        if (item.isMagical) {
            pdfStyle = { ...pdfStyle, ...{ suffix: ' ‡' } };
        }
        let xOffset = item.containerLevel * 10;
        mapper.textBox(ref, fileName, 1, 396 + xOffset, y, 120 - xOffset, 10, item.displayName, pdfStyle);
        mapper.textBox(ref, fileName, 1, 517, y, 34, 10, sf2eHelper.evalCheckMark(item.isInvested), mf_8_centered);
        mapper.textBox(ref, fileName, 1, 552, y, 23, 10, item.bulk, mf_8_centered);
        y = y + 10;
    }
});

// Bulk
mapper.textBox('bulk', fileName, 1, 403, 604, 25, 22, character.totalBulk, mf_15_centered);

// Wealth
mapper.textBox('credits', fileName, 1, 395, 719, 41, 26, character.credits || 0, mf_15_centered);
mapper.textBox('upb', fileName, 1, 489, 718, 86, 38, character.upb || 0, mf_8_multiline);

// Valuables
ref = 'valuables';
y = 647;
character.flatItems(character.valuables).forEach((item) => {
    if (y <= 697) {
        let pdfStyle = mf_8;
        if (item.isMagical) {
            pdfStyle = { ...pdfStyle, ...{ suffix: ' ‡' } };
        }
        let xOffset = item.containerLevel * 10;
        mapper.textBox(ref, fileName, 1, 396 + xOffset, y, 153 - xOffset, 10, item.displayName, pdfStyle);
        mapper.textBox(ref, fileName, 1, 521, y, 29, 10, item.price.join(' '), mf_8_centered);
        mapper.textBox(ref, fileName, 1, 551, y, 24, 10, item.bulk, mf_8_centered);
        y = y + 10;
    }
});

/* Page 3 */
// Origin and Appearance
mapper.textBox('ethnicity', fileName, 2, 218, 39, 59, 15, character.details.ethnicity, mf_10);
mapper.textBox('nationality', fileName, 2, 283, 39, 59, 15, character.details.nationality, mf_10);
mapper.textBox('birthplace', fileName, 2, 348, 48, 39, 15, character.details.biography.birthplace, mf_10);
mapper.textBox('age', fileName, 2, 413, 39, 22, 15, character.details.age, mf_10);
mapper.textBox('gender & pronouns', fileName, 2, 440, 39, 67, 15, character.details.gender, mf_10);
mapper.textBox('height', fileName, 2, 512, 39, 31, 15, character.details.height, mf_10);
mapper.textBox('weight', fileName, 2, 549, 39, 33, 15, character.details.weight, mf_10);

mapper.textBox('appearance', fileName, 2, 218, 70, 364, 15, character.details.biography.appearance, mf_10);

// Personality
mapper.textBox('attitude', fileName, 2, 218, 114, 178, 15, character.details.biography.attitude, mf_10);
mapper.textBox('deity or philosofy', fileName, 2, 404, 114, 178, 15, character.details.deity, mf_10);
const actorEdicts = character.details.biography.edicts;
mapper.textBox('edicts', fileName, 2, 218, 132, 178, 70, ' '.repeat(10) + actorEdicts, mf_10_multiline);

const actorAnathema = character.details.biography.anathema;
mapper.textBox('edicts', fileName, 2, 404, 132, 178, 70, ' '.repeat(15) + actorAnathema, mf_10_multiline);

mapper.textBox('likes', fileName, 2, 218, 217, 364, 15, character.details.biography.likes, mf_10);
const actorDislikes = character.details.biography.dislikes;
mapper.textBox('dislikes', fileName, 2, 218, 248, 364, 15, actorDislikes, mf_10);
const actorCatchPhrases = character.details.biography.catchphrases;
mapper.textBox('catchphrases', fileName, 2, 218, 280, 364, 15, actorCatchPhrases, mf_10);

// /* Campaign notes Section */
const actorNotes = character.details.biography.campaignNotes;
mapper.textBox('campaignNotes', fileName, 2, 30, 320, 270, 96, actorNotes, mf_8_multiline);
// allies and enemies are not really good at
const actorAllies = character.details.biography.allies;
mapper.textBox('allies', fileName, 2, 312, 320, 270, 22, actorAllies, mf_6_multiline);
const actorEnemies = character.details.biography?.enemies;
mapper.textBox('enemies', fileName, 2, 312, 357, 270, 22, actorEnemies, mf_6_multiline);
const actorOrganizations = character.details.biography.organizations;
mapper.textBox('organizations', fileName, 2, 312, 394, 270, 22, actorOrganizations, mf_8_multiline);

// Actions and activities
const actorActionsActivities_y = [445, 525, 606, 685];
const actorFreeActionsActivities_y = [445, 525, 606, 685];
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
        const traits = sf2eHelper.formatTraits(a.traits);
        const reference = sf2eHelper.abbreviateSource(a.reference);
        const description = a.frequency + '\n' + a.description;
        mapper.textBox(ref, fileName, 2, 30, y, 92, 20, a.name, mf_8_multiline);
        mapper.textBox(ref, fileName, 2, 124, y, 35, 20, a.glyph, action_10_centered_top);
        mapper.textBox(ref, fileName, 2, 161, y, 116, 30, traits, mf_8_multiline);
        mapper.textBox(ref, fileName, 2, 279, y, 21, 20, reference, mf_8_multiline);
        mapper.textBox(ref, fileName, 2, 30, y + 26, 271, 43, description, mf_6_multiline);
    } else if (typeof y !== 'undefined' && (a.type === 'free' || a.type === 'reaction')) {
        ref = 'free/re -action';
        const traits = sf2eHelper.formatTraits(a.traits);
        const reference = sf2eHelper.abbreviateSource(a.reference);
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
        mapper.textBox(ref, fileName, 2, 408, y - 8, 8, 8, sf2eHelper.evalCheckMark(a.type === 'free'), mf_8_centered);
        const isReaction = a.type === 'reaction';
        mapper.textBox(ref, fileName, 2, 408, y + 2, 8, 8, sf2eHelper.evalCheckMark(isReaction), mf_8_centered);
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
mapper.textBox(ref, fileName, 3, 53, 35, 10, 10, sf2eHelper.evalCheckMark(hasArcaneTradition), mf_10_centered);
mapper.textBox(ref, fileName, 3, 65, 35, 10, 10, sf2eHelper.evalCheckMark(hasOccultTradition), mf_10_centered);
mapper.textBox(ref, fileName, 3, 53, 47, 10, 10, sf2eHelper.evalCheckMark(hasPrimalTradition), mf_10_centered_top);
mapper.textBox(ref, fileName, 3, 65, 47, 10, 10, sf2eHelper.evalCheckMark(hasDivineTradition), mf_10_centered_top);

const isPreparedCaster = character.isPreparedCaster;
const isSpontaneousCaster = character.isSpontaneousCaster;
ref = 'magic preparation';
mapper.textBox(ref, fileName, 3, 119, 38, 5, 5, sf2eHelper.evalCheckMark(isPreparedCaster), mf_8_centered);
mapper.textBox(ref, fileName, 3, 119, 48, 5, 5, sf2eHelper.evalCheckMark(isSpontaneousCaster), mf_8_centered);

const spellProficiency = character.highestSpellProficiency;

// Spell Attack
if (typeof spellProficiency !== 'undefined') {
    ref = 'spell attack';
    mapper.textBox(ref, fileName, 3, 19, 85, 21, 21, spellProficiency.attack.modifier, mf_15_centered);
    mapper.textBox(ref, fileName, 3, 60, 91, 18, 12, spellProficiency.attack.attributeModifier, mf_12_centered);
    mapper.textBox(ref, fileName, 3, 78, 91, 18, 12, spellProficiency.attack.proficiencyModifier, mf_12_centered);
    const spellAttackRank = spellProficiency.attack.rank;
    mapper.textBox(ref, fileName, 3, 47, 90, 5, 5, sf2eHelper.evalCheckMark(spellAttackRank >= 1), mf_8_centered);
    mapper.textBox(ref, fileName, 3, 47, 95, 5, 5, sf2eHelper.evalCheckMark(spellAttackRank >= 2), mf_8_centered);
    mapper.textBox(ref, fileName, 3, 47, 101, 5, 5, sf2eHelper.evalCheckMark(spellAttackRank >= 3), mf_8_centered);
    mapper.textBox(ref, fileName, 3, 47, 106, 5, 5, sf2eHelper.evalCheckMark(spellAttackRank >= 4), mf_8_centered);

    ref = 'spell attack';
    mapper.textBox(ref, fileName, 3, 104, 85, 21, 21, spellProficiency.spell.modifier, mf_15_centered);

    mapper.textBox(ref, fileName, 3, 163, 91, 17, 10, spellProficiency.spell.attributeModifier, mf_12_centered);
    mapper.textBox(ref, fileName, 3, 181, 91, 17, 10, spellProficiency.spell.proficiencyModifier, mf_12_centered);

    const spellSaveRank = spellProficiency.spell.rank;
    mapper.textBox(ref, fileName, 3, 132, 90, 5, 5, sf2eHelper.evalCheckMark(spellSaveRank >= 1), mf_8_centered);
    mapper.textBox(ref, fileName, 3, 132, 95, 5, 5, sf2eHelper.evalCheckMark(spellSaveRank >= 2), mf_8_centered);
    mapper.textBox(ref, fileName, 3, 132, 101, 5, 5, sf2eHelper.evalCheckMark(spellSaveRank >= 3), mf_8_centered);
    mapper.textBox(ref, fileName, 3, 132, 106, 5, 5, sf2eHelper.evalCheckMark(spellSaveRank >= 4), mf_8_centered);
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
// 60, 91 - 18x12
// -10, -10
mapper.textBox('cantrips per day', fileName, 3, 80, 134, 32, 20, cantripSlots, mf_12_centered);

// cantrip rank
if (cantripSlots !== '') {
    mapper.textBox('cantrip rank', fileName, 3, 174, 134, 23, 20, character.cantripRank, mf_12_centered);
}
// Cantrips
let cantripsY = 167;
const cantripsMaxY = 445;
ref = 'cantrips';
let sceType;
const sceCantripCount = sf2eHelper.unique(
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
                mapper.textBox(ref, fileName, 3, 20, y, 160, 12, cantrip.type, mf_10);
                sceType = cantrip.type;
                y = cantripsY;
                cantripsY = cantripsY + 10;
                endingWhiteSpace = true;
            }
            mapper.textBox(ref, fileName, 3, 20, y, 134, 10, cantrip.name, mf_8);
            mapper.textBox(ref, fileName, 3, 154, y, 26, 10, cantrip.glyph, action_8_centered);
            mapper.textBox(ref, fileName, 3, 181, y, 18, 10, 'O'.repeat(cantrip.prepared), mf_8_centered);
        }
    });

// Focus points
ref = 'focus points';
const focusPointsMax = character.focusPoints.max;
mapper.textBox(ref, fileName, 3, 72, 463, 9, 9, sf2eHelper.evalCheckMark(focusPointsMax >= 1), mf_8_centered);
mapper.textBox(ref, fileName, 3, 85, 463, 9, 9, sf2eHelper.evalCheckMark(focusPointsMax >= 2), mf_8_centered);
mapper.textBox(ref, fileName, 3, 98, 463, 9, 9, sf2eHelper.evalCheckMark(focusPointsMax >= 3), mf_8_centered);

// focus rank
mapper.textBox('focus spell rank', fileName, 3, 174, 457, 24, 15, character.focusSpellRank, mf_12_centered);

// Focus spells
let focusY = 505;
const focusMaxY = 641;
sceType = undefined;
const sceFocusCount = sf2eHelper.unique(character.knownSpells.filter((f) => f.isFocusSpell).map((m) => m.type)).length;
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
                mapper.textBox(ref, fileName, 3, 20, y, 169, 12, spell.type, mf_10);
                sceType = spell.type;
                y = focusY;
                focusY = focusY + 10;
                endingWhiteSpace = true;
            }
            mapper.textBox(ref, fileName, 3, 20, y, 169, 10, spell.name, mf_8);
            mapper.textBox(ref, fileName, 3, 170, y, 29, 10, spell.glyph, action_8_centered);
        }
    });

// Innate spells
let innateSpellsY = 664;
const innateSpellsMaxY = 756;
ref = 'innate spell';
sceType = undefined;
const sceInnateSpellCount = sf2eHelper.unique(
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
                mapper.textBox(ref, fileName, 3, 20, y, 119, 12, spell.type, mf_10);
                sceType = spell.type;
                y = innateSpellsY;
                innateSpellsY = innateSpellsY + 10;
                endingWhiteSpace = true;
            }
            mapper.textBox(ref, fileName, 3, 20, y, 119, 10, spell.name, mf_8);
            mapper.textBox(ref, fileName, 3, 140, y, 34, 10, spell.glyph, action_8_centered);
            // TODO: frequency of innate spells
            // mapper.textBox(ref, fileName, 3, 186, y, 20, 10, spell.frequency, action_8_centered);
        }
    });

// Spell Slots
// Spells per day
const spellsPerDayX = [267, 298, 330, 361, 393, 424, 456, 487, 519, 550];
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
        mapper.textBox('focus spell rank', fileName, 3, x, 34, 25, 16, rankSlots.join('/'), pdfStyle);
    }
}

// Spells
let spellX = 208;
const spellMinY = 108;
let spellY = spellMinY;
const spellMaxY = 675;
ref = 'spell';
sceType = undefined;
let spellRank;
const sceSpellCount = sf2eHelper.unique(
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
                mapper.textBox(ref, fileName, 3, x, y, 135, 12, spell.type, mf_10);
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
            mapper.textBox(ref, fileName, 3, x, y, 107, 10, spell.name, mf_8);
            mapper.textBox(ref, fileName, 3, x + 107, y, 28, 10, spell.glyph, action_8_centered);
            mapper.textBox(ref, fileName, 3, x + 136, y, 22, 10, spell.rank, mf_8_centered);
            mapper.textBox(ref, fileName, 3, x + 159, y, 20, 10, 'O'.repeat(spell.prepared), mf_8_centered);
            if (spellY >= spellMaxY && spellX === 208) {
                spellY = spellMinY;
                spellX = 397;
            }
        }
    });

// Rituals
const ritualX = 208;
const ritualMinY = 699;
let ritualY = ritualMinY;
const ritualMaxY = 756;
ref = 'rituals';
character.knownRituals.forEach((ritual) => {
    let y;
    let x = ritualX;
    if (ritualY < ritualMaxY) {
        y = ritualY;
        ritualY = ritualY + 10;
    }
    if (typeof y !== 'undefined') {
        mapper.textBox(ref, fileName, 3, x, y, 135, 10, ritual.name, mf_8);
        mapper.textBox(ref, fileName, 3, x + 136, y, 22, 10, ritual.rank, mf_8_centered);
        mapper.textBox(ref, fileName, 3, x + 159, y, 20, 10, ritual.cost, mf_8);
    }
    if (ritualY >= ritualMaxY && ritualX === 208) {
        ritualY = ritualMinY;
        ritualX = 397;
    }
});

export { mapper };
