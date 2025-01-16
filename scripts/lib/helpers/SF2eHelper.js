import { pf2eHelper, pf2ePlayer, pf2eNPC } from './PF2eHelper.js';

/**
 * SF2eHelper module. Provides a couple of classes overriding PF2eHelper classes
 * @module SF2eHelper
 * @author William Leemans
 * @copyright William Leemans 2025
 *
 * This module should allow future-proof management of SF2e resources. Changes
 * may be made that break at some point. Be careful!
 */

/**
 * @class
 * @augments pf2eHelper
 */
export class sf2eHelper extends pf2eHelper {
    /**
     * Determine what type of actor we're dealing with and return an object which can parse all data
     * @param {Object} game the Foundry VTT game object
     * @param {Object} actor the Foundry VTT actor object
     * @returns {Object}
     */
    static getActorObject(game, actor) {
        if (actor.type === 'character') {
            return new sf2ePlayer(game, actor);
        } else if (actor.type === 'npc') {
            return new sf2eNPC(game, actor);
        } else {
            throw new Error('Could not find actor type: ' + actor.type);
        }
    }
}

/**
 * Calculate the price based on the price object
 * @param {Object} price the price object
 * @returns {array} an array containing all coins
 */
function _calculatePrice(price) {
    const calculatePrice = [];
    if (price.value.pp || 0 > 0) {
        calculatePrice.push(`${price.value.pp} upb`);
    }
    if (price.value.sp || 0 > 0) {
        calculatePrice.push(`${price.value.sp} cr`);
    }
    return calculatePrice;
}

/**
 * Return a single strike with all calculated information
 * @param {Object} rawStrike
 * @param {Object} strike
 * @returns {Object} formatted strike
 */
function _strike(rawStrike, strike) {
    strike.expend = undefined;
    if (strike.traits.filter((f) => f.startsWith('expend-')).length > 0) {
        strike.expend = Math.max(
            ...strike.traits
                .filter((f) => f.startsWith('expend-'))
                .map((m) => parseInt(m.split('-')[1]))
                .sort()
        );
    }
    strike.traits = strike.traits.filter((f) => !f.startsWith('expend-'));
    return strike;
}

/**
 * sf2e player character class
 * @class
 * @augments pf2ePlayer
 * @param {Object} game the Foundry VTT game object
 * @param {Object} actor the Foundry VTT actor object
 */
export class sf2ePlayer extends pf2ePlayer {
    /**
     * Return the number of credits the character has
     * @type {string}
     * Currently this is bound to the amount of SP a pf2e character has
     */
    get credits() {
        return this.coins.sp;
    }

    /**
     * Return the number of upb the character has
     * @type {string}
     * Currently this is bound to the amount of PP a pf2e character has
     */
    get upb() {
        return this.coins.pp;
    }

    /**
     * actor valuables
     * @type {Item[]}
     */
    get valuables() {
        return this.gemsAndArtwork;
    }

    /**
     * Calculate the price based on the price object
     * @param {Object} price the price object
     * @returns {array} an array containing all coins
     */
    _calculatePrice(price) {
        return _calculatePrice(price);
    }

    /**
     * Return a single strike with all calculated information
     * @param {Object} rawStrike
     * @returns {Object} formatted strike
     */
    _strike(rawStrike) {
        return _strike(rawStrike, super._strike(rawStrike));
    }
}

/**
 * sf2e player NPC class
 * @class
 * @augments pf2eNPC
 * @param {Object} game the Foundry VTT game object
 * @param {Object} actor the Foundry VTT actor object
 */
export class sf2eNPC extends pf2eNPC {
    /**
     * Return the number of credits the character has
     * @type {string}
     * Currently this is bound to the amount of SP a pf2e character has
     */
    get credits() {
        return this.coins.sp;
    }

    /**
     * Return the number of upb the character has
     * @type {string}
     * Currently this is bound to the amount of PP a pf2e character has
     */
    get upb() {
        return this.coins.pp;
    }

    /**
     * actor valuables
     * @type {Item[]}
     */
    get valuables() {
        return this.gemsAndArtwork;
    }

    /**
     * Calculate the price based on the price object
     * @param {Object} price the price object
     * @returns {array} an array containing all coins
     */
    _calculatePrice(price) {
        return _calculatePrice(price);
    }

    /**
     * Return a single strike with all calculated information
     * @param {Object} rawStrike
     * @returns {Object} formatted strike
     */
    _strike(rawStrike) {
        return _strike(rawStrike, super._strike(rawStrike));
    }
}
