import { pdfProvider } from '../../scripts/lib/providers/PDFProvider.js';
import { PF2eHelper } from '../../scripts/lib/helpers/PF2eHelper.js';
import { semVer } from '../../scripts/lib/SemVer.js';

// actor is available as a global variable
// game is available as a global variable

// helper functions
class pf2ePDFProvider extends pdfProvider {
    // field(file, fieldName, value, options) {
    //     console.log('fieldName:', fieldName);
    //     console.log('value:', value);
    //     super.field(file, fieldName, value, options);
    // }

    getAttacks(actor, domain) {
        let field_prefix = '';
        if (domain === 'ranged-attack-roll') {
            field_prefix = 'ranged';
        } else if (domain === 'melee-attack-roll') {
            field_prefix = 'melee';
        } else {
            this.notify('error', `getAttacks: an invalid domain was specified: ${domain}`);
            return false;
        }

        actor.system.actions
            .filter(
                (i) =>
                    i.type === 'strike' &&
                    (i.domains?.includes(domain) || i.altUsages?.filter((f) => f.domains?.includes(domain)).length > 0)
            )
            .sort((a, b) => (a.ready > b.ready ? 1 : a.ready < b.ready ? -1 : 0))
            .reverse()
            .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0))
            .forEach((attack, index) => {
                let cur_attack = {};
                if (attack.domains.includes(domain)) {
                    cur_attack = attack;
                } else if (attack.altUsages.filter((i) => i.domains.includes(domain)).length > 0) {
                    cur_attack = attack.altUsages.filter((i) => i.domains.includes(domain))[0];
                }
                let label = cur_attack.label;
                let attribute_modifier = cur_attack.modifiers
                    .filter((i) => i.type === 'ability')
                    .map((i) => i.modifier)
                    .reduce((a, b) => a + b, 0);
                let proficiency_modifier = cur_attack.modifiers
                    .filter((i) => i.type === 'proficiency')
                    .map((i) => i.modifier)
                    .reduce((a, b) => a + b, 0);
                let item_modifier = cur_attack.modifiers
                    .filter((i) => i.type === 'item' && i.enabled)
                    .map((i) => i.modifier)
                    .reduce((a, b) => a + b, 0);
                let status_modifier = cur_attack.modifiers
                    .filter((i) => i.type === 'status' && i.enabled)
                    .map((i) => i.modifier)
                    .reduce((a, b) => a + b, 0);
                let total_modifier = cur_attack.totalModifier - status_modifier;
                let damage = `${cur_attack.item.system.damage.dice}${cur_attack.item.system.damage.die}` || '-';
                let bludgeoning_damage =
                    cur_attack.item.system.damage.damageType === 'bludgeoning' ||
                    cur_attack.item.system.traits.value.includes('versatile-b') ||
                    false;
                let piercing_damage =
                    cur_attack.item.system.damage.damageType === 'piercing' ||
                    cur_attack.item.system.traits.value.includes('versatile-p') ||
                    false;
                let slashing_damage =
                    cur_attack.item.system.damage.damageType === 'slashing' ||
                    cur_attack.item.system.traits.value.includes('versatile-s') ||
                    false;
                let traits_notes = '';
                let runes = PF2eHelper.formatRunes(cur_attack.item.system.runes);
                runes = runes !== '' ? ', ' + runes : '';
                if (cur_attack.item.system.range != null) {
                    traits_notes =
                        PF2eHelper.formatTraits(
                            cur_attack.item.system.traits.value.concat([`range-${cur_attack.item.system.range}`])
                        ) + runes;
                } else {
                    traits_notes = PF2eHelper.formatTraits(cur_attack.item.system.traits.value) + runes;
                }

                if (attribute_modifier != 0) {
                    damage = damage + PF2eHelper.quantifyNumber(attribute_modifier);
                }
                this.field('all', `${field_prefix}${index + 1}_name`, label);
                this.field('all', `${field_prefix}${index + 1}_attack`, PF2eHelper.quantifyNumber(total_modifier));
                this.field('all', `${field_prefix}${index + 1}_attribute_modifier`, attribute_modifier);
                this.field('all', `${field_prefix}${index + 1}_proficiency_modifier`, proficiency_modifier);
                this.field('all', `${field_prefix}${index + 1}_item_modifier`, item_modifier);
                this.field('all', `${field_prefix}${index + 1}_damage`, damage);
                this.field('all', `${field_prefix}${index + 1}_bludgeoning_damage`, bludgeoning_damage);
                this.field('all', `${field_prefix}${index + 1}_piercing_damage`, piercing_damage);
                this.field('all', `${field_prefix}${index + 1}_slashing_damage`, slashing_damage);
                this.field(
                    'all',
                    `${field_prefix}${index + 1}_traits_notes`,
                    `                          ${traits_notes}`
                );
            });
    }
}

const spellcasting_traditions = ['arcane', 'occult', 'primal', 'divine'];
const spellcasting_types = ['prepared', 'spontaneous'];
const actor_spell_rank = Math.ceil((actor?.level ?? 0) / 2);

const mapper = new pf2ePDFProvider(actor);

// override the download name of the charactersheet
// mapper.actorName = actor.name;

// x and y coordinates are relative to the top left of the page
mapper.image('pf2e-remastered.pdf', 2, 29, 39, actor.img, 178, 265);

/* Ancestry Section*/
mapper.field('all', 'ancestry', actor.ancestry?.name || '');
mapper.field('all', 'heritage_and_traits', actor.heritage?.name || '');
mapper.field('all', 'size', actor.system.traits.size.value);

/* Character Name Section*/
mapper.field('all', 'character_name', actor.name);
mapper.field(
    'all',
    'player_name',
    Object.entries(actor.ownership)
        .filter((i) => i[1] === 3)
        .map((i) => i[0])
        .map((id) => (!game.users.get(id)?.isGM ? game.users.get(id)?.name : null))
        .filter((x) => x)
        .join(', ')
);

