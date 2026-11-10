import {DatabaseSync} from 'node:sqlite';
import {resolve,join} from 'node:path';
const dir=process.env.FORMA_DATA_DIR||(process.env.LOCALAPPDATA?join(process.env.LOCALAPPDATA,'FormaTraining'):resolve('data'));
if(!process.argv[2])throw Error('Supply a new backup filename outside dist/');
const file=resolve(process.argv[2]);
if(file.toLowerCase().startsWith(resolve('dist').toLowerCase()+String.fromCharCode(process.platform==='win32'?92:47)))throw Error('Use a private backup directory.');
const db=new DatabaseSync(join(dir,'training.sqlite'),{readOnly:true});
db.prepare('VACUUM INTO ?').run(file);db.close();
console.log('Database backup created.');
