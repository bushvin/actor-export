import { genericPropertyError, genericHelper } from './GenericHelper.js';
import { semVer } from '../SemVer.js';
/**
 * PF2eHelper module. Provides a couple of classes to easily manage your PF2e characters.
 * @module PF2eHelper
 * @author William Leemans
 * @copyright William Leemans 2024
 */

/**
 * pf2e actor abstraction base class
 *
 * This class provides a stable interface to the FoundryVTT actor object for use in
 * your charactersheets.
 * @class
 * @param {Object} game The foundry VTT game object
 * @param {Object} actor Foundry VTT actor object
 */
class pf2eActor {
    constructor(game, actor) {
        this.actor = actor;
        this.game = game;
        /**
         * the list of spellcasting traditions
         * @type {string[]}
         * @public
         */
        this.spellcastingTraditions = ['arcane', 'occult', 'primal', 'divine'];
        /**
         * the list of spellcatsing types
         * @type {string[]}
         * @public
         */
        this.spellcastingTypes = ['prepared', 'spontaneous'];
        console.debug('actor-export | character:', this);
    }

    /**
     * Return the actor name
     * @type {string}
     */
    get name() {
        return this.actor.name;
    }

    /**
     * Return the Owner name of the actor
     * @type {string}
     */
    get ownerName() {
        try {
            return Object.entries(this.actor.ownership || {})
                .filter((i) => i[1] === 3)
                .map((i) => i[0])
                .map((id) => (!this.game.users.get(id)?.isGM ? this.game.users.get(id)?.name : null))
                .filter((x) => x)
                .join(', ');
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'ownerName', error.message);
        }
    }

    /**
     * Return the actor traits
     * @type {string[]}
     */
    get traits() {
        return Array.from(this.actor.traits);
    }

    /**
     * @typedef {Object} actorAncestry
     * @property {string} name
     * @property {string} description
     */

    /**
     * Return the actor ancestry information
     * @type {actorAncestry}
     */
    get ancestry() {
        const ancestry = {
            name: this.actor.ancestry?.name || 'unknown',
            description: this.actor.ancestry?.system.description.value,
        };
        return ancestry;
    }

    /**
     * @typedef {Object} actorHeritage
     * @property {string} name
     * @property {string} description
     */

    /**
     * Return the actor heritage information
     * @type {actorHeritage}
     */
    get heritage() {
        const heritage = {
            name: this.actor.heritage?.name || 'unknown',
            description: this.actor.heritage?.system.description.value,
        };

        return heritage;
    }

    /**
     * Return the actor's (abbreviated) size
     * @type {string}
     */
    get size() {
        return this.actor.system.traits.size.value || 'unknown';
    }

    /**
     * @typedef {Object} actorBackground
     * @property {string} name
     * @property {string} description
     */

    /**
     * Return the actor background information
     * @type {actorBackground}
     */
    get background() {
        return {
            name: '',
            description: '',
        };
    }

    /**
     * @typedef {Object} actorClass
     * @property {string} name
     * @property {string} description
     * @property {string} subClass
     * @property {string} id
     */

    /**
     * Return the actor class information
     * @type {actorClass}
     */
    get class() {
        const classInfo = {
            name: this.actor.class?.name || 'unknown',
            description: this.actor.class?.system.description.value,
            subClass: '',
            id: this.actor.class?._id || '',
        };
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
        try {
            this.actor.items
                .filter((i) => i.type === 'feat' && subClassFeatures.includes(i.system.slug))
                .forEach((f) => {
                    this.actor.items
                        .filter((i) => i.flags?.pf2e?.grantedBy?.id === f._id)
                        .forEach((s) => {
                            subClass.push(s.name);
                        });
                });
            classInfo['subClass'] = subClass.join('/');
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'class', error.message);
        }
        return classInfo;
    }

    /**
     * Return the actor level
     * @type {number|string}
     */
    get level() {
        if (typeof this.actor.system.details.level.value === 'number') {
            return this.actor.system.details.level.value;
        } else {
            return 'unknown';
        }
    }

    /**
     * Return the actor's XP count
     * @type {number|string}
     */
    get xp() {
        if (typeof this.actor.system.details.xp?.value === 'number') {
            return this.actor.system.details.xp?.value;
        } else {
            return 'unknown';
        }
    }

    /**
     * Return the actor's hero point count
     * @type {number}
     */
    get heroPoints() {
        return this.actor.system.resources.heroPoints.value || 0;
    }

    /**
     * @typedef {Object} actorAttribute
     * @property {string} name
     * @property {number} modifier
     * @property {boolean} isPartialBoost
     */

    /**
     * @typedef {Object} actorAttributes
     * @property {actorAttribute} str
     * @property {actorAttribute} dex
     * @property {actorAttribute} con
     * @property {actorAttribute} int
     * @property {actorAttribute} wis
     * @property {actorAttribute} dex
     */

    /**
     * return the actor's attributes
     * @type {actorAttributes}
     */
    get attributes() {
        const attributes = {};
        try {
            Object.keys(this.actor.abilities).forEach((a) => {
                attributes[a] = {
                    name: a,
                    modifier: this.actor.abilities[a].mod,
                    isPartialBoost: pf2eHelper.isPartialBoost(this.actor, a),
                };
            });
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'attributes', error.message);
        }
        return attributes;
    }

    /**
     * @typedef {Object} actorAC
     * @property {number} statusModifier
     * @property {number} attributeModifier
     * @property {number} proficiencyModifier
     * @property {number} itemModifier
     * @property {number} modifier
     */
    /**
     * Return the actor's AC information
     * @type {actorAC}
     */
    get ac() {
        const ac = {};
        try {
            ac['statusModifier'] = this.actor.armorClass.modifiers
                .filter((i) => i.type === 'status')
                .map((i) => i.modifier)
                .reduce((a, b) => a + b, 0);
            ac['attributeModifier'] = this.actor.armorClass.modifiers
                .filter((i) => i.type === 'ability')
                .map((i) => i.modifier)
                .reduce((a, b) => a + b, 0);
            ac['proficiencyModifier'] = this.actor.armorClass.modifiers
                .filter((i) => i.type === 'proficiency')
                .map((i) => i.modifier)
                .reduce((a, b) => a + b, 0);
            ac['itemModifier'] = this.actor.armorClass.modifiers
                .filter((i) => i.type === 'item')
                .map((i) => i.modifier)
                .reduce((a, b) => a + b, 0);
            ac['modifier'] = this.actor.armorClass.value - ac['statusModifier'];
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'ac', error.message);
        }
        return ac;
    }

    /**
     * Return whether the actor has a shield equipped
     * @type {boolean}
     */
    get hasShieldEquipped() {
        return this.actor.items.filter((i) => i.type === 'shield' && i.isEquipped).length > 0;
    }

    /**
     * @typedef {Object} actorEquippedShield
     * @property {number} ac
     * @property {number} hardness
     * @property {number} hpMax
     * @property {number} hpValue
     * @property {number} bt
     */

    /**
     * Return the actor's equipped shield
     * @type {actorEquippedShield}
     */
    get equippedShield() {
        try {
            if (this.hasShieldEquipped) {
                const shield = this.actor.items.filter((i) => i.type === 'shield' && i.isEquipped)[0];
                return {
                    ac: shield.system.acBonus || 0,
                    hardness: shield.system.hardness || 0,
                    hpMax: shield.system.hp.max || 0,
                    hpValue: shield.system.hp.value || 0,
                    bt: shield.system.hp.brokenThreshold || 0,
                };
            } else {
                return undefined;
            }
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'ac', error.message);
        }
    }
    /**
     * @typedef {Object} actorDefenseProficiency
     * @property {string} name
     * @property {number} rank
     */

    /**
     * @typedef {Object} actorDefenseProficiencies
     * @property {actorDefenseProficiency} unarmored
     * @property {actorDefenseProficiency} light
     * @property {actorDefenseProficiency} medium
     * @property {actorDefenseProficiency} heavy
     * @property {actorDefenseProficiency} 'light-barding'
     * @property {actorDefenseProficiency} 'heavy-barding'
     */

    /**
     * Return the actor's defense proficiencies
     * @type {actorDefenseProficiencies}
     */
    get defenseProficiencies() {
        const proficiencies = {};
        Object.keys(this.actor.system.proficiencies?.defenses || []).forEach((defense) => {
            proficiencies[defense] = {
                name: defense,
                rank: this.actor.system.proficiencies.defenses[defense].rank,
            };
        });
        return proficiencies;
    }

    /**
     * @typedef {Object} actorSavingThrow
     * @property {string} name
     * @property {number} attributeModifier
     * @property {number} proficiencyModifier
     * @property {number} itemModifier
     * @property {number} statusModifier
     * @property {number} rank
     * @property {number} modifier
     */

    /**
     * @typedef {Object} actorSavingThrows
     * @property {actorSavingThrow} fortitude
     * @property {actorSavingThrow} reflex
     * @property {actorSavingThrow} will
     */

    /**
     * Return the actor's saving throws
     * @type {actorSavingThrows}
     */
    get savingThrows() {
        const savingThrows = {};
        try {
            Object.keys(this.actor.saves).forEach((save) => {
                savingThrows[save] = {};
                savingThrows[save]['name'] = save;
                savingThrows[save]['attributeModifier'] = this.actor.saves[save].modifiers
                    .filter((i) => i.type === 'ability' && i.enabled)
                    .map((i) => i.modifier)
                    .reduce((a, b) => a + b, 0);
                savingThrows[save]['proficiencyModifier'] = this.actor.saves[save].modifiers
                    .filter((i) => i.type === 'proficiency' && i.enabled)
                    .map((i) => i.modifier)
                    .reduce((a, b) => a + b, 0);
                savingThrows[save]['itemModifier'] = this.actor.saves[save].modifiers
                    .filter((i) => i.type === 'item' && i.enabled)
                    .map((i) => i.modifier)
                    .reduce((a, b) => a + b, 0);
                savingThrows[save]['statusModifier'] = this.actor.saves[save].modifiers
                    .filter((i) => i.type === 'item' && i.enabled)
                    .map((i) => i.modifier)
                    .reduce((a, b) => a + b, 0);
                savingThrows[save]['rank'] = this.actor.saves[save].rank;
                savingThrows[save]['modifier'] = this.actor.saves[save].mod - savingThrows[save]['statusModifier'];
            });
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'savingThrows', error.message);
        }
        return savingThrows;
    }

    /**
     * @typedef {Object} actorHP
     * @property {number} max
     * @property {number} value
     * @property {number} temp
     */

    /**
     * Return actor's HP information
     * @type {actorHP}
     */
    get hp() {
        return {
            max: this.actor.hitPoints.max || 0,
            value: this.actor.hitPoints.value || 0,
            temp: this.actor.hitPoints.temp || 0,
        };
    }

    /**
     * @typedef {Object} actorDying
     * @property {number} max
     * @property {number} value
     */

    /**
     * Return the actor's dying information
     * @type {Object}
     */
    get dying() {
        return {
            max: this.actor.system.attributes.dying.max || 0,
            value: this.actor.system.attributes.dying.value || 0,
        };
    }

    /**
     * actor wounds
     * @type {Object}
     */
    get wounded() {
        return {
            max: this.actor.system.attributes.wounded.max || 0,
            value: this.actor.system.attributes.wounded.value || 0,
        };
    }

    /**
     * actor immunities
     * @type {string}
     */
    get immunities() {
        try {
            return this.actor.system.attributes.immunities
                .map((i) => i.type)
                .sort()
                .join(', ');
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'immunities', error.message);
        }
    }

    /**
     * actor resistance
     * @type {string}
     */
    get resistance() {
        try {
            return this.actor.system.attributes.resistances
                .map((i) => i.type + ' ' + i.value)
                .sort()
                .join(', ');
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'resistance', error.message);
        }
    }

    /**
     * actor weaknesses
     * @type {string}
     */
    get weaknesses() {
        return this.actor.system.attributes.weaknesses
            .map((m) => m.type + ' ' + m.value)
            .sort()
            .join(', ');
    }

    /**
     * actor conditions
     * @type {string}
     */
    get conditions() {
        return this.actor.conditions.map((i) => i.name).join(', ');
    }

    /**
     * actor skills
     * @type {Object}
     */
    get skills() {
        const skills = {};
        const itemExcludes = ['armor-check-penalty', 'no-crowbar'];
        const armorIncludes = ['acrobatics', 'athletics', 'stealth', 'thievery'];
        try {
            Object.values(this.actor.skills)
                .sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0))
                .forEach((skill) => {
                    skills[skill.slug] = {};
                    if (skill.lore && skill.label.trim().toLowerCase().endsWith('lore')) {
                        skills[skill.slug]['label'] = skill.label.trim().slice(0, -4).trim();
                    } else {
                        skills[skill.slug]['label'] = skill.label.trim();
                    }
                    skills[skill.slug]['isLore'] = skill.lore;
                    skills[skill.slug]['attributeModifier'] = skill.attributeModifier.modifier || '0';
                    skills[skill.slug]['statusModifier'] = skill.modifiers
                        .filter((i) => i.type == 'status')
                        .map((i) => i.modifier)
                        .reduce((a, b) => a + b, 0);
                    skills[skill.slug]['proficiencyModifier'] = skill.modifiers
                        .filter((i) => i.type == 'proficiency')
                        .map((i) => i.modifier)
                        .reduce((a, b) => a + b, 0);
                    skills[skill.slug]['itemModifier'] = skill.modifiers
                        .filter((i) => i.type === 'item' && i.enabled && !itemExcludes.includes(i.slug))
                        .map((i) => i.modifier)
                        .reduce((a, b) => a + b, 0);
                    if (armorIncludes.includes(skill.slug)) {
                        skills[skill.slug]['armorModifier'] = skill.modifiers
                            .filter((i) => i.slug === 'armor-check-penalty')
                            .map((i) => i.modifier)
                            .reduce((a, b) => a + b, 0);
                    }
                    skills[skill.slug]['modifier'] = skill.mod - skills[skill.slug]['statusModifier'];
                    skills[skill.slug]['rank'] = skill.rank;
                });
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'skills', error.message);
        }
        return skills;
    }

    /**
     * actor languages
     * @type {string}
     */
    get languages() {
        if (semVer.gte(this.game.system.version, '5.12.0')) {
            return this.actor.system.details.languages.value.filter((i) => i.trim() != '').join(', ');
        } else {
            return this.actor.system.traits.languages.value
                .concat([this.actor.system.traits.languages.custom])
                .filter((i) => i.trim() !== '')
                .join(', ');
        }
    }

    /**
     * actor perception
     * @type {Object}
     */
    get perception() {
        const perception = {};
        try {
            perception['statusModifier'] = this.actor.perception.modifiers
                .filter((i) => i.type === 'status' && i.enabled)
                .map((i) => i.modifier)
                .reduce((a, b) => a + b, 0);
            perception['attributeModifier'] = this.actor.perception.modifiers
                .filter((i) => i.type === 'ability' && i.enabled)
                .map((i) => i.modifier)
                .reduce((a, b) => a + b, 0);
            perception['proficiencyModifier'] = this.actor.perception.modifiers
                .filter((i) => i.type === 'proficiency' && i.enabled)
                .map((i) => i.modifier)
                .reduce((a, b) => a + b, 0);
            perception['itemModifier'] = this.actor.perception.modifiers
                .filter((i) => i.type === 'item' && i.enabled)
                .map((i) => i.modifier)
                .reduce((a, b) => a + b, 0);
            perception['rank'] = this.actor.perception.rank || 0;
            perception['modifier'] = this.actor.perception.mod - perception['statusModifier'];
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'perception', error.message);
        }
        return perception;
    }

    /**
     * actor senses
     * @type {string}
     */
    get senses() {
        if (semVer.gte(game.system.version, '5.12.0')) {
            return this.actor.system.perception.senses
                .filter((i) => i.type)
                .map((i) => i.label)
                .concat(
                    this.actor.system.perception.modifiers
                        .filter((i) => i.type === 'item' || i.type === 'untyped')
                        .map((i) => ' ' + (i.slug ? i.slug : i.label) + ' ' + (i.modifier < 0 ? '' : '+') + i.modifier)
                )
                .join(', ');
        } else {
            return this.actor.system.traits.senses
                .filter((i) => i.type)
                .map((i) => i.label)
                .concat(
                    this.actor.system.attributes.perception.modifiers
                        .filter((i) => i.type === 'item' || i.type === 'untyped')
                        .map((i) => ' ' + (i.slug ? i.slug : i.label) + ' ' + (i.modifier < 0 ? '' : '+') + i.modifier)
                )
                .join(', ');
        }
    }

    /**
     * actor is wearing armor
     * @type {boolean}
     */
    get hasArmorEquipped() {
        return this.actor.items.filter((i) => i.type === 'armor' && i.isEquipped).length > 0;
    }

    /**
     * actor armor worn
     * @type {Object}
     */
    get equippedArmor() {
        if (this.hasArmorEquipped) {
            const armor = this.actor.items.filter((i) => i.type === 'armor' && i.isEquipped)[0];
            const equippedArmor = {
                strength: armor.strength,
                speedPenalty: 0,
            };
            if (armor.strength <= this.actor.abilities.str.mod) {
                equippedArmor['speedPenalty'] = armor.speedPenalty;
            }
            return equippedArmor;
        } else {
            return undefined;
        }
    }

    /**
     * actor base speed
     * @type {string}
     */
    get baseSpeed() {
        const movement = this.movement.filter((f) => f.isPrimary)[0];
        return movement.displayName;
    }

    /**
     * actor base movement
     * @type {Object}
     */
    get baseMovement() {
        return this.movement.filter((f) => f.isPrimary)[0];
    }

    /**
     * actor list of movement
     * @type {Object[]}
     */
    get movement() {
        const movement = [];
        const primary = {
            label: this.actor.system.attributes.speed.label,
            type: this.actor.system.attributes.speed.type,
            value: this.actor.system.attributes.speed.total,
            isPrimary: true,
        };
        if (this.actor.system.attributes.speed.slug === 'land-speed') {
            primary['displayName'] = this.actor.system.attributes.speed.total + ' feet';
        } else {
            primary['displayName'] =
                this.actor.system.attributes.speed.label + ' ' + this.actor.system.attributes.speed.total + ' feet';
        }
        movement.push(primary);
        this.actor.system.attributes.speed.otherSpeeds.forEach((m) => {
            const move = {
                label: m.label,
                type: m.type,
                value: m.total,
                isPrimary: false,
            };
            if (m.slug === 'land-speed') {
                move['displayName'] = m.total + ' feet';
            } else {
                move['displayName'] = m.label + ' ' + m.total + ' feet';
            }
            movement.push(move);
        });
        return movement;
    }

    /**
     * actor Sneak Attack Damage
     * @type {String}
     */
    get sneakAttackDamage() {
        if (typeof this.actor.flags.pf2e.sneakAttackDamage !== 'undefined') {
            const sad = this.actor.flags.pf2e.sneakAttackDamage;
            return `${sad.number}d${sad.faces}`;
        } else {
            return '';
        }
    }

    /**
     * Return a single strike with all calculated information
     * @param {Object} rawStrike
     * @returns {Object} formatted strike
     */
    _strike(rawStrike) {
        const strModifier = rawStrike.modifiers
            .filter((i) => i.type === 'ability' && i.slug === 'str' && i.enabled)
            .map((i) => i.modifier)
            .reduce((a, b) => a + b, 0);
        const dexModifier = rawStrike.modifiers
            .filter((i) => i.type === 'ability' && i.slug === 'dex' && i.enabled)
            .map((i) => i.modifier)
            .reduce((a, b) => a + b, 0);
        const strike = {
            label: rawStrike.label,
            readied: rawStrike.ready,
            isMelee: rawStrike.options.includes('melee'),
            isRanged: rawStrike.options.includes('ranged'),
            hasFinesse: rawStrike.item.system.traits.value.includes('finesse'),
            statusModifier: rawStrike.modifiers
                .filter((i) => i.type === 'status' && i.enabled)
                .map((i) => i.modifier)
                .reduce((a, b) => a + b, 0),
            proficiencyModifier: rawStrike.modifiers
                .filter((i) => i.type === 'proficiency' && i.enabled)
                .map((i) => i.modifier)
                .reduce((a, b) => a + b, 0),
            itemModifier: rawStrike.modifiers
                .filter((i) => i.type === 'item' && i.enabled)
                .map((i) => i.modifier)
                .reduce((a, b) => a + b, 0),
            hasBludgeoningDamage:
                rawStrike.item.system.damage.damageType === 'bludgeoning' ||
                rawStrike.item.system.traits.value.includes('versatile-b') ||
                false,
            hasPiercingDamage:
                rawStrike.item.system.damage.damageType === 'piercing' ||
                rawStrike.item.system.traits.value.includes('versatile-p') ||
                false,
            hasSlashingDamage:
                rawStrike.item.system.damage.damageType === 'slashing' ||
                rawStrike.item.system.traits.value.includes('versatile-s') ||
                false,
            damageFormula: rawStrike.damage({ getFormula: true }),
            sneakAttackDamage: this.sneakAttackDamage,
            traits: pf2eHelper
                .runesToTraits(rawStrike.item.system.runes)
                .concat(rawStrike.item.system.traits.value)
                .sort(),
        };
        if (strike.isRanged && typeof rawStrike.item.system.range !== 'undefined') {
            strike['traits'].push(`range-${rawStrike.item.system.range}`);
            strike['traits'].sort();
        }
        strike['modifier'] = rawStrike.totalModifier - strike.statusModifier;

        if (strike.isRanged) {
            strike['attributeModifier'] = dexModifier;
            strike['attributeName'] = 'dex';
        } else if (strike.isMelee && strike.hasFinesse && dexModifier > strModifier) {
            strike['attributeModifier'] = dexModifier;
            strike['attributeName'] = 'dex';
        } else {
            strike['attributeModifier'] = strModifier;
            strike['attributeName'] = 'str';
        }
        return strike;
    }

    /**
     * actor strikes
     * @type {Object[]}
     */
    get strikes() {
        const strikes = [];
        try {
            let rawStrikes = [];
            this.actor.system.actions
                .filter((i) => i.type === 'strike' && (i.options?.includes('melee') || i.options?.includes('ranged')))
                .sort((a, b) => (a.ready > b.ready ? 1 : a.ready < b.ready ? -1 : 0))
                .reverse()
                .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0))
                .forEach((strike) => {
                    rawStrikes.push(strike);
                    if (typeof strike.altUsages !== 'undefined') {
                        rawStrikes = rawStrikes.concat(strike.altUsages);
                    }
                });
            for (let i = 0; i < rawStrikes.length; i++) {
                const rawStrike = rawStrikes[i];

                const strike = this._strike(rawStrike);
                strikes.push(strike);
            }
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'strikes', error.message);
        }
        return strikes;
    }

    /**
     * actor weapon proficiencies
     * @type {Object}
     */
    get weaponProficiencies() {
        const proficiencies = {};
        try {
            Object.keys(this.actor.system.proficiencies.attacks).forEach((p) => {
                proficiencies[p] = {
                    label: p,
                    rank: this.actor.system.proficiencies.attacks[p].rank || 0,
                };
            });
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'weaponProficiencies', error.message);
        }
        return proficiencies;
    }

    /**
     * actor class DC
     * @type {Object}
     */
    get classDC() {
        const classDC = {};
        try {
            classDC['statusModifier'] = (this.actor.classDC?.modifiers || [])
                .filter((i) => i.type === 'status')
                .map((i) => i.modifier)
                .reduce((a, b) => a + b, 0);
            classDC['proficiencyModifier'] = (this.actor.classDC?.modifiers || [])
                .filter((i) => i.type === 'proficiency')
                .map((i) => i.modifier)
                .reduce((a, b) => a + b, 0);
            classDC['itemModifier'] = (this.actor.classDC?.modifiers || [])
                .filter((i) => i.type === 'item')
                .map((i) => i.modifier)
                .reduce((a, b) => a + b, 0);
            classDC['modifier'] = 10 + (this.actor.classDC?.mod || 0) - classDC['statusModifier'];
            classDC['attributeModifier'] = this.actor.classDC?.attributeModifier.value || 0;
            classDC['rank'] = this.actor.classDC?.rank || 0;
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'weaponProficiencies', error.message);
        }

        return classDC;
    }

    /**
     * @typedef {Object} Heritage
     * @property {string} name The heritage name
     * @property {string} displayName the heritage display name
     * @property {string} description the description of the heritage
     */

    /**
     * actor ancestry and heritage abilities
     * @type {Heritage[]}
     */
    get ancestryAndHeritageAbilities() {
        const ancestryAndHeritageAbilities = [];
        try {
            /* get regular ancestry & heritage features */
            this.actor.items
                .filter((i) => i.type === 'feat' && (i.category === 'ancestryfeature' || i.category == 'heritage'))
                .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
                .forEach((a) => {
                    const feature = {
                        name: a.name,
                        displayName: a.name,
                        description: a.system.description?.value,
                    };
                    const sub = this.actor.items
                        .filter((i) => i.flags?.pf2e?.grantedBy?.id === a._id)
                        .map((i) => i.name);
                    if (sub.length > 0) {
                        feature['displayName'] = `${a.name} (${sub.join(', ')})`;
                    }
                    ancestryAndHeritageAbilities.push(feature);
                });
            /* get the hidden heritage features */
            this.actor.items
                .filter(
                    (f) => f.type === 'feat' && f.system.location === null && f.flags.pf2e.grantedBy?.id !== undefined
                )
                .forEach((a) => {
                    const grantedBy = this.actor.items.filter(
                        (i) => i._id === a.flags?.pf2e?.grantedBy?.id && i.type === 'heritage'
                    );
                    if (grantedBy.length > 0) {
                        const feature = {
                            name: a.name,
                            displayName: a.name,
                            description: a.system.description?.value,
                        };
                        ancestryAndHeritageAbilities.push(feature);
                    }
                });
        } catch (error) {
            throw new pf2eActorPropertyError(
                'actor-export',
                'pf2eActor',
                'ancestryAndHeritageAbilities',
                error.message
            );
        }
        return ancestryAndHeritageAbilities;
    }

    /**
     * @typedef {Object} Feat
     * @property {string} description  the description of the feat
     * @property {number} level the level of the feat
     * @property {string} name the name of the feat
     * @property {string} prerequisites the prerequisites of the feat
     * @property {string[]} traits the traits of the feat
     */

    /**
     * actor ancestry feats
     * @type {Feat[]}
     */
    get ancestryFeats() {
        const ancestryFeats = [];
        try {
            for (let i = 1; i <= 20; i++) {
                this.actor.items
                    .filter(
                        (f) =>
                            f.type === 'feat' &&
                            (f.system.location === `ancestry-${i}` || (i === 1 && f.system.onlyLevel1))
                    )
                    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
                    .forEach((f) => {
                        const sub = this.actor.items
                            .filter((f) => f.flags?.pf2e?.grantedBy?.id === f._id)
                            .map((m) => m.name);
                        let featName = f.name;
                        if (f.grants.length > 0) {
                            featName = featName + ' (' + f.grants.map((m) => m.name).join(', ') + ')';
                        }
                        const feat = {
                            level: i,
                            name: featName,
                            description: f.system.description.value,
                            traits: [f.system.traits.rarity].concat(f.system.traits.value),
                            prerequisites: f.system.prerequisites.value,
                        };
                        if (sub.length > 0) {
                            feat['name'] = `${f.name} (${sub.join(', ')})`;
                        }
                        ancestryFeats.push(feat);
                    });
            }
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'ancestryFeats', error.message);
        }
        return ancestryFeats;
    }

    /**
     * actor background skill feats
     * @type {Feat[]}
     */
    get backgroundSkillFeats() {
        const backgroundSkillFeats = [];
        try {
            Object.keys(this.actor.background?.system.items || []).forEach((b) => {
                const feat = {
                    name: this.actor.background.system.items[b].name,
                    level: this.actor.background.system.items[b].level,
                    traits: [],
                    description: '',
                };
                const i = this.actor.items.filter((f) => f.type === 'feat' && f.name === feat['name']);
                if (i.length > 0) {
                    feat['description'] = i[0].system.description.value;
                    feat['traits'] = [i[0].system.traits.rarity].concat(i[0].system.traits.value);
                    feat['prerequisites'] = i[0].system.prerequisites.value;
                }
                backgroundSkillFeats.push(feat);
            });
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'backgroundSkillFeats', error.message);
        }
        return backgroundSkillFeats;
    }

    /**
     * actor skill feats
     * @type {Feat[]}
     */
    get skillFeats() {
        const skillFeats = [];
        try {
            for (let i = 1; i <= 20; i++) {
                this.actor.items
                    .filter((f) => f.type === 'feat' && f.system.location === `skill-${i}`)
                    .forEach((f) => {
                        let featName = f.name;
                        if (f.grants.length > 0) {
                            featName = featName + ' (' + f.grants.map((m) => m.name).join(', ') + ')';
                        }
                        skillFeats.push({
                            name: featName,
                            level: i,
                            description: f.system.description.value,
                            traits: [f.system.traits.rarity].concat(f.system.traits.value),
                            prerequisites: f.system.prerequisites.value,
                        });
                    });
            }
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'skillFeats', error.message);
        }
        return skillFeats;
    }

    /**
     * actor general feats
     * @type {Feat[]}
     */
    get generalFeats() {
        const generalFeats = [];
        try {
            for (let i = 1; i <= 20; i++) {
                this.actor.items
                    .filter((f) => f.type === 'feat' && f.system.location === `general-${i}`)
                    .forEach((f) => {
                        let featName = f.name;
                        if (f.grants.length > 0) {
                            featName = featName + ' (' + f.grants.map((m) => m.name).join(', ') + ')';
                        }
                        generalFeats.push({
                            level: i,
                            name: featName,
                            description: f.system.description.value,
                            prerequisites: f.system.prerequisites.value,
                            traits: [f.system.traits.rarity].concat(f.system.traits.value),
                        });
                    });
            }
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'generalFeats', error.message);
        }
        return generalFeats;
    }

    /**
     * @typedef {Object} AtrributeBoost an attribute boost
     * @property {number} level the level for the applied boost
     * @property {'str'|'dex'|'con'|'int'|'wis'|'cha'} ability the shortname of the ability boost
     */

    /**
     * actor attribute boosts
     * @type {AtrributeBoost[]}
     */
    get attributeBoosts() {
        const attributeBoosts = [];
        try {
            for (let i = 5; i <= 20; i = i + 5) {
                if (typeof this.actor.system.build !== 'undefined') {
                    this.actor.system.build.attributes.boosts[i].forEach((a) => {
                        attributeBoosts.push({ level: i, boost: a });
                    });
                }
            }
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'attributeBoosts', error.message);
        }
        return attributeBoosts;
    }

    /**
     * actor bonus feats
     * @type {Feat[]}
     */
    get bonusFeats() {
        const bonusFeats = [];
        try {
            this.actor.items
                .filter(
                    (f) => f.type === 'feat' && f.system.location === null && f.flags.pf2e.grantedBy?.id === undefined
                )
                .forEach((feat) => {
                    bonusFeats.push({
                        level: -1,
                        name: feat.name,
                        description: feat.system.description.value,
                        prerequisites: feat.system.prerequisites.value,
                        traits: [feat.system.traits.rarity].concat(feat.system.traits.value),
                    });
                });
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'bonusFeats', error.message);
        }
        return bonusFeats;
    }

    /**
     * actor class feats
     * @type {Feat[]}
     */
    get classFeats() {
        const classFeats = [];
        try {
            this.actor.items
                .filter(
                    (f) =>
                        f.type === 'feat' &&
                        (f.system?.location?.startsWith('archetype-') || f.system?.location?.startsWith('class-'))
                )
                .forEach((feat) => {
                    classFeats.push({
                        level: Number(feat.system.location.split('-').at(-1)),
                        name: feat.name,
                        description: feat.system.description.value,
                        prerequisites: feat.system.prerequisites.value,
                        traits: [feat.system.traits.rarity].concat(feat.system.traits.value),
                    });
                });
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'classFeats', error.message);
        }
        return classFeats;
    }

    /**
     * @typedef {Object} Feature a class feature
     * @property {number} level the level for the feature
     * @property {string} name the name of the feature
     * @property {string[]} traits teh traits of the feature
     * @property {string} frequency the frequency a feature can be used
     * @property {string} description  the description of the feature
     */
    /**
     * actor class features
     * @type {Feature[]}
     */
    get classFeatures() {
        const classFeatures = [];
        try {
            this.actor.items
                .filter(
                    (f) =>
                        f.type === 'feat' && f.system.category === 'classfeature' && f.system.location === this.class.id
                )
                .forEach((f) => {
                    const subFeatures = this.actor.items
                        .filter((i) => i.flags?.pf2e?.grantedBy?.id === f._id)
                        .map((m) => m.name);
                    const feature = {
                        level: f.system.level.value,
                        name: f.name,
                        traits: [f.system.traits.rarity].concat(f.system.traits.value),
                        frequency: '',
                        description: f.system.description?.value || '',
                    };
                    if (f.frequency?.max !== undefined && f.frequency?.per !== undefined) {
                        feature['frequency'] = `${f.frequency.max}/` + pf2eHelper.frequencyToHuman(f.frequency.per);
                    }
                    if (subFeatures.length > 0 && subFeatures.join(', ') !== f.name) {
                        feature['name'] = `${f.name} (${subFeatures.join(', ')})`;
                    }
                    classFeatures.push(feature);
                });
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'classFeatures', error.message);
        }
        return classFeatures;
    }

    /**
     * @typedef {Object} Item an inventory item
     * @property {number} containerLevel the level of the container the item is in
     * @property {string} name the name of the item
     * @property {string} displayName the display name of th eitem entry
     * @property {number} quantity the number of this item in the inventory
     * @property {boolean} isMagical is the item magical?
     * @property {boolean} isInvested is the item invested?
     * @property {number} bulk the bulk value of the item
     * @property {'armor'|'weapon'|'treasure'|'equipment'|'backpack'} type the type of the item
     * @property {string} stackGroup don't know
     * @property {'worn'|'stowed'} carryType how is the item carried
     * @property {number} level the level of the item
     * @property {string[]} price the price of the item
     * @property {string[]} traits the triats of the item
     * @property {string} description the description of the item
     * @property {Item[]} items The items within the container
     * @property {string} containerId the id of the container the item is in
     */

    /**
     * all actor items
     * @type {Item[]}
     */
    get items() {
        const items = this._items();
        return items;
    }

    /**
     * Enumerate actor items in a container
     * @param {null|string} [containerId=null] the id of the container to get the items from (null for the root)
     * @param {number} [level=0] a number indicating the level of depth the item is in
     * @returns {Item[]}
     */
    _items(containerId = null, level = 0) {
        const _items = [];
        try {
            this.actor.inventory.contents
                .filter((f) => f.system.containerId === containerId)
                .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
                .forEach((i) => {
                    const item = this._rawItem(i);
                    item['containerLevel'] = level;
                    item['items'] = this._items(i._id, level + 1);
                    _items.push(item);
                });
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', '_items', error.message);
        }
        return _items;
    }

    /**
     * parse an item into the requested format
     * @param {Object} item the item to parse
     * @returns {Item}
     */
    _rawItem(item) {
        const rawItem = {
            name: item.name,
            displayName: (item.system.quantity > 1 ? `${item.system.quantity} ` : '') + item.name,
            quantity: item.system.quantity,
            isMagical: item.isMagical,
            isInvested: item.isInvested,
            bulk: item.system.bulk.value,
            type: item.type,
            stackGroup: item.system.stackGroup,
            carryType: item.system.equipped.carryType,
            level: item.system.level.value,
            price: this._calculatePrice(item.system.price),
            traits: [item.system.traits.rarity].concat(item.system.traits.value),
            description: item.system.description.value,
            items: [],
            containerId: item.system.containerId,
            // activation?
        };
        return rawItem;
    }

    /**
     * return a flat list of items
     * @param {Item[]} [itemList=this.items] list of items to parse
     * @returns {Item[]}
     */
    flatItems(itemList = this.items) {
        const flatItems = [];
        itemList.forEach((item) => {
            flatItems.push(item);
            this.flatItems(item.items).forEach((childItem) => {
                if (flatItems.map((m) => m.name).indexOf(childItem.name) < 0) {
                    flatItems.push(childItem);
                }
            });
        });
        return flatItems;
    }

    /**
     * actor held items
     * @type {Item[]}
     */
    get heldItems() {
        return this.items.filter(
            (f) =>
                f.stackGroup !== 'coins' && f.type !== 'consumable' && f.type !== 'treasure' && f.carryType === 'held'
        );
    }

    /**
     * actor consumables
     * @type {Item[]}
     */
    get consumables() {
        return this.items.filter((f) => f.stackGroup !== 'coins' && f.type === 'consumable');
    }

    /**
     * actor worn items
     * @type {Item[]}
     */
    get wornItems() {
        return this.items.filter(
            (f) =>
                f.stackGroup !== 'coins' && f.type !== 'consumable' && f.type !== 'treasure' && f.carryType === 'worn'
        );
    }

    /**
     * @typedef {Object} Coins
     * @property {number} cp Copper pieces
     * @property {number} sp Silver pieces
     * @property {number} gp Gold pieces
     * @property {number} pp Platinum pieces
     *
     */

    /**
     * actor coins
     * @type {Coins}
     */
    get coins() {
        const coins = {};
        try {
            ['cp', 'sp', 'gp', 'pp'].forEach((coin) => {
                coins[coin] = this.actor.inventory.coins[coin] || 0;
            });
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'coins', error.message);
        }
        return coins;
    }

    /**
     * actor total bulk
     * @type {number}
     */
    get totalBulk() {
        try {
            return this.actor.inventory.bulk.value.normal || 0;
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'totalBulk', error.message);
        }
    }

    /**
     * Calculate the price based on the price object
     * @param {Object} price the price object
     * @returns {array} an array containing all coins
     */
    _calculatePrice(price) {
        const calculatePrice = [];
        ['pp', 'gp', 'sp', 'cp'].forEach((coin) => {
            if (price.value[coin] > 0) {
                calculatePrice.push(`${price.value[coin]} ${coin}`);
            }
        });
        return calculatePrice;
    }

    /**
     * actor gems and artwork
     * @type {Item[]}
     */
    get gemsAndArtwork() {
        return this.items.filter((f) => f.stackGroup !== 'coins' && f.type !== 'consumable' && f.type === 'treasure');
    }

    /**
     * @typedef {Object} Details
     * @property {string} ethnicity
     * @property {string} nationality
     * @property {string} age
     * @property {string} gender
     * @property {string} height
     * @property {string} weight
     * @property {string} deity
     * @property {Object} biography
     * @property {string} biography.appearance
     * @property {string} biography.attitude
     * @property {string} biography.edicts
     * @property {string} biography.anathema
     * @property {string} biography.dislikes
     * @property {string} biography.likes
     * @property {string} biography.catchphrases
     * @property {string} biography.campaignNotes
     * @property {string} biography.allies
     * @property {string} biography.enemies
     * @property {string} biography.organizations
     */

    /**
     * actor details
     * @type {Details}
     */
    get details() {
        const details = {};
        try {
            details['ethnicity'] = this.actor.system.details.ethnicity?.value || '';
            details['nationality'] = this.actor.system.details.nationality?.value || '';
            details['age'] = this.actor.system.details.age?.value || '';
            details['gender'] = this.actor.system.details.gender?.value || '';
            details['height'] = this.actor.system.details.height?.value || '';
            details['weight'] = this.actor.system.details.weight?.value || '';
            details['deity'] = this.actor.deity?.name || '';
            details['biography'] = {
                appearance: this.actor.system.details.biography?.appearance || '',
                attitude: this.actor.system.details.biography?.attitude || '',
                edicts: this.actor.system.details.biography?.edicts || '',
                anathema: this.actor.system.details.biography?.anathema || '',
                birthplace: this.actor.system.details.biography?.birthPlace || '',
                dislikes: this.actor.system.details.biography?.dislikes || '',
                likes: this.actor.system.details.biography?.likes || '',
                catchphrases: this.actor.system.details.biography?.catchphrases || '',
                campaignNotes: this.actor.system.details.biography?.campaignNotes || '',
                allies: this.actor.system.details.biography?.allies || '',
                enemies: this.actor.system.details.biography?.enemies || '',
                organizations: this.actor.system.details.biography?.organizations || '',
            };
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'details', error.message);
        }
        return details;
    }

    /**
     * @typedef {Object} Action
     * @property {string} name
     * @property {string[]} traits
     * @property {string} reference
     * @property {string} frequency
     * @property {string} type
     * @property {string} description
     * @property {number} actionCount
     * @property {string} category
     * @property {string} glyph
     */

    /**
     * actor actions, free actions and reactions
     * @type {Action[]}
     */
    get activities() {
        const activities = [];
        try {
            const actionTypes = ['action', 'free', 'reaction'];
            this.actor.items
                .filter((i) => actionTypes.includes(i.system.actionType?.value))
                .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
                .forEach((a) => {
                    const activity = {
                        name: a.name,
                        reference: a.system.publication?.title || a.system.source?.value || '',
                        frequency: '',
                        type: a.system.actionType.value,
                        description: a.system.description.value,
                        actionCount: a.system.actions.value,
                        category: a.system.category,
                    };
                    if (typeof a.system.traits.rarity === 'undefined') {
                        activity['traits'] = a.system.traits.value;
                    } else {
                        activity['traits'] = [a.system.traits.rarity].concat(a.system.traits.value);
                    }
                    activity['glyph'] = pf2eHelper.formatActivity(
                        a.system.actionType.value,
                        a.system.actions.value,
                        pf2eHelper.pdfActionIconsGlyphs
                    );
                    if (a.frequency?.max !== undefined && a.frequency?.per !== undefined) {
                        activity['frequency'] = `${a.frequency.max}/` + pf2eHelper.frequencyToHuman(a.frequency.per);
                    }
                    activities.push(activity);
                });
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'activities', error.message);
        }
        return activities;
    }

    /**
     * actor has spells belonging to the arcane tradition
     * @type {boolean}
     */
    get hasArcaneTradition() {
        try {
            return (
                this.actor.spellcasting.filter(
                    (f) =>
                        f.system?.tradition?.value == 'arcane' &&
                        this.spellcastingTypes.includes(f.system?.prepared?.value)
                ).length > 0
            );
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'hasArcaneTradition', error.message);
        }
    }

    /**
     * actor has spells belonging to the occult tradition
     * @type {boolean}
     */
    get hasOccultTradition() {
        try {
            this.actor.spellcasting.filter(
                (f) =>
                    f.system?.tradition?.value == 'occult' && this.spellcastingTypes.includes(f.system?.prepared?.value)
            ).length > 0;
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'hasOccultTradition', error.message);
        }
    }

    /**
     * actor has spells belonging to the primal tradition
     * @type {boolean}
     */
    get hasPrimalTradition() {
        try {
            this.actor.spellcasting.filter(
                (f) =>
                    f.system?.tradition?.value == 'primal' && this.spellcastingTypes.includes(f.system?.prepared?.value)
            ).length > 0;
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'hasPrimalTradition', error.message);
        }
    }

    /**
     * actor has spells belonging to the divine tradition
     * @type {boolean}
     */
    get hasDivineTradition() {
        try {
            this.actor.spellcasting.filter(
                (f) =>
                    f.system?.tradition?.value == 'divine' && this.spellcastingTypes.includes(f.system?.prepared?.value)
            ).length > 0;
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'hasDivineTradition', error.message);
        }
    }

    /**
     * actor is a prepared caster
     * @type {boolean}
     */
    get isPreparedCaster() {
        try {
            return (
                this.actor.spellcasting.filter(
                    (f) =>
                        this.spellcastingTraditions.includes(f.system?.tradition.value) &&
                        f.system?.prepared?.value === 'prepared'
                ).length > 0
            );
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'isPreparedCaster', error.message);
        }
    }

    /**
     * actor is a spontaneous caster
     * @type {boolean}
     */
    get isSpontaneousCaster() {
        try {
            return (
                this.actor.spellcasting.filter(
                    (f) =>
                        this.spellcastingTraditions.includes(f.system?.tradition.value) &&
                        f.system?.prepared?.value === 'spontaneous'
                ).length > 0
            );
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'isSpontaneousCaster', error.message);
        }
    }

    /**
     * actor spellcasting entries
     * @type {Object[]}
     */
    get spellCastingEntries() {
        return this.actor.spellcasting.filter((f) => f.type === 'spellcastingEntry');
    }

    /**
     * actor spell proficiency
     * @type {Object[]}
     */
    get spellProficiency() {
        try {
            return this.spellCastingEntries.map((m) => {
                const dcStatusModifier = m.statistic.modifiers
                    .filter((f) => f.type === 'status')
                    .map((i) => i.modifier)
                    .reduce((a, b) => a + b, 0);
                const spellStatusModifier = dcStatusModifier;
                return {
                    name: m.name,
                    attack: {
                        rank: m.statistic.rank,
                        modifier: m.statistic.mod - spellStatusModifier,
                        proficiencyModifier: m.statistic.modifiers
                            .filter((f) => f.type === 'proficiency')
                            .map((i) => i.modifier)
                            .reduce((a, b) => a + b, 0),
                        attributeModifier: m.statistic.modifiers
                            .filter((f) => f.type === 'ability')
                            .map((i) => i.modifier)
                            .reduce((a, b) => a + b, 0),
                        statusModifier: spellStatusModifier,
                    },
                    spell: {
                        rank: m.statistic.rank,
                        modifier: 10 + m.statistic.mod - dcStatusModifier,
                        proficiencyModifier: m.statistic.modifiers
                            .filter((f) => f.type === 'proficiency')
                            .map((i) => i.modifier)
                            .reduce((a, b) => a + b, 0),
                        attributeModifier: m.statistic.modifiers
                            .filter((f) => f.type === 'ability')
                            .map((i) => i.modifier)
                            .reduce((a, b) => a + b, 0),
                        statusModifier: dcStatusModifier,
                    },
                };
            });
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'spellProficiency', error.message);
        }
    }

    /**
     * actor's highest spellcasting proficiency
     * @type {Object}
     */
    get highestSpellProficiency() {
        let highestSpellProficiency;
        try {
            this.spellProficiency.forEach((sp) => {
                if (typeof highestSpellProficiency === 'undefined') {
                    highestSpellProficiency = sp;
                } else if (sp.spell.modifier > highestSpellProficiency.spell.modifier) {
                    highestSpellProficiency = sp;
                }
            });
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'highestSpellProficiency', error.message);
        }
        if (typeof highestSpellProficiency !== 'undefined') {
            return highestSpellProficiency;
        }
        return undefined;
    }

    /**
     * actor spellslots
     * @type {array}
     */
    get spellSlots() {
        const spellSlots = [];
        try {
            this.actor.spellcasting
                .filter(
                    (i) =>
                        this.spellcastingTraditions.includes(i.system?.tradition?.value) &&
                        this.spellcastingTypes.includes(i.system?.prepared?.value)
                )
                .forEach((sce) => {
                    Object.keys(sce.spells.entry.system.slots).forEach((slot) => {
                        spellSlots.push({
                            sce: sce.name,
                            rank: Number(slot.slice(4)),
                            value: sce.spells.entry.system.slots[slot].value,
                            max: sce.spells.entry.system.slots[slot].max,
                        });
                    });
                });
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'spellSlots', error.message);
        }

        return spellSlots;
    }

    /**
     * actor cantrip rank
     * @type {number}
     */
    get cantripRank() {
        try {
            return Math.ceil(this.level / 2);
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'cantripRank', error.message);
        }
    }

    /**
     * actor focus points
     * @type {Object}
     */
    get focusPoints() {
        try {
            return {
                max:
                    this.actor.system.resources.focus.max > this.actor.system.resources.focus.cap
                        ? this.actor.system.resources.focus.cap
                        : this.actor.system.resources.focus.max,
                value: this.actor.system.resources.focus.value,
            };
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'focusPoints', error.message);
        }
    }

    /**
     * actor focus spell rank
     * @type {number}
     */
    get focusSpellRank() {
        try {
            return Math.ceil(this.level / 2);
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'focusSpellRank', error.message);
        }
    }

    /**
     * actor maximum spell rank
     * @type {number}
     */
    get maximumSpellRank() {
        try {
            return Math.ceil(this.level / 2);
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'maximumSpellRank', error.message);
        }
    }

    /**
     * actor known spells
     * @type {array}
     */
    get knownSpells() {
        const knownSpells = [];
        try {
            this.spellCastingEntries
                .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
                .forEach((sce) => {
                    for (let r = 0; r <= this.maximumSpellRank; r++) {
                        sce.spells
                            .filter(
                                (i) =>
                                    (i.isCantrip && i.rank === r) ||
                                    (!i.isCantrip &&
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
                                                    (i.system.heightening.type === 'fixed' && i.rank < r)))))
                            )
                            .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
                            .forEach((s) => {
                                const spell = {
                                    type: sce.name,
                                    name: s.name,
                                    rank: r,
                                    castingTime: s.system.time.value,
                                    isCantrip: s.isCantrip,
                                    isFocusSpell: s.isFocusSpell,
                                    isInnateSpell: sce.system.prepared.value === 'innate',
                                    glyph: pf2eHelper.formatSpellCastingTime(
                                        s.system.time.value,
                                        pf2eHelper.pdfActionIconsGlyphs
                                    ),
                                    heightened:
                                        !s.isCantrip && typeof s.system.heightening !== 'undefined' && s.rank !== r,
                                    signatureSpell: s.system.location?.signature || false,
                                    prepared: Object.values(sce.system.slots[`slot${r}`].prepared).filter(
                                        (f) => f.id === s._id
                                    ).length,
                                    save:
                                        typeof s.system.defense?.passive !== 'undefined' ||
                                        typeof s.system.defense?.save !== 'undefined',
                                    saveStatistic:
                                        s.system.defense?.passive?.statistic || s.system.defense?.save?.statistic || '',
                                    saveIsBasic: s.system.defense?.save?.basic || false,
                                    range: s.system.range?.value || '',
                                    reference: s.system.publication?.title || s.system.source?.value || '',
                                    tradition: sce.system?.tradition?.value,
                                    traits: [s.system.traits.rarity].concat(s.system.traits.value),
                                    description: s.system.description.value,
                                    duration: s.system.duration?.value || '',
                                    isSustained: s.system.duration?.sustained || false,
                                    target: s.system.target?.value || '',
                                    area: '',
                                };

                                if (spell['heightened'] && s.system.heightening.type === 'fixed') {
                                    spell['heighteningType'] = s.system.heightening.type;
                                    spell['heighteningValue'] = r - s.rank;
                                } else if (spell['heightened'] && s.system.heightening.type === 'interval') {
                                    spell['heighteningType'] = s.system.heightening.type;
                                    spell['heighteningValue'] = (r - s.rank) / s.system.heightening.interval;
                                }
                                if (s.system.area !== null) {
                                    spell['area'] = `${s.system.area.value}ft ${s.system.area.type}`;
                                }
                                if (spell['saveStatistic'].toLowerCase().endsWith('-dc')) {
                                    spell['saveStatistic'] = spell['saveStatistic'].slice(0, -3);
                                }

                                knownSpells.push(spell);
                            });
                    }
                });
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'knownSpells', error.message);
        }
        return knownSpells;
    }

    /**
     * actor know formulas
     * @type {array}
     */
    get knownFormulas() {
        return [];
    }

    /**
     * actor known rituals
     * @type {array}
     */
    get knownRituals() {
        const knownRituals = [];
        try {
            this.actor.items
                .filter((f) => f.isRitual)
                .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
                .forEach((r) => {
                    const ritual = {
                        name: r.name,
                        rank: r.system.level.value,
                        castingTime: r.system.time.value,
                        cost: r.system.cost.value,
                        traits: [r.system.traits.rarity].concat(r.system.traits.value),
                        description: r.system.description.value,
                        duration: r.system.duration?.value || '',
                        isSustained: r.system.duration?.sustained || false,
                        target: r.system.target?.value || '',
                        range: r.system.range?.value || '',
                        area: '',
                        primaryCheck: r.system.ritual.primary?.check,
                        secondaryCheck: r.system.ritual.secondary?.check,
                        secondaryCasters: r.system.ritual.secondary?.casters || 0,
                    };
                    if (r.system.area !== null) {
                        ritual['area'] = `${r.system.area.value}ft ${r.system.area.type}`;
                    }

                    knownRituals.push(ritual);
                });
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'knownRituals', error.message);
        }
        return knownRituals;
    }
}

