import axios from 'axios';
import { fileURLToPath } from 'url';
import {
  insertWeatherData,
  selectAirStation,
  insertAirData,
  deleteAirData,
  deleteWeatherDatadb,
  selectWeatherData
} from './repository.js';
import pool from './config/postgresql.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const __filename = fileURLToPath(import.meta.url);

export const getWeatherData = async (date, time, next) => {
  //252번 통신해야함
  //정해진 시간에 통신해야함 (02,05,08,11,14,17,20,23) 8번 통신해야함.
  //타겟 타임 설정후 그 시간이 되면 프로그램 시작.
  //req로 시작과, 설정 시간 전송해줌
  // 252번 돌린다. 파일 list 파일 참고해서 돌리면 된다.

  // console.log(date, time);

  try {
    const data = await pool.query(selectWeatherData);
    const rows = data.rows;
    const results = rows.map((row) => ({
      xp: row.region_line_xp,
      yp: row.region_line_yp
    }));

    if (time == 0) {
      time = '0000';
    } else if (time <= 9) {
      time = '0' + time + '00';
    } else {
      time = time + '00';
    }

    var ny;
    var nx;
    var url;
    var response;
    for (let i = 1; i <= 252; i++) {
      nx = results[i - 1]['xp'];
      ny = results[i - 1]['yp'];

      // console.log(nx, ny, process.env.DATA_API_KEY, date, time);

      url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${process.env.DATA_API_KEY}&numOfRows=100&pageNo=1&base_date=${date}&base_time=${time}&nx=${nx}&ny=${ny}&dataType=JSON`;
      response = await axios.get(url);
      console.log('데이터 삽입 idx : ', i, '/252)완료');
      var weatherData = response.data.response.body.items;

      weatherData = Object.values(weatherData);
      const flattenedWeatherData = weatherData.flat();
      const filteredTMP = flattenedWeatherData.filter((item) => item.category === 'TMP');
      const filteredPCP = flattenedWeatherData.filter((item) => item.category === 'PCP');
      const filteredPTY = flattenedWeatherData.filter((item) => item.category === 'PTY');

      for (let j = 0; j < 7; j++) {
        if (filteredPCP[j]['fcstValue'] === '강수없음') {
          await pool.query(insertWeatherData, [
            i,
            filteredTMP[j]['fcstTime'],
            0,
            filteredTMP[j]['fcstValue'],
            filteredPTY[j]['fcstValue']
          ]);
        } else if (filteredPCP[j]['fcstValue'] === '50.0mm 이상') {
          await pool.query(insertWeatherData, [
            i,
            filteredTMP[j]['fcstTime'],
            '50',
            filteredTMP[j]['fcstValue'],
            filteredPTY[j]['fcstValue']
          ]);
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export const getAirData = async () => {
  // db에 저장된 서울 측정소 리스트

  const stationResults = await pool.query(selectAirStation);
  const stationList = stationResults.rows;
  // 데이터 저장전 db내용 삭제
  await pool.query(deleteAirData);

  const encodingServiceKey = process.env.AIR_SERVICE_KEY;
  const decodingServiceKey = decodeURIComponent(`${encodingServiceKey}`);
  // 40번 통신
  for (let station of stationList) {
    const airDataUrl = `http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty`;
    const airDataParams = {
      serviceKey: decodingServiceKey,
      returnType: 'json',
      stationName: station.station_name,
      dataTerm: 'DAILY',
      ver: 1.3
    };
    const airDataQuery = new URLSearchParams(airDataParams).toString();
    const airDataFetch = await fetch(`${airDataUrl}?${airDataQuery}`);
    const airDataResult = await airDataFetch.json();
    const airData = airDataResult.response.body.items[0];

    const pm10value = airData.pm10Value;
    const pm25value = airData.pm25Value;
    const pm10grade1h = airData.pm10Grade1h;
    const pm25grade1h = airData.pm25Grade1h;
    const surveyDateTime = airData.dataTime;

    await pool.query(insertAirData, [
      station.station_name,
      pm10value,
      pm25value,
      pm10grade1h,
      pm25grade1h,
      surveyDateTime
    ]);
  }
  return;
};

export const deleteWeatherData = async (time, req, res) => {
  const hour = time + '00';
  await pool.query(deleteWeatherDatadb, [hour]);
  console.log('데이터 삭제', hour, '완료');
};
