import { baseProvider } from './BaseProvider.js';
import { pf2eHelper } from '../helpers/PF2eHelper.js';

/**
 * ScribeProvider module
 * @module ScribeProvider
 * @author William Leemans
 * @copyright William Leemans 2024
 */

/**
 * The base class for all scribe related classes
 * @class
 * @description This is the base class for all scribe related renderer classes, it provides a couple of shared methods
 */
class scribeBase {
    constructor() {
        this._label = undefined;
        this._labelLevel = 1;
    }

    /**
     * formatted label for a link
     * @type {string}
     */
    get label() {
        if (typeof this._label === 'undefined') {
            return undefined;
        } else {
            return '((' + '+'.repeat(this._labelLevel) + this._label.replace(/\)$/, ') ') + '))';
        }
    }

    /**
     * Strip all Foundry VTT markdown elements
     * @param {string} value the text to be parsed
     * @returns {string}
     */
    stripFoundryElements(value) {
        if (typeof value !== 'string') {
            return value;
        }
        value = value.replace(/@UUID\[[^\]]+\]{([^}]+)}/g, '*$1*');

        value = value.replace(/\[\[\/r [^\]]+\]\]{([^}]+)}/g, '$1');
        value = value.replace(/\[\[\/br [^\]]+\]\]{([^}]+)}/g, '$1');
        value = value.replace(/\[\[\/r [0-9]+d[0-9]+\[[^\]]+\]\]\]{([^}]+)}/g, '$1');
        value = value.replace(/\[\[\/r \(@damage\)([^\[]+)\[([^\]]+)\]\]\]/, '$1 $2');
        value = value.replace(/@damage\[([^\[]+)\[([^\]]+)\]\]{([^}]+)}/gi, '$1 $2 ($3)');
        value = value.replace(/@damage\[([^\[]+)\[([^\]]+)\]\]/gi, '$1 $2');
        value = value.replace(/@Template\[[^\]]+\]{([^}]+)}/gi, '$1');
        value = value.replace(/@Template\[[^\:]+:([^\|]+)\|[^:]+:([^\]]+)\]/gi, '$1 $2 feet');
        value = value.replace(/@Compendium\[[^\]]+\]{([^}]+)}/g, '*$1*');
        value = value.replace(/@Localize\[[^\]]+\]/g, '');

        /* remove anything not needed */
        value = value.replace(/\[\[\/r[^}]+}/g, '');
        value = value.replace(
            /@check\[type:([^\|]+)\|[^\]]+classOrSpellDC[^\]]+\|basic:true[^\]]*\]/gi,
            'basic $1 save'
        );
        value = value.replace(/@check\[type:([^\|]+)\|[^\]]+classOrSpellDC[^\]]+\]/gi, '$1 save');
        value = value.replace(/@check\[[^\]]+\]/gi, '');

        value = value.replace(/&nbsp;/gi, ' ');
        return value;
    }

    /**
     * Strip HTML elements
     * @param {string} value the text to be parsed
     * @returns {string}
     */
    stripHTMLtag(value) {
        if (typeof value !== 'string') {
            return value;
        }
        value = pf2eHelper.stripHTMLtag(value, 'br', '', '\n');
        value = pf2eHelper.stripHTMLtag(value, 'hr', '---');
        value = pf2eHelper.stripHTMLtag(value, 'p', '', '\n');
        value = pf2eHelper.stripHTMLtag(value, 'strong', '**', '**');
        value = pf2eHelper.stripHTMLtag(value, 'em', '*', '*');
        value = pf2eHelper.stripHTMLtag(value, 'span');
        value = pf2eHelper.stripNestedHTMLtag(value, 'ol', 'li', '- ');
        value = pf2eHelper.stripHTMLtag(value, 'ol');
        value = pf2eHelper.stripNestedHTMLtag(value, 'ul', 'li', '- ');
        value = pf2eHelper.stripHTMLtag(value, 'ul');
        value = pf2eHelper.stripHTMLtag(value, 'h1');
        value = pf2eHelper.stripHTMLtag(value, 'h2');
        value = pf2eHelper.stripHTMLtag(value, 'h3');
        value = pf2eHelper.stripHTMLtag(value, 'h4');
        return value;
    }
}