/* Background Section */
mapper.field('all', 'background', actor.background?.name || '');
/* FIXME: complete background notes */
mapper.field('all', 'background_notes', '');

/* Level Section */
mapper.field('all', 'level', actor.system.details.level.value);
mapper.field('all', 'xp', actor.system.details.xp?.value || '');

/* Class Section */
mapper.field('all', 'class', actor.class?.name || '');
/* FIXME: complete class notes */
mapper.field('all', 'class_notes', '');

/* attributes Section */
Object.keys(actor.abilities).forEach((a) => {
    mapper.field('all', a, PF2eHelper.quantifyNumber(actor.abilities[a].mod));
    mapper.field('all', `${a}_partial`, PF2eHelper.isPartialBoost(actor, a));
});

/* Defenses Section*/

/* Armor Class */
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

mapper.field('all', 'ac', actor.armorClass.value - acStatusModifier);
mapper.field('all', 'ac_attribute_modifier', acAttributeModifier);
mapper.field('all', 'ac_proficiency_modifier', acProficiencyModifier);
mapper.field('all', 'ac_item_modifier', acItemModifier);

/* Shield */
mapper.field(
    'all',
    'ac_shield_bonus',
    actor.items.filter((i) => i.type === 'shield' && i.isEquipped).map((i) => i.system.acBonus)[0] || ''
);
mapper.field(
    'all',
    'shield_hardness',
    actor.items.filter((i) => i.type === 'shield' && i.isEquipped).map((i) => i.system.hardness)[0] || '-'
);
mapper.field(
    'all',
    'shield_max_hp',
    actor.items.filter((i) => i.type === 'shield' && i.isEquipped).map((i) => i.system.hp.max)[0] || '-'
);
mapper.field(
    'all',
    'shield_bt',
    actor.items.filter((i) => i.type === 'shield' && i.isEquipped).map((i) => i.system.hp.brokenThreshold)[0] || '-'
);
mapper.field(
    'all',
    'shield_current_hp',
    actor.items.filter((i) => i.type === 'shield' && i.isEquipped).map((i) => i.system.hp.value)[0] || '-'
);

/* Armor proficiencies */
Object.keys(actor.system.proficiencies?.defenses || []).forEach((d) => {
    mapper.field('all', `defense_${d}_trained`, actor.system.proficiencies.defenses[d].rank >= 1 || false);
    mapper.field('all', `defense_${d}_expert`, actor.system.proficiencies.defenses[d].rank >= 2 || false);
    mapper.field('all', `defense_${d}_master`, actor.system.proficiencies.defenses[d].rank >= 3 || false);
    mapper.field('all', `defense_${d}_legendary`, actor.system.proficiencies.defenses[d].rank >= 4 || false);
});

/* Saving Throws */
Object.keys(actor.saves).forEach((s) => {
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
    mapper.field('all', `${s}`, actor.saves[s].mod - saveStatusModifier);
    mapper.field('all', `${s}_attribute_modifier`, saveAttributeModifier);
    mapper.field('all', `${s}_proficiency_modifier`, saveProficiencyModifier);
    mapper.field('all', `${s}_item_modifier`, saveItemModifier);
    mapper.field('all', `${s}_trained`, actor.saves[s].rank >= 1 || false);
    mapper.field('all', `${s}_expert`, actor.saves[s].rank >= 2 || false);
    mapper.field('all', `${s}_master`, actor.saves[s].rank >= 3 || false);
    mapper.field('all', `${s}_legendary`, actor.saves[s].rank >= 4 || false);
});

/* Hit Points Section*/
mapper.field('all', 'hp_max', actor.hitPoints.max);
mapper.field('all', 'hp_current', actor.hitPoints.value);
mapper.field('all', 'hp_temp', actor.hitPoints.temp);
mapper.field('all', 'dying_1', actor.system.attributes.dying.value >= 1 || false);
mapper.field('all', 'dying_2', actor.system.attributes.dying.value >= 2 || false);
mapper.field('all', 'dying_3', actor.system.attributes.dying.value >= 3 || false);
mapper.field('all', 'dying_4', actor.system.attributes.dying.value >= 4 || false);
mapper.field('all', 'wounded', actor.system.attributes.wounded.value + '/' + actor.system.attributes.wounded.max);
mapper.field(
    'all',
    'resistances_immunities',
    ' '.repeat(44) +
        actor.system.attributes.resistances
            .map((i) => i.type + ' ' + i.value)
            .concat(actor.system.attributes.immunities.map((i) => i.type))
            .sort()
            .join(', ')
);
mapper.field('all', 'conditions', actor.conditions.map((i) => i.name).join(', '));

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
    defense_notes.push(`${b.label} ${PF2eHelper.quantifyNumber(b.modifier)} (saves)`);
});
fortitude_bonus.forEach((b) => {
    defense_notes.push(`${b.label} ${PF2eHelper.quantifyNumber(b.modifier)} (fort)`);
});
reflex_bonus.forEach((b) => {
    defense_notes.push(`${b.label} ${PF2eHelper.quantifyNumber(b.modifier)} (ref)`);
});
will_bonus.forEach((b) => {
    defense_notes.push(`${b.label} ${PF2eHelper.quantifyNumber(b.modifier)} (will)`);
});
mapper.field('all', 'defense_notes', ' '.repeat(25) + defense_notes.join(', '));

