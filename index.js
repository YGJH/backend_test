// filepath: /d:/web_final_project/src/backend.js
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// 啟用所有來源的 CORS
app.use(cors());

const apiUrl = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-EBC821F3-9782-4630-8E87-87FF25933C15';

app.get('/weather.json', (req, res) => {
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      fs.writeFileSync('weather.json', JSON.stringify(data, null, 2));
      console.log('已更新天氣資料');
      res.json(data);
    })
    .catch(error => {
      console.error('資料獲取錯誤：', error);
      // 如果獲取資料失敗，回傳本地的 weather.json
      fs.readFile('weather.json', 'utf8', (err, data) => {
        if (err) {
          res.status(500).send('伺服器錯誤');
        } else {
          res.json(JSON.parse(data));
        }
      });
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`伺服器正在監聽埠口 ${port}`);
});