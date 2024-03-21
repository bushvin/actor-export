import { pdfProvider } from '../../scripts/lib/providers/PDFProvider.js';
import { pf2eHelper } from '../../scripts/lib/helpers/PF2eHelper.js';
import { semVer } from '../../scripts/lib/SemVer.js';

// actor is available as a global variable
// game is available as a global variable

// helper functions

class pf2ePDFProvider extends pdfProvider {
    constructor(actor) {
        super(actor);
        this.page_width = 612;
        this.page_height = 792;
        //this.debug = true;
    }

    defaultFont(font, size, lineHeight = undefined) {
        if (!isNaN(Number(size))) {
            size = size / mapper.page_height;
        }
        if (!isNaN(Number(lineHeight))) {
            lineHeight = lineHeight / mapper.page_height;
        }

        super.defaultFont(font, size, lineHeight);
    }
    image(file, page, x, y, path, maxWidth = -1, maxHeight = -1, options) {
        x = x / this.page_width;
        y = y / this.page_height;
        maxWidth = maxWidth > 0 ? maxWidth / this.page_width : maxWidth;
        maxHeight = maxHeight > 0 ? maxHeight / this.page_height : maxHeight;
        super.image(file, page, x, y, path, maxWidth, maxHeight, options);
    }

    textBox(reference, file, page, x, y, width, height, text, options = {}) {
        x = x / this.page_width;
        y = y / this.page_height;
        width = width / this.page_width;
        height = height / this.page_height;
        super.textBox(reference, file, page, x, y, width, height, text, options);
    }

    checkMark(value) {
        if (value === true) {
            return 'x';
        }
        return '';
    }
}

const mapper = new pf2ePDFProvider(actor);
let ref = '';
mapper.defaultFont('MarkerFelt.ttf', 12, 12);
mapper.defaultFontColor('#01579b');
//mapper.debug = true;
// Font definitions
const mf_default = {
    // debug: true,
    // font: 'MarkerFelt.ttf',
    // size: 12 / mapper.page_height,
    // color: '#01579b',
};
const mf_6 = { ...mf_default, ...{ size: 6 / mapper.page_height, lineHeight: 8 / mapper.page_height } };
const mf_6_centered = { ...mf_6, ...{ halign: 'center' } };
const mf_6_multiline = { ...mf_6, ...{ multiline: true, valign: 'top' } };
const mf_8 = { ...mf_default, ...{ size: 8 / mapper.page_height, lineHeight: 10 / mapper.page_height } };
const mf_8_centered = { ...mf_8, ...{ halign: 'center' } };
const mf_8_top = { ...mf_8, ...{ valign: 'top' } };
const mf_8_multiline = { ...mf_8, ...{ multiline: true, valign: 'top' } };
const mf_10 = { ...mf_default, ...{ size: 10 / mapper.page_height, lineHeight: 12 / mapper.page_height } };
const mf_10_centered = { ...mf_10, ...{ halign: 'center' } };
const mf_10_centered_top = { ...mf_10_centered, ...{ valign: 'top' } };
const mf_10_multiline = { ...mf_10, ...{ multiline: true, valign: 'top' } };
const mf_12 = { ...mf_default, ...{ size: 12 / mapper.page_height, lineHeight: 14 / mapper.page_height } };
const mf_12_centered = { ...mf_12, ...{ halign: 'center' } };
const mf_15 = { ...mf_default, ...{ size: 15 / mapper.page_height, lineHeight: 17 / mapper.page_height } };
const mf_15_centered = { ...mf_15, ...{ halign: 'center' } };
const mf_17 = { ...mf_default, ...{ size: 17 / mapper.page_height, lineHeight: 19 / mapper.page_height } };
const mf_17_centered = { ...mf_17, ...{ halign: 'center' } };
const f_debug = { debug: true };

const action_8 = {
    font: 'action_icons.ttf',
    size: 8 / mapper.page_height,
    lineHeight: 8 / mapper.page_height,
    color: '#01579b',
};
const action_8_centered = { ...action_8, ...{ halign: 'center' } };
const action_8_centered_top = { ...action_8_centered, ...{ valign: 'top' } };

const action_10 = { ...action_8, ...{ size: 10 / mapper.page_height, lineHeight: 12 / mapper.page_height } };
//const action_10 = { ...action_12, ...{ size: 10 / mapper.page_height, lineHeight: 12 / mapper.page_height } };
const action_10_centered = { ...action_10, ...{ halign: 'center' } };
const action_10_centered_top = { ...action_10_centered, ...{ valign: 'top' } };

const action_12 = { ...action_8, ...{ size: 12 / mapper.page_height, lineHeight: 14 / mapper.page_height } };
//     const action_12 = {
//     font: 'action_icons.ttf',
//     size: 12 / mapper.page_height,
//     lineHeight: 14 / mapper.page_height,
//     color: '#01579b',
// };
const action_12_centered = { ...action_12, ...{ halign: 'center' } };

const fileName = 'RemasterPlayerCoreCharacterSheet.pdf';

mapper.image(fileName, 2, 29, 39, actor.img, 178, 265);

/* PAGE 1 */
const ownerName = Object.entries(actor.ownership)
    .filter((i) => i[1] === 3)
    .map((i) => i[0])
    .map((id) => (!game.users.get(id)?.isGM ? game.users.get(id)?.name : null))
    .filter((x) => x)
    .join(', ');
mapper.textBox('actor name', fileName, 0, 217, 40, 178, 18, actor.name, mf_17);
mapper.textBox('player name', fileName, 0, 260, 69, 135, 10, ownerName, mf_10);
mapper.textBox('ancestry', fileName, 0, 30, 98, 176, 8, actor.ancestry?.name || '', mf_12);
mapper.textBox('heritage', fileName, 0, 30, 114, 142, 22, actor.heritage?.name || '', mf_12);
mapper.textBox('size', fileName, 0, 180, 114, 26, 22, actor.system.traits.size.value, mf_12);

// Background
mapper.textBox('background', fileName, 0, 217, 98, 178, 8, actor.background?.name || '', mf_12);
/* TODO: background notes */

// Class
mapper.textBox('class', fileName, 0, 406, 98, 176, 8, actor.class?.name || '', mf_12);
const subClassFeatures = [
    'research-field', // alchemist
    'instinct', // barbarian
    'muses', // bard
    'deity-and-cause', // champion
    'doctrine', // cleric
    'druidic-order', // druid
    'gunslingers-way', // gunslinger
    'innovation', // inventor
    'methodology', // investigator
    'hybrid-study', // magus
    'mystery', // oracle
    'conscious-mind', // psychic
    'rogues-racket', // rogue
    'bloodline', // sorcerer
    'evolution-feat', // summoner
    'swashbucklers-style', // swashbucklers
    'patron', // witch
    'arcane-thesis', // wizard
];
const subClass = [];
actor.items
    .filter((i) => i.type === 'feat' && subClassFeatures.includes(i.system.slug))
    .forEach((f) => {
        actor.items
            .filter((i) => i.flags?.pf2e?.grantedBy?.id === f._id)
            .forEach((s) => {
                subClass.push(s.name);
            });
    });
mapper.textBox('class notes', fileName, 0, 406, 114, 176, 22, subClass.join('/'), mf_12);

// level
mapper.textBox('level', fileName, 0, 412, 50, 19, 19, actor.system.details.level.value, mf_15_centered);
mapper.textBox('xp', fileName, 0, 446, 52, 42, 15, actor.system.details.xp?.value, mf_12);

// Hero points
const heroPoints = actor.system.resources.heroPoints.value || 0;
mapper.textBox('heropoint', fileName, 0, 510, 36, 9, 16, mapper.checkMark(heroPoints >= 1), mf_17_centered);
mapper.textBox('heropoint', fileName, 0, 533, 36, 9, 16, mapper.checkMark(heroPoints >= 2), mf_17_centered);
mapper.textBox('heropoint', fileName, 0, 556, 36, 9, 16, mapper.checkMark(heroPoints >= 3), mf_17_centered);

// Attributes
const attr_x = [29, 123, 217, 311, 405, 499];
const attr_boost_x = [56, 150, 244, 338, 432, 526];
Object.keys(actor.abilities).forEach((a, i) => {
    const modifier = pf2eHelper.quantifyNumber(actor.abilities[a].mod);
    const isPartialBoost = pf2eHelper.isPartialBoost(actor, a);
    mapper.textBox(`${a} attribute`, fileName, 0, attr_x[i], 150, 21, 19, modifier, mf_15_centered);
    mapper.textBox(
        `${a} attribute boost`,
        fileName,
        0,
        attr_boost_x[i],
        168,
        5,
        5,
        mapper.checkMark(isPartialBoost),
        mf_12_centered
    );
});

// Defense
const acAttributeModifier = actor.armorClass.modifiers
    .filter((i) => i.type === 'ability')
    .map((i) => i.modifier)
    .reduce((a, b) => a + b, 0);