/**
 * Scribe Item wrapper
 * @class
 * @param {string} name the name of the item
 * @param {string} type the type of the item
 * @param {number} rank the rank of the item
 * @param {array} traits the traits of the item
 * @param {string} usage the usage text of the item
 * @param {string} description the descrition text of the item
 * @param {number} labelLevel the level of the label of the item
 * @augments scribeBase
 * @description This class provides a renderer for the item scribe resource.
 */
class scribeItem extends scribeBase {
    constructor(name, type, rank, traits, usage, description, labelLevel = 0) {
        super();
        this._itemName = name;
        this._itemType = type;
        this._itemRank = rank;
        this._itemTraits = traits;
        this._itemUsage = usage;
        this._itemDescription = description;
        this._labelLevel = labelLevel;
        this._label = this._itemName;
    }

    /**
     * sanitized usage value
     * @type {string}
     */
    get usage() {
        return this.stripFoundryElements(this.stripHTMLtag(this._itemUsage));
    }

    /**
     * sanitized description text
     * @type {string}
     */
    get description() {
        return this.stripFoundryElements(this.stripHTMLtag(this._itemDescription));
    }

    /**
     * Render the scribe object
     * @returns {string}
     */
    async scribify() {
        const scribify = [];
        scribify.push('item(');
        if (this._labelLevel > 0) {
            scribify.push(`# ${this._itemName} ${this.label}`);
        } else {
            scribify.push(`# ${this._itemName}`);
        }
        if (this._itemType !== '' && this._itemRank > 0) {
            scribify.push(`## ${this._itemType} ${this._itemRank}`);
        } else if (this.this._itemType !== '') {
            scribify.push(`## ${this._itemType}`);
        }
        scribify.push('-');
        if (this._itemTraits.length > 0) {
            scribify.push('; ' + pf2eHelper.formatTraits(this._itemTraits));
        }
        if (this.usage !== '') {
            scribify.push(this.usage);
            scribify.push('-');
        }
        scribify.push(this.description);

        scribify.push(')');
        return scribify.join('\n');
    }
}

/**
 * scribe Header wrapper
 * @class
 * @param {number} level the level of the header (1-6)
 * @param {string} title the title of the header
 * @augments scribeBase
 */
class scribeHeader extends scribeBase {
    constructor(level, title) {
        super();
        this._title = title;
        if (isNaN(Number(level))) {
            throw new Error('Level needs to be a number');
        } else if (Number(level) < 1 || Number(level) > 6) {
            throw new Error('Level needs to be between 1 and 6');
        } else {
            this._level = Number(level);
        }
        this._label = title;
        this._labelLevel = this._level;
    }

    /**
     * Render the scribe object
     * @returns {string}
     */
    async scribify() {
        const scribify = [];
        scribify.push('#'.repeat(this._level));
        scribify.push(this._title);
        if (typeof this.label !== undefined) {
            scribify.push(this.label);
        }
        return scribify.join(' ');
    }
}

/**
 * scribe Character strike wrapper
 * @class
 * @param {object} strike The strike to render
 * @augments scribeBase
 */
class scribeCharacterStrike extends scribeBase {
    constructor(strike) {
        super();
        this._strike = strike;
    }

    /**
     * Render the scribe object
     * @returns {string}
     */
    async scribify() {
        const scribify = [];
        if (this._strike.isMelee) {
            scribify.push('**Melee**');
        } else if (this._strike.isRanged) {
            scribify.push('**Ranged**');
        } else {
            scribify.push('**Unknown Strike**');
        }
        scribify.push(this._strike.label);
        scribify.push(pf2eHelper.quantifyNumber(this._strike.modifier));
        if (this._strike.traits.length > 0) {
            scribify.push('(' + pf2eHelper.formatTraits(this._strike.traits) + ')');
        }
        scribify.push('**Damage**');
        scribify.push(await this._strike.damageFormula);
        return scribify.join(' ');
    }
}

