import { pdfProvider } from '../../scripts/lib/providers/PDFProvider.js';
import { genericHelper } from '../../scripts/lib/helpers/GenericHelper.js';

const getSizeModifiier = function (size) {
    //pf1.config.sizeMods
    if (Object.keys(pf1.config.sizeMods).includes(size)) {
        return pf1.config.sizeMods[size];
    }

    return 0;
};
const mapper = new pdfProvider(actor);
// mapper.debugProvider = true;
mapper.defaultFont('MarkerFelt.ttf', 12, 14);
mapper.defaultFontColor('#01579b');

// Font definitions
const mf_default = {};
const f_debug = { debug: true };
const mf_4 = { ...mf_default, ...{ size: 4, lineHeight: 6 } };
const mf_4_multiline = { ...mf_4, ...{ multiline: true, valign: 'top' } };
const mf_8 = { ...mf_default, ...{ size: 8, lineHeight: 10 } };
const mf_8_multiline = { ...mf_8, ...{ multiline: true, valign: 'top' } };
const mf_8_centered = { ...mf_8, ...{ halign: 'center' } };
const mf_8_middle = { ...mf_8, ...{ valign: 'middle' } };
const mf_8_centered_middle = { ...mf_8_centered, ...mf_8_middle };
const mf_8_top = { ...mf_8, ...{ valign: 'top' } };
const mf_10 = { ...mf_default, ...{ size: 10, lineHeight: 12 } };
const mf_10_multiline = { ...mf_10, ...{ multiline: true, valign: 'top' } };
const mf_10_centered = { ...mf_10, ...{ halign: 'center' } };
const mf_10_middle = { ...mf_10, ...{ valign: 'middle' } };
const mf_10_centered_middle = { ...mf_10_centered, ...mf_10_middle };
const mf_12 = { ...mf_default, ...{ size: 12, lineHeight: 14 } };
const mf_12_centered = { ...mf_12, ...{ halign: 'center' } };
const mf_12_middle = { ...mf_12, ...{ valign: 'middle' } };
const mf_12_centered_middle = { ...mf_12_centered, ...mf_12_middle };
const mf_16 = { ...mf_default, ...{ size: 16, lineHeight: 18 } };
const mf_16_centered = { ...mf_16, ...{ halign: 'center' } };
const mf_16_middle = { ...mf_16, ...{ valign: 'middle' } };
const mf_16_centered_middle = { ...mf_16_centered, ...mf_16_middle };

let fileNames;
let ref;

fileNames = ['pfrpg-CharacterSheet.pdf'];
mapper.textBox('character name', fileNames, 0, 240, 39, 125, 14, actor.name, mf_12);
mapper.textBox('alignment', fileNames, 0, 371, 39, 42, 14, actor.system.details.alignment, mf_12);

const playerName = Object.entries(actor.permission)
    .filter((entry) => entry[1] === 3)
    .map((entry) => entry[0])
    .map((id) => (!game.users.get(id)?.isGM ? game.users.get(id)?.name : null))
    .filter((x) => x)
    .join(', ');
mapper.textBox('player', fileNames, 0, 421, 39, 136, 14, playerName, mf_12);

const classLevels = actor.items
    .filter((f) => f.type === 'class' && f.system.level > 0)
    .map((m) => `${m.name} ${m.system.level}`)
    .join(' / ');
const characterLevel = actor.system.attributes.hd.total;
mapper.textBox('classes', fileNames, 0, 240, 58, 174, 14, `${characterLevel} (${classLevels})`, mf_12);
mapper.textBox('Deity', fileNames, 0, 421, 58, 77, 14, actor.system.details.deity, mf_12);

if (actor.items.filter((f) => f.type === 'race').map((m) => m.name).length > 0) {
    const race = actor.items.filter((f) => f.type === 'race').map((m) => m.name)[0];
    const size = actor.system.traits.size;
    mapper.textBox('race', fileNames, 0, 240, 78, 80, 14, race, mf_12);
    mapper.textBox('size', fileNames, 0, 323, 78, 30, 14, size, mf_12);
}

mapper.textBox('size', fileNames, 0, 358, 78, 29, 14, actor.system.details.gender, mf_12);
mapper.textBox('size', fileNames, 0, 392, 78, 23, 14, actor.system.details.age, mf_12);
mapper.textBox('size', fileNames, 0, 421, 78, 33, 14, actor.system.details.height, mf_12);
mapper.textBox('size', fileNames, 0, 458, 78, 36, 14, actor.system.details.weight, mf_12);
// hair
// eyes

