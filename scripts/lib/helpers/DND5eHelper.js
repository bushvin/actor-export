import { genericPropertyError, genericHelper } from './GenericHelper.js';
// import { semVer } from '../SemVer.js';

/** DND5eHelper module
 * @module DND5eHelper
 * @author William Leemans
 * @copyright William Leemans 2024
 */

/**
 * D&D 5e actor abstraction base class
 * @class
 * @param {Object} game The foundry VTT game object
 * @param {Object} actor Foundry VTT actor object
 */
class dnd5eActor {
    constructor(game, actor) {
        this.game = game;
        this.actor = actor;
        this.className = 'dnd5eActor';
        console.debug('actor-export | character:', this);
    }

    /**
     * Remove secrets from the given html
     * @param {string} html the html to be stripped of secrets
     * @returns {string}
     */
    removeSecrets(html) {
        const secretMatchHtml = new RegExp('<section .*id=.secret-.*((?!/section).)*</section>', 'gi');
        try {
            html = html.replace(secretMatchHtml, '');
        } catch (error) {
            throw new dnd5eActorPropertyError('actor-export', this.className, 'removeSecrets', error.message);
        }

        return html;
    }

    /**
     * get the actor's abilities
     * @type {Object}
     */
    get abilities() {
        const abilities = {};
        try {
            Object.keys(this.actor.system.abilities).forEach((a) => {
                abilities[a] = {
                    name: this.game.dnd5e.config.abilities[a].label,
                    slug: a,
                    modifier: this.actor.system.abilities[a].mod,
                    value: this.actor.system.abilities[a].value,
                    save: this.actor.system.abilities[a].save,
                    isProficient: this.actor.system.abilities[a].proficient > 0,
                };
            });
        } catch (error) {
            throw new dnd5eActorPropertyError('actor-export', this.className, 'abilities', error.message);
        }
        return abilities;
    }

    /**
     * get the actor's ac
     * @type {Object}
     */
    get ac() {
        return {
            value: this.actor.system.attributes.ac.value,
        };
    }

    /**
     * get the actor's actions
     * @type {array}
     * TODO: finish this
     */
    get actions() {
        const actions = [];
        try {
            this.actor.items
                .filter((i) => i.system.activation.type === 'action')
                .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
                .forEach((a) => {
                    a.prepareFinalAttributes();
                    if (a.type === 'weapon') {
                        a.labels.derivedDamage.forEach((d) => {
                            const weapon = {
                                label: a.name,
                                type: a.type,
                                readied: a.system.equipped,
                                modifier: parseInt(a.labels?.toHit?.replace(/[\+\s]+/gi, '') || 0),
                                isMelee: a.system.range.long === null,
                                isRanged: a.system.range.long !== null,
                                l10n: {
                                    label: this.game.i18n.localize(a.name),
                                },
                            };
                            if (a.system.range.long !== null) {
                                weapon['rangeIncrement'] = a.system.range.value;
                                weapon['rangeLimit'] = a.system.range.long;
                            }
                            weapon['damageFormula'] = d.label;
                            weapon['hasBludgeoningDamage'] = d.damageType === 'bludgeoning';
                            weapon['hasPiercingDamage'] = d.damageType === 'piercing';
                            weapon['hasSlashingDamage'] = d.damageType === 'slashing';
                            actions.push(weapon);
                        });
                    } else if (w.type === 'feat') {
                        const action = {
                            label: a.name,
                        };
                    }
                });
        } catch (error) {
            throw new dnd5eActorPropertyError('actor-export', this.className, 'actions', error.message);
        }
        return actions;
    }

    /**
     * get the actor's alignment
     * @type {string}
     */
    get alignment() {
        return {
            name: this.actor.system.details.alignment,
            l10n: { name: this.game.i18n.localize(this.actor.system.details.alignment.trim()) },
        };
    }

    /**
     * get the actor's armor proficiencies
     * @type {array}
     */
    get armorProficiencies() {
        return [];
    }

