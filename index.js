import http from 'http';
import fs from 'fs';
import fetch from 'node-fetch';

const apiUrl = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-EBC821F3-9782-4630-8E87-87FF25933C15';

const server = http.createServer((req, res) => {
    // 設置 CORS 頭部
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'GET' && req.url === '/') {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    fs.writeFileSync('weather.json', JSON.stringify(data, null, 2));
                }
                fs.readFile('weather.json', 'utf8', (err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Internal Server Error');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(data);
                    }
                });
            })
            .catch(err => {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Failed to fetch data');
            });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`伺服器正在監聽埠口 ${port}`);
});