let abilityY = 119;
Object.keys(actor.system.abilities).forEach((a) => {
    const ability = actor.system.abilities[a];
    mapper.textBox(`${a} score`, fileNames, 0, 70, abilityY, 20, 12, ability.value, mf_10_centered_middle);
    const modifier = genericHelper.quantifyNumber(ability.mod);
    mapper.textBox(`${a} modifier`, fileNames, 0, 98, abilityY, 20, 12, modifier, mf_10_centered_middle);

    abilityY = abilityY + 17.5;
});
mapper.textBox('HP total', fileNames, 0, 223, 109, 50, 16, actor.system.attributes.hp.max, mf_12);

// TODO: check DR, as it is an array
// mapper.textBox('DR', fileNames, 0, 278, 111, 34, 16, actor.system.traits.dr , mf_12);

mapper.textBox('current HP', fileNames, 0, 181, 138, 130, 14, actor.system.attributes.hp.value, mf_12);
mapper.textBox('nonlethal HP', fileNames, 0, 181, 180, 130, 14, actor.system.attributes.hp.nonlethal, mf_12);

const baseLandSpeed = actor.system.attributes.speed.land.base;
mapper.textBox('Base speed', fileNames, 0, 363, 109, 30, 16, baseLandSpeed, mf_12);
mapper.textBox('Base speed', fileNames, 0, 400, 109, 28, 16, Math.floor(baseLandSpeed / 5), mf_12);

const armoredLandSpeed = actor.system.attributes.speed.land.total;
mapper.textBox('Armored speed', fileNames, 0, 443, 109, 29, 16, armoredLandSpeed, mf_12);
mapper.textBox('Armored speed', fileNames, 0, 479, 109, 29, 16, Math.floor(armoredLandSpeed / 5), mf_12);

const flySpeed = actor.system.attributes.speed.fly.total;
if (flySpeed > 0) {
    mapper.textBox('fly speed', fileNames, 0, 319, 133, 34, 16, actor.system.attributes.speed.fly.total, mf_12);
    mapper.textBox('fly speed', fileNames, 0, 359, 133, 33, 16, flySpeed, mf_12);
}
const swimSpeed = actor.system.attributes.speed.swim.total;
if (swimSpeed > 0) {
    mapper.textBox('swim speed', fileNames, 0, 397, 133, 29, 16, swimSpeed, mf_12);
}
const climbSpeed = actor.system.attributes.speed.climb.total;
if (climbSpeed > 0) {
    mapper.textBox('climb speed', fileNames, 0, 438, 133, 29, 16, climbSpeed, mf_12);
}
const burrowSpeed = actor.system.attributes.speed.burrow.total;
if (burrowSpeed > 0) {
    mapper.textBox('burrow speed', fileNames, 0, 479, 133, 29, 16, burrowSpeed, mf_12);
}

mapper.textBox('initiative', fileNames, 0, 238, 207, 20, 12, actor.system.attributes.init.total, mf_10_centered);
const initAbilityModifier = actor.system.abilities[actor.system.attributes.init.ability].mod;
mapper.textBox('initiative', fileNames, 0, 265, 207, 20, 12, initAbilityModifier, mf_10_centered);
const initBonusModifier = actor.system.attributes.init.total - initAbilityModifier;
mapper.textBox('initiative', fileNames, 0, 292, 207, 20, 12, initBonusModifier, mf_10_centered);

// AC
mapper.textBox('ac', fileNames, 0, 70, 235, 19, 12, actor.system.attributes.ac.normal.total, mf_10_centered);
const acAbilityModifier = actor.system.abilities[actor.system.attributes.ac.normal.ability].mod;
mapper.textBox('ac', fileNames, 0, 176, 235, 19, 12, acAbilityModifier, mf_10_centered);
const armorAC = actor.items
    .filter((f) => f.type === 'equipment' && f.subType === 'armor' && f.isActive)
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .map((m) => m.system.armor.value)
    .reduce((a, b) => a + b, 0);
const shieldAC = actor.items
    .filter((f) => f.type === 'equipment' && f.subType === 'shield' && f.isActive)
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .map((m) => m.system.armor.value)
    .reduce((a, b) => a + b, 0);