/* Skills */
Object.values(actor.skills)
    .filter((i) => !i.lore)
    .forEach((skill) => {
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
        mapper.field('all', `${skill.slug}`, PF2eHelper.quantifyNumber(skill.mod - skillStatusModifier));
        mapper.field('all', `${skill.slug}_attribute_modifier`, skill.attributeModifier.modifier || '0');
        mapper.field('all', `${skill.slug}_proficiency_modifier`, skillProficiencyModifier);
        mapper.field('all', `${skill.slug}_item_modifier`, skillItemModifier);
        mapper.field('all', `${skill.slug}_armor_modifier`, skillArmorModifier);
        mapper.field('all', `${skill.slug}_trained`, skill.rank >= 1 || false);
        mapper.field('all', `${skill.slug}_expert`, skill.rank >= 2 || false);
        mapper.field('all', `${skill.slug}_master`, skill.rank >= 3 || false);
        mapper.field('all', `${skill.slug}_legendary`, skill.rank >= 4 || false);
    });

/* Lore Skills */
Object.values(actor.skills)
    .filter((i) => i.lore)
    .forEach((skill, index) => {
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
        mapper.field('all', `lore${index + 1}`, PF2eHelper.quantifyNumber(skill.mod - skillStatusModifier));
        mapper.field('all', `lore${index + 1}_subcategory`, skill.label);
        mapper.field('all', `lore${index + 1}_attribute_modifier`, skill.attributeModifier.modifier || '0');
        mapper.field('all', `lore${index + 1}_proficiency_modifier`, skillProficiencyModifier);
        mapper.field('all', `lore${index + 1}_item_modifier`, skillItemModifier);
        mapper.field('all', `lore${index + 1}_armor_modifier`, skillArmorModifier);
        mapper.field('all', `lore${index + 1}_trained`, skill.rank >= 1 || false);
        mapper.field('all', `lore${index + 1}_expert`, skill.rank >= 2 || false);
        mapper.field('all', `lore${index + 1}_master`, skill.rank >= 3 || false);
        mapper.field('all', `lore${index + 1}_legendary`, skill.rank >= 4 || false);
    });

/* Skill Notes */
let skill_notes = [];
const assurance = actor.items
    .filter((i) => i.slug === 'assurance')
    .map((i) => i.rules.filter((f) => f.prompt === 'PF2E.SpecificRule.Prompt.Skill').map((m) => m.selection))
    .flat(1)
    .map((i) => PF2eHelper.capitalize(i));
if (assurance.length > 0) {
    skill_notes.push('Assurance: ' + assurance.join(', '));
}
mapper.field('all', 'skill_notes', skill_notes.join('\n'));

/* Languages Section */
if (semVer.gte(game.system.version, '5.12.0')) {
    //if (actor.system.details.languages !== undefined) {
    mapper.field(
        'all',
        'languages',
        actor.system.details.languages.value
            .filter(function (a) {
                return a.trim() != '';
            })
            .join(', ')
    );
} else {
    // pre pf2e v5.12.0
    mapper.field(
        'all',
        'languages',
        actor.system.traits.languages.value
            .concat([actor.system.traits.languages.custom])
            .filter(function (a) {
                return a.trim() != '';
            })
            .join(', ')
    );
}

/* Perception Section  */
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
    .filter((i) => i.type === 'proficiency' && i.enabled)
    .map((i) => i.modifier)
    .reduce((a, b) => a + b, 0);
mapper.field('all', 'perception', PF2eHelper.quantifyNumber(actor.perception.mod - perceptionStatusModifier));
mapper.field('all', 'perception_attribute_modifier', perceptionAbilityModifier);
mapper.field('all', 'perception_proficiency_modifier', perceptionProficiencyModifier);
mapper.field('all', 'perception_item_modifier', perceptionItemModifier);
mapper.field('all', 'perception_trained', actor.perception.rank >= 1 || '');
mapper.field('all', 'perception_expert', actor.perception.rank >= 2 || '');
mapper.field('all', 'perception_master', actor.perception.rank >= 3 || '');
mapper.field('all', 'perception_legendary', actor.perception.rank >= 4 || '');

if (semVer.gte(game.system.version, '5.12.0')) {
    //if (actor.system.perception.senses !== undefined) {
    mapper.field(
        'all',
        'senses_notes',
        actor.system.perception.senses
            .filter((i) => i.type)
            .map((i) => i.label)
            .concat(
                actor.system.perception.modifiers
                    .filter((i) => i.type === 'item' || i.type === 'untyped')
                    .map((i) => ' ' + (i.slug ? i.slug : i.label) + ' ' + (i.modifier < 0 ? '' : '+') + i.modifier)
            )
            .join(', ')
    );
} else {
    mapper.field(
        'all',
        'senses_notes',
        actor.system.traits.senses
            .filter((i) => i.type)
            .map((i) => i.label)
            .concat(
                actor.system.attributes.perception.modifiers
                    .filter((i) => i.type === 'item' || i.type === 'untyped')
                    .map((i) => ' ' + (i.slug ? i.slug : i.label) + ' ' + (i.modifier < 0 ? '' : '+') + i.modifier)
            )
            .join(', ')
    );
}

/* Speed Section */
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

mapper.field('all', 'speed', speed + armorSpeedPenalty);
mapper.field(
    'all',
    'special_movement',
    actor.system.attributes.speed.otherSpeeds.map((i) => ' ' + i.label + ' ' + i.value).join(', ') +
        ' \n' +
        actor.system.attributes.speed.modifiers
            .map((i) => ' ' + (i.slug ? i.slug : i.label) + ' ' + (i.modifier < 0 ? '' : '+') + i.modifier)
            .join(', ')
);

/* Strikes */
/* Melee strikes range from 0-2 */
mapper.getAttacks(actor, 'melee-attack-roll');

/* Ranged strikes range from 0-1 */
mapper.getAttacks(actor, 'ranged-attack-roll');

