import { baseProvider } from './BaseProvider.js';
import { PF2eHelper } from '../helpers/PF2eHelper.js';

class scribeBase {
    constructor(item) {
        this._item = item;
    }

    _label(label, level) {
        return '((' + '+'.repeat(level) + label + ' ))';
    }

    _cleanup = function (item) {
        if (typeof item !== 'string') {
            return item;
        }
        return (
            item
                .split('\n')
                .map((i) => i.replace(/^\s+/, ''))
                .join('\n') + '  \n'
        );
    };

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
        value = value.replace(/\[\[\/r [0-9]+d[0-9]+\[[^\]]+\]\]\]{([^}]+)}/g, '$1');
        value = value.replace(/@damage\[([^\[]+)\[([^\]]+)\]\]{([^}]+)}/gi, '$1 $2 ($3)');
        value = value.replace(/@damage\[([^\[]+)\[([^\]]+)\]\]/gi, '$1 $2');
        value = value.replace(/@Template\[[^\]]+\]{([^}]+)}/gi, '$1');
        value = value.replace(/@Template\[[^\:]+:([^\|]+)\|[^:]+:([^\]]+)\]/gi, '$1 $2 feet');
        value = value.replace(/@Compendium\[[^\]]+\]{([^}]+)}/g, '*$1*');

        /* remove anything not needed */
        value = value.replace(/\[\[\/r[^}]+}/g, '');
        value = value.replace(/@check\[[^\]]+\]/gi, '');

        value = this._strip_html_element('br', value, '\n');
        value = this._strip_html_element('hr', value, '-');
        value = this._strip_html_element('p', value, '', '\n');
        value = this._strip_html_element('strong', value, '**', '**');
        value = this._strip_html_element('em', value, '*', '*');
        value = this._strip_html_element('span', value);
        value = this._strip_nested_html_element('ol', 'li', value, '1. ', '\n');
        value = this._strip_html_element('ol', value);
        value = this._strip_nested_html_element('ul', 'li', value, '- ', '\n');
        value = this._strip_html_element('ul', value);
        /*
        value = this._strip_html_element("li", value, '1. ', '\n');
        */
        buff_heading = buff_heading + 1;
        value = this._strip_html_element('h1', value, '#'.repeat(buff_heading) + ' ', '\n');
        value = this._strip_html_element('h2', value, '#'.repeat(buff_heading) + ' ', '\n');
        value = this._strip_html_element('h3', value, '#'.repeat(buff_heading) + ' ', '\n');
        value = this._strip_html_element('h4', value, '#'.repeat(buff_heading) + ' ', '\n');
        value = this._strip_html_element('h5', value, '#'.repeat(buff_heading) + ' ', '\n');

        return value;
    };

    _strip_html_element = function (element, value, pre_replace = '', post_replace = '') {
        element = element.toLowerCase();
        if (['hr', 'br'].includes(element)) {
            let re = new RegExp(`<${element} \/>`, 'gi');
            value = value.replace(re, pre_replace);
        } else {
            let pre = new RegExp(`<${element}[^>]*>`, 'i');
            let post = new RegExp(`</${element}>`, 'i');
            while (true) {
                let ovalue = value;
                value = value.replace(pre, pre_replace);
                value = value.replace(post, post_replace);
                if (ovalue === value) {
                    break;
                }
            }
        }
        return value;
    };

    _strip_nested_html_element = function (parent, element, value, pre_replace = '', post_replace = '') {
        let pre_parent = new RegExp(`<${parent}[^>]*>`, 'i');
        let post_parent = new RegExp(`</${parent}>`, 'i');
        let start_index = 0;
        while (true) {
            let ovalue = value;
            let search_value = value.substring(start_index);
            let pre_match = pre_parent.exec(search_value);
            let post_match = post_parent.exec(search_value);
            if (typeof pre_match === 'object' && !pre_match) {
                break;
            }
            if (typeof post_match === 'object' && !post_match) {
                break;
            }
            let snippet = search_value.substring(pre_match.index + pre_match[0].length, post_match.index);
            snippet = this._strip_html_element(element, snippet, pre_replace, post_replace);
            value =
                value.substring(0, start_index) +
                search_value.substring(0, pre_match.index + pre_match[0].length) +
                snippet +
                search_value.substring(post_match.index);
            start_index = start_index + post_match.index + post_match[0].length;
            if (ovalue === value) {
                break;
            }
        }
        return value;
    };
}

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

    scribify() {
        let description = this._item_description.join('\n-\n');
        let traits = PF2eHelper.formatTraits(this._item_traits);

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

    heritage = function (heritage) {
        this._heritage.push(heritage);
    };

    scribify() {
        let ret = '';
        let traits = this._ancestry_traits;
        this._heritage.forEach((i) => {
            traits = traits.concat(i.system.traits.value.concat([i.system.traits.rarity]));
        });
        traits = PF2eHelper.formatTraits(traits);
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

class scribeBackground extends scribeItemEntry {
    constructor(item) {
        super(item);
        this._item_rank = '';
        this._item_description.push(this._parse_description(this._item.system.description?.value || ''));
    }
}

class scribeClass extends scribeBase {
    constructor(item, label_level = 0) {
        super(item);
        this._class_name = this._item.name;
        this._class_label = this._item.name;
        this._class_description = this._item.system.description?.value || '';
        this._label_level = label_level;
    }

    scribify() {
        let ret = [];
        ret.push(`# Class: ${this._class_name} ${this._label(this._class_label, this._label_level)}`);

        let pre = new RegExp(`<span[^>]+style="float:right"[^>]*>`, 'i');
        let post = new RegExp(`</span>`, 'i');
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

        /* ret.push(this._class_description, 1); */
        return this._cleanup(ret.join('\n'));
    }
}

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

class scribeFeature extends scribeItemEntry {
    constructor(item, label_level = 0) {
        super(item, label_level);
        this._item_type = '';
        // this._label_level = label_level;

        if (this._item.system.level?.value == 0) {
            this._item_rank = '';
        }
        this._item_description.push(this._parse_description(this._item.system.description?.value || ''));
    }
}

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
        this._item_traits.push(PF2eHelper.resolveSize(this._item.size || 'medium'));

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
                        item = `${item}; **${PF2eHelper.shortOrdinal(rank)}** ${spells[rank].sort()}`;
                    });
                push_to.push(item);
            });
    }

    pushDefensiveAbilities(push_to) {
        this._item.items
            .filter((i) => i.type === 'action' && i.system.category === 'defensive')
            .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
            .forEach((a) => {
                const name = a.name;
                const traits = PF2eHelper.formatTraits(
                    a.system.traits.value.concat(a.system.traits.otherTags).concat([a.system.traits.rarity])
                );
                let activity = PF2eHelper.formatActivity(
                    a.system.actionType.value,
                    a.system.actions.value,
                    PF2eHelper.scribeActivityGlyphs
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

    pushOffensiveAbilities(push_to) {
        this._item.items
            .filter((i) => i.type === 'action' && i.system.category === 'offensive')
            .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
            .forEach((a) => {
                const name = a.name;
                const traits = PF2eHelper.formatTraits(
                    a.system.traits.value.concat(a.system.traits.otherTags).concat([a.system.traits.rarity])
                );
                let activity = PF2eHelper.formatActivity(
                    a.system.actionType.value,
                    a.system.actions.value,
                    PF2eHelper.scribeActivityGlyphs
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

    pushSenses(push_to) {
        const entry = [];
        const senses = this._item.system.perception.senses
            .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0))
            .map((i) => i.label);
        entry.push(`**Perception** ${PF2eHelper.quantifyNumber(this._item.perception.mod)}`);
        if (senses.length > 0) {
            entry.push(senses.join(', '));
        }

        push_to.push(entry.join('; '));
    }

    pushMeleeAttacks(push_to) {
        const melee = this._item.system.actions
            .filter((i) => i.type === 'strike' && i.attackRollType === 'PF2E.NPCAttackMelee')
            .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0));
        melee.forEach((a) => {
            push_to.push(
                `**Melee** ${PF2eHelper.formatActivity('action', a.glyph, PF2eHelper.scribeActivityGlyphs)} ${
                    a.label
                } ${PF2eHelper.quantifyNumber(a.totalModifier)}, **Damage** ${a.damageFormula}`
            );
        });
    }

    pushRangedAttacks(push_to) {
        const melee = this._item.system.actions
            .filter((i) => i.type === 'strike' && i.attackRollType === 'PF2E.NPCAttackRanged')
            .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0));
        melee.forEach((a) => {
            push_to.push(
                `**Ranged** ${PF2eHelper.formatActivity('action', a.glyph, PF2eHelper.scribeActivityGlyphs)} ${
                    a.label
                } ${PF2eHelper.quantifyNumber(a.totalModifier)}, **Damage** ${a.damageFormula}`
            );
        });
    }

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

    pushAcSaves(push_to) {
        const entry = [];
        entry.push(`**AC** ${this._item.armorClass.value}`);
        entry.push(`**Fort** ${PF2eHelper.quantifyNumber(this._item.saves.fortitude.mod)}`);
        entry.push(`**Ref** ${PF2eHelper.quantifyNumber(this._item.saves.reflex.mod)}`);
        entry.push(`**Will** ${PF2eHelper.quantifyNumber(this._item.saves.will.mod)}`);
        push_to.push(entry.join(', '));
    }

    pushAbilities(push_to) {
        let abilities = [];
        Object.keys(this._item.abilities).forEach((a) => {
            abilities.push(`**${PF2eHelper.capitalize(a)}** ${PF2eHelper.quantifyNumber(this._item.abilities[a].mod)}`);
        });
        push_to.push(abilities.join(', '));
    }

    pushSkills(push_to) {
        const skills = Object.values(this._item.skills)
            .filter((i) => i.proficient)
            .map((i) => `${i.label} ${PF2eHelper.quantifyNumber(i.mod)}`)
            .sort((a, b) => {
                return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
            });
        if (skills.length > 0) {
            push_to.push(`**Skills** ${skills.join(', ')}`);
        }
    }

    pushLanguages(push_to) {
        const languages = this._item.system.details.languages.value.map((i) => `${PF2eHelper.capitalize(i)}`);
        if (languages.length > 0) {
            push_to.push(`**Languages** ${languages.join(', ')}`);
        }
    }
}

class scribeSpell extends scribeItemEntry {
    constructor(item, label_level = 0) {
        super(item, label_level);
        let actions = '';
        let cast = '';
        actions = PF2eHelper.formatSpellCastingTime(this._item.system.time.value, PF2eHelper.scribeActivityGlyphs);
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
        if (!(typeof this._item.system.defense === 'object' && !this._item.system.defense)) {
            if (typeof this._item.system.defense.passive === 'object' && !this._item.system.defense.passive) {
                if (this._item.system.defense.passive.statistic !== '') {
                    dd.push(`**Defense** ${this._item.system.defense.passive.statistic}`);
                }
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

export class scribeProvider extends baseProvider {
    constructor(actor) {
        super(actor);
        this.scribeData = [];
    }

    static class = {
        scribeAncestry: scribeAncestry,
        scribeBackground: scribeBackground,
        scribeClass: scribeClass,
        scribeCreature: scribeCreature,
        scribeItemEntry: scribeItemEntry,
        scribeFeat: scribeFeat,
        scribeFeature: scribeFeature,
        scribeFormula: scribeFormula,
        scribeSpell: scribeSpell,
    };

    scribe(scribeOption, scribeData) {
        let data = {
            option: scribeOption,
            data: scribeData,
        };
        this.scribeData.push(data);
    }

    getScribeData(scribeOption) {
        return this.scribeData
            .filter((i) => i.option === scribeOption)
            .map((i) => i.data)
            .join('\n');
    }

    download(sourceFileURI, destinationFileName) {
        super.download(sourceFileURI, destinationFileName);
        const scribeOption = sourceFileURI.split('/').pop();
        const ret = this.getScribeData(scribeOption);
        if (ret !== undefined && ret != '') {
            saveDataToFile(ret, 'text/plain', destinationFileName);
        }
    }
}
