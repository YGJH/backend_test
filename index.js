// index.js
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import fs from 'fs/promises'; // 確保匯入 fs/promises
import OpenAI from 'openai';

dotenv.config();


const app = express();
app.use(cors());  // 允許所有跨域請求
app.use(express.json());
app.use(express.urlencoded({extended: true}));  // 新增此行
app.options('*', cors());  // 處理所有路徑的 OPTIONS 請求

// 設置速率限制器
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15分鐘
  max: 100,                  // 限制每個 IP 15分鐘內最多 100 個請求
  message: '請求次數過多，請稍後再試',
  standardHeaders: true,
  legacyHeaders: false,
});

// 設置請求減速
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,  // 15分鐘
  delayAfter: 50,            // 50個請求後開始減速
  delayMs: () => 500         // 每個請求增加 500ms 延遲
});

// API 金鑰驗證中間件
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  console.log('API 金鑰：', apiKey);
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({error: '未授權的請求'});
  }
  next();
};

// 請求記錄中間件
const requestLogger = (req, res, next) => {
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] IP: ${clientIP}, Method: ${req.method}, Path: ${
      req.path}, User-Agent: ${req.headers['user-agent']}`);
  next();
};

// User-Agent 驗證中間件
const validateUserAgent = (req, res, next) => {
  const userAgent = req.headers['user-agent'];
  if (!userAgent || userAgent.toLowerCase().includes('bot') ||
      userAgent.toLowerCase().includes('crawler') ||
      userAgent.toLowerCase().includes('spider')) {
    return res.status(403).json({error: '禁止訪問'});
  }
  next();
};

// 應用中間件
app.use(requestLogger);
app.use(limiter);
app.use(speedLimiter);
app.use(validateUserAgent);
app.use(apiKeyAuth);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ForcastApiUrl =
    `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-089?Authorization=${
        process.env.WEATHER_API_KEY}`;
const currentWeatherApiUrl =
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
    // 調用 OpenAI API 獲取穿搭建議
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: messages,
      temperature: 0.7,
    });
    let advice =
        chatCompletion.choices[0].message;  // There's no "data" property
    return advice.content;
  } catch (error) {
    console.error('錯誤：', error);
    return '無法給出穿搭建議';
  }
}

async function getInformation() {
  let forecastData, weatherData;

  try {
    const forecastResponse = await fetch(ForcastApiUrl);
    if (forecastResponse.ok) {
      forecastData = await forecastResponse.json();
      fs.writeFile(
          'forecastWeather.json', JSON.stringify(forecastData, null, 2),
          'utf8');
    } else {
      console.error('無法取得氣象預報資料');
      const forecastDataString =
          await fs.readFile('forecastWeather.json', 'utf8');
      forecastData = JSON.parse(forecastDataString);
    }
  } catch (error) {
    console.error('取得氣象預報資料時發生錯誤：', error);
    const forecastDataString =
        await fs.readFile('forecastWeather.json', 'utf8');
    forecastData = JSON.parse(forecastDataString);
  }

  try {
    const weatherResponse = await fetch(currentWeatherApiUrl);
    if (weatherResponse.ok) {
      weatherData = await weatherResponse.json();
      await fs.writeFile(
          'weather.json', JSON.stringify(weatherData, null, 2), 'utf8');
    } else {
      console.error('無法取得天氣資料');
      const weatherDataString = await fs.readFile('weather.json', 'utf8');
      weatherData = JSON.parse(weatherDataString);
    }
  } catch (error) {
    console.error('取得天氣資料時發生錯誤：', error);
    const weatherDataString = await fs.readFile('weather.json', 'utf8');
    weatherData = JSON.parse(weatherDataString);
  }

  return {forecastData, weatherData};
}

app.post('/weather', async (req, res) => {
  try {
    let {cityName, timestamp} = req.body;
    console.log('POST 請求：', req.body);
    const {forecastData, weatherData} = await getInformation();
    // 呼叫 readLocalWeather 函式來處理目前天氣與預報資料，並回傳
    await readLocalWeather(cityName, res, weatherData, forecastData, timestamp);
  } catch (error) {
    console.error('處理 POST 請求錯誤：', error);
    res.status(500).send('伺服器錯誤');
  }
});


// 讀取本地天氣資料函式
async function readLocalWeather(
    cityName, res, currentWeather, forecastWeather, timestamp) {
  try {
    // 檢查 records 和 location 屬性
    if (!currentWeather.records ||
        !Array.isArray(currentWeather.records.location)) {
      res.status(500).send('伺服器錯誤');
      return;
    }

    const currentLocation = currentWeather.records.location.find(
        (loc) => loc.locationName === cityName);

    if (!currentLocation) {
      console.error('找不到該城市的目前天氣資訊');
      res.status(404).send('找不到該城市的目前天氣資訊');
      return;
    }
    // 提取目前天氣資訊
    const currentWeatherElements = currentLocation.weatherElement;
    // console.log('目前天氣資訊：', currentWeatherElements);
    const currentWx =
        currentWeatherElements.find((element) => element.elementName === 'Wx')
            .time[0]
            .parameter.parameterName;
    const currentPoP =
        currentWeatherElements.find((element) => element.elementName === 'PoP')
            .time[0]
            .parameter.parameterName;
    const currentMinT =
        currentWeatherElements.find((element) => element.elementName === 'MinT')
            .time[0]
            .parameter.parameterName;
    const currentMaxT =
        currentWeatherElements.find((element) => element.elementName === 'MaxT')
            .time[0]
            .parameter.parameterName;

    // 讀取未來三天預報資料
    // const forecastData = await fs.readFile(forecastPath, 'utf8');
    // const forecastWeather = JSON.parse(forecastData);

    // 檢查 records 和 Locations 屬性
    if (!forecastWeather.records?.Locations?.[0]?.Location) {
      console.error('氣象預報資料格式錯誤:', forecastWeather);
      res.status(500).send('伺服器錯誤');
      return;
    }

    const forecastLocation = forecastWeather.records.Locations[0].Location.find(
        (loc) => loc.LocationName === cityName);

    if (!forecastLocation) {
      console.error('找不到該城市的預報資訊');
      res.status(404).send('找不到詀城市的預報資訊');
      return;
    }

    const forecastElements = forecastLocation.WeatherElement;
    // 找出天氣現象和綜合描述的資料
    const wxElement =
        forecastElements.find(element => element.ElementName === '天氣現象');
    const weatherDescElement = forecastElements.find(
        element => element.ElementName === '天氣預報綜合描述');
    const tempElement =
        forecastElements.find(element => element.ElementName === '溫度');
    const feelsTempElement =
        forecastElements.find(element => element.ElementName === '體感溫度');
    if (!wxElement?.Time) {
      console.error('找不到天氣資料');
      res.status(500).send('伺服器錯誤');
      return;
    }
    if (!tempElement?.Time) {
      console.error('找不到溫度資料');
      res.status(500).send('伺服器錯誤');
      return;
    }

    // 修改取得預報資料的方式
    const forecastWx = [];
    for (let i = 0; i < wxElement.Time.length; i += 8) {  // 每天取一個時間點
      const wxTime = wxElement.Time[i];
      const tempTime = tempElement.Time[i];
      const weaDesc = weatherDescElement.Time[i];
      const feelsTempTime = feelsTempElement?.Time[i];
      if (wxTime && tempTime) {
        forecastWx.push({
          date: (wxTime.StartTime) ? wxTime.StartTime.split('T')[0] : '無日期',
          description: weaDesc.ElementValue[0].WeatherDescription || '無描述',
          temp: tempTime.ElementValue[0]?.Temperature || '無溫度資料',
          feelsTemp: feelsTempTime?.ElementValue[0]?.ApparentTemperature ||
              '無體感溫度資料'
        });
      }
      if (forecastWx.length >= 3) break;  // 只取三天的資料
    }
    const formatedCurrentDate = timestamp ?
        new Date(timestamp).toLocaleDateString('zh-TW') :
        new Date().toLocaleDateString('zh-TW');

    // 確保 forecastList 有內容並包含完整描述
    const forecastList =
        forecastWx
            .map(
                forecast => `日期：${forecast.date}，天氣：${
                    forecast.description}，溫度：${
                    forecast.temp}°C，體感溫度：${forecast.feelsTemp}°C`)
            .join('； ');


    const messageContent =
        `今天是${formatedCurrentDate}，${cityName}的目前天氣為：天氣狀況 ${
            currentWx}，降雨機率 ${currentPoP}%，` +
        `溫度約 ${currentMinT}°C ~ ${currentMaxT}°C。未來三天的天氣預報如下：${
            forecastList}請問我今天應該穿什麼衣服？請只用繁體中文回答`;

    // 獲取穿搭建議
    // console.log('穿搭建議問題：', messageContent);
    // const advice = '';
    const advice = await getDressingAdvice(messageContent);

    // 構建回傳資料
    const responseData = {
      city: cityName,
      currentWeather: {
        weather: currentWx,
        pop: currentPoP,
        minTemp: currentMinT,
        maxTemp: currentMaxT,
      },
      forecast: forecastList,
      advice: advice,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('讀取天氣資料錯誤：', error);
    res.status(500).send('伺服器錯誤');
  }
}

app.get('/weather', async (req, res) => {
  try {
    const {latitude, longitude, useFrontendApi, timestamp} = req.query;
    console.log('GET 請求經緯度：', req.query);

    if (!latitude || !longitude) {
      res.status(400).send('缺少經緯度參數');
      return;
    }

    // 使用 Google Maps API 根據經緯度取得城市名稱
    const geocodeResponse =
        await fetch(`${googleMapsApiUrl}?latlng=${latitude},${longitude}&key=${
            process.env.GOOGLE_API_KEY}&language=zh-TW`);

    const geocodeData = await geocodeResponse.json();

    if (geocodeData.status !== 'OK') {
      res.status(404).send('找不到對應的城市');
      return;
    }

    const cityName = geocodeData.results[0]
                         .address_components
                         .find(
                             component => component.types.includes(
                                 'administrative_area_level_1'))
                         ?.long_name;

    if (!cityName) {
      res.status(404).send('無法解析城市名稱');
      return;
    }

    // console.log('城市名稱：', cityName);

    // 根據 useFrontendApi 參數決定回傳內容
    if (useFrontendApi === 'true') {
      res.status(200).json({city: cityName});
      return;  // 加入 return 確保函數結束
    }

    // 如果不是前端 API 調用，則處理完整天氣資訊

    const {forecastData, weatherData} = await getInformation();

    await readLocalWeather(cityName, res, weatherData, forecastData, timestamp);
    // 移除這裡的 res.end()，因為 readLocalWeather 已經會發送回應

  } catch (error) {
    console.error('處理 GET 請求錯誤：', error);
    res.status(500).send('伺服器錯誤');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`伺服器正在監聽埠口 ${port}`);
});