/**
 * pf2e Actor Property Error
 * @class
 * @augments Error
 * @param {string} moduleName the name of the module the error has occurred in
 * @param {string} className the name of the class the error has occurred in
 * @param {string} methodName the name of the method the error has occurred in
 * @param {string} message the error message
 */
class pf2eActorPropertyError extends genericPropertyError {
    constructor(moduleName, className, methodName, message) {
        super(moduleName, className, methodName, message, 'pf2eActorPropertyError');
    }
}

/**
 * pf2e player character class
 * @class
 * @augments pf2eActor
 * @param {Object} game the Foundry VTT game object
 * @param {Object} actor the Foundry VTT actor object
 */
export class pf2ePlayer extends pf2eActor {
    constructor(game, actor) {
        super(game, actor);
    }

    /**
     * actor background
     * @type {Object}
     */
    get background() {
        const background = {
            name: this.actor.background?.name || 'unknown',
            description: this.actor.background?.system.description.value || '',
        };
        return background;
    }

    /**
     * actor know formulas
     * @type {array}
     */
    get knownFormulas() {
        const knownFormulas = [];
        const formulaCost = [
            '5 sp',
            '1 gp',
            '2 gp',
            '3 gp',
            '5 gp',
            '8 gp',
            '13 gp',
            '18 gp',
            '25 gp',
            '35 gp',
            '50 gp',
            '70 gp',
            '100 gp',
            '150 gp',
            '225 gp',
            '325 gp',
            '500 gp',
            '750 gp',
            '1,200 gp',
            '2,000 gp',
            '3,500 gp',
        ];
        try {
            this.actor.system.crafting.formulas.forEach((f) => {
                const el = fromUuidSync(f.uuid);
                knownFormulas.push({
                    name: el.name,
                    level: el.system.level.value,
                    description: el.system.description.value,
                    traits: [el.system.traits.rarity].concat(el.system.traits.value),
                    cost: formulaCost[el.system.level.value],
                });
            });
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'knownFormulas', error.message);
        }

