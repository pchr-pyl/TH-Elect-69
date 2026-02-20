const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./plot.json', 'utf8'));

const provinces = [...new Set(data.map(d => d['จังหวัด']).filter(Boolean))];

const template = provinces.reduce((acc, p, i) => {
    acc[p] = { x: 0, y: 0 };
    return acc;
}, {});

fs.writeFileSync('layout_template.json', JSON.stringify(template, null, 2));
console.log('Template generated.');