/**
 * scribe Character activity wrapper
 * @class
 * @param {object} activity The activity to render
 * @augments scribeBase
 */
class scribeCharacterActivity extends scribeBase {
    constructor(activity) {
        super();
        this._activity = activity;
    }

    /**
     * sanitized description text
     */
    get description() {
        return this.stripFoundryElements(this.stripHTMLtag(this._activity.description));
    }
    /**
     * Render the scribe object
     * @returns {string}
     */
    async scribify() {
        const scribify = [];
        scribify.push(`**${this._activity.name}**`);
        scribify.push(
            pf2eHelper.formatActivity(this._activity.type, this._activity.actionCount, pf2eHelper.scribeActivityGlyphs)
        );
        scribify.push(this.description);

        return scribify.join(' ');
    }
}

/**
 * scribe Character feat wrapper
 * @class
 * @param {object} feat The feat to render
 * @param {number} labelLevel The label level to associate with the feat
 * @augments scribeItem
 */
class scribeCharacterFeat extends scribeItem {
    constructor(feat, labelLevel = 0) {
        super();
        this._feat = feat;
        this._labelLevel = labelLevel;
    }

    /**
     * Render the scribe object
     * @returns {string}
     */
    async scribify() {
        this._itemName = await this._feat.name;
        this._itemType = 'feat';
        this._itemRank = await this._feat.level;
        this._itemTraits = await this._feat.traits;
        this._itemDescription = await this._feat.description;
        this._label = this._itemName;

        const usage = [];
        const itemPrerequisites = this._feat.prerequisites.map((m) => m.value).sort();
        if (itemPrerequisites.length > 0) {
            usage.push(`**Prerequisites** ${itemPrerequisites.join('; ')}`);
        }
        this._itemUsage = usage.join('\n\n');
        return await super.scribify();
    }
}

/**
 * scribe Character spell wrapper
 * @class
 * @param {object} spell The spell to render
 * @param {number} labelLevel The label level to associate with the spell
 * @augments scribeItem
 */
class scribeCharacterSpell extends scribeItem {
    constructor(spell, labelLevel = 0) {
        super();
        this._spell = spell;
        this._labelLevel = labelLevel;
    }
    /**
     * Render the scribe object
     * @returns {string}
     */
    async scribify() {
        const itemActivity = pf2eHelper.formatSpellCastingTime(
            await this._spell.castingTime,
            pf2eHelper.scribeActivityGlyphs
        );
        this._label = await this._spell.name;
        this._itemName = this._label + ' ' + itemActivity;
        this._itemType = 'spell';
        this._itemRank = await this._spell.rank;
        this._itemTraits = await this._spell.traits;
        this._itemDescription = await this._spell.description;

        const usage = [];
        usage.push('**Tradition** ' + (await this._spell.tradition));
        usage.push(`**Cast** ${itemActivity}\n`);

        const rat = [];
        const itemRange = await this._spell.range;
        const itemArea = await this._spell.area;
        const itemTarget = await this._spell.target;
        if (itemRange !== '') {
            rat.push(`**Range** ${itemRange}`);
        }
        if (itemArea !== '') {
            rat.push(`**Area** ${itemArea}`);
        }
        if (itemTarget !== '') {
            rat.push(`**Target** ${itemTarget}`);
        }
        if (rat.length > 0) {
            usage.push(rat.join('; '));
        }
        const dd = [];
        const itemDuration = await this._spell.duration;
        let defense = '';
        if (this._spell.save) {
            defense = this._spell.saveIsBasic ? 'Basic ' : '';
            if (this._spell.saveStatistic === 'ac') {
                defense = defense + 'AC';
            } else {
                defense = defense + this._spell.saveStatistic;
            }
            dd.push(`**Defense** ${defense}`);
        }
        if (itemDuration !== '') {
            dd.push(`**Duration** ${itemDuration}`);
        } else if (this._spell.isSustained) {
            dd.push(`**Duration** Sustained`);
        }
        if (dd.length > 0) {
            usage.push(dd.join('; '));
        }
        this._itemUsage = usage.join('\n\n');
        return await super.scribify();
    }
}

