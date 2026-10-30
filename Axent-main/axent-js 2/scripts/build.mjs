import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import platforms from '../platforms.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=['detect.js','overlay.js'].map(name=>fs.readFileSync(path.join(root,'src',name),'utf8')).join('\n');
for(const platform of platforms){
 const dir=path.join(root,'terminals',platform.id);
 fs.mkdirSync(dir,{recursive:true});
 const script='(function(){\n'+source+'\naxentOverlay('+JSON.stringify(platform)+');\n})();void 0;';
 fs.writeFileSync(path.join(dir,'bookmarklet.js'),script+'\n');
 fs.writeFileSync(path.join(dir,'bookmarklet.txt'),'javascript:'+encodeURIComponent(script)+'\n');
}
console.log('Built six standalone JavaScript bookmarklets.');