/* Weapon Proficiencies */
Object.keys(actor.system.proficiencies?.attacks || []).forEach((a) => {
    mapper.field('all', `attack_${a}_trained`, actor.system.proficiencies.attacks[a].rank >= 1 || false);
    mapper.field('all', `attack_${a}_expert`, actor.system.proficiencies.attacks[a].rank >= 2 || false);
    mapper.field('all', `attack_${a}_master`, actor.system.proficiencies.attacks[a].rank >= 3 || false);
    mapper.field('all', `attack_${a}_legendary`, actor.system.proficiencies.attacks[a].rank >= 4 || false);
});
/* This is probably not needed */
mapper.field('all', 'attack_other_trained', false);
mapper.field('all', 'attack_other_expert', false);
mapper.field('all', 'attack_other_master', false);
mapper.field('all', 'attack_other_legendary', false);

/* FIXME: fill out attack_other_notes */
mapper.field('all', 'attack_other_notes', '');
/* FIXME: fill out critical_specializations */
mapper.field('all', 'critical_specializations', '');

/* Class DC Section */
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
mapper.field('all', 'class_dc', (actor.classDC?.mod || 0) + 10 - classDcStatusModifier);
mapper.field('all', 'class_dc_attribute_modifier', actor.classDC?.attributeModifier.value || 0);
mapper.field('all', 'class_dc_proficiency_modifier', classDcProficiencyModifier);
mapper.field('all', 'class_dc_item_modifier', classDcItemModifier);

/* Ancestry and General Feats Section*/
mapper.field(
    'all',
    '1_ancestry_hertitage_abilities',
    actor.items
        .filter((i) => i.type === 'feat' && (i.category === 'ancestryfeature' || i.category == 'heritage'))
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .map((i) => i.name)
        .join(', ')
);
mapper.field(
    'all',
    '1_ancestry_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'ancestry-1').map((i) => i.name)[0] || ''
);
mapper.field(
    'all',
    '1_background_skill_feat',
    Object.keys(actor.background?.system.items || []).length > 0
        ? actor.background.system.items[Object.keys(actor.background.system.items)[0]].name
        : ''
);
mapper.field(
    'all',
    '2_skill_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'skill-2').map((i) => i.name)[0] || ''
);
mapper.field(
    'all',
    '3_general_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'general-3').map((i) => i.name)[0] || ''
);
mapper.field(
    'all',
    '4_skill_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'skill-4').map((i) => i.name)[0] || ''
);
mapper.field(
    'all',
    '5_ancestry_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'ancestry-5').map((i) => i.name)[0] || ''
);
if (actor.system.build !== undefined) {
    mapper.field('all', '5_boosts', PF2eHelper.formatAttributeBoosts(actor.system.build.attributes.boosts[5]));
}
mapper.field(
    'all',
    '6_skill_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'skill-6').map((i) => i.name)[0] || ''
);
mapper.field(
    'all',
    '7_general_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'general-7').map((i) => i.name)[0] || ''
);
mapper.field(
    'all',
    '8_skill_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'skill-8').map((i) => i.name)[0] || ''
);
mapper.field(
    'all',
    '9_ancestry_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'ancestry-9').map((i) => i.name)[0] || ''
);
mapper.field(
    'all',
    '10_skill_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'skill-10').map((i) => i.name)[0] || ''
);
mapper.field('all', '10_boosts', PF2eHelper.formatAttributeBoosts(actor.system.build?.attributes.boosts[10]));
mapper.field(
    'all',
    '11_general_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'general-11').map((i) => i.name)[0] || ''
);
mapper.field(
    'all',
    '12_skill_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'skill-12').map((i) => i.name)[0] || ''
);
mapper.field(
    'all',
    '13_ancestry_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'ancestry-13').map((i) => i.name)[0] || ''
);
mapper.field(
    'all',
    '14_skill_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'skill-14').map((i) => i.name)[0] || ''
);
mapper.field(
    'all',
    '15_general_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'general-15').map((i) => i.name)[0] || ''
);
mapper.field('all', '15_boosts', PF2eHelper.formatAttributeBoosts(actor.system.build?.attributes.boosts[15]));
mapper.field(
    'all',
    '16_skill_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'skill-16').map((i) => i.name)[0] || ''
);
mapper.field(
    'all',
    '17_ancestry_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'ancestry-17').map((i) => i.name)[0] || ''
);
mapper.field(
    'all',
    '18_skill_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'skill-18').map((i) => i.name)[0] || ''
);
mapper.field(
    'all',
    '19_general_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'general-19').map((i) => i.name)[0] || ''
);
mapper.field(
    'all',
    '20_skill_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'skill-20').map((i) => i.name)[0] || ''
);
mapper.field('all', '20_boosts', PF2eHelper.formatAttributeBoosts(actor.system.build?.attributes.boosts[20]));

