const fs = require('fs');
const http = require('http'); // 修改為 http 模組
const fetch = require('node-fetch');

const apiUrl =
    'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-EBC821F3-9782-4630-8E87-87FF25933C15';

const server = http.createServer((req, res) => {
    fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            // 成功取得資料後，使用 data
            fs.writeFileSync('./assets/weather.json', JSON.stringify(data, null, 2));
            console.log(data);
            
            // 將 weather.json 回傳給使用者
            fs.readFile('./assets/weather.json', (err, data) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 Not Found</h1>');
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(data);
                }
            });
        })
        .catch(error => {
            console.error('資料獲取錯誤：', error);

            // 若取得資料失敗，仍嘗試回傳 weather.json
            fs.readFile('./assets/weather.json', (err, data) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 Not Found</h1>');
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(data);
                }
            });
        });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
