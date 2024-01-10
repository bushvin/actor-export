import { GenericHelper } from './GenericHelper.js';

/**
 * PF2e Helper class for PF2e centric functions
 */
export class PF2eHelper extends GenericHelper {
    /**
     * Abbreviate the names of the sources a resource is from
     * @param {string} value - Source name
     * @returns {string}
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
     * Generate PDF action symbols
     * @param {string} action - the action to be converted
     * @returns {string}
     */
    static actionsToSymbols(action, symbols) {
        action = String(action);
        if (symbols === undefined) {
            symbols = {
                0: '',
                1: 'á',
                2: 'â',
                3: 'ã',
                reaction: 'ä',
                free: 'à',
            };
        }
        if (action === '0') {
            action = symbols[0];
        } else if (action === '1') {
            action = symbols[1];
        } else if (action === '2') {
            action = symbols[2];
        } else if (action === '3') {
            action = symbols[3];
        } else if (action === '1 to 2') {
            action = `${symbols[1]} - ${symbols[2]}`;
        } else if (action === '1 to 3') {
            action = `${symbols[1]} - ${symbols[3]}`;
        } else if (action === 'reaction') {
            action = symbols.reaction;
        } else if (action === 'free') {
            action = symbols.free;
        }
        action = action.replace(/ minutes/g, 'm');
        action = action.replace(/ minute/g, 'm');
        /* FIXME: do the same for free actions */

        return action;
    }

    /**
     * Format and sort attribute boosts according to their order
     * @param {array} attributes - list of attributes
     * @returns {string}
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
     * @param {Object} runes - a rune entry from the PF2e actor
     * @returns
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

    /**
     * Order and format traits
     * @param {array} traitList - an array of traits to be formatted
     * @returns {string}
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
        tl = tl.concat(traitList.map((i) => this.capitalize(i)).sort());
        return tl.join(', ');
    }

    /**
     * Resolve pf2e system frequency to human
     * @param {string} frequency
     * @returns
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
     * @param {*} actor - the actor object
     * @param {*} attribute - the attribute for which to discover if there is a partial boost
     * @returns {boolean}
     */
    static isPartialBoost(actor, attribute) {
        /* is there a partial boost for the given attribute */
        let count = 0;
        attribute = attribute.toLowerCase();
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
}