/* Class Abilities Section */
mapper.field(
    'all',
    '1_class_feats_features',
    actor.items
        .filter(
            (i) =>
                i.type === 'feat' &&
                i.system.level.value === 1 &&
                (i.system.category === 'classfeature' || i.system.category === 'class')
        )
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .map((i) => i.name)
        .join(', ') || ''
);
mapper.field(
    'all',
    '2_class_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'class-2').map((i) => i.name)[0] || ''
);
mapper.field(
    'all',
    '3_class_feature',
    actor.items
        .filter((i) => i.type === 'feat' && i.system.category === 'classfeature' && i.system.level.value === 3)
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .map((i) => i.name)
        .join(', ') || ''
);
mapper.field(
    'all',
    '4_class_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'class-4').map((i) => i.name)[0] || ''
);
mapper.field(
    'all',
    '5_class_feature',
    actor.items
        .filter((i) => i.type === 'feat' && i.system.category === 'classfeature' && i.system.level.value === 5)
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .map((i) => i.name)
        .join(', ') || ''
);
mapper.field(
    'all',
    '6_class_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'class-6').map((i) => i.name)[0] || ''
);
mapper.field(
    'all',
    '7_class_feature',
    actor.items
        .filter((i) => i.type === 'feat' && i.system.category === 'classfeature' && i.system.level.value === 7)
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .map((i) => i.name)
        .join(', ') || ''
);
mapper.field(
    'all',
    '8_class_feat',
    actor.items.filter((i) => i.type === 'feat' && i.system.location === 'class-8').map((i) => i.name)[0] || ''
);
mapper.field(
    'all',
    '9_class_feature',
    actor.items
        .filter((i) => i.type === 'feat' && i.system.category === 'classfeature' && i.system.level.value === 9)
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .map((i) => i.name)
        .join(', ') || ''
);
mapper.field(
    'all',
    '10_class_feat',
    actor.items
        .filter((i) => i.type === 'feat' && i.system.location === 'class-10')
        .map((i) => i.name)
        .join(', ') || ''
);
mapper.field(
    'all',
    '11_class_feature',
    actor.items
        .filter((i) => i.type === 'feat' && i.system.category === 'classfeature' && i.system.level.value === 11)
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .map((i) => i.name)
        .join(', ') || ''
);
mapper.field(
    'all',
    '12_class_feat',
    actor.items
        .filter((i) => i.type === 'feat' && i.system.location === 'class-12')
        .map((i) => i.name)
        .join(', ') || ''
);
mapper.field(
    'all',
    '13_class_feature',
    actor.items
        .filter((i) => i.type === 'feat' && i.system.category === 'classfeature' && i.system.level.value === 13)
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .map((i) => i.name)
        .join(', ') || ''
);
mapper.field(
    'all',
    '14_class_feat',
    actor.items
        .filter((i) => i.type === 'feat' && i.system.location === 'class-14')
        .map((i) => i.name)
        .join(', ') || ''
);
mapper.field(
    'all',
    '15_class_feature',
    actor.items
        .filter((i) => i.type === 'feat' && i.system.category === 'classfeature' && i.system.level.value === 15)
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .map((i) => i.name)
        .join(', ') || ''
);
mapper.field(
    'all',
    '16_class_feat',
    actor.items
        .filter((i) => i.type === 'feat' && i.system.location === 'class-16')
        .map((i) => i.name)
        .join(', ') || ''
);
mapper.field(
    'all',
    '17_class_feature',
    actor.items
        .filter((i) => i.type === 'feat' && i.system.category === 'classfeature' && i.system.level.value === 17)
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .map((i) => i.name)
        .join(', ') || ''
);
mapper.field(
    'all',
    '18_class_feat',
    actor.items
        .filter((i) => i.type === 'feat' && i.system.location === 'class-18')
        .map((i) => i.name)
        .join(', ') || ''
);
mapper.field(
    'all',
    '19_class_feature',
    actor.items
        .filter((i) => i.type === 'feat' && i.system.category === 'classfeature' && i.system.level.value === 18)
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .map((i) => i.name)
        .join(', ') || ''
);
mapper.field(
    'all',
    '20_class_feat',
    actor.items
        .filter((i) => i.type === 'feat' && i.system.location === 'class-20')
        .map((i) => i.name)
        .join(', ') || ''
);

/* Inventory Section */
let held_index = 0;
let consumable_index = 0;
let worn_index = 0;
let treasure_index = 0;
actor.inventory.contents
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .forEach((item) => {
        if (item.type === 'consumable') {
            /* Consumables */
            mapper.field(
                'all',
                `consumable${consumable_index}_name`,
                (item.system.quantity > 1 ? item.system.quantity + ' ' : '') +
                    item.name +
                    (item.isMagical ? ' ‡ ' : ' ')
            );
            mapper.field('all', `consumable${consumable_index}_bulk`, item.system.bulk.value);
            consumable_index++;
        } else if (item.system.usage.type === 'held') {
            /* Held items */
            mapper.field(
                'all',
                `held_item${held_index}_name`,
                (item.system.quantity > 1 ? item.system.quantity + ' ' : '') +
                    item.name +
                    (item.isMagical ? ' ‡ ' : ' ')
            );
            mapper.field('all', `held_item${held_index}_bulk`, item.system.bulk.value);
            held_index++;
        } else if (item.system.usage.type === 'worn') {
            /* Worn items */
            mapper.field(
                'all',
                `worn_item${worn_index}_name`,
                (item.system.quantity > 1 ? item.system.quantity + ' ' : '') +
                    item.name +
                    (item.isMagical ? ' ‡ ' : ' ')
            );
            mapper.field('all', `worn_item${worn_index}_invested`, item.isInvested);
            mapper.field('all', `worn_item${worn_index}_bulk`, item.system.bulk.value);
            worn_index++;
        } else if (item.type === 'treasure' && item.system.usage.type === 'carried') {
            /* Gems and artwork */
            let price = [];
            ['pp', 'gp', 'sp', 'cp'].forEach((t) => {
                if (item.system.price.value[t] > 0) {
                    price.push(`${item.system.price.value[t]} ${t}`);
                }
            });
            mapper.field(
                'all',
                `gems_artwork${treasure_index}_name`,
                (item.system.quantity > 1 ? item.system.quantity + ' ' : '') + item.name + (item.isMagical ? ' ‡ ' : '')
            );
            mapper.field('all', `gems_artwork${treasure_index}_price`, price.join(', '));
            mapper.field('all', `gems_artwork${treasure_index}_bulk`, item.system.bulk.value);
            treasure_index++;
        }
    });

mapper.field('all', 'bulk', actor.inventory.bulk.value.normal);
mapper.field('all', 'copper', actor.inventory.coins.cp || 0);
mapper.field('all', 'silver', actor.inventory.coins.sp || 0);
mapper.field('all', 'gold', actor.inventory.coins.gp || 0);
mapper.field('all', 'platinum', actor.inventory.coins.pp || 0);

