js = `console.log('Hello everyone!');`;
encodedJs = encodeURIComponent(js);
dataUri = 'data:text/javascript;charset=utf-8,' + encodedJs;
import(dataUri);


js = `export default 'Returned value'`;
//js = `console.log('Hello everyone!');`;
dataUri = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(js);
import(dataUri)
  .then((namespaceObject) => {
    console.log(namespaceObject.default);
  }).catch ((error) =>
    {console.log(error);}
  );

js = `
import { pdfProvider } from './modules/actor-export/scripts/lib/providers/PDFProvider.js';
// actor is available as a global variable
// game is available as a global variable

const mapper = new pdfProvider();

// override the download name of the character sheet
// mapper.actorName = actor.name;

mapper.field('character_name', actor.name);

export { mapper };`;
dataUri = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(js);
import(dataUri)
  .then((namespaceObject) => {
    console.log(namespaceObject.mapper);
  }).catch ((error) =>
    {console.log(error);}
  );




import { pdfProvider } from 'https://foundry.elaba.net/modules/actor-export/scripts/lib/providers/PDFProvider.js';

console.log('hello, world');
console.log('hello, world, again!');
const mapper = new pdfProvider(actor);
mapper.file = 'https://foundry.elaba.net/modules/actor-export/providers/pf2e-remaster/pf2e-remastered.pdf';
mapper.downloadFileName = `${mapper.actorName} - custom.pdf`;
export { mapper };
  



import('/modules/actor-export/scripts/lib/providers/PDFProvider.js').then( (module) => {
  const mapper = new module.pdfProvider(actor);
  console.log('hello, world');
  console.log('hello, world, again!');
  export { mapper };
})
