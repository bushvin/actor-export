import { baseProvider } from './BaseProvider.js';
import { pf2eHelper } from '../helpers/PF2eHelper.js';

/**
 * ScribeProvider module
 * @module ScribeProvider
 * @author William Leemans
 * @copyright William Leemans 2024
 */

/**
 * @class
 * The base class to format scribe markdown
 * @param {Object} item the raw resource to be scribed
 */
class scribeBase {
    constructor(item) {
        this._item = item;
    }

    /**
     * Remove empty lines from a given string
     * @param {string} value the string value to clean up
     * @returns {string} the cleaned up string
     */
    _cleanup = function (value) {
        if (typeof value !== 'string') {
            return value;
        }
        return (
            value
                .split('\n')
                .map((i) => i.replace(/^\s+/, ''))
                .join('\n') + '  \n'
        );
    };

    /**
     * Generate a label/shortcut
     * @param {string} label the name of the label
     * @param {number} level the level of indentation for the label
     * @returns {string} a label/shortcut
     */
    _label(label, level) {
        return '((' + '+'.repeat(level) + label + ' ))';
    }

    /**
     * Format given text to replace Foundry commands and HTML with markdown counterparts
     * @param {string} value the text to be parsed
     * @param {number} buff_heading buff headings with this many
     * @returns {string} the formatted text
     */
    _parse_description = function (value, buff_heading = 0) {
        if (typeof value !== 'string') {
            return value;
        }
        const matcher = function (m, p) {
            return game.i18n.localize(p);
        };
        value = value.replace(/@Localize\[([^\]]+)\]/gi, matcher);
        // let's not remove these for now...
        // value = value.replace(/@UUID\[[^\]]+\.conditionitems\.[^\]]+\]{([^}]+)}/g, '*$1*');
        // value = value.replace(/@UUID\[[^\]]+\.feats-srd\.[^\]]+\]{([^}]+)}/g, '*$1*');
        // value = value.replace(/@UUID\[[^\]]+\.feat-effects\.[^\]]+\]{([^}]+)}/g, '*$1*');
        // value = value.replace(/@UUID\[[^\]]+\.spells-srd\.[^\]]+\]{([^}]+)}/g, '*$1*');
        // value = value.replace(/@UUID\[[^\]]+\.actionspf2e\.[^\]]+\]{([^}]+)}/g, '*$1*');
        // value = value.replace(/@UUID\[[^\]]+\.spell-effects\.[^\]]+\]{([^}]+)}/g, '*$1*');
        // value = value.replace(/@UUID\[[^\]]+\.classfeatures\.[^\]]+\]{([^}]+)}/g, '*$1*');
        // value = value.replace(/@UUID\[[^\]]+\.bestiary-ability-glossary-srd\.[^\]]+\]{([^}]+)}/g, '*$1*');
        value = value.replace(/@UUID\[[^\]]+\]{([^}]+)}/g, '*$1*');

        // @UUID[Compendium.pf2e.bestiary-ability-glossary-srd.Item.v61oEQaDdcRpaZ9X]{Aura}
        value = value.replace(/\[\[\/r [^\]]+\]\]{([^}]+)}/g, '$1');
        value = value.replace(/\[\[\/br [^\]]+\]\]{([^}]+)}/g, '$1');
        value = value.replace(/\[\[\/r [0-9]+d[0-9]+\[[^\]]+\]\]\]{([^}]+)}/g, '$1');
        value = value.replace(/\[\[\/r \(@damage\)([^\[]+)\[([^\]]+)\]\]\]/, '$1 $2');
        value = value.replace(/@damage\[([^\[]+)\[([^\]]+)\]\]{([^}]+)}/gi, '$1 $2 ($3)');
        value = value.replace(/@damage\[([^\[]+)\[([^\]]+)\]\]/gi, '$1 $2');
        value = value.replace(/@Template\[[^\]]+\]{([^}]+)}/gi, '$1');
        value = value.replace(/@Template\[[^\:]+:([^\|]+)\|[^:]+:([^\]]+)\]/gi, '$1 $2 feet');
        value = value.replace(/@Compendium\[[^\]]+\]{([^}]+)}/g, '*$1*');

        /* remove anything not needed */
        value = value.replace(/\[\[\/r[^}]+}/g, '');
        value = value.replace(
            /@check\[type:([^\|]+)\|[^\]]+classOrSpellDC[^\]]+\|basic:true[^\]]*\]/gi,
            'basic $1 save'
        );
        value = value.replace(/@check\[type:([^\|]+)\|[^\]]+classOrSpellDC[^\]]+\]/gi, '$1 save');
        value = value.replace(/@check\[[^\]]+\]/gi, '');

        value = value.replace(/&nbsp;/gi, ' ');

        value = pf2eHelper.stripHTMLtag(value, 'br');
        value = pf2eHelper.stripHTMLtag(value, 'hr', '-');
        value = pf2eHelper.stripHTMLtag(value, 'p', '', '\n');
        value = pf2eHelper.stripHTMLtag(value, 'strong', ' **', '**');
        value = pf2eHelper.stripHTMLtag(value, 'em', ' *', '*');
        value = pf2eHelper.stripHTMLtag(value, 'span');
        value = pf2eHelper.stripNestedHTMLtag(value, 'ol', 'li', '1. ');
        value = pf2eHelper.stripHTMLtag(value, 'ol');
        value = pf2eHelper.stripNestedHTMLtag(value, 'ul', 'li', '- ');
        value = pf2eHelper.stripHTMLtag(value, 'ul');
        buff_heading = buff_heading + 1;
        value = pf2eHelper.stripHTMLtag(value, 'h1', '#'.repeat(buff_heading) + ' ', '\n');
        value = pf2eHelper.stripHTMLtag(value, 'h2', '#'.repeat(buff_heading) + ' ', '\n');
        value = pf2eHelper.stripHTMLtag(value, 'h3', '#'.repeat(buff_heading) + ' ', '\n');
        value = pf2eHelper.stripHTMLtag(value, 'h4', '#'.repeat(buff_heading) + ' ', '\n');
        value = pf2eHelper.stripHTMLtag(value, 'h5', '#'.repeat(buff_heading) + ' ', '\n');

        return value;
    };
}