/* Origin and Appearance Section */
mapper.field('all', 'ethnicity', actor.system.details.ethnicity?.value || '');
mapper.field('all', 'nationality', actor.system.details.nationality?.value || '');
mapper.field('all', 'birthplace', actor.system.details.biography?.birthPlace || '');
mapper.field('all', 'age', actor.system.details.age?.value || '');
mapper.field('all', 'gender_pronouns', actor.system.details.gender?.value || '');
mapper.field('all', 'height', actor.system.details.height?.value || '');
mapper.field('all', 'weight', actor.system.details.weight?.value || '');
mapper.field(
    'all',
    'Appearance',
    actor.system.details.biography?.appearance.replace('<p>', '').replace('</p>', '') || ''
);

/* Personality Section */
mapper.field('all', 'attitude', actor.system.details.biography?.attitude || '');
mapper.field('all', 'deity_philosophy', actor.deity?.name || '');
mapper.field('all', 'edicts', actor.system.details.biography?.edicts || '');
mapper.field('all', 'anathema', actor.system.details.biography?.anathema || '');
mapper.field('all', 'likes', actor.system.details.biography?.likes || '');
mapper.field('all', 'dislikes', actor.system.details.biography?.dislikes || '');
mapper.field('all', 'catchphrases', actor.system.details.biography?.catchphrases || '');

/* Campaign notes Section */
mapper.field(
    'all',
    'campaign_notes',
    actor.system.details.biography?.campaignNotes.replace('<p>', '').replace('</p>', '') || ''
);
mapper.field('all', 'allies', actor.system.details.biography?.allies.replace('<p>', '').replace('</p>', '') || '');
mapper.field('all', 'enemies', actor.system.details.biography?.enemies.replace('<p>', '').replace('</p>', '') || '');
mapper.field(
    'all',
    'organizations',
    actor.system.details.biography?.organaizations?.replace('<p>', '').replace('</p>', '') || ''
);

/* Actions and Activities */
/* ranges from 0-8 in PDF*/
actor.items
    .filter((i) => i.system.actionType?.value == 'action')
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .forEach((action, index) => {
        if (index < 9) {
            let frequency =
                (action.frequency?.max || '') + '/' + PF2eHelper.frequencyToHuman(action.frequency?.per || '');
            if (typeof action.frequency?.max === 'undefined' && typeof action.frequency?.per === 'undefined') {
                frequency = '';
            }
            mapper.field('all', `activity${index + 1}_name`, action.name);
            mapper.field(
                'all',
                `activity${index + 1}_action_count`,
                PF2eHelper.actionsToSymbols(action.system.actions.value)
            );
            mapper.field(
                'all',
                `activity${index + 1}_traits`,
                PF2eHelper.formatTraits([action.system.traits.rarity].concat(action.system.traits.value))
            );
            mapper.field('all', `activity${index + 1}_frequency`, frequency);
            mapper.field(
                'all',
                `activity${index + 1}_reference`,
                PF2eHelper.abbreviateSource(action.system.publication?.title || action.system.source?.value || '')
            );
        }
    });

/* Reactions and Free actions */
/* ranges from 9-16 in PDF*/
actor.items
    .filter((i) => i.system.actionType?.value == 'reaction' || i.system.actionType?.value == 'free')
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .reverse()
    .sort((a, b) =>
        a.system.actionType.value < b.system.actionType.value
            ? -1
            : a.system.actionType.value > b.system.actionType.value
            ? 1
            : 0
    )
    .reverse()
    .forEach((action, index) => {
        if (index < 9) {
            let frequency =
                (action.frequency?.max || '') + '/' + PF2eHelper.frequencyToHuman(action.frequency?.per || '');
            if (typeof action.frequency?.max === 'undefined' && typeof action.frequency?.per === 'undefined') {
                frequency = '';
            }
            mapper.field('all', `activity${index + 9}_name`, action.name);
            mapper.field(
                'all',
                `activity${index + 9}_action_count`,
                action.system.actionType.value === 'reaction' ? 'ä' : 'à' || ''
            );
            mapper.field(
                'all',
                `activity${index + 9}_traits`,
                PF2eHelper.formatTraits([action.system.traits.rarity].concat(action.system.traits.value))
            );
            mapper.field('all', `activity${index + 9}_frequency`, frequency);
            mapper.field(
                'all',
                `activity${index + 9}_reference`,
                PF2eHelper.abbreviateSource(action.system.publication?.title || action.system.source?.value || '')
            );
        }
    });

/* Magical Tradition Section*/
['arcane', 'occult', 'primal', 'divine'].forEach((tradition) => {
    mapper.field(
        'all',
        tradition,
        actor.spellcasting.filter(
            (i) =>
                i.system?.tradition?.value === tradition &&
                ['prepared', 'spontaneous'].includes(i.system?.prepared?.value)
        ).length > 0 || false
    );
});

mapper.field(
    'all',
    'prepared_caster',
    actor.spellcasting.filter(
        (i) => spellcasting_traditions.includes(i.system?.tradition?.value) && i.system?.prepared?.value === 'prepared'
    ).length || false
);
mapper.field(
    'all',
    'spontaneous_caster',
    actor.spellcasting.filter(
        (i) =>
            spellcasting_traditions.includes(i.system?.tradition?.value) && i.system?.prepared?.value === 'spontaneous'
    ).length || false
);

/* Spell Statistics Section */
// mapper.field(
//     'all',
//     'spell_attack',
//     PF2eHelper.quantifyNumber(
//         actor.spellcasting
//             .filter(
//                 (i) =>
//                     spellcasting_traditions.includes(i.system?.tradition?.value) &&
//                     spellcasting_types.includes(i.system?.prepared?.value)
//             )
//             .sort((a, b) =>
//                 a.statistic.check.mod < b.statistic.check.mod
//                     ? -1
//                     : a.statistic.check.mod > b.statistic.check.mod
//                     ? 1
//                     : 0
//             )
//             .reverse()
//             .map((i) => i.statistic.mod)[0]
//     ) || ''
// );