/**
 * scribe Character formula wrapper
 * @class
 * @param {object} formula The formula to render
 * @param {number} labelLevel The label level to associate with the formula
 * @augments scribeItem
 */
class scribeCharacterFormula extends scribeItem {
    constructor(formula, labelLevel = 0) {
        super();
        this._formula = formula;
        this._labelLevel = labelLevel;
    }

    /**
     * Render the scribe object
     * @returns {string}
     */
    async scribify() {
        this._itemName = await this._formula.name;
        this._itemType = 'formula';
        this._itemRank = await this._formula.level;
        this._itemTraits = await this._formula.traits;
        this._itemDescription = await this._formula.description;
        this._label = this._itemName;

        this._itemUsage = '**Cost** ' + (await this._formula.cost);

        return await super.scribify();
    }
}

/**
 * scribe Character ritual wrapper
 * @class
 * @param {object} formula The ritual to render
 * @param {number} labelLevel The label level to associate with the ritual
 * @augments scribeItem
 */
class scribeCharacterRitual extends scribeItem {
    constructor(ritual, labelLevel = 0) {
        super();
        this._ritual = ritual;
        this._labelLevel = labelLevel;
    }

    /**
     * Render the scribe object
     * @returns {string}
     */
    async scribify() {
        this._itemName = await this._ritual.name;
        this._itemType = 'ritual';
        this._itemRank = await this._ritual.rank;
        this._itemTraits = await this._ritual.traits;
        this._itemDescription = await this._ritual.description;
        this._label = this._itemName;

        const usage = [];
        const ccs = [];
        const itemCastingTime = this._ritual.castingTime;
        const itemCost = this._ritual.cost;
        const itemSecondaryCasters = this._ritual.secondaryCasters;
        if (itemCastingTime !== '') {
            ccs.push(`**Cast** ${itemCastingTime}`);
        }
        if (itemCost !== '') {
            ccs.push(`**Cost** ${itemCost}`);
        }
        if (itemSecondaryCasters > 0) {
            ccs.push(`**Secondary Casters** ${itemSecondaryCasters}`);
        }
        if (ccs.length > 0) {
            usage.push(ccs.join('; '));
        }

        const ps = [];
        const itemPrimaryCheck = this._ritual.primaryCheck;
        const itemSecondaryCheck = this._ritual.secondaryCheck;
        if (itemPrimaryCheck !== '') {
            ps.push(`**Primary Check** ${itemPrimaryCheck}`);
        }
        if (itemSecondaryCheck !== '') {
            ps.push(`**Secondary Check** ${itemSecondaryCheck}`);
        }
        if (ps.length > 0) {
            usage.push(ps.join('; ') + '\n');
        }

        const rat = [];
        const itemRange = await this._ritual.range;
        const itemArea = await this._ritual.area;
        const itemTarget = await this._ritual.target;
        if (itemRange !== '') {
            rat.push(`**Range** ${itemRange}`);
        }
        if (itemArea !== '') {
            rat.push(`**Area** ${itemArea}`);
        }
        if (itemTarget !== '') {
            rat.push(`**Target** ${itemTarget}`);
        }
        if (rat.length > 0) {
            usage.push(rat.join('; ') + '\n');
        }
        this._itemUsage = usage.join('\n\n');

        return await super.scribify();
    }
}

/**
 * scribe Creature wrapper
 * @class
 * @param {object} creature The creature to render
 * @param {number} labelLevel The label level to associate with the creature
 * @augments scribeItem
 */
class scribeCreature extends scribeItem {
    constructor(creature, labelLevel = 0) {
        super();
        this._creature = creature;
        this._labelLevel = labelLevel;
    }

    /**
     * Generate senses for the creature
     * @returns {array}
     */
    async senses() {
        const senses = [];
        senses.push(`**Perception** ${pf2eHelper.quantifyNumber(this._creature.perception.modifier)}`);
        if (this._creature.senses != '') {
            senses.push(this._creature.senses);
        }
        return [senses.join('; ')];
    }

    /**
     * Generate languages for the creature
     * @returns {array}
     */
    async languages() {
        if (this._creature.languages !== '') {
            return [`**Languages** ${this._creature.languages}`];
        }
        return [];
    }

