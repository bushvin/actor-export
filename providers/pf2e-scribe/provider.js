import { scribeProvider } from '../../scripts/lib/providers/ScribeProvider.js';

const mapper = new scribeProvider(actor);

// scribeProvider.class contains all scribe classes which handle the raw object
// passed to it.

mapper.scribe('actor-creature', new scribeProvider.class.scribeCreature(actor).scribify());

export { mapper };
