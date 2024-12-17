import http from 'http';
import fs from 'fs';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const apiUrl = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${process.env.WEATHER_API_KEY}`;
const googleMapsApiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

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
                    let tim = new Date();
                    tim.setHours(tim.getHours() + 8);
                    if (location) {
                        // 加上時間戳記
                        const responseData = {
                            timestamp: tim.toLocaleString(),
                            data: location,
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
    } else if (req.method === 'GET' && url.pathname === '/weather') {
        console.log('GET');
        const latitude = url.searchParams.get('latitude');
        const longitude = url.searchParams.get('longitude');
        console.log('經度：', latitude);
        console.log('緯度：', longitude);
        if (!latitude || !longitude) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('缺少經緯度參數');
            return;
        }
        // 調用 Google Maps API 取得城市名稱
        fetch(`${googleMapsApiUrl}?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_API_KEY}`)
        .then(response => response.json())
        .then(geoData => {
                console.log(`url.searchParams:${googleMapsApiUrl}?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_API_KEY}`);
                if (geoData.status === 'OK') {
                    const addressComponents = geoData.results[0].address_components;
                    const cityComponent = addressComponents.find(component => component.types.includes('administrative_area_level_1'));
                    const cityName = cityComponent ? cityComponent.long_name : null;

                    if (cityName) {
                        // ...existing weather fetching code using cityName...
                        fetch(apiUrl)
                            .then(response => response.json())
                            .then(data => {
                                if (data.success === 'true') {
                                    // 儲存最新的天氣資料
                                    fs.writeFileSync('weather.json', JSON.stringify(data, null, 2));

                                    const locations = data.records.location;
                                    const location = locations.find(loc => loc.locationName === cityName);
                                    let tim = new Date();
                                    tim.setHours(tim.getHours() + 8);
                                    if (location) {
                                        // 加上時間戳記
                                        const responseData = {
                                            timestamp: tim.toLocaleString(),
                                            data: location
                                        };
                                        res.writeHead(200, { 'Content-Type': 'application/json' });
                                        res.end(JSON.stringify(responseData));
                                    } else {
                                        console.log(locations);
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
                        res.end(`無法解析城市名稱`);
                    }
                } else {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Google Maps API 錯誤');
                }
            })
            .catch(err => {
                console.error('Google Maps API 錯誤：', err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('無法取得城市名稱');
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