    /**
     * Generate skills for the creature
     * @returns {array}
     */
    async skills() {
        const skills = [];
        Object.values(this._creature.skills).forEach((s) => {
            if (typeof s.rank === 'undefined' || s.rank > 0) {
                skills.push(`${s.label} ${pf2eHelper.quantifyNumber(s.modifier)}`);
            }
        });
        if (skills.length > 0) {
            return ['**Skills** ' + skills.join('; ')];
        } else {
            return [];
        }
    }

    /**
     * Generate attributes for the creature
     * @returns {array}
     */
    async attributes() {
        const attributes = [];
        Object.values(this._creature.attributes).forEach((a) => {
            attributes.push('**' + pf2eHelper.capitalize(a.name) + '** ' + pf2eHelper.quantifyNumber(a.modifier));
        });
        return [attributes.join('; ')];
    }

    /**
     * Generate items for the creature
     * @returns {array}
     */
    async items() {
        let items = [];
        items = items.concat(this._creature.heldItems.map((m) => m.displayName));
        items = items.concat(this._creature.consumables.map((m) => m.displayName));
        items = items.concat(this._creature.wornItems.map((m) => m.displayName));
        Object.keys(this._creature.coins).forEach((k) => {
            if (this._creature.coins[k] > 0) {
                items.push(`${this._creature.coins[k]} ${k}`);
            }
        });
        if (items.length > 0) {
            return ['**Items** ' + items.sort().join(', ')];
        } else {
            return [];
        }
    }

    /**
     * Generate AC and Saving throws for the creature
     * @returns {array}
     */
    async acSaves() {
        const acSaves = [];
        acSaves.push(`**AC** ${this._creature.ac.modifier}`);
        acSaves.push(`**Fort** ${pf2eHelper.quantifyNumber(this._creature.savingThrows.fortitude.modifier)}`);
        acSaves.push(`**Ref** ${pf2eHelper.quantifyNumber(this._creature.savingThrows.reflex.modifier)}`);
        acSaves.push(`**Will** ${pf2eHelper.quantifyNumber(this._creature.savingThrows.will.modifier)}`);
        return [acSaves.join(', ')];
    }

    /**
     * Generate HP, Immunities, Weaknesses and Resistance for the creature
     * @returns {array}
     */
    async hpImmunityWeaknessResistance() {
        const hpImmunityWeaknessResistance = [];
        hpImmunityWeaknessResistance.push(`**HP** ${this._creature.hp.max}`);
        if (this._creature.immunities !== '') {
            hpImmunityWeaknessResistance.push(`**Immunities** ${this._creature.immunities}`);
        }
        if (this._creature.weaknesses !== '') {
            hpImmunityWeaknessResistance.push(`**Weaknesses** ${this._creature.resistance}`);
        }
        if (this._creature.resistance !== '') {
            hpImmunityWeaknessResistance.push(`**Resistances** ${this._creature.resistance}`);
        }
        return [hpImmunityWeaknessResistance.join('; ')];
    }

    /**
     * Generate defensive activities for the creature
     * @returns {array}
     */
    async defensiveActivities() {
        const defensiveActivities = [];
        this._creature.activities
            .filter((f) => f.category === 'defensive')
            .forEach((a) => {
                const name = a.name;
                const traits = pf2eHelper.formatTraits(a.traits);
                const activity = pf2eHelper.formatActivity(a.type, a.actionCount, pf2eHelper.scribeActivityGlyphs);
                const description = a.description;
                defensiveActivities.push(
                    `**${name}** ` +
                        (activity !== '' ? `${activity} ` : '') +
                        (traits.length > 0 ? `(${traits}) ` : '' + description)
                );
            });
        return defensiveActivities;
    }