// mapper.field(
//     'all',
//     'spell_dc',
//     actor.spellcasting
//         .filter(
//             (i) =>
//                 spellcasting_traditions.includes(i.system?.tradition?.value) &&
//                 spellcasting_types.includes(i.system?.prepared?.value)
//         )
//         .sort((a, b) =>
//             a.statistic.check.mod < b.statistic.check.mod ? -1 : a.statistic.check.mod > b.statistic.check.mod ? 1 : 0
//         )
//         .reverse()
//         .map((i) => i.statistic.check.mod)[0] + 10 || ''
// );

mapper.field(
    'all',
    'cantrip_slots',
    actor.spellcasting
        .filter(
            (i) =>
                spellcasting_traditions.includes(i.system?.tradition?.value) &&
                spellcasting_types.includes(i.system?.prepared?.value)
        )
        .sort((a, b) =>
            a.statistic.check.mod < b.statistic.check.mod ? -1 : a.statistic.check.mod > b.statistic.check.mod ? 1 : 0
        )
        .reverse()
        .map((i) => i.spells.entry.system.slots.slot0.max)[0]
);

mapper.field(
    'all',
    'cantrip_rank',
    actor.items.filter((i) => i.type === 'spell' && i.isCantrip)[0]
        ? Math.round(actor.system.details.level.value / 2)
        : ''
);

/* Focus Spells Section */
mapper.field('all', 'focus_point_1', actor.system.resources.focus.max >= 1 || false);
mapper.field('all', 'focus_point_2', actor.system.resources.focus.max >= 2 || false);
mapper.field('all', 'focus_point_3', actor.system.resources.focus.max >= 3 || false);
mapper.field(
    'all',
    'focus_spell_rank',
    actor.items.filter((i) => i.type === 'spell' && i.isFocusSpell && !i.isRitual)[0]
        ? Math.round(actor.system.details.level.value / 2)
        : ''
);

/* Spells: innate, prepared, spontaneous, focus and cantrips */
let spell_proficiency = [];
let spell_proficiency_modifier = [];
let spell_attribute_modifier = [];
let spell_dc = [];
let spell_attack = [];
const spellCastingEntries = actor.spellcasting.filter((i) => i.type === 'spellcastingEntry');
let spell_slots = {};
let cantrip_count = 0;
let innate_spell_count = 0;
let spell_count = 0;
let focus_spell_count = 0;
spellCastingEntries
    .sort((a, b) => {
        return a.system.prepared.value < b.system.prepared.value
            ? -1
            : a.system.prepared.value > b.system.prepared.value
            ? 1
            : 0;
    })
    .sort((a, b) => {
        return a.system.tradition.value < b.system.tradition.value
            ? -1
            : a.system.tradition.value > b.system.tradition.value
            ? 1
            : 0;
    })
    .forEach((sce) => {
        let hasCantripTitle = false;
        let hasInnateTitle = false;
        let hasFocusTitle = false;
        let hasSpellTitle = false;
        const sceProficiencyModifier = sce.statistic.modifiers
            .filter((i) => i.type === 'proficiency')
            .map((i) => i.modifier)
            .reduce((a, b) => a + b, 0);
        const sceAttributeModifier = sce.statistic.modifiers
            .filter((i) => i.type === 'ability')
            .map((i) => i.modifier)
            .reduce((a, b) => a + b, 0);
        const sceStatusModifier = sce.statistic.modifiers
            .filter((i) => i.type === 'status')
            .map((i) => i.modifier)
            .reduce((a, b) => a + b, 0);
        spell_proficiency_modifier.push(sceProficiencyModifier);
        spell_attribute_modifier.push(sceAttributeModifier);
        spell_dc.push(10 + sce.statistic.mod - sceStatusModifier);
        spell_attack.push(sce.statistic.mod - sceStatusModifier);
        spell_proficiency.push(sce.system?.proficiency?.value || 0);
        for (let r = 1; r <= actor_spell_rank; r++) {
            const rankSpells = sce.spells
                .filter(
                    (i) =>
                        (i.type !== undefined && i.rank === r) ||
                        (sce.isPrepared &&
                            i.system.heightening !== undefined &&
                            ((i.system.heightening.type === 'interval' &&
                                i.rank < r &&
                                parseInt((r - i.rank) / i.system.heightening.interval) ==
                                    (r - i.rank) / i.system.heightening.interval) ||
                                (i.system.heightening.type === 'fixed' && i.rank < r)))
                )
                .sort((a, b) => {
                    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
                });
            if (
                !hasCantripTitle &&
                spellCastingEntries.length > 0 &&
                rankSpells.filter((i) => i.isCantrip).length > 0
            ) {
                mapper.field('all', `cantrip_entry${cantrip_count++}_name`, sce.name);
                hasCantripTitle = true;
            }
            if (
                !hasInnateTitle &&
                spellCastingEntries.length > 0 &&
                rankSpells.filter((i) => !i.isCantrip).length > 0 &&
                sce.system.prepared.value === 'innate'
            ) {
                mapper.field('all', `innate_spell_entry${innate_spell_count++}_name`, sce.name);
                hasInnateTitle = true;
            } else if (
                !hasSpellTitle &&
                spellCastingEntries.length > 0 &&
                rankSpells.filter((i) => !i.isCantrip).length > 0 &&
                ['prepared', 'spontaneous'].includes(sce.system.prepared.value)
            ) {
                mapper.field('all', `spell_entry${spell_count++}_name`, sce.name);
                hasSpellTitle = true;
            } else if (
                !hasFocusTitle &&
                spellCastingEntries.length > 0 &&
                rankSpells.filter((i) => !i.isCantrip).length > 0 &&
                sce.system.prepared.value === 'focus'
            ) {
                mapper.field('all', `focus_spell_entry${focus_spell_count++}_name`, sce.name);
                hasFocusTitle = true;
            }
            rankSpells.forEach((s) => {
                let spell_name = s.name;
                let spell_actions = PF2eHelper.actionsToSymbols(s.system.time.value);
                let spell_rank = r;
                let spell_prep = Object.values(sce.system.slots[`slot${r}`].prepared).filter(
                    (i) => i.id === s._id
                ).length;
                if (s.system.heightening !== undefined && s.system.heightening.type === 'fixed' && s.rank != r) {
                    let h = r - s.rank;
                    spell_name = `${s.name} (+${h})`;
                } else if (
                    s.system.heightening !== undefined &&
                    s.system.heightening.type === 'interval' &&
                    s.rank != r
                ) {
                    let h = (r - s.rank) / s.system.heightening.interval;
                    spell_name = `${s.name} (+${h})`;
                }
                let field_prefix = 'unknown';
                if (s.isCantrip) {
                    field_prefix = `cantrip_entry${cantrip_count++}`;
                } else if (sce.system.prepared.value === 'innate') {
                    field_prefix = `innate_spell_entry${innate_spell_count++}`;
                } else if (['prepared', 'spontaneous'].includes(sce.system.prepared.value)) {
                    field_prefix = `spell_entry${spell_count++}`;
                } else if (sce.system.prepared.value === 'focus') {
                    field_prefix = `focus_spell_entry${focus_spell_count++}`;
                } else {
                    mapper.notify('warn', `Unknown prepared type: ${sce.system.prepared.value}`);
                }

                mapper.field('all', `${field_prefix}_name`, spell_name);
                mapper.field('all', `${field_prefix}_actions`, spell_actions);
                mapper.field('all', `${field_prefix}_rank`, spell_rank);
                mapper.field('all', `${field_prefix}_prep`, spell_prep === 0 ? '' : spell_prep);
            });
            if (spellCastingEntries.length > 0 && rankSpells.filter((i) => i.isCantrip).length > 0) {
                mapper.field('all', `cantrip_entry${cantrip_count++}_name`, '');
            }
            if (
                spellCastingEntries.length > 0 &&
                rankSpells.filter((i) => !i.isCantrip).length > 0 &&
                sce.system.prepared.value === 'innate'
            ) {
                mapper.field('all', `innate_spell_entry${innate_spell_count++}_name`, '');
            } else if (
                spellCastingEntries.length > 0 &&
                rankSpells.filter((i) => !i.isCantrip).length > 0 &&
                ['prepared', 'spontaneous'].includes(sce.system.prepared.value)
            ) {
                mapper.field('all', `spell_entry${spell_count++}_name`, '');
            } else if (
                spellCastingEntries.length > 0 &&
                rankSpells.filter((i) => !i.isCantrip).length > 0 &&
                sce.system.prepared.value === 'focus'
            ) {
                mapper.field('all', `focus_spell_entry${focus_spell_count++}_name`, '');
            }
            if (!sce.isCantrip && (sce.isPrepared || sce.isSpontaneous)) {
                spell_slots[r] = (spell_slots[r] || []).concat([sce.system.slots[`slot${r}`].max]);
            }
        }
    });
