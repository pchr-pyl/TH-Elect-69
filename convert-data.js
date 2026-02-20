const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const iconv = require('iconv-lite');

const filesToProcess = [
  {
    input: 'ElectionData-Analysis-Public - Plot.csv',
    output: 'plot.json'
  },
  {
    input: 'ElectionData-Analysis-Public - สสแบ่งเขต.csv',
    output: 'constituency.json'
  },
  {
    input: 'ElectionData-Analysis-Public - party list.csv',
    output: 'partylist.json'
  },
  {
    input: 'ElectionData-Analysis-Public - referendum.csv',
    output: 'referendum.json'
  }
];

function processFile(fileConfig) {
  return new Promise((resolve, reject) => {
    const results = [];
    const inputPath = path.join(__dirname, fileConfig.input);
    const outputPath = path.join(__dirname, 'dashboard', 'public', fileConfig.output);

    if (!fs.existsSync(inputPath)) {
      console.warn(`Warning: File not found: ${inputPath}`);
      return resolve();
    }

    fs.createReadStream(inputPath)
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.trim(),
          mapValues: ({ header, index, value }) => {
            const trimmedValue = value.trim();
            // Remove commas for numbers like "1,000" or "-1,000"
            const unformattedValue = trimmedValue.replace(/,/g, '');
            // Try to parse as number if it's not empty and is a valid number
            if (unformattedValue !== '' && !isNaN(unformattedValue)) {
              return Number(unformattedValue);
            }
            return trimmedValue;
          }
        })
      )
      .on('data', (data) => results.push(data))
      .on('end', () => {
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
        console.log(`Successfully converted ${fileConfig.input} to ${fileConfig.output}`);
        resolve();
      })
      .on('error', (error) => {
        console.error(`Error processing ${fileConfig.input}:`, error);
        reject(error);
      });
  });
}

async function main() {
  console.log('Starting conversion process...');
  for (const fileConfig of filesToProcess) {
    try {
      await processFile(fileConfig);
    } catch (error) {
      console.error(`Failed to process ${fileConfig.input}`);
    }
  }
  console.log('All conversions completed.');
}

main();
