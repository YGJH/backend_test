import http from 'http';
import fs from 'fs';
import fetch from 'node-fetch';

const apiUrl = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-EBC821F3-9782-4630-8E87-87FF25933C15';

const server = http.createServer((req, res) => {
    // 設置 CORS 頭部
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'POST' && url.pathname === '/weather') {
        const cityName = url.searchParams.get('city');
        console.log('城市名稱：', cityName);
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.success === 'true') {
                    // 儲存最新的天氣資料
                    fs.writeFileSync('weather.json', JSON.stringify(data, null, 2));

                    const locations = data.records.location;
                    const location = locations.find(loc => loc.locationName === cityName);
                    let tim = new Date().toLocaleString();
                    tim.setUTCHours(tim.getUTCHours() + 8);
                    if (location) {
                        // 加上時間戳記
                        const responseData = {
                            timestamp: tim.toLocaleString(),
                            data: location
                        };
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(responseData));
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('找不到該城市的天氣資訊');
                    }
                } else {
                    // 無法取得最新資料，讀取本地的 weather.json
                    readLocalWeather(cityName, res);
                }
            })
            .catch(err => {
                console.error('資料獲取錯誤：', err);
                // 無法取得最新資料，讀取本地的 weather.json
                readLocalWeather(cityName, res);
            });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// 定義讀取本地 weather.json 的函式
function readLocalWeather(cityName, res) {
    fs.readFile('weather.json', 'utf8', (err, data) => {
        if (err) {
            // 本地沒有資料，回傳錯誤
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('無法取得天氣資料');
        } else {
            const weatherData = JSON.parse(data);
            const locations = weatherData.records.location;
            const location = locations.find(loc => loc.locationName === cityName);

            if (location) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(location));
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('找不到該城市的天氣資訊');
            }
        }
    });
}

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`伺服器正在監聽埠口 ${port}`);
});