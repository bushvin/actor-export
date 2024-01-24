import { genericHelper } from './GenericHelper.js';

/**
 * PF2eHelper module
 * @module PF2eHelper
 * @author William Leemans
 * @copyright William Leemans 2024
 */

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

        return source;
    }

    /**
     * simple function to generate the damage of a strike
     * @param {Object} strike the strike object as found in actor.system.actions
     * @param {Object} actor the actor object to check for additional feats like weapon specialization
     * @returns {string}
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
        if (isThief && dexModifier > strModifier) {
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
     */
    static damageFormula(strike, actor) {
        if (strike.damageFormula !== undefined) {
            return strike.damageFormula;
        } else {
            return pf2eHelper.strikeDamage(strike, actor) + ' ' + strike.item.system.damage.damageType;
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
        } else if (tTrait.startsWith('deadly-')) {
            return 'Deadly ' + tTrait.split('-').pop();
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
