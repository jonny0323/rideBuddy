import axios from 'axios';
import 'dotenv/config';
import jwt from 'jsonwebtoken';

// 네이버 로그인 화면 띄우기
export const userNaverLogin = (req, res, next) => {
  const NAVER_STATE = Math.random().toString(36).substring(2, 12);

  const loginWindow =
    `https://nid.naver.com/oauth2.0/authorize?` +
    `response_type=code` +
    `&client_id=${process.env.NAVER_CLIENT_ID}` +
    `&state=${NAVER_STATE}` + //인코딩 해야할수도 테스트해보기
    `&redirect_uri=${process.env.NAVER_CALLBACK_URL}`;

  res.send(loginWindow);
};

// 네이버 토큰발급 요청
export const userNaverCallback = async (req, res, next) => {
  const code = req.query.code;
  const state = req.query.string;

  const tokenUrl =
    `https://nid.naver.com/oauth2.0/token?` +
    `grant_type=authorization_code` +
    `&client_id=${process.env.NAVER_CLIENT_ID}` +
    `&client_secret=${process.env.NAVER_CLIENT_SECRET}` +
    `&code=${code}` +
    `&state=${state}`;

  const response = await axios.get(tokenUrl);

  if (response.status == 200) {
    await axios({
      method: 'GET',
      url: 'http://localhost:5000/users/login/naver/profile',
      headers: {
        access_token: `${response.data.access_token}`,
      },
    });
  }

  // res.set({
  //   Content_type: 'text/plain',
  //   refresh_token: `${response.data.refresh_token}`,
  // });
  // res.cookie('access_token', `${response.data.access_token}`);
  // res.status(200).send();
};

// 네이버 액세스토큰으로 식별자 얻기
export const userNaverProfile = async (req, res, next) => {
  const identifierURL = `https://openapi.naver.com/v1/nid/me?`;

  const personalInfo = await axios({
    method: 'GET',
    url: identifierURL,
    headers: {
      Authorization: `Bearer ${req.headers.access_token}`,
    },
  });

  const naverName = personalInfo.data.response.name;
  const naverId = personalInfo.data.response.id;
  if (naverName && naverId) {
    await axios({
      method: 'POST',
      url: 'http://localhost:5000/users/login/oauth/user/check',
      data: {
        name: `${naverName}`,
        id: `${naverId}`,
      },
    });
  }
};

// 네이버 식별자 데이터 베이스에 저장 or 확인
export const userDBCheck = async (req, res, next) => {
  const userName = req.body.name;
  const userId = req.body.id;

  //회원정보db에 userId 있는지 확인
  //없으면 insert 후 local jwt 생성으로 이동
  //있으면 local jwt 생성으로 이동

  //있으면 local jwt 생성
};
// local jwt 생성 후 반환
export const makeJwt = async (req, res, next) => {};

// local 액세스 토큰만료시 갱신 후 반환
export const refreshJwt = async (req, res, next) => {};

// 리프레이쉬 토큰 만료시