    /**
     * get the actor's attacks
     * @type {array}
     */
    get attacks() {
        const attacks = [];
        try {
            this.actor.items
                .filter((i) => i.type === 'weapon' && i.system.activation.type === 'action')
                .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
                .forEach((w) => {
                    w.prepareFinalAttributes();
                    if (typeof w.labels.derivedDamage !== 'undefined') {
                        w.labels.derivedDamage.forEach((d) => {
                            const weapon = {
                                label: w.name,
                                readied: w.system.equipped,
                                modifier: parseInt(w.labels?.toHit?.replace(/[\+\s]+/gi, '') || 0),
                                isMelee: w.system.range.long === null,
                                isRanged: w.system.range.long !== null,
                                l10n: {
                                    label: this.game.i18n.localize(w.name),
                                },
                            };
                            if (w.system.range.long !== null) {
                                weapon['rangeIncrement'] = w.system.range.value;
                                weapon['rangeLimit'] = w.system.range.long;
                            }
                            weapon['damageFormula'] = d.label;
                            weapon['hasBludgeoningDamage'] = d.damageType === 'bludgeoning';
                            weapon['hasPiercingDamage'] = d.damageType === 'piercing';
                            weapon['hasSlashingDamage'] = d.damageType === 'slashing';
                            attacks.push(weapon);
                        });
                    }
                });
        } catch (error) {
            throw new dnd5eActorPropertyError('actor-export', this.className, 'attacks', error.message);
        }
        return attacks;
    }

    /**
     * get the actor's background
     * @type {Object}
     */
    get background() {
        return { name: '', l10n: { name: '' } };
    }

    /**
     * get the actor class list as an array
     * @type {Array}
     */
    get classLevels() {
        const classLevels = actor.items
            .filter((i) => i.type === 'class')
            .map((i) => {
                const c = {
                    name: i.name.trim(),
                    isPrimaryClass: i.flags?.srd5e?.isPrimaryClass || false,
                    level: i.system.levels,
                    spellCastingClass: typeof i.spellcasting.type !== 'undefined',
                    subClass: (i.system.subclass || '').trim(),
                    l10n: {
                        name: this.game.i18n.localize(i.name.trim()),
                        subClass: this.game.i18n.localize((i.system.subclass || '').trim()),
                    },
                };
                if (c.subClass === '') {
                    c.displayName = `${c.name} ${c.level}`;
                    c.l10n.displayName = `${c.l10n.name} ${c.level}`;
                } else {
                    c.displayName = `${c.name} (${c.subClass}) ${c.level}`;
                    c.l10n.displayName = `${c.l10n.name} (${c.l10n.subClass}) ${c.level}`;
                }
                return c;
            });

        return classLevels;
    }

    /**
     * get the actor's coins
     * @type {Object}
     */
    get coins() {
        const coins = {};
        ['cp', 'sp', 'ep', 'gp', 'pp'].forEach((coin) => {
            coins[coin] = this.actor.system.currency[coin] || 0;
        });
        return coins;
    }

    /**
     * get the actor's death saves
     * @type {Object}
     */
    get deathSave() {
        return {
            successes: this.actor.system.attributes.death.success,
            failures: this.actor.system.attributes.death.failure,
        };
    }

    /**
     * get the actor's character details
     * @type {Object}
     */
    get details() {
        const details = {};
        try {
            details['traits'] = this.actor.system.details.trait || '';
            details['ideals'] = this.actor.system.details.ideal || '';
            details['bonds'] = this.actor.system.details.bond || '';
            details['flaws'] = this.actor.system.details.flaw || '';
            details['age'] = this.actor.flags['tidy5e-sheet']?.age || '';
            details['height'] = this.actor.flags['tidy5e-sheet']?.height || '';
            details['weight'] = this.actor.flags['tidy5e-sheet']?.weight || '';
            details['eyes'] = this.actor.flags['tidy5e-sheet']?.eyes || '';
            details['skin'] = this.actor.flags['tidy5e-sheet']?.skin || '';
            details['hair'] = this.actor.flags['tidy5e-sheet']?.hair || '';
            details['backstory'] = this.removeSecrets(this.actor.system.details.biography.value || '');
        } catch (error) {
            throw new dnd5eActorPropertyError('actor-export', this.className, 'details', error.message);
        }
        return details;
    }