/**
 * @class
 * A class to format the given object as a scribe item
 * @param {Object} item the raw resource to be scribed
 * @param {number} label_level the level of indentation for the label of the item
 * @extends scribeBase
 */
class scribeItemEntry extends scribeBase {
    constructor(item, label_level = 0) {
        super(item);
        this._item_title = this._item.name;
        this._item_label = this._item.name;
        this._item_type = this._item.type;
        this._item_rank = this._item.system.level?.value || 0;
        this._item_traits = this._item.system.traits?.value.concat([this._item.system.traits?.rarity]) || [];
        this._item_source = this._item.system.publication?.title || '';
        this._item_description = [];
        this._section = [];
        this._label_level = label_level;
    }

    /**
     * Generate the scribe markdown for an item entry
     * @returns {string} a formatted scribe item entry
     */
    scribify() {
        let description = this._item_description.join('\n-\n');
        let traits = pf2eHelper.formatTraits(this._item_traits);

        let item = 'item(\n';
        item = item + `# ${this._item_title} ${this._label(this._item_label, this._label_level)}\n`;
        if (this._item_rank !== '') {
            item = item + `## ${this._item_type} ${this._item_rank}\n`;
        } else {
            item = item + `## ${this._item_type}\n`;
        }
        item = item + '-\n';
        if (traits !== '') {
            item = item + `; ${traits}\n`;
        }
        if (this._item_source.trim() != '') {
            item = item + `**Source** ${this._item_source}\n\n`;
        }
        item = item + `${description}\n\n`;
        item = item + ')\n';
        return this._cleanup(item);
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
class scribeTableEntry extends scribeBase {
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
        const parsed = row.map((i) => i.replace(/\(/, '\\(').replace(/\)/, '\\)'));
        this._contentRows.push(parsed);
    }

    /**
     * Generate the scribe markdown for a table entry
     * @returns {string} a formatted scribe table entry
     */
    scribify() {
        let entry = [];
        if (this._headerRow.length > 0) {
        }
        entry.push(this._headerRow.join(' | '));
        entry.push(this._headerRow.map((i) => '---').join(' | '));
        this._contentRows.forEach((row) => {
            entry.push(Object.values(row).join(' | '));
        });
        if (this._footer != '') {
            entry.push(`.${this._footer}`);
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
 * A class to generate a scribe formatted action
 * @param {Object} action the raw resource to be scribed
 * @extends scribeBase
 */
class scribeAction extends scribeBase {
    constructor(action) {
        super();
        this._action = action;
    }

    /**
     * is the activity an action?
     * @returns {boolean} whether the activity is an action
     */
    get isAction() {
        return this._action.system.actionType?.value === 'action';
    }

    /**
     * is the activity a reaction?
     * @returns {boolean} whether the activity is a reaction
     */
    get isReaction() {
        return this._action.system.actionType?.value === 'reaction';
    }

    /**
     * is the activity a free action?
     * @returns {boolean} whether the activity is a free action
     */
    get isFreeAction() {
        return this._action.system.actionType?.value === 'free';
    }

    /**
     * Generate the scribe markdown for a class
     * @returns {string} a formatted scribe class
     */
    scribify() {
        const ret = [];
        ret.push(`**${this._action.name}**`);
        ret.push(
            pf2eHelper.formatActivity(
                this._action.system.actionType?.value,
                this._action.system.actions?.value,
                pf2eHelper.scribeActivityGlyphs
            )
        );
        ret.push(this._parse_description(this._action.description));
        return 'item(\n' + ret.join(' ') + '\n)';
    }
}

/**
 * @class
 * A class to generate a scribe formatted ancestry
 * @param {Object} item the raw resource to be scribed
 * @param {number} label_level the level of indentation for the label of the item
 * @extends scribeBase
 */
class scribeAncestry extends scribeBase {
    constructor(item, label_level = 0) {
        super(item);
        this._ancestry_title = '';
        this._ancestry_type = 'ancestry';
        this._heritage = [];
        this._ancestry_traits = [];
        this._ancestry_description = [];
        this._ancestry_title = this._item.name;
        this._ancestry_traits = this._item.system.traits?.value.concat([this._item.system.traits?.rarity]) || [];
        this._ancestry_description.push(this._parse_description(this._item.system.description?.value || ''));
        this._item_label = this._item.name;
        this._label_level = label_level;
    }

    /**
     * Add a heritage object
     * @param {Object} heritage the heritage object to be added to the ancestry
     */
    heritage = function (heritage) {
        this._heritage.push(heritage);
    };

    /**
     * Generate the scribe markdown for an ancestry
     * @returns {string} a formatted scribe ancestry
     */
    scribify() {
        let ret = '';
        let traits = this._ancestry_traits;
        this._heritage.forEach((i) => {
            traits = traits.concat(i.system.traits.value.concat([i.system.traits.rarity]));
        });
        traits = pf2eHelper.formatTraits(traits);
        ret = ret + `# Ancestry: ${this._ancestry_title} ${this._label(this._ancestry_title, this._label_level)}\n`;
        ret = ret + `-\n`;
        if (traits !== '') {
            ret = ret + `; ${traits}\n`;
        }
        ret = ret + `${this._ancestry_description.join('\n')}`;
        if (this._heritage.length > 0) {
            this._heritage.forEach((i) => {
                ret = ret + `## Heritage: ${i.name}  ${this._label(i.name, this._label_level + 1)}\n`;
                ret = ret + `${i.system.description.value}\n`;
            });
        }
        return this._cleanup(ret);
    }
}

/**
 * @class
 * A class to generate a scribe formatted background
 * @param {Object} item the raw resource to be scribed
 * @extends scribeItemEntry
 */
class scribeBackground extends scribeItemEntry {
    constructor(item) {
        super(item);
        this._item_rank = '';
        this._item_description.push(this._parse_description(this._item.system.description?.value || ''));
    }
}

/**
 * @class
 * A class to generate a scribe formatted class
 * @param {Object} item the raw resource to be scribed
 * @param {number} label_level the level of indentation for the label of the item
 * @extends scribeItemEntry
 */
class scribeClass extends scribeBase {
    constructor(item, label_level = 0) {
        super(item);
        this._class_name = this._item.name;
        this._class_label = this._item.name;
        this._class_description = this._item.system.description?.value || '';
        this._label_level = label_level;
    }

    /**
     * Generate the scribe markdown for a class
     * @returns {string} a formatted scribe class
     */
    scribify() {
        const ret = [];
        ret.push(`# Class: ${this._class_name} ${this._label(this._class_label, this._label_level)}`);

        const pre = new RegExp(`<span[^>]+style="float:right"[^>]*>`, 'i');
        const post = new RegExp(`</span>`, 'i');
        while (true) {
            let ovalue = this._class_description;
            this._class_description = this._class_description.replace(pre, ' (');
            if (ovalue === this._class_description) {
                break;
            }
            this._class_description = this._class_description.replace(post, ')');
            if (ovalue === this._class_description) {
                break;
            }
        }

        ret.push(this._parse_description(this._class_description, 1));

        return this._cleanup(ret.join('\n'));
    }
}

/**
 * @class
 * A class to generate a scribe formatted creature
 * @param {Object} item the raw resource to be scribed
 * @extends scribeItemEntry
 */
class scribeCreature extends scribeItemEntry {
    constructor(item) {
        super(item);
        if (this._item.type !== 'character') {
            this._item_type = 'creature';
        }
        this._creature_features = [];
        this._creature_defense = [];
        this._creature_offense = [];
        this._item_rank = this._item.level || 0;
        this._item_traits.push(pf2eHelper.resolveSize(this._item.size || 'medium'));

        // features
        this.pushSenses(this._creature_features);
        this.pushLanguages(this._creature_features);
        this.pushSkills(this._creature_features);
        this.pushAbilities(this._creature_features);
        this.pushItems(this._creature_features);

        // defense
        this.pushAcSaves(this._creature_defense);
        this.pushHpImmunityWeaknessResistance(this._creature_defense);
        this.pushDefensiveAbilities(this._creature_defense);

        // offense
        this.pushMovement(this._creature_offense);
        this.pushMeleeAttacks(this._creature_offense);
        this.pushRangedAttacks(this._creature_offense);
        this.pushSpellcasting(this._creature_offense);
        this.pushOffensiveAbilities(this._creature_offense);

        this._item_description.push(this._creature_features.join('\n\n'));
        this._item_description.push(this._creature_defense.join('\n\n'));
        this._item_description.push(this._creature_offense.join('\n\n'));
    }

    /**
     * Generate Ability information
     * @param {array} push_to the array to push to
     */
    pushAbilities(push_to) {
        let abilities = [];
        Object.keys(this._item.abilities).forEach((a) => {
            abilities.push(`**${pf2eHelper.capitalize(a)}** ${pf2eHelper.quantifyNumber(this._item.abilities[a].mod)}`);
        });
        push_to.push(abilities.join(', '));
    }

    /**
     * Generate AC and Save information
     * @param {array} push_to the array to push to
     */
    pushAcSaves(push_to) {
        const entry = [];
        entry.push(`**AC** ${this._item.armorClass.value}`);
        entry.push(`**Fort** ${pf2eHelper.quantifyNumber(this._item.saves.fortitude.mod)}`);
        entry.push(`**Ref** ${pf2eHelper.quantifyNumber(this._item.saves.reflex.mod)}`);
        entry.push(`**Will** ${pf2eHelper.quantifyNumber(this._item.saves.will.mod)}`);
        push_to.push(entry.join(', '));
    }

    /**
     * Generate Defensive Ability information
     * @param {array} push_to the array to push to
     */
    pushDefensiveAbilities(push_to) {
        this._item.items
            .filter((i) => i.type === 'action' && i.system.category === 'defensive')
            .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
            .forEach((a) => {
                const name = a.name;
                const traits = pf2eHelper.formatTraits(
                    a.system.traits.value.concat(a.system.traits.otherTags).concat([a.system.traits.rarity])
                );
                let activity = pf2eHelper.formatActivity(
                    a.system.actionType.value,
                    a.system.actions.value,
                    pf2eHelper.scribeActivityGlyphs
                );
                const description = this._parse_description(a.system.description.value)
                    .replace(/-/g, '')
                    .replace(/\n\s*\n/g, '\n');
                const item =
                    `**${name}** ` +
                    (activity !== '' ? `${activity} ` : '') +
                    (traits !== '' ? `(${traits}) ` : '') +
                    description;
                push_to.push(item);
            });
    }

    /**
     * Generate HP, Immunity and Resistance information
     * @param {array} push_to the array to push to
     */
    pushHpImmunityWeaknessResistance(push_to) {
        const entry = [];
        entry.push(`**HP** ${actor.hitPoints.value || 0}`);
        if (actor.system.attributes.immunities.map((i) => i.label).length > 0) {
            entry.push('**Immunities** ' + actor.system.attributes.immunities.map((i) => i.label).join(', '));
        }
        if (actor.system.attributes.weaknesses.length > 0) {
            entry.push('**Weaknesses** ' + actor.system.attributes.weaknesses.map((i) => i.label).join(', '));
        }
        if (actor.system.attributes.resistances.length > 0) {
            entry.push('**Resistances** ' + actor.system.attributes.resistances.map((i) => i.label).join(', '));
        }

        push_to.push(entry.join('; '));
    }

    /**
     * Generate Item information
     * @param {array} push_to the array to push to
     */
    pushItems(push_to) {
        if (this._item.inventory.contents.filter((i) => !i.isAmmo).length > 0) {
            push_to.push(
                `**Items** ${this._item.inventory.contents
                    .filter((i) => !i.isAmmo)
                    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
                    .map((i) => i.name)
                    .join(', ')}`
            );
        }
    }

    /**
     * Generate Language information
     * @param {array} push_to the array to push to
     */
    pushLanguages(push_to) {
        const languages = this._item.system.details.languages.value.map((i) => `${pf2eHelper.capitalize(i)}`);
        if (languages.length > 0) {
            push_to.push(`**Languages** ${languages.join(', ')}`);
        }
    }

    /**
     * Generate Melee Attack information
     * @param {array} push_to the array to push to
     */
    pushMeleeAttacks(push_to) {
        this._item.system.actions
            .filter((i) => i.type === 'strike' && i.options.includes('melee'))
            .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0))
            .forEach((strike) => {
                push_to.push(new scribeStrike(strike, this._item).scribify());
            });
    }

    /**
     * Generate Movement information
     * @param {array} push_to the array to push to
     */
    pushMovement(push_to) {
        const entry = [];
        entry.push(`**Speed** ${this._item.system.attributes.speed.total} feet`);
        this._item.system.attributes.speed.otherSpeeds
            .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0))
            .map((i) => `${i.label} ${i.total} feet`)
            .forEach((s) => entry.push(s));
        const details =
            this._item.system.attributes.speed.details !== '' ? ` (${this._item.system.attributes.speed.details})` : '';
        push_to.push(entry.join('; ') + details);
    }