        return knownFormulas;
    }
}

/**
 * pf2e player NPC class
 * @class
 * @augments pf2eActor
 * @param {Object} game the Foundry VTT game object
 * @param {Object} actor the Foundry VTT actor object
 */
export class pf2eNPC extends pf2eActor {
    constructor(game, actor) {
        super(game, actor);
    }

    /**
     * actor ac
     * @type {Object}
     */
    get ac() {
        const ac = {};
        ac['modifier'] = this.actor.system.attributes.ac.value;

        return ac;
    }

    /**
     * actor strikes
     * @type {array}
     */
    get strikes() {
        const strikes = [];
        try {
            let rawStrikes = [];
            this.actor.system.actions
                .filter((i) => i.type === 'strike' && (i.options?.includes('melee') || i.options?.includes('ranged')))
                .sort((a, b) => (a.ready > b.ready ? 1 : a.ready < b.ready ? -1 : 0))
                .reverse()
                .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0))
                .forEach((strike) => {
                    rawStrikes.push(strike);
                    if (typeof strike.altUsages !== 'undefined') {
                        rawStrikes = rawStrikes.concat(strike.altUsages);
                    }
                });
            for (let i = 0; i < rawStrikes.length; i++) {
                const rawStrike = rawStrikes[i];
                const strModifier = rawStrike.modifiers
                    .filter((i) => i.type === 'ability' && i.slug === 'str' && i.enabled)
                    .map((i) => i.modifier)
                    .reduce((a, b) => a + b, 0);
                const dexModifier = rawStrike.modifiers
                    .filter((i) => i.type === 'ability' && i.slug === 'dex' && i.enabled)
                    .map((i) => i.modifier)
                    .reduce((a, b) => a + b, 0);
                const strike = {
                    label: rawStrike.label,
                    readied: rawStrike.ready,
                    isMelee: rawStrike.options.includes('melee'),
                    isRanged: rawStrike.options.includes('ranged'),
                    hasFinesse: rawStrike.item.system.traits.value.includes('finesse'),
                    statusModifier: rawStrike.modifiers
                        .filter((i) => i.type === 'status' && i.enabled)
                        .map((i) => i.modifier)
                        .reduce((a, b) => a + b, 0),
                    proficiencyModifier: rawStrike.modifiers
                        .filter((i) => i.type === 'proficiency' && i.enabled)
                        .map((i) => i.modifier)
                        .reduce((a, b) => a + b, 0),
                    itemModifier: rawStrike.modifiers
                        .filter((i) => i.type === 'item' && i.enabled)
                        .map((i) => i.modifier)
                        .reduce((a, b) => a + b, 0),
                    traits: pf2eHelper
                        .runesToTraits(rawStrike.item.system.runes)
                        .concat(rawStrike.item.system.traits.value)
                        .sort(),
                };
                const damageRoll = rawStrike.item.system.damageRolls[Object.keys(rawStrike.item.system.damageRolls)[0]];
                strike['hasBludgeoningDamage'] =
                    damageRoll.damageType === 'bludgeoning' ||
                    rawStrike.item.system.traits.value.includes('versatile-b') ||
                    false;
                strike['hasPiercingDamage'] =
                    damageRoll.damageType === 'piercing' ||
                    rawStrike.item.system.traits.value.includes('versatile-p') ||
                    false;
                strike['hasSlashingDamage'] =
                    damageRoll.damageType === 'slashing' ||
                    rawStrike.item.system.traits.value.includes('versatile-s') ||
                    false;
                strike['damageFormula'] = damageRoll.damage;
                if (strike.isRanged && typeof rawStrike.item.system.range !== 'undefined') {
                    strike['traits'].push(`range-${rawStrike.item.system.range}`);
                    strike['traits'].sort();
                }
                strike['modifier'] = rawStrike.totalModifier - strike.statusModifier;

                if (strike.isRanged) {
                    strike['attributeModifier'] = dexModifier;
                    strike['attributeName'] = 'dex';
                } else if (strike.isMelee && strike.hasFinesse && dexModifier > strModifier) {
                    strike['attributeModifier'] = dexModifier;
                    strike['attributeName'] = 'dex';
                } else {
                    strike['attributeModifier'] = strModifier;
                    strike['attributeName'] = 'str';
                }
                strikes.push(strike);
            }
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eActor', 'strikes', error.message);
        }
        return strikes;
    }

    /**
     * actor skills
     * @type {Object}
     */
    get skills() {
        const skills = {};
        try {
            this.actor.items
                .filter((f) => f.type === 'lore')
                .forEach((s) => {
                    const slug = s.name.toLowerCase().replace(/\s+/g, '-');
                    skills[slug] = {
                        label: s.name,
                        modifier: s.system.mod.value,
                    };
                });
        } catch (error) {
            throw new pf2eActorPropertyError('actor-export', 'pf2eNPC', 'skills', error.message);
        }
        return skills;
    }
}