    /**
     * Generate offensive activities for the creature
     * @returns {array}
     */
    async offensiveActivities() {
        const offensiveActivities = [];
        this._creature.activities
            .filter((f) => f.category === 'offensive')
            .forEach((a) => {
                const name = a.name;
                const traits = pf2eHelper.formatTraits(a.traits);
                const activity = pf2eHelper.formatActivity(a.type, a.actionCount, pf2eHelper.scribeActivityGlyphs);
                const description = a.description;
                offensiveActivities.push(
                    `**${name}** ` +
                        (activity !== '' ? `${activity} ` : '') +
                        (traits.length > 0 ? `(${traits}) ` : '') +
                        description
                );
            });
        return offensiveActivities;
    }

    /**
     * Generate movement for the creature
     * @returns {array}
     */
    async movement() {
        const movement = [];
        movement.push(`**Speed** ${this._creature.baseSpeed}`);
        this._creature.movement
            .filter((f) => !f.isPrimary)
            .forEach((m) => {
                movement.push(m.displayName);
            });
        return [movement.join(', ')];
    }

    /**
     * Generate melee strikes for the creature
     * @returns {array}
     */
    async melee() {
        const melee = [];
        const strikes = this._creature.strikes.filter((f) => f.isMelee);
        for (let i = 0; i < strikes.length; i++) {
            melee.push(await new scribeCharacterStrike(strikes[i]).scribify());
        }

        return melee;
    }

    /**
     * Generate ranged strikes for the creature
     * @returns {array}
     */
    async ranged() {
        const ranged = [];
        const strikes = this._creature.strikes.filter((f) => f.isRanged);
        for (let i = 0; i < strikes.length; i++) {
            ranged.push(await new scribeCharacterStrike(strikes[i]).scribify());
        }

        return ranged;
    }

    /**
     * Generate spells for the creature
     * @returns {array}
     */
    async spells() {
        const spells = {};
        this._creature.knownSpells
            .filter((f) => !f.isCantrip)
            .forEach((s) => {
                if (typeof spells[s.type] === 'undefined') {
                    spells[s.type] = {};
                }

                if (typeof spells[s.type][s.rank] === 'undefined') {
                    spells[s.type][s.rank] = [];
                }
                if (s.heightened) {
                    spells[s.type][s.rank].push(`${s.name} (+${s.heighteningValue})`);
                } else {
                    spells[s.type][s.rank].push(s.name);
                }
            });

        this._creature.knownSpells
            .filter((f) => f.isCantrip)
            .forEach((s) => {
                if (typeof spells[s.type] === 'undefined') {
                    spells[s.type] = {};
                }

                if (typeof spells[s.type][0] === 'undefined') {
                    spells[s.type][0] = [];
                }
                if (s.heightened) {
                    spells[s.type][0].push(`${s.name} (+${s.heighteningValue})`);
                } else {
                    spells[s.type][0].push(s.name);
                }
            });

        const ret = [];
        Object.keys(spells)
            .sort()
            .forEach((sce) => {
                console.log('spellProficiency', this._creature.spellProficiency);
                const spellProficiency = this._creature.spellProficiency.filter((f) => f.name === sce)[0];
                const entry = [
                    `**${sce}** DC ${spellProficiency.spell.modifier}, attack ${pf2eHelper.quantifyNumber(spellProficiency.attack.modifier)}`,
                ];
                Object.keys(spells[sce])
                    .sort()
                    .reverse()
                    .forEach((rank) => {
                        const displayRank =
                            rank === '0'
                                ? 'Cantrips (' + pf2eHelper.shortOrdinal(this._creature.maximumSpellRank) + ')'
                                : pf2eHelper.shortOrdinal(rank);
                        entry.push(`**${displayRank}** *` + spells[sce][rank].sort().join(', ').toLowerCase() + '*');
                    });
                ret.push(entry.join('; '));
            });

        return ret;
    }