    /**
     * Generate Offensive Ability information
     * @param {array} push_to the array to push to
     */
    pushOffensiveAbilities(push_to) {
        this._item.items
            .filter((i) => i.type === 'action' && i.system.category === 'offensive')
            .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
            .forEach((a) => {
                const name = a.name;
                const traits = pf2eHelper.formatTraits(
                    a.system.traits.value.concat(a.system.traits.otherTags).concat([a.system.traits.rarity])
                );
                let activity = pf2eHelper.formatActivity(
                    a.system.actionType.value,
                    a.system.actions.value,
                    pf2eHelper.scribeActivityGlyphs
                );
                const description = this._parse_description(a.system.description.value)
                    .replace(/-/g, '')
                    .replace(/\n\s*\n/g, '\n');
                let item =
                    `**${name}** ` +
                    (activity !== '' ? `${activity} ` : '') +
                    (traits !== '' ? `(${traits}) ` : '') +
                    description;
                push_to.push(item);
            });
    }

    /**
     * Generate Ranged Attack information
     * @param {array} push_to the array to push to
     */
    pushRangedAttacks(push_to) {
        this._item.system.actions
            .filter((i) => i.type === 'strike' && i.options.includes('ranged'))
            .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0))
            .forEach((strike) => {
                push_to.push(new scribeStrike(strike, this._item).scribify());
            });
    }

    /**
     * Generate Senses information
     * @param {array} push_to the array to push to
     */
    pushSenses(push_to) {
        const entry = [];
        const senses = this._item.system.perception.senses
            .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0))
            .map((i) => i.label);
        entry.push(`**Perception** ${pf2eHelper.quantifyNumber(this._item.perception.mod)}`);
        if (senses.length > 0) {
            entry.push(senses.join(', '));
        }

        push_to.push(entry.join('; '));
    }

    /**
     * Generate Skill information
     * @param {array} push_to the array to push to
     */
    pushSkills(push_to) {
        const skills = Object.values(this._item.skills)
            .filter((i) => i.proficient)
            .map((i) => `${i.label} ${pf2eHelper.quantifyNumber(i.mod)}`)
            .sort((a, b) => {
                return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
            });
        if (skills.length > 0) {
            push_to.push(`**Skills** ${skills.join(', ')}`);
        }
    }
    /**
     * Generate Spellcasting information
     * @param {array} push_to the array to push to
     */
    pushSpellcasting(push_to) {
        this._item.spellcasting
            .filter((i) => i.type === 'spellcastingEntry')
            .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
            .forEach((sce) => {
                const name = sce.name;
                const save_dc = sce.statistic.dc.value;
                const spells = {};
                sce.spells
                    .filter((i) => true)
                    .forEach((s) => {
                        spells[s.rank] = (spells[s.rank] || []).concat([`*${s.name}*`]);
                    });
                let item = `**${name}** DC ${save_dc}`;
                Object.keys(spells)
                    .sort()
                    .reverse()
                    .forEach((rank) => {
                        item = `${item}; **${pf2eHelper.shortOrdinal(rank)}** ${spells[rank].sort().join(', ')}`;
                    });
                push_to.push(item);
            });
    }
}

