// index.js
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());  // 允許所有跨域請求
app.use(express.json());
app.use(express.urlencoded({extended: true}));  // 新增此行
app.options('*', cors());  // 處理所有路徑的 OPTIONS 請求


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const apiUrl =
    `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${
        process.env.WEATHER_API_KEY}`;
const googleMapsApiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
async function getDressingAdvice(messageContent) {
  try {
    const messages = [
      {
        role: 'user',
        content: messageContent,  // 使用 'content' 而非 'message'
      },
    ];
    console.log('送往 OpenAI 的訊息：', messages);
    // 調用 OpenAI API 獲取穿搭建議
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: messages,
      max_tokens: 100,
      temperature: 0.7,
    });
    let advice = chatCompletion.choices[0].message; // There's no "data" property
	return advice.content;
} catch (error) {
    console.error('錯誤：', error);
    return '無法給出穿搭建議';
  }
}

app.post('/weather', async (req, res) => {
  console.log('POST 請求：', req.body);
  const {cityName} = req.body;
  try {
    console.log('城市名稱：', cityName);

    const weatherResponse = await fetch(apiUrl);
    const data = await weatherResponse.json();


    if (data.success === 'true') {
      // 儲存最新的天氣資料
      fs.writeFileSync('weather.json', JSON.stringify(data, null, 2));

      const locations = data.records.location;
      const location = locations.find(loc => loc.locationName === cityName);
      let tim = new Date();
      tim.setHours(tim.getHours() + 8);
      tim = tim.toLocaleString();  // 時區調整
      if (location) {
        // 調用 OpenAI API 獲取穿搭建議
        const messageContent =
            `今天是${tim}，${location.locationName}的天氣是 ${
                location.weatherElement[0]
                    .time[0]
                    .parameter.parameterName}，溫度約 ${
                location.weatherElement[2].time[0].parameter.parameterName} ~ ${
                location.weatherElement[4]
                    .time[0]
                    .parameter.parameterName} 度，降雨機率約 ${
                location.weatherElement[1]
                    .time[0]
                    .parameter.parameterName}%。請問我今天應該穿什麼衣服？`;
          const advice = await getDressingAdvice(messageContent);
          const responseData = {
			  timestamp: tim,
			  data: location,
			  advice: advice,
			};
			console.log('穿搭建議：', advice);
          res.status(200).json(responseData);
      } else {
        res.status(404).send('找不到該縣市的天氣資訊');
      }
    } else {
			  // 無法取得最新資料，讀取本地的 weather.json
	  readLocalWeather(cityName, res);
	}
  } catch (error) {
    console.error('錯誤：', error);
    res.status(500).send('無法取得天氣資訊');
  }
});
app.get('/weather', async (req, res) => {
  const {latitude, longitude} = req.query;
  console.log('經度：', latitude);
  console.log('緯度：', longitude);
  if (!latitude || !longitude) {
    res.status(400).send('缺少經緯度參數');
    return;
  }
  // 設定較長的 Timeout，例如 60 秒
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 600000);
  try {
    // 在這裡添加 language=zh-TW 參數
    const response = await fetch(
        `${googleMapsApiUrl}?latlng=${latitude},${
            longitude}&language=zh-TW&key=${process.env.GOOGLE_API_KEY}`,
        {signal: controller.signal});
    const geoData = await response.json();
    if (geoData.status === 'OK') {
      const addressComponents = geoData.results[0].address_components;
      const cityComponent = addressComponents.find(
          component => component.types.includes('administrative_area_level_1'));
      const cityName = cityComponent ? cityComponent.long_name : null;

      if (cityName) {
        console.log('解析到的縣市名稱：', cityName);
        // 使用縣市名稱來獲取天氣資訊
        const weatherResponse = await fetch(apiUrl);
        const weatherData = await weatherResponse.json();
        if (weatherData.success === 'true') {
          // 儲存最新的天氣資料
          fs.writeFileSync(
              'weather.json', JSON.stringify(weatherData, null, 2));

          const locations = weatherData.records.location;
          const location = locations.find(loc => loc.locationName === cityName);
          let tim = new Date();
          tim.setHours(tim.getHours() + 8);  // 時區調整
            tim=tim.toLocaleString();
          if (location) {
            const messageContent =
            `今天是${tim}，${location.locationName}的天氣是 ${
                location.weatherElement[0]
                    .time[0]
                    .parameter.parameterName}，溫度約 ${
                location.weatherElement[2].time[0].parameter.parameterName} ~ ${
                location.weatherElement[4]
                    .time[0]
                    .parameter.parameterName} 度，降雨機率約 ${
                location.weatherElement[1]
                    .time[0]
                    .parameter.parameterName}%。請問我今天應該穿什麼衣服？`;
            const advice = await getDressingAdvice(messageContent);
            console.log('穿搭建議：', advice);
            const responseData = {
              timestamp: tim.toLocaleString(),
              data: location,
              advice: advice,
            };
            res.status(200).json(responseData);
			res.end();
          } else {
            res.status(404).send('找不到該縣市的天氣資訊');
          }
        } else {
          // 無法取得最新資料，讀取本地的 weather.json
          readLocalWeather(cityName, res);
        }
      } else {
        res.status(404).send('無法解析縣市名稱');
      }
    } else {
      res.status(500).send('Google Maps API 錯誤');
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('Google Maps API 請求超時');
      res.status(504).send('Google Maps API 請求超時，請稍後再試');
    } else {
      console.error('Google Maps API 錯誤：', err);
      res.status(500).send('無法取得縣市名稱');
    }
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`伺服器正在監聽埠口 ${port}`);
});

async function readLocalWeather(cityName, res) {
  fs.readFile('weather.json', 'utf8', async (err, data) => {
    if (err) {
      res.status(500).send('Internal Server Error');
    } else {
      try {
        const weatherData = JSON.parse(data);
        const locations = weatherData.records.location;
        const location = locations.find(loc => loc.locationName === cityName);
        if (location) {
          let tim = new Date();
          tim.setHours(tim.getHours() + 8);  // 時區調整
          tim = tim.toLocaleString();
            const messageContent =  
            `今天是${tim}，${location.locationName}的天氣是 ${
                location.weatherElement[0]
                    .time[0]
                    .parameter.parameterName}，溫度約 ${
                location.weatherElement[2].time[0].parameter.parameterName} ~ ${
                location.weatherElement[4]
                    .time[0]
                    .parameter.parameterName} 度，降雨機率約 ${
                location.weatherElement[1]
                    .time[0]
                    .parameter.parameterName}%。請問我今天應該穿什麼衣服？`;
            const advice = await getDressingAdvice(messageContent);

          const responseData = {
            timestamp: tim.toLocaleString(),
            data: location,
            advice: advice,
          };
          res.status(200).json(responseData);
		  res.end();
        } else {
          res.status(404).send('找不到該縣市的天氣資訊');
        }
      } catch (parseError) {    
        res.status(500).send('Internal Server Error');
      }
    }
  });
}