    /**
     * Render the scribe object
     * @returns {string}
     */
    async scribify() {
        this._itemName = await this._creature.name;
        this._itemType = 'creature';
        this._itemRank = await this._creature.level;
        this._itemTraits = await this._creature.traits;
        this._itemDescription = ''; // TODO
        this._label = this._itemName;

        let usage = [];
        usage = usage.concat(await this.senses());
        usage = usage.concat(await this.languages());
        usage = usage.concat(await this.skills());
        usage = usage.concat(await this.attributes());
        usage = usage.concat(await this.items());
        usage.push('-');
        usage = usage.concat(await this.acSaves());
        usage = usage.concat(await this.hpImmunityWeaknessResistance());
        usage = usage.concat(await this.defensiveActivities());
        usage.push('-');
        usage = usage.concat(await this.movement());
        usage = usage.concat(await this.melee());
        usage = usage.concat(await this.ranged());
        usage = usage.concat(await this.spells());
        usage = usage.concat(await this.offensiveActivities());

        this._itemUsage = usage.join('\n\n');

        return await super.scribify();
    }
}

/**
 * scribe Head wrapper
 * @class
 * @param {string} title The title of the Heading
 * @param {string} text The text to render with the title
 * @param {number} labelLevel The label level to associate with the creature, default: 0
 * @augments scribeBase
 */
class scribeHead extends scribeBase {
    constructor(title, text, labelLevel = 0) {
        super();
        this._title = title;
        this._text = text;
        this._labelLevel = labelLevel;
        this._label = this._title;
    }

    /**
     * sanitized title
     * @type {string}
     */
    get title() {
        return this.stripFoundryElements(this.stripHTMLtag(this._title));
    }

    /**
     * sanitized text
     * @type {string}
     */
    get text() {
        return this.stripFoundryElements(this.stripHTMLtag(this._text));
    }

    /**
     * Render the scribe object
     * @returns {string}
     */
    async scribify() {
        const scribify = [];
        scribify.push('head(');
        if (this._labelLevel > 0) {
            scribify.push(`# ${this.title} ${this.label}`);
        } else {
            scribify.push(`# ${this.title}`);
        }
        scribify.push(`${this.text}\n`);
        scribify.push('-');
        scribify.push(')\n');

        return scribify.join('\n');
    }
}

/**
 * scribe Text wrapper
 * @class
 * @param {string} text The text to render
 * @augments scribeBase
 */
class scribeText extends scribeBase {
    constructor(text) {
        super();
        this._text = text;
    }

    /**
     * sanitized text
     * @type {string}
     */
    get text() {
        return this.stripFoundryElements(this.stripHTMLtag(this._text));
    }

    /**
     * Render the scribe object
     * @returns {string}
     */
    async scribify() {
        return String(await this.text).replace(/\n/, '\n\n') + '\n';
    }
}

/**
 * @class
 * A class to generate a scribe formatted table
 * @param {string} name the name of the table
 * @param {array} headerRow (optional) an array of strings to be used as the header
 * @param {array} contentRows (optional) an array of arrays of strings to be used as cell data
 * @param {string} footer (optional) The footer to add to the table
 * @extends scribeBase
 */
class scribeTable extends scribeBase {
    constructor(name, headerRow = [], contentRows = [], footer = '') {
        super();
        this._name = name;
        this.setHeaderRow(headerRow);
        this._contentRows = contentRows;
        this._footer = footer;
    }

    /**
     * Add a table row
     * @param {array} row an array of strings to be used as a row's cell data
     */
    addContentRow(row) {
        const parsed = [];
        row.forEach((el) => {
            if (typeof el === 'string') {
                parsed.push(el.replace(/\(/, '\\(').replace(/\)/, '\\)'));
            } else {
                parsed.push(el);
            }
        });

        this._contentRows.push(parsed);
    }

    /**
     * Generate the scribe markdown for a table entry
     * @returns {string} a formatted scribe table entry
     */
    async scribify() {
        let entry = [];
        if (this._headerRow.length > 0) {
            if (this._name !== '') {
                entry.push(`##### ${this._name}`);
            }
            entry.push(this._headerRow.join(' | '));
            entry.push(Array(this._headerRow.length).fill('---').join(' | '));
            for (let r = 0; r < this._contentRows.length; r++) {
                const row = this._contentRows[r];
                const renderedCells = [];
                for (let c = 0; c < row.length; c++) {
                    renderedCells.push(await row[c]);
                }
                entry.push(renderedCells.join(' | '));
            }
            if (this._footer != '') {
                entry.push(`.${this._footer}`);
            }
        }
        return entry.join('\n');
    }

