import { scribeProvider } from '../../scripts/lib/providers/ScribeProvider.js';
import { pf2eHelper } from '../../scripts/lib/helpers/PF2eHelper.js';

const mapper = new scribeProvider(actor);

// scribeProvider.class contains all scribe classes which handle the raw object
// passed to it.

/**
 * actor-creature
 */
mapper.scribe('actor-creature', new scribeProvider.class.scribeCreature(actor).scribify());

/**
 * actor-abc
 */
// Ancestry and Heritage
const ancestries = actor.items.filter((i) => i.type === 'ancestry');
if (ancestries.length > 0) {
    const ancestry = new scribeProvider.class.scribeAncestry(ancestries[0]);
    actor.items
        .filter((i) => i.type === 'heritage')
        .forEach((el) => {
            ancestry.heritage(el);
        });
    mapper.scribe('actor-abc', ancestry.scribify());
}

// Ancestry Features
const ancestryFeatures = actor.items.filter((i) => i.type === 'feat' && i.system.category === 'ancestryfeature');
if (ancestryFeatures.length > 0) {
    mapper.scribe('actor-abc', '## Ancestry Features ((+Ancestry Features))');
    ancestryFeatures
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .forEach((el) => {
            mapper.scribe('actor-abc', new scribeProvider.class.scribeFeature(el, 2).scribify());
        });
}

// Background
const backgrounds = actor.items.filter((i) => i.type === 'background');
if (backgrounds.length > 0) {
    backgrounds.forEach((el) => {
        mapper.scribe('actor-abc', new scribeProvider.class.scribeBackground(el).scribify());
    });
}
// Class
const classes = actor.items.filter((i) => i.type === 'class');
if (classes.length > 0) {
    classes.forEach((el) => {
        mapper.scribe('actor-abc', new scribeProvider.class.scribeClass(el).scribify());
    });
}

// Class feature
const classFeatures = actor.items.filter((i) => i.type === 'feat' && i.system.category === 'classfeature');
if (classFeatures.length > 0) {
    mapper.scribe('actor-abc', '## Class features ((+Class features))');
    classFeatures
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .forEach((el) => {
            mapper.scribe('actor-abc', new scribeProvider.class.scribeFeature(el, 2).scribify());
        });
}
// Feats
const feats = actor.items.filter(
    (i) =>
        i.type === 'feat' &&
        (i.system.category === 'skill' || i.system.category === 'general' || i.system.category === 'class')
);

if (feats.length > 0) {
    mapper.scribe('actor-abc', '# Feats ((Feats))');
    feats
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .forEach((el) => {
            mapper.scribe('actor-abc', new scribeProvider.class.scribeFeat(el, 1).scribify());
        });
}
// Spells
const spells = actor.items
    .filter((i) => i.type === 'spell')
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

if (spells.length > 0) {
    mapper.scribe('actor-abc', '# Spells ((Spells))');
    spells.forEach((el) => {
        mapper.scribe('actor-abc', new scribeProvider.class.scribeSpell(el, 1).scribify());
    });
}

// Formulas
if ((actor.system.crafting?.formulas || []).length > 0) {
    mapper.scribe('actor-abc', '# Formulas ((Formulas))');
    actor.system.crafting.formulas
        .map((i) => fromUuidSync(i.uuid))
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .forEach((el) => {
            mapper.scribe('actor-abc', new scribeProvider.class.scribeFormula(el, 1).scribify());
        });
}

/**
 * actor-actions
 */
const meleeActions = [];
const rangedActions = [];
const strikeActions = actor.system.actions.filter((i) => i.type === 'strike');
if (strikeActions.length > 0) {
    strikeActions.forEach((el) => {
        const strike = new scribeProvider.class.scribeStrike(el, actor);
        if (strike.isMelee) {
            meleeActions.push('item(\n' + strike.scribify() + '\n)');
        } else if (strike.isRanged) {
            rangedActions.push('item(\n' + strike.scribify() + '\n)');
        }
        (el.altUsages || []).forEach((alt) => {
            const altStrike = new scribeProvider.class.scribeStrike(alt, actor);
            if (altStrike.isMelee) {
                meleeActions.push('item(\n' + altStrike.scribify() + '\n)');
            } else if (altStrike.isRanged) {
                rangedActions.push('item(\n' + altStrike.scribify() + '\n)');
            }
        });
    });
}
if (meleeActions.length > 0 || rangedActions.length > 0) {
    mapper.scribe('actor-actions', '# Attacks ((Attacks))');
    mapper.scribe('actor-actions', meleeActions.concat(rangedActions).join('\n\n'));
    mapper.scribe('actor-actions', ' ');
}

const activityTypes = ['action', 'reaction', 'free'];
const freeActions = [];
const reActions = [];
const regularActions = [];
actor.items
    .filter((i) => activityTypes.includes(i.system.actionType?.value))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .forEach((a) => {
        const action = new scribeProvider.class.scribeAction(a);
        if (action.isAction) {
            regularActions.push(action.scribify());
        } else if (action.isReaction) {
            reActions.push(action.scribify());
        } else if (action.isFreeAction) {
            freeActions.push(action.scribify());
        }
    });

if (regularActions.length > 0 || reActions.length > 0 || freeActions.length > 0) {
    mapper.scribe('actor-actions', '# Actions ((Actions))');
    if (regularActions.length > 0) {
        mapper.scribe('actor-actions', '## Actions ((+Actions))');
        mapper.scribe('actor-actions', regularActions.join('\n\n'));
    }
    if (reActions.length > 0) {
        mapper.scribe('actor-actions', '## Reactions ((+Reactions))');
        mapper.scribe('actor-actions', reActions.join('\n\n'));
    }
    if (freeActions.length > 0) {
        mapper.scribe('actor-actions', '## Free Actions ((+Free Actions))');
        mapper.scribe('actor-actions', freeActions.join('\n\n'));
    }
    mapper.scribe('actor-actions', ' ');
}
const spell_dc = Math.max(
    ...actor.spellcasting.filter((i) => i.type === 'spellcastingEntry').map((i) => i.statistic.mod)
);
if (spells.length > 0) {
    const headerCells = ['Spell', 'actions', 'Defense', 'rank', 'range', 'AofE'];
    const spellTable = new scribeProvider.class.scribeTableEntry('Spell List', headerCells);
    spells.forEach((el) => {
        const activity = pf2eHelper.formatSpellCastingTime(el.system.time.value, pf2eHelper.scribeActivityGlyphs);
        let defense = '';
        if (el.system.defense?.passive !== undefined) {
            defense = `${el.system.defense.passive.statistic} ${10 + spell_dc}`;
        } else if (el.system.defense?.save !== undefined) {
            defense =
                (el.system.defense.save.basic ? 'Basic ' : '') +
                pf2eHelper.capitalize(el.system.defense.save.statistic) +
                ' ' +
                pf2eHelper.quantifyNumber(spell_dc);
        }
        const spellType = el.isCantrip ? 'Cantrip' : el.isFocusSpell ? 'Focus' : 'Spell';
        const rank = `${spellType} ${el.rank}`;
        const range = el.system.range?.value || '';
        let AofE = '';
        if (el.system.area !== null) {
            AofE = `${el.system.area.value}ft ${el.system.area.type}`;
        } else {
            AofE = el.system.target?.value || '';
        }
        spellTable.addContentRow([el.name, activity, defense, rank, range, AofE]);
    });

    mapper.scribe('actor-actions', '# Spells ((Spells))');
    mapper.scribe('actor-actions', spellTable.scribify());
    mapper.scribe('actor-actions', ' ');
}
export { mapper };