/**
 * @class
 * @augments genericHelper
 * PF2e Helper class for PF2e centric functions
 */
export class pf2eHelper extends genericHelper {
    /**
     * Activity Glyph set for the action icons font.
     * To be used with pf2eHelper.formatActivity
     * @static
     */
    static pdfActionIconsGlyphs = {
        0: '',
        1: 'á',
        2: 'â',
        3: 'ã',
        '1 - 2': 'á - â',
        '1 to 2': 'á - â',
        '1 - 3': 'á - ã',
        '1 to 3': 'á - ã',
        reaction: 'ä',
        free: 'à',
    };

    /**
     * Activity Glyph set for scribe.pf2.tools.
     * To be used with pf2eHelper.formatActivity
     * @static
     */
    static scribeActivityGlyphs = {
        0: '',
        1: ':a:',
        2: ':aa:',
        3: ':aaa:',
        '1 - 2': ':a: - :aa:',
        '1 to 2': ':a: - :aa:',
        '1 - 3': ':a: - :aaa:',
        '1 to 3': ':a: - :aaa:',
        reaction: ':r:',
        free: ':f:',
    };

    /**
     * Abbreviate the names of the sourcebooks a resource is from.
     * @param {string} value Source name
     * @returns {string} PF2e Source abbreviation
     * @static
     */
    static abbreviateSource(source) {
        /* return the abbreviation of the given source */
        switch (source) {
            case "Pathfinder Advanced Player's Guide":
                return 'APG';
            case 'Pathfinder Book of the Dead':
                return 'BotD';
            case 'Pathfinder Core Rulebook':
                return 'CRB';
            case 'Pathfinder Dark Archive':
                return 'DA';
            case 'Pathfinder Gamemastery Guide':
                return 'GMG';
            case 'Pathfinder Guns & Gears':
                return 'GG';
            case 'Pathfinder GM Core':
                return 'GMC';
            case 'Pathfinder Lost Omens: Ancestry Guide':
                return 'AG';
            case 'Pathfinder Lost Omens: Character Guide':
                return 'CG';
            case 'Pathfinder Lost Omens: Gods & Magic':
                return 'GaM';
            case 'Pathfinder Player Core':
                return 'PC';
            case 'Pathfinder Rage of Elements':
                return 'RoE';
            case 'Pathfinder Secrets of Magic':
                return 'SoM';
            case 'Pathfinder Treasure Vault':
                return 'TV';
        }

        if (source.startsWith('Pathfinder #')) {
            //Pathfinder #188: They Watched the Stars
            const t = source.split(':');
            if (t.length > 0) {
                return 'PF' + t[0].substring(12);
            }
        }
        return source
            .split(' ')
            .map((m) => m[0])
            .join('')
            .toUpperCase();
    }