    /**
     * Set the header row
     * @param {array} row an array of strings to be used as the header
     */
    setHeaderRow(row) {
        const parsed = row.map((i) => i.replace(/\(/, '\\(').replace(/\)/, '\\)'));
        this._headerRow = parsed;
    }
}

/**
 * @class
 * A class to generate a title on each page
 * @param {string} text The text to render
 * @augments scribeBase
 */
class scribeTitle extends scribeBase {
    constructor(text) {
        super();
        this._text = text;
    }

    /**
     * sanitized text
     * @type {string}
     */
    get text() {
        return this.stripFoundryElements(this.stripHTMLtag(this._text));
    }

    /**
     * Render the scribe object
     * @returns {string}
     */
    async scribify() {
        return 'title(\n' + this.text + '\n)\n';
    }
}

/**
 * @class
 * A class to generate a watermark on each page
 * @param {string} text The text to render
 * @augments scribeBase
 */
class scribeWatermark extends scribeBase {
    constructor(text) {
        super();
        this._text = text;
    }

    /**
     * sanitized text
     * @type {string}
     */
    get text() {
        return this.stripFoundryElements(this.stripHTMLtag(this._text));
    }

    /**
     * Render the scribe object
     * @returns {string}
     */
    async scribify() {
        return 'watermark(\n' + this.text + '\n)\n';
    }
}

/**
 * @class
 * A class to generate scribe formatted files.
 * @param {Object} actor The Foundry VTT actor object.
 * @augments baseProvider
 */
export class scribeProvider extends baseProvider {
    constructor(actor) {
        super(actor);
        this.scribeData = [];
        this.scribeFile = undefined;
    }

    /**
     * all scribe classes available to use to format resources
     * @static
     */
    static class = {
        scribeCharacterActivity: scribeCharacterActivity,
        scribeCharacterFeat: scribeCharacterFeat,
        scribeCharacterFormula: scribeCharacterFormula,
        scribeCharacterSpell: scribeCharacterSpell,
        scribeCharacterStrike: scribeCharacterStrike,
        scribeCharacterRitual: scribeCharacterRitual,
        scribeCreature: scribeCreature,
        scribeHead: scribeHead,
        scribeHeader: scribeHeader,
        scribeItem: scribeItem,
        scribeTable: scribeTable,
        scribeText: scribeText,
        scribeTitle: scribeTitle,
        scribeWatermark: scribeWatermark,
    };

    /**
     * Create an empty file for scribe
     * @async
     * @returns {Promise} a dummy promise
     */
    async createFile() {
        return new Promise((resolve) => {
            resolve({ ok: true });
        });
    }

    /**
     * Update the file
     * @async
     * @returns {undefined}
     */
    async updateFile() {
        const option = this.overrideFilePath || this.providerFilePath;
        const rendered = [];
        for (let i = 0; i < this.scribeData.length; i++) {
            if (this.scribeData[i].option === option || this.scribeData[i].option.toLowerCase() === 'all') {
                rendered.push(await this.scribeData[i].data.scribify());
            }
        }
        this.scribeFile = rendered.join('\n');
        return;
    }

    /**
     * Save the file
     * @async
     * @returns {undefined}
     */
    async saveFile() {
        if (this.scribeFile !== undefined && this.scribeFile != '') {
            saveDataToFile(
                this.scribeFile,
                'text/plain',
                this.overrideDestinationFileName || this.providerDestinationFileName
            );
        }
        return;
    }

    /**
     * Get the specified scribe text
     * @param {string} scribeOption The scribe option to get the text of
     * @returns {string} scribe formatted text
     */
    getScribeData(scribeOption) {
        return this.scribeData
            .filter((i) => i.option === scribeOption)
            .map((i) => i.data)
            .join('\n');
    }

    /**
     * Store Scribe information as regular text
     * @param {string} scribeOption The option the text is related to
     * @param {string} scribeData Scribe formatted text
     */
    scribe(scribeOption, scribeData) {
        let data = {
            option: scribeOption,
            data: scribeData,
        };
        this.scribeData.push(data);
    }
}
