import cors from 'cors';
import express from 'express';
import fs from 'fs';
import fetch from 'node-fetch';

const app = express();

// 啟用所有來源的 CORS
app.use(cors());

const apiUrl =
    'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-EBC821F3-9782-4630-8E87-87FF25933C15';

app.get(
    './',
    (req, res) => {fetch(apiUrl)
                       .then(response => response.json())
                       .then((data) => {
  if (data.success) {
    fs.writeFileSync('weather.json', JSON.stringify(data, null, 2));
  }
                       })
                         fs.readFile('./weather.json', 'utf8', (err, data) => {
  res.end(data);
                       })});

                         const port = process.env.PORT || 3000;
                         app.listen(port, () => {
                           console.log(`伺服器正在監聽埠口 ${port}`);
                         });