    /**
     * simple function to generate the damage of a strike
     * @param {Object} strike the strike object as found in actor.system.actions
     * @param {Object} actor the actor object to check for additional feats like weapon specialization
     * @returns {string}
     * @static
     */
    static strikeDamage(strike, actor) {
        let strikeDamage = '';
        if (strike.damageFormula !== undefined) {
            const temp = strike.damageFormula.trim().split(' ');
            temp.pop();
            return temp.join(' ');
        }

        let hasWeaponSpecialization = false;
        let hasGreaterWeaponSpecialization = false;
        let itemHasFinesse = strike.item.system.traits.value.includes('finesse');
        let isThief = false;
        let strModifier = 0;
        let dexModifier = 0;
        if (actor !== undefined) {
            hasWeaponSpecialization =
                actor.items.filter(
                    (i) =>
                        i.type === 'feat' &&
                        i.system.category === 'classfeature' &&
                        i.system.slug === 'weapon-specialization'
                ).length > 0;
            hasGreaterWeaponSpecialization =
                actor.items.filter(
                    (i) =>
                        i.type === 'feat' &&
                        i.system.category === 'classfeature' &&
                        i.system.slug === 'greater-weapon-specialization'
                ).length > 0;
            isThief =
                actor.items.filter(
                    (i) => i.type === 'feat' && i.system.category === 'classfeature' && i.system.slug === 'thief'
                ).length > 0;
            strModifier = actor.system.abilities.str.mod;
            dexModifier = actor.system.abilities.dex.mod;
        }

        const damageDice = `${strike.item.system.damage.dice}${strike.item.system.damage.die}`;
        let damageModifier = 0;
        let attributeDamageModifier = 0;

        if (hasWeaponSpecialization) {
            let proficiencyRank = strike.modifiers
                .filter((i) => i.type === 'proficiency')
                .map((i) => i.label.toLowerCase());
            switch (`${proficiencyRank}`) {
                case 'expert':
                    damageModifier = damageModifier + (hasGreaterWeaponSpecialization ? 4 : 2);
                    break;
                case 'master':
                    damageModifier = damageModifier + (hasGreaterWeaponSpecialization ? 6 : 3);
                    break;
                case 'master':
                    damageModifier = damageModifier + (hasGreaterWeaponSpecialization ? 8 : 4);
                    break;
            }
        }

        if (strike.options.includes('melee') || strike.options.includes('thrown')) {
            attributeDamageModifier = strModifier;
        }
        if (isThief && itemHasFinesse && dexModifier > strModifier) {
            attributeDamageModifier = dexModifier;
        }

        damageModifier = damageModifier + attributeDamageModifier;
        if (damageModifier !== 0) {
            strikeDamage = damageDice + pf2eHelper.quantifyNumber(damageModifier);
        } else {
            strikeDamage = damageDice;
        }
        return strikeDamage;
    }