    /**
     * get the actor's equipment
     * @type {array}
     */
    get equipment() {
        const equipment = [];
        const equipmentTypes = ['backpack', 'consumable', 'container', 'equipment', 'loot', 'weapon'];
        this.actor.items
            .filter((f) => equipmentTypes.includes(f.type))
            .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
            .forEach((i) => {
                const item = {
                    name: i.name.trim(),
                    type: i.type,
                    quantity: i.system.quantity,
                    isMagical: Array.from(i.system.properties).includes('mgc'),
                    isAttuned: (i.system.attunement || 0) > 0,
                    l10n: {
                        name: this.game.i18n.localize(i.name.trim()),
                    },
                };
                item['displayName'] = item.quantity > 1 ? `${item.quantity} ${item.name}` : item.name;
                item['l10n']['displayName'] = item.quantity > 1 ? `${item.quantity} ${item.l10n.name}` : item.l10n.name;

                equipment.push(item);
            });
        return equipment;
    }

    /**
     * get the actor's features
     * @type {array}
     */
    get features() {
        const features = [];
        this.actor.items
            .filter((f) => f.type === 'feat')
            .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
            .forEach((f) => {
                const feature = {
                    name: f.name,
                    description: f.system.description.value,
                    l10n: {
                        name: this.game.i18n.localize(f.name.trim()),
                    },
                };
                features.push(feature);
            });
        return features;
    }

    /**
     * get whether the actor has inspiration
     */
    get hasInspiration() {
        return this.actor.system.attributes.inspiration || false;
    }

    /**
     * return the actor's hit dice
     * @type {number}
     */
    get hd() {
        const hd = {
            max: this.actor.system.attributes.hd.max || 0,
            value: this.actor.system.attributes.hd.value || 0,
        };

        return hd;
    }

    /**
     * get the actor's hitpoints
     * @type {Object}
     */
    get hp() {
        return {
            max: this.actor.system.attributes.hp.max || 0,
            value: this.actor.system.attributes.hp.value || 0,
            temp: this.actor.system.attributes.hp.temp || 0,
        };
    }

    /**
     * get the actor's initiative
     * @type {Object}
     */
    get initiative() {
        return {
            total: this.actor.system.attributes.init.total,
        };
    }

    /**
     * get the actor's known spells
     * @type {array}
     */
    get knownSpells() {
        const knownSpells = [];
        try {
            this.actor.items
                .filter((i) => i.type === 'spell')
                .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
                .sort((a, b) => (a.system.level < b.system.level ? -1 : a.system.level > b.system.level ? 1 : 0))
                .forEach((s) => {
                    const spell = {
                        name: s.name,
                        level: s.system.level,
                        components: [],
                        prepared: s.system.preparation.prepared,
                        l10n: {
                            name: this.game.i18n.localize(s.name.trim()),
                        },
                    };
                    if (s.system.properties.has('vocal')) {
                        spell.components.push('v');
                    }
                    if (s.system.properties.has('somatic')) {
                        spell.components.push('s');
                    }
                    if (s.system.properties.has('material')) {
                        spell.components.push('m');
                    }
                    if (s.system.properties.has('ritual')) {
                        spell.components.push('r');
                    }
                    if (s.system.properties.has('concentration')) {
                        spell.components.push('c');
                    }
                    knownSpells.push(spell);
                });
        } catch (error) {
            throw new dnd5eActorPropertyError('actor-export', this.className, 'knownSpells', error.message);
        }
        return knownSpells;
    }

