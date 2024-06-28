const fs = require('fs');

// 讀取 JSON 文件
const data = fs.readFileSync('seat-data.json', 'utf8');
const jsonData = JSON.parse(data);


// 將 JSON 格式化成每個物件一行
const formattedData = JSON.stringify(jsonData, null, 2)
  .split('\n')
  .map(line => line.trim())
  .join('')
  .replace(/},\s*{/g, '},\n{');


// 將格式化的 JSON 寫回文件
fs.writeFileSync('output-seat-data.json', formattedData);

console.log('JSON 文件已格式化');
