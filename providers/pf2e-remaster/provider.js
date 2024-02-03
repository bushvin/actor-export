import { pdfProvider } from '../../scripts/lib/providers/PDFProvider.js';
import { pf2eHelper } from '../../scripts/lib/helpers/PF2eHelper.js';
import { semVer } from '../../scripts/lib/SemVer.js';

// actor is available as a global variable
// game is available as a global variable

// helper functions
class pf2ePDFProvider extends pdfProvider {
    getStrikes() {
        let strikes = [];
        let meleeIndex = 1;
        let rangedIndex = 1;

        actor.system.actions
            .filter((i) => i.type === 'strike')
            .sort((a, b) => (a.ready > b.ready ? 1 : a.ready < b.ready ? -1 : 0))
            .reverse()
            .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0))
            .forEach((strike) => {
                strikes.push(strike);
                strikes = strikes.concat(strike.altUsages);
            });

        for (let i = 0; i < strikes.length; i++) {
            const strike = strikes[i];
            // strikes.forEach((strike) => {
            const isMeleeStrike = strike.options?.includes('melee') || false;
            const isRangedStrike = strike.options?.includes('ranged') || false;
            if (!isMeleeStrike && !isRangedStrike) {
                this.notify('warn', `This strike is neither melee or ranged: ${strike.label}`);
                continue;
            }
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
                    pf2eHelper.formatTraits(
                        strike.item.system.traits.value.concat([`range-${strike.item.system.range}`])
                    ) + runes;
            } else {
                traitsAndNotes = pf2eHelper.formatTraits(strike.item.system.traits.value) + runes;
            }

            const attributeName = isMeleeStrike ? (hasFinesse && dexModifier >= strModifier ? 'Dex' : 'Str') : 'Dex';
            const attributeModifier = isMeleeStrike
                ? hasFinesse && dexModifier >= strModifier
                    ? dexModifier
                    : strModifier
                : dexModifier;
            const ret = {
                name: strike.label,
                attack: strike.totalModifier - statusModifier,
                attribute: attributeName,
                attributeModifier: attributeModifier,
                proficiencyModifier: strike.modifiers
                    .filter((i) => i.type === 'proficiency' && i.enabled)
                    .map((i) => i.modifier)
                    .reduce((a, b) => a + b, 0),
                itemModifier: strike.modifiers
                    .filter((i) => i.type === 'item' && i.enabled)
                    .map((i) => i.modifier)
                    .reduce((a, b) => a + b, 0),
                damageFormula: strike.damage({ getFormula: true }),
                hasBludgeoningDamage:
                    strike.item.system.damage.damageType === 'bludgeoning' ||
                    strike.item.system.traits.value.includes('versatile-b') ||
                    false,
                hasPiercingDamage:
                    strike.item.system.damage.damageType === 'piercing' ||
                    strike.item.system.traits.value.includes('versatile-p') ||
                    false,
                hasSlashingDamage:
                    strike.item.system.damage.damageType === 'slashing' ||
                    strike.item.system.traits.value.includes('versatile-s') ||
                    false,
                traitsAndNotes: traitsAndNotes,
            };
            if (isMeleeStrike) {
                this.addStrike('melee', meleeIndex++, ret);
            } else {
                this.addStrike('ranged', rangedIndex++, ret);
            }
        }
    }

    addStrike(domain, index, strike) {
        this.field('all', `${domain}${index}_name`, strike.name);
        this.field('all', `${domain}${index}_attack`, strike.attack);
        this.field('all', `${domain}${index}_attribute`, strike.attribute);
        this.field('all', `${domain}${index}_attribute_modifier`, strike.attributeModifier);
        this.field('all', `${domain}${index}_proficiency_modifier`, strike.proficiencyModifier);
        this.field('all', `${domain}${index}_item_modifier`, strike.itemModifier);
        this.field('all', `${domain}${index}_damage`, strike.damageFormula, {
            parseValue: function (value) {
                return value.replace(/(piercing|bludgeoning|slashing)/gi, '').replace(/\s+/g, ' ');
            },
        });
        this.field('all', `${domain}${index}_bludgeoning_damage`, strike.hasBludgeoningDamage);
        this.field('all', `${domain}${index}_piercing_damage`, strike.hasPiercingDamage);
        this.field('all', `${domain}${index}_slashing_damage`, strike.hasSlashingDamage);
        this.field('all', `${domain}${index}_traits_notes`, ' '.repeat(26) + strike.traitsAndNotes);
    }

    replaceNotesHtml(notes) {
        notes = pf2eHelper.stripHTMLtag(notes, 'br');
        notes = pf2eHelper.stripHTMLtag(notes, 'hr', '---');
        notes = pf2eHelper.stripHTMLtag(notes, 'p', '', '\n');
        notes = pf2eHelper.stripHTMLtag(notes, 'strong');
        notes = pf2eHelper.stripHTMLtag(notes, 'em');
        notes = pf2eHelper.stripHTMLtag(notes, 'span');
        notes = pf2eHelper.stripNestedHTMLtag(notes, 'ol', 'li', '- ');
        notes = pf2eHelper.stripHTMLtag(notes, 'ol');
        notes = pf2eHelper.stripNestedHTMLtag(notes, 'ul', 'li', '- ');
        notes = pf2eHelper.stripHTMLtag(notes, 'ul');
        notes = pf2eHelper.stripHTMLtag(notes, 'h1');
        notes = pf2eHelper.stripHTMLtag(notes, 'h2');
        notes = pf2eHelper.stripHTMLtag(notes, 'h3');
        notes = pf2eHelper.stripHTMLtag(notes, 'h4');
        return notes;
    }
}