    /**
     * simple function to generate the damage formula of a strike
     * @param {Object} strike the strike object as found in actor.system.actions
     * @param {Object} actor the actor object to check for additional feats like weapon specialization
     * @returns {string}
     * @static
     */
    static damageFormula(strike, actor) {
        if (strike.damageFormula !== undefined) {
            return strike.damageFormula;
        } else {
            if (typeof strike.item.system.damage !== 'undefined') {
                return pf2eHelper.strikeDamage(strike, actor) + ' ' + strike.item.system.damage.damageType;
            } else {
                const damageRoll = strike.item.system.damageRolls[Object.keys(strike.item.system.damageRolls)[0]];
                return damageRoll.damage + ' ' + damageRoll.damageType;
            }
        }
    }

    /**
     * Format the activity according to actionType and activity
     * @param {string} actionType action type: action, free, or reaction
     * @param {string} activity the activity
     * @param {Object} symbols the symbol set to use
     * @returns {string} Activity Glyph
     * @static
     */
    static formatActivity(actionType, activity, symbols = this.isRequiredArg('symbols', 'formatActivity')) {
        actionType = String(actionType).toLowerCase().trim();
        activity = String(activity).trim();
        let ret = activity;
        if (actionType === 'action') {
            if (Object.keys(symbols).includes(activity)) {
                ret = symbols[activity];
            }
        } else if (actionType === 'free') {
            ret = symbols.free;
        } else if (actionType === 'reaction') {
            ret = symbols.reaction;
        }
        ret = ret.replace(/ minutes/g, 'm');
        ret = ret.replace(/ minute/g, 'm');
        return ret;
    }