mapper.textBox('armor ac', fileNames, 0, 119, 235, 19, 12, armorAC, mf_10_centered);
mapper.textBox('shield ac', fileNames, 0, 147, 235, 19, 12, shieldAC, mf_10_centered);

const sizeModifier = getSizeModifiier(actor.system.traits.size);
mapper.textBox('size ac', fileNames, 0, 205, 235, 19, 12, sizeModifier, mf_10_centered);

mapper.textBox('touch ac', fileNames, 0, 69, 263, 19, 12, actor.system.attributes.ac.touch.total, mf_10_centered);
const flatfootedAC = actor.system.attributes.ac.flatFooted.total;
mapper.textBox('flatfooted ac', fileNames, 0, 155, 263, 19, 12, flatfootedAC, mf_10_centered);
// TODO:
// mapper.field('all', 'Natural Armor', actor.system.attributes.naturalAC);
// mapper.field(
//     'all',
//     'AC Misc Modifier',
//     Math.floor(
//         actor.system.attributes.ac.normal.total -
//             actor.system.attributes.naturalAC -
//             10
//     )
// );

let saveY = 297;
Object.keys(actor.system.attributes.savingThrows).forEach((s) => {
    const save = actor.system.attributes.savingThrows[s];
    mapper.textBox(`${s} save`, fileNames, 0, 106, saveY, 20, 11, save.total, mf_10_centered);
    const baseSave = actor.items
        .filter((i) => i.data.type === 'class')
        .map((m) => m.system.savingThrows[s].base)
        .reduce((a, b) => a + b, 0);
    mapper.textBox(`${s} base save`, fileNames, 0, 134, saveY, 20, 11, baseSave, mf_10_centered);

    const saveAbilityModifier = actor.system.abilities[save.ability].mod;
    mapper.textBox(`${s} save modifier`, fileNames, 0, 162, saveY, 20, 11, saveAbilityModifier, mf_10_centered);
    saveY = saveY + 17;
});

mapper.textBox('save notes', fileNames, 0, 271, 289, 41, 54, actor.system.attributes.saveNotes, mf_8_multiline);

mapper.textBox('bab', fileNames, 0, 174, 351, 33, 12, actor.system.attributes.bab.total, mf_10_centered);
mapper.textBox('spell resistance', fileNames, 0, 281, 351, 20, 12, actor.system.attributes.sr.total, mf_10_centered);

mapper.textBox('cmb total', fileNames, 0, 128, 371, 25, 12, actor.system.attributes.cmb.total, mf_10_centered);
mapper.textBox('cmb base', fileNames, 0, 163, 371, 19, 12, actor.system.attributes.bab.total, mf_10_centered);
mapper.textBox('cmb str', fileNames, 0, 193, 371, 19, 12, actor.system.abilities.str.mod, mf_10_centered);
mapper.textBox('cmb size', fileNames, 0, 223, 371, 19, 12, sizeModifier, mf_10_centered);

mapper.textBox('cmd total', fileNames, 0, 128, 399, 25, 12, actor.system.attributes.cmd.total, mf_10_centered);
mapper.textBox('cmd base', fileNames, 0, 163, 399, 19, 12, actor.system.attributes.bab.total, mf_10_centered);
mapper.textBox('cmd str', fileNames, 0, 193, 399, 19, 12, actor.system.abilities.str.mod, mf_10_centered);
mapper.textBox('cmd dex', fileNames, 0, 223, 399, 19, 12, actor.system.abilities.dex.mod, mf_10_centered);
mapper.textBox('cmd size', fileNames, 0, 254, 399, 19, 12, sizeModifier, mf_10_centered);

const weapons = actor.items
    .filter((i) => i.type === 'weapon')
    .sort((a, b) => (a.system.equipped < b.system.equipped ? -1 : a.system.equipped > b.system.equipped ? 1 : 0))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