const acProficiencyModifier = actor.armorClass.modifiers
    .filter((i) => i.type === 'proficiency')
    .map((i) => i.modifier)
    .reduce((a, b) => a + b, 0);
const acItemModifier = actor.armorClass.modifiers
    .filter((i) => i.type === 'item')
    .map((i) => i.modifier)
    .reduce((a, b) => a + b, 0);
const acStatusModifier = actor.armorClass.modifiers
    .filter((i) => i.type === 'status')
    .map((i) => i.modifier)
    .reduce((a, b) => a + b, 0);

mapper.textBox('ac', fileName, 0, 51, 212, 25, 17, actor.armorClass.value - acStatusModifier, mf_17_centered);
mapper.textBox('ac', fileName, 0, 46, 248, 17, 10, acAttributeModifier, mf_10_centered);
mapper.textBox('ac', fileName, 0, 64, 248, 17, 10, acProficiencyModifier, mf_10_centered);
mapper.textBox('ac', fileName, 0, 82, 248, 18, 10, acItemModifier, mf_10_centered);

// Shield
const shieldAcBonus =
    actor.items.filter((i) => i.type === 'shield' && i.isEquipped).map((i) => i.system.acBonus)[0] || '';
const shieldHardness =
    actor.items.filter((i) => i.type === 'shield' && i.isEquipped).map((i) => i.system.hardness)[0] || '';
const shieldHPmax = actor.items.filter((i) => i.type === 'shield' && i.isEquipped).map((i) => i.system.hp.max)[0] || '';
const shieldHPbt =
    actor.items.filter((i) => i.type === 'shield' && i.isEquipped).map((i) => i.system.hp.brokenThreshold)[0] || '';
const shieldHPvalue =
    actor.items.filter((i) => i.type === 'shield' && i.isEquipped).map((i) => i.system.hp.value)[0] || '';
mapper.textBox('shield', fileName, 0, 104, 205, 15, 17, shieldAcBonus, mf_15);
mapper.textBox('shield', fileName, 0, 127, 209, 21, 10, shieldHardness, mf_10_centered);
mapper.textBox('shield', fileName, 0, 153, 209, 17, 10, shieldHPmax, mf_10_centered);
mapper.textBox('shield', fileName, 0, 170, 209, 18, 10, shieldHPbt, mf_10_centered);
mapper.textBox('shield', fileName, 0, 192, 209, 16, 10, shieldHPvalue, mf_10_centered);

// Armor proficiencies
const armor_proficiency_x = [127, 152, 172, 194];
Object.keys(actor.system.proficiencies?.defenses || []).forEach((d, i) => {
    const defenseRank = actor.system.proficiencies.defenses[d].rank;
    const x = armor_proficiency_x[i];
    ref = `${d} proficiency`;
    if (!d.endsWith('-barding')) {
        mapper.textBox(ref, fileName, 0, x, 244, 7, 5, mapper.checkMark(defenseRank >= 1), mf_10_centered);
        mapper.textBox(ref, fileName, 0, x, 250, 7, 5, mapper.checkMark(defenseRank >= 2), mf_10_centered);
        mapper.textBox(ref, fileName, 0, x, 257, 7, 5, mapper.checkMark(defenseRank >= 3), mf_10_centered);
        mapper.textBox(ref, fileName, 0, x, 264, 7, 5, mapper.checkMark(defenseRank >= 4), mf_10_centered);
    }
});

