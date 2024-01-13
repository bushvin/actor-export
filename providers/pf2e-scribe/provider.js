import { scribeProvider } from '../../scripts/lib/providers/ScribeProvider.js';

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
const spells = actor.items.filter((i) => i.type === 'spell');
if (spells.length > 0) {
    mapper.scribe('actor-abc', '# Spells ((Spells))');
    actor.items
        .filter((i) => i.type === 'spell')
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .forEach((el) => {
            mapper.scribe('actor-abc', new scribeProvider.class.scribeSpell(el, 1).scribify());
        });
}

// Formulas
if ((actor.system.crafting?.formulas || []).length > 0) {
    mapper.scribe('actor-abc', '# Formulas ((Formulas))');
    actor.system.crafting.formulas
        .map((i) => fromUuidSync(i.uuid))
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .forEach((f) => {
            mapper.scribe('actor-abc', new scribeProvider.class.scribeFormula(el, 1).scribify());
        });
}
export { mapper };