const weaponY = [439, 502, 565, 627, 690];
for (let i = 0; i < weapons.length; i++) {
    const w = weapons[i];
    const weaponType = w.system.weaponSubtype;
    const weaponActions = w.system.actions;
    for (let a = 0; a < weaponActions.length; a++) {
        let y;
        if (weaponY.length > 0) {
            y = weaponY[0];
        }
        if (typeof y === 'undefined') {
            continue;
        }
        mapper.textBox('wp', fileNames, 0, 28, y, 181, 16, w.name, mf_12_centered_middle);
        const action = weaponActions[a];
        const actionAbilityAttackModifier = actor.system.abilities[action.ability.attack].mod;
        const actionAttackModifier = action.conditionals
            .map((m) => m.modifiers.filter((f) => f.target === 'attack').map((m) => m.formula))
            .flat()
            .map((m) => parseInt(m))
            .reduce((a, b) => a + b, 0);
        const actionAbilityDamageModifier = actor.system.abilities[action.ability.damage].mod;
        const weaponAttackBonus = genericHelper.quantifyNumber(
            actor.system.attributes.bab.total + actionAbilityAttackModifier + actionAttackModifier
        );
        let damageFormula;
        if (action.damage.parts[0].formula.startsWith('sizeRoll')) {
            const formula = action.damage.parts[0].formula.replace('@', 'actor.');
            damageFormula = eval(`pf1.utils.rollPreProcess.${formula}`);
        }
        const damage =
            `${damageFormula[0].number}d${damageFormula[0].faces} ` +
            genericHelper.quantifyNumber(actionAbilityDamageModifier) +
            ' ' +
            action.damage.parts[0].type.values.join(',');

        mapper.textBox('wp attack bonus', fileNames, 0, 210, y, 64, 16, weaponAttackBonus, mf_10_centered_middle);
        mapper.textBox('wp crit', fileNames, 0, 275, y, 37, 16, action.ability.critRange, mf_10_centered_middle);

        mapper.textBox('wp subtype', fileNames, 0, 28, y + 25, 32, 16, weaponType, mf_10_centered_middle);
        if (Number(action.range) > 0) {
            const range = `${action.range} (${action.maxIncrements})`;
            mapper.textBox('wp range', fileNames, 0, 61, y + 25, 47, 16, range, mf_10_centered_middle);
        }
        mapper.textBox('wp damage', fileNames, 0, 210, y + 25, 102, 16, damage, mf_10_centered_middle);
        weaponY.shift();
    }
}