Object.keys(spell_slots).forEach((key) => {
    mapper.field('all', `spell${key}_slots`, spell_slots[key].join('|'));
});
mapper.field('all', 'spell_proficiency_modifier', spell_proficiency_modifier[0] || '');
mapper.field('all', 'spell_attribute_modifier', spell_attribute_modifier[0] || '');
mapper.field('all', 'spell_dc_proficiency_modifier', spell_proficiency_modifier[0] || '');
mapper.field('all', 'spell_dc_attribute_modifier', spell_attribute_modifier[0] || '');
mapper.field('all', 'attack_spell_trained', spell_proficiency[0] >= 1);
mapper.field('all', 'attack_spell_expert', spell_proficiency[0] >= 2);
mapper.field('all', 'attack_spell_master', spell_proficiency[0] >= 3);
mapper.field('all', 'attack_spell_legendary', spell_proficiency[0] >= 4);
mapper.field('all', 'spell_dc_trained', spell_proficiency[0] >= 1);
mapper.field('all', 'spell_dc_expert', spell_proficiency[0] >= 2);
mapper.field('all', 'spell_dc_master', spell_proficiency[0] >= 3);
mapper.field('all', 'spell_dc_legendary', spell_proficiency[0] >= 4);
mapper.field('all', 'spell_attack', PF2eHelper.quantifyNumber(spell_attack[0]) || '');
mapper.field('all', 'spell_dc', spell_dc[0] || '');

/* Rituals */
const ritualList = actor.items.filter((i) => i.system.ritual !== undefined);
let ritual_count = 0;
actor.items
    .filter((i) => i.system.ritual !== undefined)
    .forEach((r) => {
        const ritual_prefix = `ritual_entry${ritual_count++}`;
        mapper.field('all', `${ritual_prefix}_name`, r.name);
        mapper.field('all', `${ritual_prefix}_rank`, r.rank);
        mapper.field('all', `${ritual_prefix}_cost`, r.system.cost.value);
    });

/* Formulas */
(actor.system.crafting?.formulas || [])
    .map((a) => fromUuidSync(a.uuid))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .reverse()
    .sort((a, b) => (a.system.level < b.system.level ? -1 : a.system.level > b.system.level ? 1 : 0))
    .reverse()
    .forEach((item, index) => {
        mapper.field('all', `formula${index}_name`, item.name);
        mapper.field('all', `formula${index}_rank`, item.system.level.value);
    });

export { mapper };