    /**
     * get the actor's languages
     * @type {array}
     */
    get languages() {
        const languages = [];
        try {
            this.actor.system.traits.languages.value.forEach((l) => {
                const language = {
                    slug: l,
                    label: 'unknown',
                    isStandard: false,
                    isExotic: false,
                    isCustom: false,
                    l10n: { label: 'unknown' },
                };

                if (typeof this.game.dnd5e.config.languages.standard.children[l] !== 'undefined') {
                    language['label'] = this.game.dnd5e.config.languages.standard.children[l];
                    language['isStandard'] = true;
                } else if (typeof this.game.dnd5e.config.languages.exotic.children[l] !== 'undefined') {
                    language['label'] = this.game.dnd5e.config.languages.exotic.children[l].label;
                    language['isExotic'] = true;
                } else if (typeof this.game.dnd5e.config.languages[l] !== 'undefined') {
                    language['label'] = this.game.dnd5e.config.languages[l].label;
                }
                language['l10n']['label'] = this.game.i18n.localize(language['label']);

                languages.push(language);
            });
            this.actor.system.traits.languages.custom.split(';').forEach((l) => {
                if (l.trim() !== '') {
                    languages.push({
                        slug: l.toLowerCase().replace(/[^a-z0-9]+/, '-'),
                        label: l,
                        isStandard: false,
                        isExotic: false,
                        isCustom: true,
                        l10n: { label: this.game.i18n.localize(l) },
                    });
                }
            });
        } catch (error) {
            throw new dnd5eActorPropertyError('actor-export', this.className, 'languages', error.message);
        }

        return languages;
    }

    /**
     * get the actor's movement types
     * @type {array}
     */
    get movement() {
        const movement = [];
        Object.keys(this.game.dnd5e.config.movementTypes).forEach((m) => {
            if (actor.system.attributes.movement[m] !== null) {
                const move = {
                    slug: m,
                    label: this.game.dnd5e.config.movementTypes[m],
                    value: this.actor.system.attributes.movement[m],
                    canHover: this.actor.system.attributes.movement.hover,
                    units: this.game.dnd5e.config.movementUnits[this.actor.system.attributes.movement.units],
                    isPrimary: false,
                    l10n: {
                        label: this.game.i18n.localize(this.game.dnd5e.config.movementTypes[m]),
                    },
                };
                if (m === 'walk') {
                    move['isPrimary'] = true;
                }
                move['displayName'] = `${move.label} ${move.value}${move.units}` + (move.canHover ? ' (hover)' : '');
                movement.push(move);
            }
        });
        return movement;
    }

    /**
     * get the actor name
     * @type {string}
     */
    get name() {
        return this.actor.name;
    }

    /**
     * get the actor owner name
     * @type {string}
     */
    get ownerName() {
        try {
            return Object.entries(this.actor.ownership)
                .filter((entry) => entry[1] === 3)
                .map((entry) => entry[0])
                .map((id) => (!game.users.get(id)?.isGM ? game.users.get(id)?.name : null))
                .filter((x) => x)
                .join(', ');
        } catch (error) {
            throw new dnd5eActorPropertyError('actor-export', this.className, 'ownerName', error.message);
        }
    }

    /**
     * get actor's base proficiency bonus
     * @type {number}
     */
    get proficiencyBonus() {
        return this.actor.system.attributes.prof || 0;
    }

    /**
     * get the actor's race
     * @type {Object}
     */
    get race() {
        return { name: '', l10n: { name: '' } };
    }

    /**
     * get the actor's skills
     * @type {Object}
     */
    get skills() {
        const skills = {};
        try {
            Object.keys(this.actor.system.skills)
                .sort()
                .forEach((s) => {
                    skills[s] = {
                        slug: s,
                        label: this.game.dnd5e.config.skills[s].label,
                        isProficient: this.actor.system.skills[s].value > 0,
                        modifier: this.actor.system.skills[s].total,
                        passive: this.actor.system.skills[s].passive,
                        l10n: {
                            name: this.game.i18n.localize(this.game.dnd5e.config.skills[s].label),
                        },
                    };
                    skills[s]['slug'] = s;
                });
        } catch (error) {
            throw new dnd5eActorPropertyError('actor-export', this.className, 'skills', error.message);
        }
        return skills;
    }

    /**
     * get the actor's spell attack bonus
     * @type {number}
     */
    get spellAttackBonus() {
        return this.spellSaveDC - 8;
    }

    /**
     * get the actor's spell casting ability
     * @type {string}
     */
    get spellCastingAbility() {
        return {
            shortName: this.actor.system.attributes.spellcasting || '',
            l10n: {
                shortName: this.game.i18n.localize(this.actor.system.attributes.spellcasting || ''),
            },
        };
    }

    /**
     * get the actor's spell save DC
     * @type {number}
     */
    get spellSaveDC() {
        return this.actor.system.attributes.spelldc || 0;
    }