    /**
     * Format and sort attribute boosts according to their order
     * @param {array} attributes list of attributes
     * @returns {string} Sorted list of attribute boosts
     * @static
     */
    static formatAttributeBoosts(attributes) {
        if (!Array.isArray(attributes)) {
            return '';
        }
        let a = [];
        ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach((atr) => {
            if (attributes.includes(atr)) {
                a.push(atr);
            }
        });
        return a.join(', ');
    }

    /**
     * Format runes as traits
     * @param {Object} runes the runes object associated with a weapon
     * @returns {array}
     */
    static runesToTraits(runes) {
        let runeList = [];
        if ((runes.potency || 0) > 0) {
            runeList.push(`Potency +${runes.potency}`);
        }
        if ((runes.striking || 0) > 2) {
            runeList.push(`Major Striking`);
        } else if ((runes.striking || 0) > 1) {
            runeList.push(`Greater Striking`);
        } else if ((runes.striking || 0) > 0) {
            runeList.push(`Striking`);
        }
        (runes.property || []).forEach((r) => {
            runeList.push(`${this.capitalize(r)} Rune`);
        });

        return runeList;
    }

    /**
     * Format runes into a string
     * @param {Object} runes a rune entry from the PF2e actor
     * @returns {string} list of runes
     * @static
     */
    static formatRunes(runes) {
        let runeList = [];

        if ((runes.potency || 0) > 0) {
            runeList.push(`Potency +${runes.potency}`);
        }
        if ((runes.striking || 0) > 2) {
            runeList.push(`Major Striking`);
        } else if ((runes.striking || 0) > 1) {
            runeList.push(`Greater Striking`);
        } else if ((runes.striking || 0) > 0) {
            runeList.push(`Striking`);
        }
        (runes.property || []).forEach((r) => {
            runeList.push(`${this.capitalize(r)} Rune`);
        });
        return runeList.join(', ');
    }