// skills
const skillY = [
    195, 206, 218, 229, 241, 252, 263, 275, 286, 298, 309, 320, 332, 343, 355, 366, 378, 389, 400, 412, 423, 435, 446,
    457, 469, 480, 492, 503, 514, 526, 537, 549, 560, 572, 583, 594, 606, 617, 629,
];
const skipSkills = ['art', 'lor'];
Object.keys(actor.system.skills).forEach((s) => {
    let y;
    if (!skipSkills.includes(s) && skillY.length > 0) {
        y = skillY[0];
    }
    if (typeof y !== 'undefined') {
        const skill = actor.system.skills[s];
        const skillModifier = genericHelper.quantifyNumber(skill.mod);
        const isClassSkill = genericHelper.evalCheckMark(skill.cs);
        const skillAbilityModifier = actor.system.abilities[skill.ability].mod;
        const skillRankModifier = skill.rank * 2;
        const skillMiscModifier = skillModifier - skillAbilityModifier - skillRankModifier;
        const skillSubSkills = skill.subSkills || {};
        if (s === 'crf') {
            // TODO: subskills crf1...n
            const keys = Object.keys(skillSubSkills);
            let subSkillCount = 0;
            for (let i = 0; i < keys.length; i++) {
                if (subSkillCount >= 3) {
                    continue;
                }
                y = skillY[0];
                const subSkillName = skillSubSkills[keys[i]].name;
                const subSkillModifier = skillSubSkills[keys[i]].mod;
                const subSkillAbilityModifier = actor.system.abilities[skillSubSkills[keys[i]].ability].mod;
                const subSkillRankModifier = skillSubSkills[keys[i]].rank * 2;
                const subSkillMiscModifier = subSkillModifier - subSkillAbilityModifier - subSkillRankModifier;
                mapper.textBox('subSkill cs', fileNames, 0, 318, y, 6, 10, isClassSkill, mf_8_centered);
                mapper.textBox('subSkill name', fileNames, 0, 354, y, 75, 10, subSkillName, mf_8);
                mapper.textBox('subSkill modifier', fileNames, 0, 435, y, 21, 10, subSkillModifier, mf_8_centered);
                mapper.textBox(
                    'subSkill ability',
                    fileNames,
                    0,
                    484,
                    y,
                    21,
                    10,
                    subSkillAbilityModifier,
                    mf_8_centered
                );
                mapper.textBox('subSkill rank', fileNames, 0, 515, y, 21, 10, subSkillRankModifier, mf_8_centered);
                mapper.textBox('subSkill misc', fileNames, 0, 546, y, 21, 10, subSkillMiscModifier, mf_8_centered);
                skillY.shift();
                subSkillCount++;
            }
            for (let i = 0; i < 3 - subSkillCount; i++) {
                skillY.shift();
            }
        } else if (s === 'prf') {
            // TODO: subskills prf1...n
            const keys = Object.keys(skillSubSkills);
            let subSkillCount = 0;
            for (let i = 0; i < keys.length; i++) {
                if (subSkillCount >= 2) {
                    continue;
                }
                y = skillY[0];
                const subSkillName = skillSubSkills[keys[i]].name;
                const subSkillModifier = skillSubSkills[keys[i]].mod;
                const subSkillAbilityModifier = actor.system.abilities[skillSubSkills[keys[i]].ability].mod;
                const subSkillRankModifier = skillSubSkills[keys[i]].rank * 2;
                const subSkillMiscModifier = subSkillModifier - subSkillAbilityModifier - subSkillRankModifier;
                mapper.textBox('subSkill cs', fileNames, 0, 318, y, 6, 10, isClassSkill, mf_8_centered);
                mapper.textBox('subSkill name', fileNames, 0, 367, y, 64, 10, subSkillName, mf_8);
                mapper.textBox('subSkill modifier', fileNames, 0, 435, y, 21, 10, subSkillModifier, mf_8_centered);
                mapper.textBox(
                    'subSkill ability',
                    fileNames,
                    0,
                    484,
                    y,
                    21,
                    10,
                    subSkillAbilityModifier,
                    mf_8_centered
                );
                mapper.textBox('subSkill rank', fileNames, 0, 515, y, 21, 10, subSkillRankModifier, mf_8_centered);
                mapper.textBox('subSkill misc', fileNames, 0, 546, y, 21, 10, subSkillMiscModifier, mf_8_centered);
                skillY.shift();
                subSkillCount++;
            }
            for (let i = 0; i < 2 - subSkillCount; i++) {
                skillY.shift();
            }
        } else if (s === 'pro') {
            // TODO: subskills pr01...n
            const keys = Object.keys(skillSubSkills);
            let subSkillCount = 0;
            for (let i = 0; i < keys.length; i++) {
                if (subSkillCount >= 2) {
                    continue;
                }
                y = skillY[0];
                const subSkillName = skillSubSkills[keys[i]].name;
                const subSkillModifier = skillSubSkills[keys[i]].mod;
                const subSkillAbilityModifier = actor.system.abilities[skillSubSkills[keys[i]].ability].mod;
                const subSkillRankModifier = skillSubSkills[keys[i]].rank * 2;
                const subSkillMiscModifier = subSkillModifier - subSkillAbilityModifier - subSkillRankModifier;
                mapper.textBox('subSkill cs', fileNames, 0, 318, y, 6, 10, isClassSkill, mf_8_centered);
                mapper.textBox('subSkill name', fileNames, 0, 378, y, 53, 10, subSkillName, mf_8);
                mapper.textBox('subSkill modifier', fileNames, 0, 435, y, 21, 10, subSkillModifier, mf_8_centered);
                mapper.textBox(
                    'subSkill ability',
                    fileNames,
                    0,
                    484,
                    y,
                    21,
                    10,
                    subSkillAbilityModifier,
                    mf_8_centered
                );
                mapper.textBox('subSkill rank', fileNames, 0, 515, y, 21, 10, subSkillRankModifier, mf_8_centered);
                mapper.textBox('subSkill misc', fileNames, 0, 546, y, 21, 10, subSkillMiscModifier, mf_8_centered);
                skillY.shift();
                subSkillCount++;
            }
            for (let i = 0; i < 2 - subSkillCount; i++) {
                skillY.shift();
            }
        } else {
            mapper.textBox('skill cs', fileNames, 0, 318, y, 6, 10, isClassSkill, mf_8_centered);
            mapper.textBox('skill modifier', fileNames, 0, 435, y, 21, 10, skillModifier, mf_8_centered);
            mapper.textBox('skill ability', fileNames, 0, 484, y, 21, 10, skillAbilityModifier, mf_8_centered);
            mapper.textBox('skill rank', fileNames, 0, 515, y, 21, 10, skillRankModifier, mf_8_centered);
            mapper.textBox('skill misc', fileNames, 0, 546, y, 21, 10, skillMiscModifier, mf_8_centered);
            skillY.shift();
        }
    }
});

