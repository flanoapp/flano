const fs = require('fs');

try {
    const json = fs.readFileSync('./app.json', { encoding: 'utf8', flag: 'r' });
    const env = fs.readFileSync('./.env', { encoding: 'utf8', flag: 'r' });

    let vars = {};
    for (let v of env.trim().split('\n')) {
        vars[v.split('=')[0]] = v.split('=')[1];
    }

    let new_json = json;
    for (const v in vars) {
        new_json = new_json.replace(v, vars[v]);
    }

    fs.writeFileSync('./app.json', new_json);
} catch (e) {
    console.log('could not replace secrets', e);
}