/**
 * @class
 * A class to generate a scribe formatted feat
 * @param {Object} item the raw resource to be scribed
 * @param {number} label_level the level of indentation for the label of the item
 * @extends scribeItemEntry
 */
class scribeFeat extends scribeItemEntry {
    constructor(item, label_level = 0) {
        super(item, label_level);
        // FIXME: use formatActionSomething
        if (this._item.system.actionType.value === 'reaction') {
            this._item_title = `${this._item_title} :r:`;
        }
        let prerequisites = [];
        this._item.system.prerequisites.value.forEach((i) => {
            prerequisites.push(i.value);
        });
        if (prerequisites.length > 0) {
            this._item_description.push(`**Prerequisites** ${prerequisites.join(', ')}`);
        }
        this._item_description.push(this._parse_description(this._item.system.description?.value || ''));
    }
}

/**
 * @class
 * A class to generate a scribe formatted feature
 * @param {Object} item the raw resource to be scribed
 * @param {number} label_level the level of indentation for the label of the item
 * @extends scribeItemEntry
 */
class scribeFeature extends scribeItemEntry {
    constructor(item, label_level = 0) {
        super(item, label_level);
        this._item_type = '';

        if (this._item.system.level?.value == 0) {
            this._item_rank = '';
        }
        this._item_description.push(this._parse_description(this._item.system.description?.value || ''));
    }
}