const spellcasting_traditions = ['arcane', 'occult', 'primal', 'divine'];
const spellcasting_types = ['prepared', 'spontaneous'];
const actor_spell_rank = Math.ceil((actor?.level ?? 0) / 2);

const mapper = new pf2ePDFProvider(actor);

if (actor.level < 1) {
    mapper.notify(
        'warn',
        'This character has 0 levels. This may cause unexpected results. Please consider adding levels!',
        { permanent: true }
    );
}

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

/* Heropoints */
mapper.field('all', 'hero_point_1', (actor.system.resources.heroPoints.value || 0) >= 1);
mapper.field('all', 'hero_point_2', (actor.system.resources.heroPoints.value || 0) >= 2);
mapper.field('all', 'hero_point_3', (actor.system.resources.heroPoints.value || 0) >= 3);

/* Class Section */
mapper.field('all', 'class', actor.class?.name || '');
/* FIXME: complete class notes */
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
mapper.field('all', 'class_notes', subClass.join('/'));

/* attributes Section */
Object.keys(actor.abilities).forEach((a) => {
    mapper.field('all', a, pf2eHelper.quantifyNumber(actor.abilities[a].mod));
    mapper.field('all', `${a}_partial`, pf2eHelper.isPartialBoost(actor, a));
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
        mapper.field('all', `${skill.slug}`, pf2eHelper.quantifyNumber(skill.mod - skillStatusModifier));
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
        mapper.field('all', `lore${index + 1}`, pf2eHelper.quantifyNumber(skill.mod - skillStatusModifier));
        mapper.field('all', `lore${index + 1}_subcategory`, `${skill.label} Lore`);
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
    .map((i) => pf2eHelper.capitalize(i));
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
    .filter((i) => i.type === 'item' && i.enabled)
    .map((i) => i.modifier)
    .reduce((a, b) => a + b, 0);
mapper.field('all', 'perception', pf2eHelper.quantifyNumber(actor.perception.mod - perceptionStatusModifier));
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
mapper.getStrikes();

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
const ancestry_hertitage_abilities_1 = [];
actor.items
    .filter((i) => i.type === 'feat' && (i.category === 'ancestryfeature' || i.category == 'heritage'))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .forEach((a) => {
        const sub = actor.items.filter((i) => i.flags?.pf2e?.grantedBy?.id === a._id).map((i) => i.name);
        if (sub.length === 0) {
            ancestry_hertitage_abilities_1.push(a.name);
        } else {
            ancestry_hertitage_abilities_1.push(`${a.name} (${sub.join(', ')})`);
        }
    });

mapper.field('all', '1_ancestry_hertitage_abilities', ancestry_hertitage_abilities_1.join(', '));

const ancestry_feat_1 = [];
actor.items
    .filter(
        (i) =>
            i.type === 'feat' &&
            (i.system.location === 'ancestry-1' || (i.system.category === 'ancestry' && i.system.onlyLevel1))
    )
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .forEach((s) => {
        const sub = actor.items.filter((i) => i.flags?.pf2e?.grantedBy?.id === s._id).map((i) => i.name);
        if (sub.length === 0) {
            ancestry_feat_1.push(s.name);
        } else {
            ancestry_feat_1.push(`${s.name} (${sub.join(', ')})`);
        }
    });
mapper.field('all', '1_ancestry_feat', ancestry_feat_1.join(', '));

const r1_background_skill_feat = [];
Object.keys(actor.background?.system.items || []).forEach((b) => {
    r1_background_skill_feat.push(actor.background.system.items[b].name);
});
mapper.field('all', '1_background_skill_feat', r1_background_skill_feat.join(', '));

for (let s = 2; s <= 20; s = s + 2) {
    mapper.field(
        'all',
        `${s}_skill_feat`,
        actor.items
            .filter((i) => i.type === 'feat' && i.system.location === `skill-${s}`)
            .map((i) => i.name)
            .join(', ') || ''
    );
}

for (let g = 3; g <= 20; g = g + 4) {
    mapper.field(
        'all',
        `${g}_general_feat`,
        actor.items
            .filter((i) => i.type === 'feat' && i.system.location === `general-${g}`)
            .map((i) => i.name)
            .join(', ') || ''
    );
}

for (let a = 5; a <= 20; a = a + 4) {
    mapper.field(
        'all',
        `${a}_ancestry_feat`,
        actor.items
            .filter((i) => i.type === 'feat' && i.system.location === `ancestry-${a}`)
            .map((i) => i.name)
            .join(', ') || ''
    );
}

for (let b = 5; b <= 20; b = b + 5) {
    if (actor.system.build !== undefined) {
        mapper.field('all', `${b}_boosts`, pf2eHelper.formatAttributeBoosts(actor.system.build.attributes.boosts[b]));
    }
}

/* Class Abilities Section */
const class_id = actor.class._id;
const class_feats_features_1 = [];
actor.items
    .filter(
        (i) =>
            i.type === 'feat' &&
            i.system.location === class_id &&
            i.system.level.value <= 1 &&
            i.flags?.pf2e?.grantedBy?.id === undefined &&
            (i.system.category === 'classfeature' || i.system.category === 'class')
    )
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .forEach((f) => {
        const sub = actor.items.filter((i) => i.flags?.pf2e?.grantedBy?.id === f._id).map((i) => i.name);
        if (sub.length === 0) {
            class_feats_features_1.push(f.name);
        } else {
            class_feats_features_1.push(`${f.name} (${sub.join(', ')})`);
        }
    });
mapper.field('all', '1_class_feats_features', class_feats_features_1.join(', '));

for (let f = 3; f <= 20; f = f + 2) {
    const class_feature = [];
    actor.items
        .filter(
            (i) =>
                i.type === 'feat' &&
                i.system.category === 'classfeature' &&
                i.system.location === class_id &&
                i.system.level.value === f
        )
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .forEach((f) => {
            const sub = actor.items.filter((i) => i.flags?.pf2e?.grantedBy?.id === f._id).map((i) => i.name);
            if (sub.length === 0) {
                class_feature.push(f.name);
            } else {
                class_feature.push(`${f.name} (${sub.join(', ')})`);
            }
        });
    mapper.field('all', `${f}_class_feature`, class_feature.join(', '));
}

for (let f = 2; f <= 20; f = f + 2) {
    mapper.field(
        'all',
        `${f}_class_feat`,
        actor.items
            .filter((i) => i.type === 'feat' && [`archetype-${f}`, `class-${f}`].includes(i.system.location))
            .map((i) => i.name)
            .join(', ') || ''
    );
}

/* Inventory Section */
let held_index = 0;
let consumable_index = 0;
let worn_index = 0;
let treasure_index = 0;
let container_index = 0;
actor.inventory.contents
    .filter((i) => i.system.containerId === null && i.system.stackGroup !== 'coins')
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .forEach((item) => {
        const contained_items = actor.inventory.contents
            .filter((i) => i.system.containerId === item._id && i.system.stackGroup !== 'coins')
            .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
        const comtainer_label = contained_items.length > 0 ? ' [+]' : '';
        if (item.type === 'consumable') {
            /* Consumables */
            mapper.field(
                'all',
                `consumable${consumable_index}_name`,
                (item.system.quantity > 1 ? item.system.quantity + ' ' : '') +
                    item.name +
                    comtainer_label +
                    (item.isMagical ? ' ‡ ' : ' ')
            );
            mapper.field('all', `consumable${consumable_index}_bulk`, item.system.bulk.value);
            if (contained_items.length > 0) {
                mapper.field(
                    'all',
                    `container_item${container_index}_name`,
                    (item.system.quantity > 1 ? item.system.quantity + ' ' : '') +
                        item.name +
                        (item.isMagical ? ' ‡ ' : ' ')
                );
                mapper.field('all', `container_item${container_index}_bulk`, item.system.bulk.value);
                container_index++;
            }
            consumable_index++;
            // i.system.equipped.carryType
            // } else if (item.system.usage.type === 'held') {
        } else if (item.type === 'treasure') {
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
                (item.system.quantity > 1 ? item.system.quantity + ' ' : '') +
                    item.name +
                    comtainer_label +
                    (item.isMagical ? ' ‡ ' : '')
            );
            mapper.field('all', `gems_artwork${treasure_index}_price`, price.join(', '));
            mapper.field('all', `gems_artwork${treasure_index}_bulk`, item.system.bulk.value);
            treasure_index++;
            if (contained_items.length > 0) {
                mapper.field(
                    'all',
                    `container_item${container_index}_name`,
                    (item.system.quantity > 1 ? item.system.quantity + ' ' : '') +
                        item.name +
                        (item.isMagical ? ' ‡ ' : '')
                );
                mapper.field('all', `container_item${container_index}_bulk`, item.system.bulk.value);
                container_index++;
            }
        } else if (item.system.equipped.carryType === 'held') {
            /* Held items */
            mapper.field(
                'all',
                `held_item${held_index}_name`,
                (item.system.quantity > 1 ? item.system.quantity + ' ' : '') +
                    item.name +
                    comtainer_label +
                    (item.isMagical ? ' ‡ ' : ' ')
            );
            mapper.field('all', `held_item${held_index}_bulk`, item.system.bulk.value);
            held_index++;
            if (contained_items.length > 0) {
                mapper.field(
                    'all',
                    `container_item${container_index}_name`,
                    (item.system.quantity > 1 ? item.system.quantity + ' ' : '') +
                        item.name +
                        (item.isMagical ? ' ‡ ' : ' ')
                );
                mapper.field('all', `container_item${container_index}_bulk`, item.system.bulk.value);
                container_index++;
            }
            // } else if (item.system.usage.type === 'worn') {
        } else if (item.system.equipped.carryType === 'worn') {
            /* Worn items */
            mapper.field(
                'all',
                `worn_item${worn_index}_name`,
                (item.system.quantity > 1 ? item.system.quantity + ' ' : '') +
                    item.name +
                    comtainer_label +
                    (item.isMagical ? ' ‡ ' : ' ')
            );
            mapper.field('all', `worn_item${worn_index}_invested`, item.isInvested);
            mapper.field('all', `worn_item${worn_index}_bulk`, item.system.bulk.value);
            worn_index++;
            if (contained_items.length > 0) {
                mapper.field(
                    'all',
                    `container_item${container_index}_name`,
                    (item.system.quantity > 1 ? item.system.quantity + ' ' : '') +
                        item.name +
                        (item.isMagical ? ' ‡ ' : ' ')
                );
                mapper.field('all', `container_item${container_index}_invested`, item.isInvested);
                mapper.field('all', `container_item${container_index}_bulk`, item.system.bulk.value);
                container_index++;
            }
        }
        contained_items.forEach((containedItem) => {
            mapper.field(
                'all',
                `container_item${container_index}_name`,
                '    ' +
                    (containedItem.system.quantity > 1 ? containedItem.system.quantity + ' ' : '') +
                    containedItem.name +
                    (containedItem.isMagical ? ' ‡ ' : ' ')
            );
            mapper.field('all', `container_item${container_index}_invested`, containedItem.isInvested);
            mapper.field('all', `container_item${container_index}_bulk`, containedItem.system.bulk.value);
            container_index++;
        });
        if (contained_items.length > 0) {
            container_index++;
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
    'appearance',
    ' '.repeat(25) + mapper.replaceNotesHtml(actor.system.details.biography?.appearance || '')
);

/* Personality Section */
mapper.field('all', 'attitude', ' '.repeat(15) + actor.system.details.biography?.attitude || '');
mapper.field('all', 'deity_philosophy', actor.deity?.name || '');
mapper.field('all', 'edicts', ' '.repeat(15) + (actor.system.details.biography?.edicts || []).join(', '));
mapper.field('all', 'anathema', ' '.repeat(20) + (actor.system.details.biography?.anathema || []).join(', '));
mapper.field('all', 'likes', ' '.repeat(10) + actor.system.details.biography?.likes || '');
mapper.field('all', 'dislikes', ' '.repeat(15) + actor.system.details.biography?.dislikes || '');
mapper.field('all', 'catchphrases', ' '.repeat(25) + actor.system.details.biography?.catchphrases || '');

/* Campaign notes Section */
mapper.field('all', 'campaign_notes', mapper.replaceNotesHtml(actor.system.details.biography?.campaignNotes || ''));
mapper.field('all', 'allies', ' '.repeat(10) + mapper.replaceNotesHtml(actor.system.details.biography?.allies || ''));
mapper.field('all', 'enemies', ' '.repeat(15) + mapper.replaceNotesHtml(actor.system.details.biography?.enemies || ''));
mapper.field(
    'all',
    'organizations',
    ' '.repeat(25) + mapper.replaceNotesHtml(actor.system.details.biography?.organizations || '')
);

/* Actions and Activities */
/* ranges from 0-8 in PDF*/
actor.items
    .filter((i) => i.system.actionType?.value == 'action')
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .forEach((action, index) => {
        if (index < 9) {
            let frequency =
                (action.frequency?.max || '') + '/' + pf2eHelper.frequencyToHuman(action.frequency?.per || '');
            if (typeof action.frequency?.max === 'undefined' && typeof action.frequency?.per === 'undefined') {
                frequency = '';
            }
            mapper.field('all', `activity${index + 1}_name`, action.name);
            mapper.field(
                'all',
                `activity${index + 1}_action_count`,
                pf2eHelper.formatActivity(
                    action.system.actionType.value,
                    action.system.actions.value,
                    pf2eHelper.pdfActionIconsGlyphs
                )
            );
            mapper.field(
                'all',
                `activity${index + 1}_traits`,
                pf2eHelper.formatTraits([action.system.traits.rarity].concat(action.system.traits.value))
            );
            mapper.field('all', `activity${index + 1}_frequency`, frequency);
            mapper.field(
                'all',
                `activity${index + 1}_reference`,
                pf2eHelper.abbreviateSource(action.system.publication?.title || action.system.source?.value || '')
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
                (action.frequency?.max || '') + '/' + pf2eHelper.frequencyToHuman(action.frequency?.per || '');
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
                pf2eHelper.formatTraits([action.system.traits.rarity].concat(action.system.traits.value))
            );
            mapper.field('all', `activity${index + 9}_frequency`, frequency);
            mapper.field(
                'all',
                `activity${index + 9}_reference`,
                pf2eHelper.abbreviateSource(action.system.publication?.title || action.system.source?.value || '')
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
// FIXME: when no cantrips are available, return an empty string
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
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
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
            }
            rankSpells.forEach((s) => {
                let spell_name = s.name;
                let spell_actions = pf2eHelper.formatSpellCastingTime(
                    s.system.time.value,
                    pf2eHelper.pdfActionIconsGlyphs
                );
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
mapper.field('all', 'spell_attack', pf2eHelper.quantifyNumber(spell_attack[0]) || '');
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