    /** Format an individual trait according to certain rules
     * @param {string} trait trait to be formatted
     * @returns {string} formatted trait
     * @static
     */
    static formatTrait(trait) {
        const tTrait = trait.toLowerCase();
        if (tTrait.startsWith('two-hand-')) {
            return 'Two-Hand ' + tTrait.split('-').pop();
        } else if (tTrait.startsWith('thrown-')) {
            return 'Thrown ' + tTrait.split('-').pop();
        } else if (tTrait.startsWith('versatile-')) {
            return 'Versatile ' + tTrait.split('-').pop().toUpperCase();
        } else if (tTrait.startsWith('range-')) {
            return 'Range ' + tTrait.split('-').pop();
        } else if (tTrait.startsWith('reach-')) {
            return 'Reach ' + tTrait.split('-').pop();
        } else if (tTrait.startsWith('deadly-')) {
            return 'Deadly ' + tTrait.split('-').pop();
        } else if (tTrait.startsWith('fatal-')) {
            return 'Fatal ' + tTrait.split('-').pop();
        } else if (tTrait.startsWith('volley-')) {
            return 'Volley ' + tTrait.split('-').pop();
        } else {
            return this.capitalize(trait);
        }
    }

    /**
     * Format Spell Casting Times
     * @param {string} activity the activity
     * @param {Object} symbols the symbol set to use
     * @returns {string} Activiy Glyph
     * @static
     */
    static formatSpellCastingTime(activity, symbols = this.isRequiredArg('symbols', 'formatSpellCastingTime')) {
        if (activity === 'free') {
            return this.formatActivity('free', activity, symbols);
        } else if (activity === 'reaction') {
            return this.formatActivity('reaction', activity, symbols);
        } else {
            return this.formatActivity('action', activity, symbols);
        }
    }

    /**
     * Order and format traits
     * @param {array} traitList an array of traits to be formatted
     * @returns {string} sorted list of traits
     */
    static formatTraits(traitList) {
        if (typeof traitList === 'undefined') {
            return '';
        }
        traitList = traitList
            .filter((i) => i !== 'common' && i !== null && typeof i !== 'undefined')
            .map((i) => i.toLowerCase());
        let tl = [];
        ['uncommon', 'rare'].forEach((el) => {
            if (traitList.includes(el)) {
                tl.push(this.capitalize(el));
                traitList.splice(traitList.indexOf(el), 1);
            }
        });
        const alignment = [];
        ['chaotic', 'lawful', 'good', 'neutral', 'evil'].forEach((el) => {
            if (traitList.includes(el)) {
                alignment.push(el);
                traitList.splice(traitList.indexOf(el), 1);
            }
        });
        switch (alignment.join('-')) {
            case 'chaotic-evil':
                traitList.push('ce');
                break;
            case 'chaotic':
            case 'chaotic-neutral':
                traitList.push('cn');
                break;
            case 'chaotic-good':
                traitList.push('cg');
                break;
            case 'neutral-evil':
                traitList.push('ne');
                break;
            case 'neutral':
            case 'neutral-neutral':
                traitList.push('n');
                break;
            case 'neutral-good':
                traitList.push('ng');
                break;
            case 'lawful-evil':
                traitList.push('le');
                break;
            case 'lawful':
            case 'lawful-neutral':
                traitList.push('ln');
                break;
            case 'lawful-good':
                traitList.push('lg');
                break;
        }
        ['lg', 'ln', 'le', 'ng', 'n', 'ne', 'cg', 'cn', 'ce'].forEach((el) => {
            if (traitList.includes(el)) {
                tl.push(el.toLocaleUpperCase());
                traitList.splice(traitList.indexOf(el), 1);
            }
        });
        ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'].forEach((el) => {
            if (traitList.includes(el)) {
                tl.push(this.capitalize(el));
                traitList.splice(traitList.indexOf(el), 1);
            }
        });
        tl = tl.concat(traitList.map((i) => this.formatTrait(i)).sort());
        return tl.join(', ');
    }

    /**
     * Resolve pf2e system frequency to human
     * @param {string} frequency PF2e system frequency
     * @returns {string} human readable frequency
     * @static
     */
    static frequencyToHuman(frequency) {
        const frequencyTable = {
            pt1m: 'minute',
            pt10m: '10 minutes',
            pt1h: 'hour',
            pt24h: '24 hours',
            p1w: 'week',
            p1m: 'month',
            p1y: 'year',
        };
        if (Object.keys(frequencyTable).includes(frequency.toLowerCase())) {
            return frequencyTable[frequency.toLowerCase()];
        } else {
            return frequency;
        }
    }

    /**
     * Determine what type of actor we're dealing with and return an object which can parse all data
     * @param {Object} game the Foundry VTT game object
     * @param {Object} actor the Foundry VTT actor object
     * @returns {Object}
     */
    static getActorObject(game, actor) {
        if (actor.type === 'character') {
            return new pf2ePlayer(game, actor);
        } else if (actor.type === 'npc') {
            return new pf2eNPC(game, actor);
        } else {
            throw new Error('Could not find actor type: ' + actor.type);
        }
    }

    /**
     * Return whether or not an attribute boost is partial
     * @param {*} actor the actor object
     * @param {*} attribute the attribute for which to discover if there is a partial boost
     * @returns {boolean} whether the given attribute has a partial boost
     * @static
     */
    static isPartialBoost(actor, attribute) {
        /* is there a partial boost for the given attribute */
        let count = 0;
        attribute = attribute.toLowerCase();
        if (actor.system.build === undefined) {
            return false;
        }
        Object.values(actor.system.build.attributes.boosts).forEach((el) => {
            if (typeof el === 'string' && el.toLowerCase() === attribute) {
                count = count + 1;
            } else if (Array.isArray(el) && el.map((i) => i.toLowerCase()).includes(attribute)) {
                count = count + 1;
            }
        });
        Object.values(actor.system.build.attributes.flaws).forEach((el) => {
            if (typeof el === 'string' && el.toLowerCase() === attribute) {
                count = count - 1;
            } else if (Array.isArray(el) && el.map((i) => i.toLowerCase()).includes(attribute)) {
                count = count - 1;
            }
        });
        if (count > 4 && parseInt(count / 2) * 2 < count) {
            return true;
        }
        return false;
    }

    /**
     * Return full size name
     * @param {string} size the abbreviated size entry
     * @returns {string} Full size name
     * @static
     */
    static resolveSize(size) {
        switch (size) {
            case 'tiny':
                return 'Tiny';
            case 'sm':
                return 'Small';
            case 'med':
                return 'Medium';
            case 'lg':
                return 'Large';
            case 'huge':
                return 'Huge';
            case 'grg':
                return 'Gargantuan';
            default:
                return size;
        }
    }
}