//const languages = actor.system.traits.languages.total.map((m) => m.capitalize()).join(', ');
const languages = actor.system.traits.languages.customTotal
    .split(';')
    .map((m) => m.capitalize())
    .join(', ');
mapper.textBox('languages', fileNames, 0, 318, 700, 250, 33, languages, mf_8_top);

// page 2
const armorSubTypes = ['armor', 'shield'];
const armorItems = actor.items
    .filter((f) => f.type === 'equipment' && armorSubTypes.includes(f.subType) && f.isActive)
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

const armorY = [59, 77, 95, 114, 132];
for (let i = 0; i < armorItems.length; i++) {
    let y;
    if (armorY.length > 0) {
        y = armorY[0];
    }
    if (typeof y !== 'undefined') {
        const armorItem = armorItems[i];
        const armorBonus = genericHelper.quantifyNumber(armorItem.system.armor.value);
        const armorType = armorItem.system.equipmentSubtype;
        const armorPenalty = armorItem.system.armor.acp;
        const armorSpellFailure = armorItem.system.spellFailure;
        const armorWeight = armorItem.system.weight.value;
        mapper.textBox('armor', fileNames, 1, 35, y, 112, 17, armorItem.name, mf_12_middle);
        mapper.textBox('armor bonus', fileNames, 1, 148, y, 32, 17, armorBonus, mf_12_centered_middle);
        mapper.textBox('armor type', fileNames, 1, 181, y, 48, 17, armorType, mf_12_centered_middle);
        mapper.textBox('armor penalty', fileNames, 1, 230, y, 49, 17, armorPenalty, mf_12_centered_middle);
        mapper.textBox('armor sf', fileNames, 1, 280, y, 43, 17, armorSpellFailure, mf_12_centered_middle);
        mapper.textBox('armor weight', fileNames, 1, 324, y, 36, 17, armorWeight, mf_12_centered_middle);
        armorY.shift();
    }
}

const gearTypes = ['consumable', 'container', 'equipment', 'loot', 'weapon'];
const gearItems = actor.items
    .filter((f) => gearTypes.includes(f.type))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

const gearY = [
    200, 215, 228, 243, 260, 274, 288, 303, 317, 331, 345, 360, 376, 391, 404, 419, 433, 448, 462, 476, 493, 508, 521,
    536, 550, 565,
];
for (let i = 0; i < gearItems.length; i++) {
    let y;
    if (gearY.length > 0) {
        y = gearY[0];
    } else {
        continue;
    }
    const gearItem = gearItems[i];
    let gearDisplayName = gearItem.name;
    if (gearItem.system.quantity > 1) {
        gearDisplayName = `${gearItem.system.quantity} ${gearItem.name}`;
    }
    if (gearItem.system.quantity > 0) {
        mapper.textBox('gear', fileNames, 1, 36, y, 114, 14, gearDisplayName, mf_8_middle);
        mapper.textBox('gear', fileNames, 1, 151, y, 16, 14, gearItem.system.weight.value, mf_8_centered_middle);
        gearY.shift();
    }
}
const gearTotalWeight = actor.system.attributes.encumbrance.carriedWeight;
mapper.textBox('gear', fileNames, 1, 151, 578, 16, 14, gearTotalWeight, mf_8_centered_middle);

const gearLightLoad = actor.system.attributes.encumbrance.levels.light;
const gearMediumLoad = actor.system.attributes.encumbrance.levels.medium;
const gearHeavyLoad = actor.system.attributes.encumbrance.levels.heavy;
const gearCarryLoad = actor.system.attributes.encumbrance.levels.carry;
const gearDragLoad = actor.system.attributes.encumbrance.levels.drag;
mapper.textBox('light load', fileNames, 1, 71, 600, 22, 13, gearLightLoad, mf_8_centered_middle);
mapper.textBox('medium load', fileNames, 1, 71, 618, 22, 13, gearMediumLoad, mf_8_centered_middle);
mapper.textBox('heady load', fileNames, 1, 71, 636, 22, 13, gearHeavyLoad, mf_8_centered_middle);
mapper.textBox('lift over head', fileNames, 1, 142, 600, 22, 13, gearHeavyLoad, mf_8_centered_middle);
mapper.textBox('lift off ground', fileNames, 1, 142, 618, 22, 13, gearCarryLoad, mf_8_centered_middle);
mapper.textBox('Drag or push', fileNames, 1, 142, 636, 22, 13, gearDragLoad, mf_8_centered_middle);