    /**
     * get the actor's spell slots
     * @type {array}
     */
    get spellSlots() {
        const spellSlots = [];
        try {
            for (let i = 1; i <= 9; i++) {
                const spellEntry = this.actor.system.spells[`spell${i}`];
                const se = {
                    level: i,
                    value: spellEntry.value || 0,
                    max: spellEntry.max || 0,
                };
                se['expended'] = se['max'] - se['value'];
                spellSlots.push(se);
            }
        } catch (error) {
            throw new dnd5eActorPropertyError('actor-export', this.className, 'spellSlots', error.message);
        }
        return spellSlots;
    }
    /**
     * get the actor's tool proficiencies
     * @type {array}
     */
    get toolProficiencies() {
        const toolProficiencies = [];
        Object.keys(this.actor.system.tools).forEach((p) => {
            const toolProficiency = {
                slug: p,
            };
            if (typeof this.game.dnd5e.config.toolProficiencies[p] !== 'undefined') {
                toolProficiency['label'] = this.game.dnd5e.config.toolProficiencies[p];
            } else if (
                typeof this.game.packs.get('dnd5e.items').index.get(this.game.dnd5e.config.toolIds[p]) !== 'undefined'
            ) {
                toolProficiency['label'] = this.game.packs
                    .get('dnd5e.items')
                    .index.get(this.game.dnd5e.config.toolIds[p]).name;
            }
            toolProficiencies['l10n'] = {
                label: this.game.i18n.localize(toolProficiencies['label']),
            };
            toolProficiencies.push(toolProficiency);
        });

        return toolProficiencies;
    }

    /**
     * get the actor's traits
     * @type {array}
     */
    get traits() {
        const traits = [];
        this.actor.items
            .filter((f) => f.type === 'trait')
            .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
            .forEach((f) => {
                const trait = {
                    name: f.name,
                    description: f.system.description.value,
                    l10n: {
                        name: this.game.i18n.localize(f.name),
                    },
                };
                traits.push(trait);
            });
        return traits;
    }

    /**
     * get the actor's weapon proficiencies
     * @type {array}
     */
    get weaponProficiencies() {
        return [];
    }

    /**
     * get the actor's XP count
     */
    get xp() {
        return this.actor.system.details.xp.value;
    }
}

/**
 * DND 5e Property Error class
 * @class
 * @augments Error
 * @param {string} moduleName the name of the module the error has occurred in
 * @param {string} className the name of the class the error has occurred in
 * @param {string} methodName the name of the method the error has occurred in
 * @param {string} message the error message
 */
class dnd5eActorPropertyError extends genericPropertyError {
    constructor(moduleName, className, methodName, message) {
        super(moduleName, className, methodName, message, 'dnd5eActorPropertyError');
    }
}

/**
 * dnd5e player character abstraction class
 * @class
 * @augments dnd5eActor
 * @param {Object} game The foundry VTT game object
 * @param {Object} actor Foundry VTT actor object
 */
class dnd5ePlayer extends dnd5eActor {
    constructor(game, actor) {
        super(game, actor);
        this.className = 'dnd5ePlayer';
    }

    /**
     * get the player's armor proficiencies
     * @type {array}
     */
    get armorProficiencies() {
        const armorProficiencies = [];
        try {
            this.actor.system.traits.armorProf.value.forEach((p) => {
                const armorProficiency = {
                    slug: p,
                };
                if (typeof this.game.dnd5e.config.armorProficiencies[p] !== 'undefined') {
                    armorProficiency['label'] = this.game.dnd5e.config.armorProficiencies[p];
                } else if (
                    typeof this.game.packs.get('dnd5e.items').index.get(this.game.dnd5e.config.armorIds[p]) !==
                    'undefined'
                ) {
                    armorProficiency['label'] = this.game.packs
                        .get('dnd5e.items')
                        .index.get(this.game.dnd5e.config.armorIds[p]).name;
                }
                armorProficiencies['l10n'] = {
                    label: this.game.i18n.localize(armorProficiencies['label']),
                };

                armorProficiencies.push(armorProficiency);
            });
            this.actor.system.traits.armorProf.custom.split(';').forEach((p) => {
                if (p.trim() !== '') {
                    const armorProficiency = {
                        slug: p.toLowerCase().replace(/[^a-z0-9]+/, '-'),
                        label: p,
                        l10n: {
                            label: this.game.i18n.localize(p),
                        },
                    };
                    armorProficiencies.push(armorProficiency);
                }
            });
        } catch (error) {
            throw new dnd5eActorPropertyError('actor-export', this.className, 'armorProficiencies', error.message);
        }
        return armorProficiencies;
    }