// Saving Throws
const saves_x = [217, 279, 341];
Object.keys(actor.saves).forEach((s, i) => {
    const saveAttributeModifier = actor.saves[s].modifiers
        .filter((i) => i.type === 'ability' && i.enabled)
        .map((i) => i.modifier)
        .reduce((a, b) => a + b, 0);
    const saveProficiencyModifier = actor.saves[s].modifiers
        .filter((i) => i.type === 'proficiency' && i.enabled)
        .map((i) => i.modifier)
        .reduce((a, b) => a + b, 0);
    const saveItemModifier = actor.saves[s].modifiers
        .filter((i) => i.type === 'item' && i.enabled)
        .map((i) => i.modifier)
        .reduce((a, b) => a + b, 0);
    const saveStatusModifier = actor.saves[s].modifiers
        .filter((i) => i.type === 'item' && i.enabled)
        .map((i) => i.modifier)
        .reduce((a, b) => a + b, 0);
    const saveRank = actor.saves[s].rank;
    const save = pf2eHelper.quantifyNumber(actor.saves[s].mod - saveStatusModifier);
    const x = saves_x[i];
    ref = `${s} save`;
    mapper.textBox(ref, fileName, 0, x, 202, 43, 18, save, mf_15_centered);
    mapper.textBox(ref, fileName, 0, x - 1, 228, 17, 10, saveAttributeModifier, mf_10_centered);
    mapper.textBox(ref, fileName, 0, x + 17, 228, 17, 10, saveProficiencyModifier, mf_10_centered);
    mapper.textBox(ref, fileName, 0, x + 35, 228, 17, 10, saveItemModifier, mf_10_centered);

    ref = `${s} proficiency`;
    mapper.textBox(ref, fileName, 0, x + 47, 205, 5, 4, mapper.checkMark(saveRank >= 1), mf_10_centered);
    mapper.textBox(ref, fileName, 0, x + 47, 209, 5, 4, mapper.checkMark(saveRank >= 2), mf_10_centered);
    mapper.textBox(ref, fileName, 0, x + 47, 215, 5, 4, mapper.checkMark(saveRank >= 3), mf_10_centered);
    mapper.textBox(ref, fileName, 0, x + 47, 220, 5, 4, mapper.checkMark(saveRank >= 4), mf_10_centered);
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
mapper.textBox('hitpoints', fileName, 0, 402, 201, 40, 20, actor.hitPoints.max, mf_15_centered);
mapper.textBox('hitpoints', fileName, 0, 442, 199, 87, 34, actor.hitPoints.value, { ...mf_10, ...{ valign: 'top' } });
mapper.textBox('hitpoints', fileName, 0, 535, 199, 48, 10, actor.hitPoints.temp, mf_10);

const dyingValue = actor.system.attributes.dying.value;
mapper.textBox('dying', fileName, 0, 555, 215, 4, 4, mapper.checkMark(dyingValue >= 1), mf_10_centered);
mapper.textBox('dying', fileName, 0, 564, 215, 4, 4, mapper.checkMark(dyingValue >= 2), mf_10_centered);
mapper.textBox('dying', fileName, 0, 572, 215, 4, 4, mapper.checkMark(dyingValue >= 3), mf_10_centered);
mapper.textBox('dying', fileName, 0, 580, 215, 4, 4, mapper.checkMark(dyingValue >= 4), mf_10_centered);

const woundedValue = actor.system.attributes.wounded.value;
const woundedMax = actor.system.attributes.wounded.max;
mapper.textBox('wounds', fileName, 0, 567, 222, 17, 11, `${woundedValue}/${woundedMax}`, mf_10_centered);
const resistance_immunities = actor.system.attributes.resistances
    .map((i) => i.type + ' ' + i.value)
    .concat(actor.system.attributes.immunities.map((i) => i.type))
    .sort()
    .join(', ');
mapper.textBox('resistance', fileName, 0, 405, 240, 179, 16, resistance_immunities, mf_10);
mapper.textBox('conditions', fileName, 0, 405, 262, 179, 16, actor.conditions.map((i) => i.name).join(', '), mf_10);

/* Skills */
const skill_y = [291, 317, 344, 370, 397, 424, 450, 530, 556, 583, 609, 636, 663, 689, 716, 742];
Object.values(actor.skills)
    .filter((i) => !i.lore)
    .forEach((skill, i) => {
        const skillStatusModifier = skill.modifiers
            .filter((i) => i.type == 'status')
            .map((i) => i.modifier)
            .reduce((a, b) => a + b, 0);
        const skillProficiencyModifier = skill.modifiers
            .filter((i) => i.type == 'proficiency')
            .map((i) => i.modifier)
            .reduce((a, b) => a + b, 0);
        const itemExcludes = ['armor-check-penalty', 'no-crowbar'];
        const skillItemModifier = skill.modifiers
            .filter((i) => i.type === 'item' && i.enabled && !itemExcludes.includes(i.slug))
            .map((i) => i.modifier)
            .reduce((a, b) => a + b, 0);
        const skillArmorModifier = skill.modifiers
            .filter((i) => i.slug === 'armor-check-penalty')
            .map((i) => i.modifier)
            .reduce((a, b) => a + b, 0);
        const skillTotalModifier = pf2eHelper.quantifyNumber(skill.mod - skillStatusModifier);
        const skillAttributeModifier = skill.attributeModifier.modifier || '0';
        const y = skill_y[i];
        ref = `${skill.slug} skill`;
        mapper.textBox(ref, fileName, 0, 95, y, 32, 18, skillTotalModifier, mf_15_centered);
        mapper.textBox(ref, fileName, 0, 146, y + 1, 19, 12, skillAttributeModifier, mf_12_centered);
        mapper.textBox(ref, fileName, 0, 166, y + 1, 19, 12, skillProficiencyModifier, mf_12_centered);
        mapper.textBox(ref, fileName, 0, 187, y + 1, 19, 12, skillItemModifier, mf_12_centered);

        if (['acrobatics', 'athletics', 'stealth', 'thievery'].indexOf(skill.slug) !== -1) {
            mapper.textBox(ref, fileName, 0, 207, y + 1, 19, 12, skillArmorModifier, mf_12_centered);
        }

        ref = `${skill.slug} proficiency`;
        mapper.textBox(ref, fileName, 0, 133, y, 5, 5, mapper.checkMark(skill.rank >= 1), mf_8_centered);
        mapper.textBox(ref, fileName, 0, 133, y + 5, 5, 5, mapper.checkMark(skill.rank >= 2), mf_8_centered);
        mapper.textBox(ref, fileName, 0, 133, y + 10, 5, 5, mapper.checkMark(skill.rank >= 3), mf_8_centered);
        mapper.textBox(ref, fileName, 0, 133, y + 15, 5, 5, mapper.checkMark(skill.rank >= 4), mf_8_centered);
    });

/* Lore Skills */
const lore_skill_y = [477, 503];
Object.values(actor.skills)
    .filter((i) => i.lore)
    .forEach((skill, index) => {
        if (index < 2) {
            const skillStatusModifier = skill.modifiers
                .filter((i) => i.type == 'status')
                .map((i) => i.modifier)
                .reduce((a, b) => a + b, 0);
            const skillProficiencyModifier = skill.modifiers
                .filter((i) => i.type == 'proficiency')
                .map((i) => i.modifier)
                .reduce((a, b) => a + b, 0);
            const itemExcludes = ['armor-check-penalty', 'no-crowbar'];
            const skillItemModifier = skill.modifiers
                .filter((i) => i.type === 'item' && i.enabled && !itemExcludes.includes(i.slug))
                .map((i) => i.modifier)
                .reduce((a, b) => a + b, 0);
            const skillArmorModifier = skill.modifiers
                .filter((i) => i.slug === 'armor-check-penalty')
                .map((i) => i.modifier)
                .reduce((a, b) => a + b, 0);
            const y = lore_skill_y[index];
            const skillTotalModifier = pf2eHelper.quantifyNumber(skill.mod - skillStatusModifier);
            const skillAttributeModifier = skill.attributeModifier.modifier || '0';
            const skillName = skill.label;
            let pdfNameStyle = mf_12;
            if (skillName.length > 14) {
                pdfNameStyle = mf_10;
            }
            ref = 'lore skill';
            mapper.textBox(ref, fileName, 0, 0, y - 3, 68, 18, skillName, {
                ...pdfNameStyle,
                ...{ halign: 'right' },
            });
            mapper.textBox(ref, fileName, 0, 95, y + 1, 32, 18, skillTotalModifier, mf_15_centered);
            mapper.textBox(ref, fileName, 0, 146, y + 1, 19, 12, skillAttributeModifier, mf_12_centered);
            mapper.textBox(ref, fileName, 0, 166, y + 1, 19, 12, skillProficiencyModifier, mf_12_centered);
            mapper.textBox(ref, fileName, 0, 187, y + 1, 19, 12, skillItemModifier, mf_12_centered);
            mapper.textBox(ref, fileName, 0, 133, y, 5, 5, mapper.checkMark(skill.rank >= 1), mf_8_centered);
            mapper.textBox(ref, fileName, 0, 133, y + 5, 5, 5, mapper.checkMark(skill.rank >= 2), mf_8_centered);
            mapper.textBox(ref, fileName, 0, 133, y + 10, 5, 5, mapper.checkMark(skill.rank >= 3), mf_8_centered);
            mapper.textBox(ref, fileName, 0, 133, y + 15, 5, 5, mapper.checkMark(skill.rank >= 4), mf_8_centered);
        }
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
const perceptionStatusModifier = actor.perception.modifiers
    .filter((i) => i.type === 'status' && i.enabled)
    .map((i) => i.modifier)
    .reduce((a, b) => a + b, 0);
const perceptionAbilityModifier = actor.perception.modifiers
    .filter((i) => i.type === 'ability' && i.enabled)
    .map((i) => i.modifier)
    .reduce((a, b) => a + b, 0);
const perceptionProficiencyModifier = actor.perception.modifiers
    .filter((i) => i.type === 'proficiency' && i.enabled)
    .map((i) => i.modifier)
    .reduce((a, b) => a + b, 0);
const perceptionItemModifier = actor.perception.modifiers
    .filter((i) => i.type === 'item' && i.enabled)
    .map((i) => i.modifier)
    .reduce((a, b) => a + b, 0);
const perceptionModifier = pf2eHelper.quantifyNumber(actor.perception.mod - perceptionStatusModifier);
mapper.textBox('perception', fileName, 0, 403, 302, 20, 10, perceptionModifier, mf_12_centered);
mapper.textBox('perception', fileName, 0, 436, 302, 18, 10, perceptionAbilityModifier, mf_10_centered);
mapper.textBox('perception', fileName, 0, 455, 302, 17, 10, perceptionProficiencyModifier, mf_10_centered);
mapper.textBox('perception', fileName, 0, 473, 302, 17, 10, perceptionItemModifier, mf_10_centered);
mapper.textBox('perception', fileName, 0, 424, 297, 5, 5, mapper.checkMark(actor.perception.rank >= 1), mf_8_centered);
mapper.textBox('perception', fileName, 0, 424, 302, 5, 5, mapper.checkMark(actor.perception.rank >= 2), mf_8_centered);
mapper.textBox('perception', fileName, 0, 424, 308, 5, 5, mapper.checkMark(actor.perception.rank >= 3), mf_8_centered);
mapper.textBox('perception', fileName, 0, 424, 313, 5, 5, mapper.checkMark(actor.perception.rank >= 4), mf_8_centered);

let senses_notes = '';
if (semVer.gte(game.system.version, '5.12.0')) {
    senses_notes = actor.system.perception.senses
        .filter((i) => i.type)
        .map((i) => i.label)
        .concat(
            actor.system.perception.modifiers
                .filter((i) => i.type === 'item' || i.type === 'untyped')
                .map((i) => ' ' + (i.slug ? i.slug : i.label) + ' ' + (i.modifier < 0 ? '' : '+') + i.modifier)
        )
        .join(', ');
} else {
    senses_notes = actor.system.traits.senses
        .filter((i) => i.type)
        .map((i) => i.label)
        .concat(
            actor.system.attributes.perception.modifiers
                .filter((i) => i.type === 'item' || i.type === 'untyped')
                .map((i) => ' ' + (i.slug ? i.slug : i.label) + ' ' + (i.modifier < 0 ? '' : '+') + i.modifier)
        )
        .join(', ');
}
mapper.textBox('senses notes', fileName, 0, 405, 327, 84, 40, senses_notes, {
    ...mf_8,
    ...{ valign: 'top', multiline: true },
});

// speed
let speed = actor.system.attributes.speed.value + actor.system.attributes.speed.totalModifier;
const armorList = actor.items.filter((i) => i.type === 'armor' && i.isEquipped);
let armor = undefined;
let armorSpeedPenalty = 0;
if (armorList.length > 0) {
    armor = armorList[0];
    armorSpeedPenalty = armor.speedPenalty;
    if (armorSpeedPenalty < 0 && armor.strength <= actor.abilities.str.mod) {
        armorSpeedPenalty = armorSpeedPenalty + 5 > 0 ? 0 : armorSpeedPenalty + 5;
    }
}
mapper.textBox('speed', fileName, 0, 498, 298, 50, 14, speed + armorSpeedPenalty, mf_12_centered);

const special_movement =
    actor.system.attributes.speed.otherSpeeds.map((i) => ' ' + i.label + ' ' + i.value).join(', ') +
    ' \n' +
    actor.system.attributes.speed.modifiers.map(
        (i) => ' ' + (i.slug ? i.slug : i.label) + ' ' + (i.modifier < 0 ? '' : '+') + i.modifier
    );
mapper.textBox('special movement', fileName, 0, 499, 327, 84, 40, special_movement, {
    ...mf_8,
    ...{ valign: 'top', multiline: true },
});

// Strikes
let strikes = [];
actor.system.actions
    .filter((i) => i.type === 'strike' && (i.options?.includes('melee') || i.options?.includes('ranged')))
    .sort((a, b) => (a.ready > b.ready ? 1 : a.ready < b.ready ? -1 : 0))
    .reverse()
    .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0))
    .forEach((strike) => {
        strikes.push(strike);
        strikes = strikes.concat(strike.altUsages);
    });

const melee_strike_y = [408, 457, 506];
const ranged_strike_y = [570, 619];
let melee_strike_count = 0;
let ranged_strike_count = 0;
for (let i = 0; i < strikes.length; i++) {
    const strike = strikes[i];
    const isMeleeStrike = strike.options?.includes('melee') || false;
    const isRangedStrike = strike.options?.includes('ranged') || false;
    const hasFinesse = strike.item.system.traits.value.includes('finesse');
    const dexModifier = strike.modifiers
        .filter((i) => i.type === 'ability' && i.slug === 'dex' && i.enabled)
        .map((i) => i.modifier)
        .reduce((a, b) => a + b, 0);
    const strModifier = strike.modifiers
        .filter((i) => i.type === 'ability' && i.slug === 'str' && i.enabled)
        .map((i) => i.modifier)
        .reduce((a, b) => a + b, 0);
    const statusModifier = strike.modifiers
        .filter((i) => i.type === 'status' && i.enabled)
        .map((i) => i.modifier)
        .reduce((a, b) => a + b, 0);
    let traitsAndNotes = '';
    let runes = pf2eHelper.formatRunes(strike.item.system.runes);
    runes = runes !== '' ? ', ' + runes : '';
    if (strike.item.system.range != null) {
        traitsAndNotes =
            pf2eHelper.formatTraits(strike.item.system.traits.value.concat([`range-${strike.item.system.range}`])) +
            runes;
    } else {
        traitsAndNotes = pf2eHelper.formatTraits(strike.item.system.traits.value) + runes;
    }
    const strikeModifier = pf2eHelper.quantifyNumber(strike.totalModifier - statusModifier);
    const attributeName = isMeleeStrike ? (hasFinesse && dexModifier >= strModifier ? 'Dex' : 'Str') : 'Dex';
    const attributeModifier = isMeleeStrike
        ? hasFinesse && dexModifier >= strModifier
            ? dexModifier
            : strModifier
        : dexModifier;
    const proficiencyModifier = strike.modifiers
        .filter((i) => i.type === 'proficiency' && i.enabled)
        .map((i) => i.modifier)
        .reduce((a, b) => a + b, 0);
    const itemModifier = strike.modifiers
        .filter((i) => i.type === 'item' && i.enabled)
        .map((i) => i.modifier)
        .reduce((a, b) => a + b, 0);
    const damageFormula = strike.damage({ getFormula: true });
    const hasBludgeoningDamage =
        strike.item.system.damage.damageType === 'bludgeoning' ||
        strike.item.system.traits.value.includes('versatile-b') ||
        false;
    const hasPiercingDamage =
        strike.item.system.damage.damageType === 'piercing' ||
        strike.item.system.traits.value.includes('versatile-p') ||
        false;
    const hasSlashingDamage =
        strike.item.system.damage.damageType === 'slashing' ||
        strike.item.system.traits.value.includes('versatile-s') ||
        false;
    let strike_y = 0;
    const dmgParser = function (value) {
        return value.replace(/(piercing|bludgeoning|slashing)/gi, '').replace(/\s+/g, ' ');
    };
    if (isMeleeStrike) {
        if (melee_strike_count >= melee_strike_y.length) {
            continue;
        }
        strike_y = melee_strike_y[melee_strike_count];
        melee_strike_count++;
    } else if (isRangedStrike) {
        if (ranged_strike_count >= ranged_strike_y.length) {
            continue;
        }
        strike_y = ranged_strike_y[ranged_strike_count];
        ranged_strike_count++;
    }
    const strikeName = strike.label;
    let pdfNameStyle = mf_10;
    if (strikeName.length > 32) {
        pdfNameStyle = mf_6;
    } else if (strikeName.length > 20) {
        pdfNameStyle = mf_8;
    }
    let pdfTraitsStyle = mf_8;
    if (traitsAndNotes.length > 77) {
        pdfTraitsStyle = mf_6;
    }
    if (strike_y > 0) {
        ref = 'strike';
        mapper.textBox(ref, fileName, 0, 311, strike_y - 5, 84, 17, strikeName, pdfNameStyle);
        mapper.textBox(ref, fileName, 0, 404, strike_y - 5, 26, 17, strikeModifier, mf_12_centered);
        mapper.textBox(ref, fileName, 0, 436, strike_y + 1, 18, 10, attributeModifier, mf_10_centered);
        if (isMeleeStrike && attributeName !== 'Str') {
            mapper.textBox(ref, fileName, 0, 440, strike_y + 11, 10, 10, attributeName, mf_8);
        }

        mapper.textBox(ref, fileName, 0, 455, strike_y + 1, 17, 10, proficiencyModifier, mf_10_centered);
        mapper.textBox(ref, fileName, 0, 472, strike_y + 1, 17, 10, itemModifier, mf_10_centered);
        mapper.textBox(ref, fileName, 0, 499, strike_y - 5, 74, 17, damageFormula, {
            ...mf_10,
            ...{ valueParser: dmgParser },
        });
        mapper.textBox(ref, fileName, 0, 365, strike_y + 22, 219, 10, traitsAndNotes, pdfTraitsStyle);
        mapper.textBox(ref, fileName, 0, 576, strike_y, 5, 5, mapper.checkMark(hasBludgeoningDamage), mf_8_centered);
        mapper.textBox(ref, fileName, 0, 576, strike_y + 6, 5, 5, mapper.checkMark(hasPiercingDamage), mf_8_centered);
        mapper.textBox(ref, fileName, 0, 576, strike_y + 12, 5, 5, mapper.checkMark(hasSlashingDamage), mf_8_centered);
    }
}

// Weapon proficiencies
const wp_x = [314, 336, 360, 381];
['simple', 'martial', 'advanced', 'unarmed'].forEach((a, i) => {
    // Object.keys(actor.system.proficiencies?.attacks || []).forEach((a, i) => {
    const wp = actor.system.proficiencies.attacks[a].rank || 0;
    mapper.textBox('weapon proficiencies', fileName, 0, wp_x[i], 672, 6, 6, mapper.checkMark(wp >= 1), mf_8_centered);
    mapper.textBox('weapon proficiencies', fileName, 0, wp_x[i], 679, 6, 6, mapper.checkMark(wp >= 2), mf_8_centered);
    mapper.textBox('weapon proficiencies', fileName, 0, wp_x[i], 685, 6, 6, mapper.checkMark(wp >= 3), mf_8_centered);
    mapper.textBox('weapon proficiencies', fileName, 0, wp_x[i], 692, 6, 6, mapper.checkMark(wp >= 4), mf_8_centered);
});
// TODO: 'Other' weapon proficiencies
// TODO: Weapon proficiency notes
// TODO: Critical Specializations

// Class DC
const classDcStatusModifier = (actor.classDC?.modifiers || [])
    .filter((i) => i.type === 'status')
    .map((i) => i.modifier)
    .reduce((a, b) => a + b, 0);
const classDcProficiencyModifier = (actor.classDC?.modifiers || [])
    .filter((i) => i.type === 'proficiency')
    .map((i) => i.modifier)
    .reduce((a, b) => a + b, 0);
const classDcItemModifier = (actor.classDC?.modifiers || [])
    .filter((i) => i.type === 'item')
    .map((i) => i.modifier)
    .reduce((a, b) => a + b, 0);
const classDcModifier = (actor.classDC?.mod || 0) + 10 - classDcStatusModifier;
const classDcAttrModifier = actor.classDC?.attributeModifier.value || 0;
mapper.textBox('class dc', fileName, 0, 319, 705, 70, 25, classDcModifier, mf_15_centered);
mapper.textBox('class dc', fileName, 0, 336, 746, 17, 10, classDcAttrModifier, mf_10_centered);
mapper.textBox('class dc', fileName, 0, 354, 746, 17, 10, classDcProficiencyModifier, mf_10_centered);
mapper.textBox('class dc', fileName, 0, 372, 746, 18, 10, classDcItemModifier, mf_10_centered);

/* PAGE 2 */
// Ancestry and General Feats
// Ancestry and heritage Abilities
const ancestryAndHeritageAbilities = [];
actor.items
    .filter((i) => i.type === 'feat' && (i.category === 'ancestryfeature' || i.category == 'heritage'))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .forEach((a) => {
        const sub = actor.items.filter((i) => i.flags?.pf2e?.grantedBy?.id === a._id).map((i) => i.name);
        if (sub.length === 0) {
            ancestryAndHeritageAbilities.push(a.name);
        } else {
            ancestryAndHeritageAbilities.push(`${a.name} (${sub.join(', ')})`);
        }
    });
ref = 'Ancestry and heritage Abilities';
mapper.textBox(ref, fileName, 1, 49, 53, 162, 25, ancestryAndHeritageAbilities.join(', '), mf_8_multiline);

// Ancestry Feats
const ancestry_y = [86, 272, 398, 524, 650];
for (let i = 1; i <= 20; i = i + 4) {
    const feats = [];
    actor.items
        .filter((f) => f.type === 'feat' && (f.system.location === `ancestry-${i}` || (i === 1 && f.system.onlyLevel1)))
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .forEach((f) => {
            const sub = actor.items.filter((f) => f.flags?.pf2e?.grantedBy?.id === f._id).map((m) => m.name);
            if (sub.length === 0) {
                feats.push(f.name);
            } else {
                feats.push(`${f.name} (${sub.join(', ')})`);
            }
        });
    const y = ancestry_y[0];
    mapper.textBox('Ancestry feats', fileName, 1, 49, y, 162, 20, feats.join(', '), mf_8_multiline);

    ancestry_y.shift();
}

// Background Skill Feats
const backgroundSkillFeats = [];
Object.keys(actor.background?.system.items || []).forEach((b) => {
    backgroundSkillFeats.push(actor.background.system.items[b].name);
});
ref = 'background skill feats';
mapper.textBox(ref, fileName, 1, 49, 123, 162, 43, backgroundSkillFeats.join(', '), mf_8_multiline);

// Skill feats
const skill_feats_y = [176, 239, 302, 365, 428, 491, 554, 617, 680, 742];
for (let i = 2; i <= 20; i = i + 2) {
    const feats = actor.items.filter((f) => f.type === 'feat' && f.system.location === `skill-${i}`).map((m) => m.name);
    const y = skill_feats_y[0];
    mapper.textBox('skill feats', fileName, 1, 49, y, 162, 20, feats.join(', '), mf_8_multiline);

    skill_feats_y.shift();
}

// General feats
const general_feats_y = [208, 333, 460, 586, 712];
for (let i = 3; i <= 20; i = i + 4) {
    const feats = actor.items
        .filter((f) => f.type === 'feat' && f.system.location === `general-${i}`)
        .map((m) => m.name);
    const y = general_feats_y[0];
    mapper.textBox('general feats', fileName, 1, 49, y, 162, 20, feats.sort().join(', '), mf_8_multiline);

    general_feats_y.shift();
}

// Attribute boosts
const boost_y = [271, 428, 586, 743];
for (let i = 5; i <= 20; i = i + 5) {
    const y = boost_y[0];
    if (actor.system.build !== undefined) {
        const boosts = pf2eHelper.formatAttributeBoosts(actor.system.build.attributes.boosts[i]);
        mapper.textBox('attribute boosts', fileName, 1, 184, y, 27, 20, boosts, mf_6_multiline);
    }

    boost_y.shift();
}

// Class Feats and Features
const classId = actor.class?._id || 'unknown';
const classFeatsFeatures = [];
actor.items
    .filter(
        (f) =>
            f.type === 'feat' &&
            (f.system.location === classId || f.system.location === 'class-1') &&
            f.system.level.value <= 1 &&
            f.flags?.pf2e?.grantedBy?.id === undefined &&
            (f.system.category === 'classfeature' || f.system.category === 'class')
    )
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .forEach((item) => {
        const sub = actor.items.filter((f) => f.flags?.pf2e?.grantedBy?.id === item._id).map((m) => m.name);
        if (sub.length > 0 && sub.join(', ') !== item.name) {
            classFeatsFeatures.push(`${item.name} (${sub.join(', ')})`);
        } else {
            classFeatsFeatures.push(item.name);
        }
    });
ref = 'class feats and features';
mapper.textBox(ref, fileName, 1, 216, 53, 179, 113, classFeatsFeatures.join(', '), mf_8_multiline);

// Class Feats
const class_feats_y = [176, 239, 302, 365, 428, 491, 554, 617, 680, 742];
for (let i = 2; i <= 20; i = i + 2) {
    const feats = actor.items
        .filter((f) => f.type === 'feat' && [`archetype-${i}`, `class-${i}`].includes(f.system.location))
        .map((m) => m.name);
    const y = class_feats_y[0];
    mapper.textBox('class feats', fileName, 1, 216, y, 179, 20, feats.sort().join(', '), mf_8_multiline);
    class_feats_y.shift();
}

// Class Features
const class_features_y = [208, 272, 333, 398, 460, 524, 586, 650, 712];
for (let i = 3; i <= 20; i = i + 2) {
    const classFeatures = [];
    actor.items
        .filter(
            (f) =>
                f.type === 'feat' &&
                f.system.category === 'classfeature' &&
                f.system.location === classId &&
                f.system.level.value === i
        )
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .forEach((item) => {
            const sub = actor.items.filter((f) => f.flags?.pf2e?.grantedBy?.id === item._id).map((m) => m.name);
            if (sub.length > 0 && sub.join(', ') !== item.name) {
                classFeatures.push(`${item.name} (${sub.join(', ')})`);
            } else {
                classFeatures.push(item.name);
            }
        });
    const y = class_features_y[0];
    mapper.textBox('class features', fileName, 1, 216, y, 179, 20, classFeatures.sort().join(', '), mf_8_multiline);
    class_features_y.shift();
}

// Inventory
let y = 0;
// Held items
// item names shouldn't be longer than 50/45 characters
y = 48;
actor.inventory.contents
    .filter(
        (f) =>
            f.system.containerId === null &&
            f.system.stackGroup !== 'coins' &&
            f.type !== 'consumable' &&
            f.type !== 'treasure' &&
            f.system.equipped.carryType === 'held'
    )
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .forEach((item) => {
        if (y <= 180) {
            let itemName = item.name;
            const suffix = item.isMagical ? ' ‡' : '';
            const bulk = item.system.bulk.value;
            mapper.textBox('held items', fileName, 1, 406, y, 153, 10, itemName, { ...mf_8, ...{ suffix: suffix } });
            mapper.textBox('held items', fileName, 1, 566, y, 14, 10, bulk, mf_8_centered);
        } else if (y <= 190) {
            mapper.textBox('held items', fileName, 1, 406, y, 153, 10, '...', mf_8);
        }
        y = y + 10;
    });

// Consumables
y = 203;
actor.inventory.contents
    .filter((f) => f.system.containerId === null && f.system.stackGroup !== 'coins' && f.type === 'consumable')
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .forEach((item) => {
        if (y <= 340) {
            let itemName = item.system.quantity > 1 ? `${item.system.quantity} ${item.name}` : item.name;
            const suffix = item.isMagical ? ' ‡' : '';
            const bulk = item.system.bulk.value;
            mapper.textBox('consumables', fileName, 1, 406, y, 153, 10, itemName, { ...mf_8, ...{ suffix: suffix } });
            mapper.textBox('consumables', fileName, 1, 566, y, 14, 10, bulk, mf_8_centered);
        } else if (y <= 350) {
            mapper.textBox('consumables', fileName, 1, 406, y, 153, 10, '...', mf_8);
        }
        y = y + 10;
    });

// Worn items
y = 365;
actor.inventory.contents
    .filter(
        (f) =>
            f.system.containerId === null &&
            f.system.stackGroup !== 'coins' &&
            f.type !== 'consumable' &&
            f.type !== 'treasure' &&
            f.system.equipped.carryType !== 'held' &&
            f.system.equipped.carryType === 'worn'
    )
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .forEach((item) => {
        if (y <= 568) {
            let itemName = item.system.quantity > 1 ? `${item.system.quantity} ${item.name}` : item.name;
            const suffix = item.isMagical ? ' ‡' : '';
            const bulk = item.system.bulk.value;
            mapper.textBox('worn items', fileName, 1, 406, y, 120, 10, itemName, { ...mf_8, ...{ suffix: suffix } });
            mapper.textBox('worn items', fileName, 1, 530, y, 27, 10, mapper.checkMark(item.isInvested), mf_8_centered);
            mapper.textBox('worn items', fileName, 1, 566, y, 14, 10, bulk, mf_8_centered);
            y = y + 10;

            actor.inventory.contents
                .filter((f) => f.system.containerId === item._id)
                .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
                .forEach((cItem) => {
                    if (y <= 568) {
                        let cItemName =
                            cItem.system.quantity > 1
                                ? `    ${cItem.system.quantity} ${cItem.name}`
                                : `    ${cItem.name}`;
                        const cSuffix = cItem.isMagical ? ' ‡' : '';
                        const cItemInvested = cItem.isInvested ? 'X' : '';
                        const cBulk = cItem.system.bulk.value;
                        mapper.textBox('worn items', fileName, 1, 406, y, 120, 10, cItemName, {
                            ...mf_8,
                            ...{ suffix: cSuffix },
                        });
                        mapper.textBox('worn items', fileName, 1, 530, y, 27, 10, cItemInvested, mf_8_centered);
                        mapper.textBox('worn items', fileName, 1, 566, y, 14, 10, cBulk, mf_8_centered);
                    } else if (y <= 578) {
                        mapper.textBox('worn items', fileName, 1, 406, y, 120, 10, '...', mf_8);
                    }
                    y = y + 10;
                });
        } else if (y <= 578) {
            mapper.textBox('worn items', fileName, 1, 406, y, 120, 10, '...', mf_8);
            y = y + 10;
        }
    });

// Bulk
mapper.textBox('bulk', fileName, 1, 413, 610, 25, 22, actor.inventory.bulk.value.normal, mf_15_centered);

// Wealth
mapper.textBox('wealth', fileName, 1, 415, 665, 28, 20, actor.inventory.coins.cp || 0, mf_15_centered);
mapper.textBox('wealth', fileName, 1, 458, 665, 28, 20, actor.inventory.coins.sp || 0, mf_15_centered);
mapper.textBox('wealth', fileName, 1, 501, 665, 28, 20, actor.inventory.coins.gp || 0, mf_15_centered);
mapper.textBox('wealth', fileName, 1, 544, 665, 28, 20, actor.inventory.coins.pp || 0, mf_15_centered);

// Gems and Artwork
ref = 'gems and artwork';
y = 711;
actor.inventory.contents
    .filter(
        (f) =>
            f.system.containerId === null &&
            f.system.stackGroup !== 'coins' &&
            f.type !== 'consumable' &&
            f.type === 'treasure'
    )
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .forEach((item) => {
        if (y <= 752) {
            let itemName = item.system.quantity > 1 ? `${item.system.quantity} ${item.name}` : item.name;
            itemName = item.isMagical ? `${itemName} ‡` : itemName;
            const bulk = item.system.bulk.value;
            const itemPrice = [];
            ['pp', 'gp', 'sp', 'cp'].forEach((coin) => {
                if (item.system.price.value[coin] > 0) {
                    itemPrice.push(`${item.system.price.value[coin]} ${coin}`);
                }
            });

            mapper.textBox(ref, fileName, 1, 406, y, 120, 10, itemName, mf_8);
            mapper.textBox(ref, fileName, 1, 530, y, 27, 10, itemPrice.join(' '), mf_8_centered);
            mapper.textBox(ref, fileName, 1, 566, y, 14, 10, bulk, mf_8_centered);
        } else if (y <= 762) {
            mapper.textBox(ref, fileName, 1, 406, y, 120, 10, '...', mf_8);
        }
        y = y + 10;
    });

/* Page 3 */
// Origin and Appearance
mapper.textBox('ethnicity', fileName, 2, 218, 48, 59, 15, actor.system.details.ethnicity?.value || '', mf_10);
mapper.textBox('nationality', fileName, 2, 283, 48, 59, 15, actor.system.details.nationality?.value || '', mf_10);
mapper.textBox('birthplace', fileName, 2, 348, 48, 59, 15, actor.system.details.biography?.birthPlace || '', mf_10);
mapper.textBox('age', fileName, 2, 413, 48, 22, 15, actor.system.details.age?.value || '', mf_10);
mapper.textBox('gender & pronouns', fileName, 2, 440, 48, 67, 15, actor.system.details.gender?.value || '', mf_10);
mapper.textBox('height', fileName, 2, 512, 48, 31, 15, actor.system.details.height?.value || '', mf_10);
mapper.textBox('weight', fileName, 2, 549, 48, 33, 15, actor.system.details.weight?.value || '', mf_10);

mapper.textBox('appearance', fileName, 2, 218, 79, 364, 15, actor.system.details.biography?.appearance || '', mf_10);

// Personality
mapper.textBox('attitude', fileName, 2, 218, 123, 178, 15, actor.system.details.biography?.attitude || '', mf_10);
mapper.textBox('deity or philosofy', fileName, 2, 404, 123, 178, 15, actor.deity?.name || '', mf_10);
const actorEdicts = actor.system.details.biography?.edicts || '';
mapper.textBox('edicts', fileName, 2, 218, 141, 178, 70, ' '.repeat(10) + actorEdicts, mf_10_multiline);

const actorAnathema = actor.system.details.biography?.anathema || '';
mapper.textBox('edicts', fileName, 2, 404, 141, 178, 70, ' '.repeat(15) + actorAnathema, mf_10_multiline);

mapper.textBox('likes', fileName, 2, 218, 226, 364, 15, actor.system.details.biography?.likes || '', mf_10);
const actorDislikes = actor.system.details.biography?.dislikes || '';
mapper.textBox('dislikes', fileName, 2, 218, 257, 364, 15, actorDislikes, mf_10);
const actorCatchPhrases = actor.system.details.biography?.catchphrases || '';
mapper.textBox('catchphrases', fileName, 2, 218, 289, 364, 15, actorCatchPhrases, mf_10);

// /* Campaign notes Section */
const actorNotes = actor.system.details.biography?.campaignNotes || '';
mapper.textBox('campaignNotes', fileName, 2, 30, 329, 270, 96, actorNotes, mf_8_multiline);
// allies and enemies are not really good at
const actorAllies = actor.system.details.biography?.allies || '';
mapper.textBox('allies', fileName, 2, 312, 329, 270, 22, actorAllies, mf_6_multiline);
const actorEnemies = actor.system.details.biography?.enemies || '';
mapper.textBox('enemies', fileName, 2, 312, 366, 270, 22, actorEnemies, mf_6_multiline);
const actorOrganizations = actor.system.details.biography?.organizations || '';
mapper.textBox('organizations', fileName, 2, 312, 403, 270, 22, actorOrganizations, mf_8_multiline);

// Actions and activities
const actorActionsActivities_y = [454, 534, 615, 694];
actor.items
    .filter((i) => i.system.actionType?.value == 'action')
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .forEach((action) => {
        if (actorActionsActivities_y.length > 0) {
            const y = actorActionsActivities_y[0];
            const actionName = action.name;
            const actionActions = pf2eHelper.formatActivity(
                action.system.actionType.value,
                action.system.actions.value,
                pf2eHelper.pdfActionIconsGlyphs
            );
            const actionTraits = pf2eHelper.formatTraits(
                [action.system.traits.rarity].concat(action.system.traits.value)
            );
            const actionReference = pf2eHelper.abbreviateSource(
                action.system.publication?.title || action.system.source?.value || ''
            );
            let actionFrequency = '';
            if (action.frequency?.max !== undefined && action.frequency?.per !== undefined) {
                actionFrequency = `${action.frequency.max}/` + pf2eHelper.frequencyToHuman(action.frequency.per);
            }
            mapper.textBox('action name', fileName, 2, 30, y, 92, 20, actionName, mf_8_multiline);
            mapper.textBox('action actions', fileName, 2, 124, y, 35, 20, actionActions, action_10_centered_top);
            mapper.textBox('action traits', fileName, 2, 161, y, 116, 30, actionTraits, mf_8_multiline);
            mapper.textBox('action reference', fileName, 2, 279, y, 21, 20, actionReference, mf_8_multiline);
            mapper.textBox(
                'action effects',
                fileName,
                2,
                30,
                y + 29,
                271,
                38,
                actionFrequency + '\n' + action.system.description.value,
                mf_6_multiline
            );

            actorActionsActivities_y.shift();
        }
    });

const actorFreeActionsActivities_y = [454, 534, 615, 694];
actor.items
    .filter((i) => i.system.actionType?.value == 'reaction' || i.system.actionType?.value == 'free')
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .forEach((action) => {
        if (actorFreeActionsActivities_y.length > 0) {
            const y = actorFreeActionsActivities_y[0];
            const actionName = action.name;
            const isReaction = action.system.actionType.value === 'reaction' || false;
            const isFreeAction = action.system.actionType.value !== 'reaction' || false;

            const actionTraits = pf2eHelper.formatTraits(
                [action.system.traits.rarity].concat(action.system.traits.value)
            );
            const actionReference = pf2eHelper.abbreviateSource(
                action.system.publication?.title || action.system.source?.value || ''
            );
            let actionDescription = '';
            let actionTrigger = '';
            let actionEffects = '';
            if (isReaction) {
                actionDescription = action.system.description.value.split('<hr />');
                if (actionDescription[0].replace(/<strong>Trigger<\/strong>/, '') != actionDescription[0]) {
                    actionTrigger = actionDescription[0].replace(/<strong>Trigger<\/strong>/, '');
                    actionEffects = actionDescription.slice(1).join('\n');
                } else {
                    actionEffects = actionDescription.join('\n');
                }
            }
            let actionFrequency = '';
            if (action.frequency?.max !== undefined && action.frequency?.per !== undefined) {
                actionFrequency = `${action.frequency.max}/` + pf2eHelper.frequencyToHuman(action.frequency.per);
            }
            mapper.textBox('reaction name', fileName, 2, 312, y, 94, 20, actionName, mf_8_multiline);
            mapper.textBox(
                'reaction freeaction',
                fileName,
                2,
                408,
                y - 8,
                8,
                8,
                mapper.checkMark(isFreeAction),
                mf_8_centered
            );
            mapper.textBox(
                'reaction reaction',
                fileName,
                2,
                408,
                y + 2,
                8,
                8,
                mapper.checkMark(isReaction),
                mf_8_centered
            );
            mapper.textBox('reaction traits', fileName, 2, 444, y, 115, 30, actionTraits, mf_8_multiline);
            mapper.textBox('reaction reference', fileName, 2, 561, y, 21, 20, actionReference, mf_8_multiline);
            mapper.textBox('reaction trigger', fileName, 2, 312, y + 28, 270, 15, actionTrigger, mf_6_multiline);
            mapper.textBox('reaction effects', fileName, 2, 312, y + 49, 270, 18, actionEffects, mf_6_multiline);

            actorFreeActionsActivities_y.shift();
        }
    });

/*  Page 4 */
// Magical Tradition
const spellcastingTraditions = ['arcane', 'occult', 'primal', 'divine'];
const spellcastingTypes = ['prepared', 'spontaneous'];
const hasArcaneTradition =
    actor.spellcasting.filter(
        (f) => f.system?.tradition?.value == 'arcane' && spellcastingTypes.includes(f.system?.prepared?.value)
    ).length > 0;
const hasOccultTradition =
    actor.spellcasting.filter(
        (f) => f.system?.tradition?.value == 'occult' && spellcastingTypes.includes(f.system?.prepared?.value)
    ).length > 0;
const hasPrimalTradition =
    actor.spellcasting.filter(
        (f) => f.system?.tradition?.value == 'primal' && spellcastingTypes.includes(f.system?.prepared?.value)
    ).length > 0;
const hasDivineTradition =
    actor.spellcasting.filter(
        (f) => f.system?.tradition?.value == 'divine' && spellcastingTypes.includes(f.system?.prepared?.value)
    ).length > 0;
const isPreparedCaster =
    actor.spellcasting.filter(
        (f) => spellcastingTraditions.includes(f.system?.tradition.value) && f.system?.prepared?.value === 'prepared'
    ).length > 0;
const isSpontaneousCaster =
    actor.spellcasting.filter(
        (f) => spellcastingTraditions.includes(f.system?.tradition.value) && f.system?.prepared?.value === 'spontaneous'
    ).length > 0;

mapper.textBox('arcane tradition', fileName, 3, 64, 41, 10, 10, mapper.checkMark(hasArcaneTradition), mf_10_centered);
mapper.textBox('Occult tradition', fileName, 3, 72, 41, 10, 10, mapper.checkMark(hasOccultTradition), mf_10_centered);
mapper.textBox(
    'primal tradition',
    fileName,
    3,
    64,
    51,
    10,
    10,
    mapper.checkMark(hasPrimalTradition),
    mf_10_centered_top
);
mapper.textBox(
    'divine tradition',
    fileName,
    3,
    72,
    51,
    10,
    10,
    mapper.checkMark(hasDivineTradition),
    mf_10_centered_top
);

mapper.textBox('prepared caster', fileName, 3, 129, 46, 5, 5, mapper.checkMark(isPreparedCaster), mf_8_centered);
mapper.textBox('spontaneous caster', fileName, 3, 129, 56, 5, 5, mapper.checkMark(isSpontaneousCaster), mf_8_centered);

const spellProficiencyModifier = [];
const spellAttributeModifier = [];
const spellProficiencyRank = [];
const spellAttack = [];
const spellDC = [];
const spellSlots = [];
const spellCastingEntries = actor.spellcasting.filter((i) => i.type === 'spellcastingEntry');
const actorSpellRank = Math.ceil((actor?.level ?? 0) / 2);
let innateY = 672;
const innateMaxY = 752;
let focusY = 514;
const focusMaxY = 648;
const spellY = 116;
let currentSpellY = spellY;
let currentSpellX = 218;
const spellMaxY = 671;
let lastSpellTitle = '';
let cantrips_y = 176;
const cantrips_max_y = 444;
spellCastingEntries
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .forEach((sce) => {
        spellProficiencyModifier.push(
            sce.statistic.modifiers
                .filter((i) => i.type === 'proficiency')
                .map((i) => i.modifier)
                .reduce((a, b) => a + b, 0)
        );
        spellAttributeModifier.push(
            sce.statistic.modifiers
                .filter((i) => i.type === 'ability')
                .map((i) => i.modifier)
                .reduce((a, b) => a + b, 0)
        );
        const sceStatusModifier = sce.statistic.modifiers
            .filter((i) => i.type === 'status')
            .map((i) => i.modifier)
            .reduce((a, b) => a + b, 0);
        spellProficiencyRank.push(sce.system?.proficiency?.value || 0);
        spellAttack.push((sce.statistic.mod || 0) - sceStatusModifier);
        spellDC.push(10 + (sce.statistic.mod || 0) - sceStatusModifier);
        const cantrips = sce.spells.filter((f) => f.isCantrip);
        if (cantrips.length > 0) {
            mapper.textBox('cantrips', fileName, 3, 30, cantrips_y, 169, 12, sce.name, mf_10);
            cantrips_y = cantrips_y + 12;
            cantrips
                .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
                .forEach((s) => {
                    if (cantrips_y <= cantrips_max_y) {
                        const spellName = s.name;
                        const spellActions = pf2eHelper.formatSpellCastingTime(
                            s.system.time.value,
                            pf2eHelper.pdfActionIconsGlyphs
                        );
                        const spellPrepared = Object.values(sce.system.slots[`slot0`].prepared).filter(
                            (f) => f.id === s._id
                        ).length;
                        mapper.textBox('cantrips', fileName, 3, 30, cantrips_y, 132, 10, spellName, mf_8);
                        mapper.textBox(
                            'cantrips',
                            fileName,
                            3,
                            163,
                            cantrips_y,
                            24,
                            10,
                            spellActions,
                            action_8_centered
                        );
                        mapper.textBox(
                            'cantrips',
                            fileName,
                            3,
                            192,
                            cantrips_y,
                            13,
                            10,
                            'O'.repeat(spellPrepared),
                            mf_8_centered
                        );
                    }
                    cantrips_y = cantrips_y + 10;
                });
            cantrips_y = cantrips_y + 5;
        }

        for (let r = 1; r <= actorSpellRank; r++) {
            const rankSpells = sce.spells
                .filter(
                    (i) =>
                        !i.isCantrip &&
                        ((i.type !== undefined && i.rank === r) ||
                            (sce.isSpontaneous &&
                                i.system.heightening !== undefined &&
                                i.system.location?.signature === true &&
                                ((i.system.heightening.type === 'interval' &&
                                    i.rank < r &&
                                    parseInt((r - i.rank) / i.system.heightening.interval) ==
                                        (r - i.rank) / i.system.heightening.interval) ||
                                    (i.system.heightening.type === 'fixed' && i.rank < r))) ||
                            (sce.isPrepared &&
                                i.system.heightening !== undefined &&
                                ((i.system.heightening.type === 'interval' &&
                                    i.rank < r &&
                                    parseInt((r - i.rank) / i.system.heightening.interval) ==
                                        (r - i.rank) / i.system.heightening.interval) ||
                                    (i.system.heightening.type === 'fixed' && i.rank < r))))
                )
                .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
            if (rankSpells.length == 0) {
                continue;
            }
            if (sce.system.prepared.value === 'innate' && innateY <= innateMaxY) {
                // name, actions, frequency
                // mapper.textBox('innate spells', fileName, 3, 30, innateY, 116, 10, `${sce.name} - rank ${r}`, mf_8);
                // innateY = innateY + 10;

                rankSpells.forEach((s) => {
                    if (innateY <= innateMaxY) {
                        const spellName = s.name;
                        const spellActions = pf2eHelper.formatSpellCastingTime(
                            s.system.time.value,
                            pf2eHelper.pdfActionIconsGlyphs
                        );
                        // const spellFrequency =
                        mapper.textBox('innate spells', fileName, 3, 30, innateY, 116, 10, spellName, mf_8);
                        mapper.textBox(
                            'innate spells',
                            fileName,
                            3,
                            153,
                            innateY,
                            25,
                            10,
                            spellActions,
                            action_8_centered
                        );
                        // mapper.textBox('innate spells', fileName, 3, 30, innateY, 186, 20, spellFrequency, mf_8);
                    }
                    innateY = innateY + 10;
                });
                // innateY = innateY + 5;
            } else if (spellcastingTypes.includes(sce.system.prepared.value)) {
                // name, actions, rank, Prep
                // 2 columns
                spellSlots[r] = (spellSlots[r] || []).concat([sce.system.slots[`slot${r}`].max]);

                if (lastSpellTitle !== sce.name) {
                    mapper.textBox('spells', fileName, 3, currentSpellX, currentSpellY, 177, 12, `${sce.name}`, mf_10);
                    currentSpellY = currentSpellY + 12;
                    lastSpellTitle = sce.name;
                }
                rankSpells.forEach((s) => {
                    if (currentSpellY >= spellMaxY && currentSpellX === 218) {
                        currentSpellY = spellY;
                        currentSpellX = 406;
                    }
                    if (currentSpellY <= spellMaxY) {
                        let spellName = s.name;
                        const spellActions = pf2eHelper.formatSpellCastingTime(
                            s.system.time.value,
                            pf2eHelper.pdfActionIconsGlyphs
                        );
                        const spellTags = [];
                        if (
                            s.system.heightening !== undefined &&
                            s.system.heightening.type === 'fixed' &&
                            s.rank != r
                        ) {
                            const heightened = r - s.rank;
                            //spellName = `${spellName} (+${heightened})`;
                            spellTags.push(`+${heightened}`);
                        } else if (
                            s.system.heightening !== undefined &&
                            s.system.heightening.type === 'interval' &&
                            s.rank != r
                        ) {
                            const heightened = (r - s.rank) / s.system.heightening.interval;
                            //spellName = `${spellName} (+${heightened})`;
                            spellTags.push(`+${heightened}`);
                        }

                        if (s.system.location?.signature === true) {
                            spellTags.push(`S`);
                        }

                        if (spellTags.length > 0) {
                            spellName = spellName + ' (' + spellTags.join(', ') + ')';
                        }

                        const spellPrepared = Object.values(sce.system.slots[`slot${r}`].prepared).filter(
                            (i) => i.id === s._id
                        ).length;
                        mapper.textBox(
                            'spell name',
                            fileName,
                            3,
                            currentSpellX,
                            currentSpellY,
                            105,
                            10,
                            spellName,
                            mf_8
                        );
                        mapper.textBox(
                            'spell actions',
                            fileName,
                            3,
                            currentSpellX + 107,
                            currentSpellY,
                            25,
                            10,
                            spellActions,
                            action_8_centered
                        );
                        mapper.textBox(
                            'spell rank',
                            fileName,
                            3,
                            currentSpellX + 139,
                            currentSpellY,
                            16,
                            10,
                            r,
                            mf_8_centered
                        );
                        mapper.textBox(
                            'spell rank',
                            fileName,
                            3,
                            currentSpellX + 162,
                            currentSpellY,
                            14,
                            10,
                            'O'.repeat(spellPrepared),
                            mf_8_centered
                        );
                    }
                    currentSpellY = currentSpellY + 10;
                });
                currentSpellY = currentSpellY + 5;
            } else if (sce.system.prepared.value === 'focus' && focusY <= focusMaxY) {
                // name, actions
                rankSpells.forEach((s) => {
                    if (focusY <= focusMaxY) {
                        const spellName = s.name;
                        const spellActions = pf2eHelper.formatSpellCastingTime(
                            s.system.time.value,
                            pf2eHelper.pdfActionIconsGlyphs
                        );
                        mapper.textBox('focus spell name', fileName, 3, 30, focusY, 146, 10, spellName, mf_8);
                        mapper.textBox(
                            'focus spell actions',
                            fileName,
                            3,
                            181,
                            focusY,
                            25,
                            10,
                            spellActions,
                            action_8_centered
                        );
                    }
                    focusY = focusY + 10;
                });
            } else {
                // unknown!
            }
        }
    });
const sceIndex = spellProficiencyRank.indexOf(Math.max(...spellProficiencyRank));

// Spell Attack
mapper.textBox('spell attack', fileName, 3, 29, 95, 21, 21, spellAttack[sceIndex], mf_15_centered);

mapper.textBox(
    'spell attack attr modifier',
    fileName,
    3,
    70,
    101,
    17,
    10,
    spellAttributeModifier[sceIndex],
    mf_12_centered
);
mapper.textBox(
    'spell attack prof modifier',
    fileName,
    3,
    88,
    101,
    17,
    10,
    spellProficiencyModifier[sceIndex],
    mf_12_centered
);
mapper.textBox(
    'spell attack prof rank',
    fileName,
    3,
    57,
    100,
    5,
    5,
    mapper.checkMark(spellProficiencyRank[sceIndex] >= 1),
    mf_8_centered
);
mapper.textBox(
    'spell attack prof rank',
    fileName,
    3,
    57,
    105,
    5,
    5,
    mapper.checkMark(spellProficiencyRank[sceIndex] >= 2),
    mf_8_centered
);
mapper.textBox(
    'spell attack prof rank',
    fileName,
    3,
    57,
    111,
    5,
    5,
    mapper.checkMark(spellProficiencyRank[sceIndex] >= 3),
    mf_8_centered
);
mapper.textBox(
    'spell attack prof rank',
    fileName,
    3,
    57,
    116,
    5,
    5,
    mapper.checkMark(spellProficiencyRank[sceIndex] >= 4),
    mf_8_centered
);

mapper.textBox('spell DC', fileName, 3, 114, 95, 21, 21, spellDC[sceIndex], mf_15_centered);

mapper.textBox(
    'spell dc attr modifier',
    fileName,
    3,
    173,
    101,
    17,
    10,
    spellAttributeModifier[sceIndex],
    mf_12_centered
);
mapper.textBox(
    'spell dc prof modifier',
    fileName,
    3,
    191,
    101,
    17,
    10,
    spellProficiencyModifier[sceIndex],
    mf_12_centered
);

mapper.textBox(
    'spell dc prof rank',
    fileName,
    3,
    142,
    100,
    5,
    5,
    mapper.checkMark(spellProficiencyRank[sceIndex] >= 1),
    mf_8_centered
);
mapper.textBox(
    'spell dc prof rank',
    fileName,
    3,
    142,
    105,
    5,
    5,
    mapper.checkMark(spellProficiencyRank[sceIndex] >= 2),
    mf_8_centered
);
mapper.textBox(
    'spell dc prof rank',
    fileName,
    3,
    142,
    111,
    5,
    5,
    mapper.checkMark(spellProficiencyRank[sceIndex] >= 3),
    mf_8_centered
);
mapper.textBox(
    'spell dc prof rank',
    fileName,
    3,
    142,
    116,
    5,
    5,
    mapper.checkMark(spellProficiencyRank[sceIndex] >= 4),
    mf_8_centered
);

// cantrips
// cantrips per day
const cantripSlots = Math.max(
    ...actor.spellcasting
        .filter(
            (i) =>
                spellcastingTraditions.includes(i.system?.tradition?.value) &&
                spellcastingTypes.includes(i.system?.prepared?.value)
        )
        .map((i) => i.spells.entry.system.slots.slot0.max)
);
mapper.textBox('cantrips per day', fileName, 3, 90, 142, 24, 15, cantripSlots, mf_12_centered);

// cantrip rank
const cantripRank = actorSpellRank;
mapper.textBox('cantrip rank', fileName, 3, 184, 142, 24, 15, cantripRank, mf_12_centered);

// Focus points
// actor.system.resources.focus.max >= 1
mapper.textBox(
    'focus point 1',
    fileName,
    3,
    80,
    467,
    12,
    12,
    mapper.checkMark(actor.system.resources.focus.max >= 1),
    mf_10_centered
);
mapper.textBox(
    'focus point 2',
    fileName,
    3,
    93,
    467,
    12,
    12,
    mapper.checkMark(actor.system.resources.focus.max >= 2),
    mf_10_centered
);
mapper.textBox(
    'focus point 3',
    fileName,
    3,
    106,
    467,
    12,
    12,
    mapper.checkMark(actor.system.resources.focus.max >= 3),
    mf_10_centered
);

// focus rank
const focusSpellRank = actorSpellRank;
mapper.textBox('focus spell rank', fileName, 3, 184, 467, 24, 15, focusSpellRank, mf_12_centered);

// Rituals
const rituals = actor.items.filter((f) => f.system.ritual !== undefined);

const ritualY = 707;
let currentRitualY = ritualY;
const ritualMaxY = 752;
let currentRitualX = 218;
rituals
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .forEach((r) => {
        if (currentRitualY >= ritualMaxY && currentRitualX === 218) {
            currentRitualY = ritualY;
            currentRitualX = 406;
        }
        if (currentRitualY <= ritualMaxY) {
            const ritualName = r.name;
            const ritualRank = r.rank;
            const ritualCost = r.system.cost.value;
            mapper.textBox('ritual name', fileName, 3, currentRitualX, currentRitualY, 132, 10, ritualName, mf_8);
            mapper.textBox(
                'ritual name',
                fileName,
                3,
                currentRitualX + 137,
                currentRitualY,
                19,
                10,
                ritualRank,
                mf_8_centered
            );
            mapper.textBox('ritual name', fileName, 3, currentRitualX + 162, currentRitualY, 24, 10, ritualCost, mf_8);
        }
        currentRitualY = currentRitualY + 10;
    });

// Spell Slots
// Spells per day
const spellsPerDay = [0, 277, 308, 340, 371, 403, 434, 466, 497, 529, 560];
spellSlots.forEach((r, i) => {
    let pdfStyle = mf_12_centered;
    if (r.length > 2) {
        pdfStyle = mf_10_centered;
    } else if (r.length > 6) {
        pdfStyle = mf_8_centered;
    } else if (r.length > 4) {
        pdfStyle = mf_6_centered;
    }
    mapper.textBox('focus spell rank', fileName, 3, spellsPerDay[i], 41, 23, 15, r.join('/'), pdfStyle);
});

export { mapper };