const coinCP = actor.system.currency.cp;
const coinSP = actor.system.currency.sp;
const coinGP = actor.system.currency.gp;
const coinPP = actor.system.currency.pp;
mapper.textBox('cp', fileNames, 1, 51, 672, 22, 10, coinCP, mf_8);
mapper.textBox('sp', fileNames, 1, 51, 686, 22, 10, coinSP, mf_8);
mapper.textBox('gp', fileNames, 1, 51, 699, 22, 10, coinGP, mf_8);
mapper.textBox('pp', fileNames, 1, 51, 714, 22, 10, coinPP, mf_8);

const feats = actor.items
    .filter((f) => f.type === 'feat' && f.subType === 'feat')
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .map((m) => m.name);

mapper.textBox('feats', fileNames, 1, 180, 197, 243, 175, feats.join(', '), {
    ...mf_8_multiline,
    ...{ lineHeight: 13 },
});

const abilitySubtypes = ['classFeat', 'trait'];
const specialAbilities = actor.items
    .filter((f) => f.type === 'feat' && abilitySubtypes.includes(f.subType))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .map((m) => m.name);

mapper.textBox('special abilities', fileNames, 1, 180, 399, 243, 294, specialAbilities.join(', '), {
    ...mf_8_multiline,
    ...{ lineHeight: 13 },
});

const xpCurrent = actor.system.details.xp.value;
mapper.textBox('current xp', fileNames, 1, 181, 714, 159, 21, xpCurrent, mf_16_centered_middle);

// spells
const spellsY = [84, 100, 118, 135, 153, 169, 188, 204, 222, 239];
for (let i = 0; i < spellsY.length; i++) {
    let y = spellsY[i];
    const maxSpells = actor.system.attributes.spells.spellbooks.primary.spells[`spell${i}`].max;
    const spellDC = 10 + i + actor.system.abilities[actor.system.attributes.spells.spellbooks.primary.ability].mod;
    // actor.system.attributes.spells.spellbooks.primary.ability
    if (maxSpells > 0) {
        mapper.textBox(`spells per day ${i}`, fileNames, 1, 523, y, 19, 10, maxSpells, mf_8_centered_middle);
        mapper.textBox(`spell save dc ${i}`, fileNames, 1, 461, y, 19, 10, spellDC, mf_8_centered_middle);
        const knownSpells = actor.system.attributes.spells.spellbooks.primary.spells[`spell${i}`].known.max;
        const preparedSpells = actor.system.attributes.spells.spellbooks.primary.spells[`spell${i}`].preparation.max;
        if (knownSpells > 0) {
            mapper.textBox(`spells known ${i}`, fileNames, 1, 431, y, 19, 10, knownSpells, mf_8_centered_middle);
        } else {
            mapper.textBox(`spells known ${i}`, fileNames, 1, 431, y, 19, 10, preparedSpells, mf_8_centered_middle);
        }
    }
}

const spellListY = [
    { y: 321, height: 55, lines: 8 },
    { y: 384, height: 55, lines: 8 },
    { y: 447, height: 47, lines: 7 },
    { y: 500, height: 41, lines: 6 },
    { y: 550, height: 35, lines: 5 },
    { y: 591, height: 27, lines: 4 },
    { y: 625, height: 27, lines: 4 },
    { y: 660, height: 27, lines: 4 },
    { y: 694, height: 21, lines: 3 },
    { y: 722, height: 15, lines: 2 },
];
for (let i = 0; i < spellListY.length; i++) {
    const y = spellListY[i].y;
    const height = spellListY[i].height;

    const spells = actor.items
        .filter((f) => f.type === 'spell' && f.system.level === i)
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    let spellList;
    if (spells.length > 8) {
        spellList = spells
            .map((m) => m.name)
            .slice(0, 7)
            .concat(['...'])
            .join('\n');
    } else {
        spellList = spells
            .map((m) => m.name)
            .slice(0, 7)
            .join('\n');
    }
    for (let s = 0; s < spells.length; s++) {
        mapper.textBox(`spelllist ${i}`, fileNames, 1, 430, y, 159, height, spellList, mf_4_multiline);
    }
}

export { mapper };