/**
 * @class
 * A class to generate a scribe formatted formula
 * @param {Object} item the raw resource to be scribed
 * @param {number} label_level the level of indentation for the label of the item
 * @extends scribeItemEntry
 */
class scribeFormula extends scribeItemEntry {
    constructor(item, label_level = 0) {
        super(item, label_level);
        this._formula_cost_table = [
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
        this._item_rank = this._item.level;
        this._item_type = 'formula';
        this._item_description.push(`**Cost** ${this._formula_cost_table[this._item.level]}`);
        this._item_description.push(this._parse_description(this._item.description));
    }
}

/**
 * @class
 * A class to generate a scribe formatted Spell
 * @param {Object} item the raw resource to be scribed
 * @param {number} label_level the level of indentation for the label of the item
 * @extends scribeItemEntry
 */
class scribeSpell extends scribeItemEntry {
    constructor(item, label_level = 0) {
        super(item, label_level);
        let actions = '';
        let cast = '';
        actions = pf2eHelper.formatSpellCastingTime(this._item.system.time.value, pf2eHelper.scribeActivityGlyphs);
        if (actions === this._item.system.time.value) {
            cast = `**Cast** ${actions}\n`;
            actions = '';
        }
        this._item_title = `${this._item.name} ${actions}`;

        if (this._item.isCantrip) {
            this._item_type = 'cantrip';
        } else if (this._item.isFocusSpell) {
            this._item_type = 'focus';
        } else {
            this._item_type = 'spell';
        }

        let first = [];
        if (this._item.system.traits.traditions.length > 0) {
            first.push(`**Tradition** ${this._item.system.traits.traditions.join(', ')}\n`);
        }
        if (cast !== '') {
            first.push(cast);
        }

        /* Range, Area, Targets */
        let rat = [];
        if (!(typeof this._item.system.range === 'object' && !this._item.system.range)) {
            if (this._item.system.range.value !== '') {
                rat.push(`**Range** ${this._item.system.range.value}`);
            }
        }
        if (!(typeof this._item.system.area === 'object' && !this._item.system.area)) {
            if (this._item.system.area.value !== '') {
                rat.push(`**Area** ${this._item.system.area.value}ft ${this._item.system.area.type}`);
            }
        }
        if (
            !(typeof this._item.system.target === 'object' && !this._item.system.target) &&
            this._item.system.target != ''
        ) {
            if (this._item.system.target.value !== '') {
                rat.push(`**Targets** ${this._item.system.target.value}`);
            }
        }
        if (rat.length > 0) {
            first.push(rat.join('; ') + '\n');
        }

        /* Defense, Duration */
        let dd = [];
        if (this._item.system.defense?.passive !== undefined) {
            if (this._item.system.defense.passive.statistic !== '') {
                dd.push(`**Defense** ${this._item.system.defense.passive.statistic}`);
            }
        } else if (this._item.system.defense?.save !== undefined) {
            if (this._item.system.defense.save.statistic !== '') {
                dd.push(
                    '**Defense** ' +
                        (this._item.system.defense.save.basic ? 'Basic ' : '') +
                        this._item.system.defense.save.statistic
                );
            }
        }
        if (!(typeof this._item.system.duration === 'object' && !this._item.system.duration)) {
            if (this._item.system.duration.value != '') {
                let duration = `**Duration** ${this._item.system.duration.value}`;
                if (this._item.system.duration.sustained) {
                    duration = `${duration} (Sustained)`;
                }
                dd.push(duration);
            }
        }
        if (dd.length > 0) {
            first.push(dd.join('; ') + '\n');
        }

        this._item_description.push(first.join('\n'));

        this._item_description.push(this._parse_description(this._item.system.description.value));
    }
}

/**
 * @class
 * A class to generate a scribe formatted Strike
 * @param {Object} strike the raw resource to be scribed
 * @extends scribeBase
 */
class scribeStrike extends scribeBase {
    constructor(strike, actor) {
        super();
        this._strike = strike;
        this._actor = actor;
    }

