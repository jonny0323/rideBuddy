import 'dotenv/config';
import cron from 'node-cron';
import { getWeatherData, deleteWeatherData, getAirData } from './src/module.js';
// src안에 module폴더 만들고 repo는 그냥 두구
// 여기는 프로그램 시작파일.
// 배포 해오기 백엔드 배포를 해와라라라라랄

const getWeatherDay = [2, 5, 8, 11, 14, 17, 20, 23];
getWeatherDay.forEach((hour) => {
  cron.schedule(`2 ${hour} * * *`, async () => {
    const currentTime = new Date();
    var year = currentTime.getFullYear();
    var month = (currentTime.getMonth() + 1).toString().padStart(2, '0'); // getMonth()는 0부터 시작하므로 1을 더해야 함
    var day = currentTime.getDate().toString().padStart(2, '0');
    date = `${year}${month}${day}`;
    getWeatherData(date, hour);
  });
});

// 하나씩 함수를 만들어라.
for (let i = 0; i < 24; i++) {
  cron.schedule(`5 ${i} * * *`, async () => {
    deleteWeatherData(i);
  });
}

// 2시간에 한번씩 getAirData 호출
cron.schedule('0 20 */2 * * *', async () => {
  try {
    const currentTime = new Date().toString();
    console.log(`주기적으로 함수 실행중, 현재시각 ${currentTime}`);
    await getAirData();
  } catch (err) {
    console.error('cron.schedule에러발생');
  }
});

getWeatherData(20250202, 20);
