const http = require('http');
const fs = require('fs');
const port = process.env.PORT || 3000;
const apiUrl = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-EBC821F3-9782-4630-8E87-87FF25933C15';
const server = http.createServer((req, res) => {
  fetch(apiUrl).then((response) => response.json()).then((data) => {
    // 成功取得資料後，使用 data
    fs.writeFileSync('weather.json', JSON.stringify(data, null, 2));
  })
  // 若取得資料失敗，仍嘗試回傳 weather.json
  fs.readFile('weather.json', (err, data) => {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(data);
  });
});

server.listen(port, () => {
  // console.log('Server is running on http://localhost:3000');
});