    /**
     * is the strike a melee strike?
     * @returns {boolean} whether the strike is a melee strike
     */
    get isMelee() {
        return this._strike.options.includes('melee');
    }

    /**
     * is the strike a ranged strike?
     * @returns {boolean} whether the strike is a ranged strike
     */
    get isRanged() {
        return this._strike.options.includes('ranged');
    }

    /**
     * Generate the scribe markdown for a class
     * @returns {string} a formatted scribe class
     */
    scribify() {
        const ret = [];
        if (this.isMelee) {
            ret.push('**Melee**');
        } else if (this.isRanged) {
            ret.push('**Ranged**');
        }
        ret.push(this._strike.label);
        ret.push(pf2eHelper.quantifyNumber(this._strike.totalModifier));
        if (this._strike.item.system.traits.value.length > 0) {
            ret.push('(' + pf2eHelper.formatTraits(this._strike.item.system.traits.value) + ')');
        }
        ret.push('**Damage**');
        ret.push(pf2eHelper.damageFormula(this._strike, this._actor));

        return ret.join(' ');
    }
}

/**
 * @class
 * A class to generate scribe formatted files.
 * @param {Object} actor The Foundry VTT actor object.
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
        scribeAction: scribeAction,
        scribeAncestry: scribeAncestry,
        scribeBackground: scribeBackground,
        scribeClass: scribeClass,
        scribeCreature: scribeCreature,
        scribeItemEntry: scribeItemEntry,
        scribeTableEntry: scribeTableEntry,
        scribeFeat: scribeFeat,
        scribeFeature: scribeFeature,
        scribeFormula: scribeFormula,
        scribeSpell: scribeSpell,
        scribeStrike: scribeStrike,
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
     * @param {string} sourceFileURI The full path of the file loaded
     * @returns
     */
    async updateFile(sourceFileURI) {
        // const option = sourceFileURI.split('/').pop();
        const option = this.sourceFileURI;
        this.scribeFile = this.getScribeData(option);
        return;
    }

    /**
     * Save the file
     * @async
     */
    async saveFile() {
        console.log('saveFile');
        console.log('this.scribeFile:', this.scribeFile);
        if (this.scribeFile !== undefined && this.scribeFile != '') {
            saveDataToFile(this.scribeFile, 'text/plain', this.destinationFileName || destinationFileName);
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