    /**
     * get the player's background
     * @type {Object}
     */
    get background() {
        const background = super.background;
        try {
            if (typeof this.actor.system.details.background.name !== 'undefined') {
                background['name'] = this.actor.system.details.background.name;
            } else if (typeof this.actor.system.details.background === 'string') {
                background['name'] = this.actor.system.details.background;
            }
            background['l10n']['name'] = this.game.i18n.localize(background['name']);
        } catch (error) {
            throw new dnd5eActorPropertyError('actor-export', this.className, 'background', error.message);
        }
        return background;
    }

    /**
     * get the player's race
     * @type {Object}
     */
    get race() {
        const race = super.race;
        try {
            race['name'] = this.actor.system.details.race.name || this.actor.system.details.race;
            race['l10n']['name'] = this.game.i18n.localize(race['name']);
        } catch (error) {
            throw new dnd5eActorPropertyError('actor-export', this.className, 'race', error.message);
        }
        return race;
    }

    /**
     * get the player's weapon proficiencies
     * @type {array}
     */
    get weaponProficiencies() {
        const weaponProficiencies = [];
        try {
            this.actor.system.traits.weaponProf.value.forEach((p) => {
                const weaponProficiency = {
                    slug: p,
                };
                if (typeof this.game.dnd5e.config.weaponProficiencies[p] !== 'undefined') {
                    weaponProficiency['label'] = this.game.dnd5e.config.weaponProficiencies[p];
                } else if (
                    typeof this.game.packs.get('dnd5e.items').index.get(this.game.dnd5e.config.weaponIds[p]) !==
                    'undefined'
                ) {
                    weaponProficiency['label'] = this.game.packs
                        .get('dnd5e.items')
                        .index.get(this.game.dnd5e.config.weaponIds[p]).name;
                }
                weaponProficiency['l10n'] = {
                    label: this.game.i18n.localize(weaponProficiency['label']),
                };
                weaponProficiencies.push(weaponProficiency);
            });
            this.actor.system.traits.weaponProf.custom.split(';').forEach((p) => {
                if (p.trim() !== '') {
                    const weaponProficiency = {
                        slug: p.toLowerCase().replace(/[^a-z0-9]+/, '-'),
                        label: p,
                        l10n: {
                            label: this.game.i18n.localize(p),
                        },
                    };
                    weaponProficiencies.push(weaponProficiency);
                }
            });
        } catch (error) {
            throw new dnd5eActorPropertyError('actor-export', this.className, 'weaponProficiencies', error.message);
        }
        return weaponProficiencies;
    }
}

/**
 * dnd5e non player character abstraction class
 * @class
 * @augments dnd5eActor
 * @param {Object} game The foundry VTT game object
 * @param {Object} actor Foundry VTT actor object
 */
class dnd5eNPC extends dnd5eActor {
    constructor(game, actor) {
        super(game, actor);
        this.className = 'dnd5eNPC';
    }
}

/**
 * @class
 * @augments genericHelper
 * DND5e Helper class for DND 5e centric functions
 */
export class dnd5eHelper extends genericHelper {
    /**
     * Determine what type of actor we're dealing with and return an object which can parse all data
     * @param {Object} game the Foundry VTT game object
     * @param {Object} actor the Foundry VTT actor object
     * @returns {Object}
     */
    static getActorObject(game, actor) {
        if (actor.type === 'character') {
            return new dnd5ePlayer(game, actor);
        } else if (actor.type === 'npc') {
            return new dnd5eNPC(game, actor);
        } else {
            throw new Error('Could not find actor type: ' + actor.type);
        }
    }
}
