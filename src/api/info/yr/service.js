import pool from '#config/postgresql.js';
import {
  searchCenter,
  searchRoad,
  insertAccountLike,
  selectAccountLike,
  deleteAccountLike,
  plusLikeNum,
  minusLikeNum,
  selectLikeNum,
  selectRoadName
} from './repository.js';
import { calcDistance } from '../utility/harversine.js';
import { sortCompare } from '../utility/sortCompareFunc.js';
import { getData } from '../utility/getData.js';
import wrap from '#utility/wrapper.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '#utility/customError.js';
import { verifyReq } from '../utility/verifyReq.js';
export const getCentersList = wrap(async (req, res) => {
  // 1. 현재 nx ,ny, 페이지네이션 오면
  const { page, nx, ny } = req.body;
  // 유효성 검증
  verifyReq(page, nx, ny);

  const resultData = await getData(page, nx, ny, 'center');
  // 중간에 에러가 났으면 에러 메시지 반환됨
  if (resultData.message) {
    throw Error('getData내부에러');
  }
  // 만약 모든 resultData의 모든 값이 Null 일 경우 (더 이상 페이지가 존재하지 않을경우)
  const isNull = (value) => value == null;
  if (resultData.every(isNull)) {
    res.status(200).send({
      message: '더 이상 페이지가 존재하지 않습니다.'
    });
    return;
  }

  res.status(200).send({
    resultData
  });
});

export const getRoadsList = wrap(async (req, res) => {
  // 1. 현재 nx ,ny, 페이지네이션 오면
  const { page, nx, ny } = req.body;
  verifyReq(page, nx, ny);

  const resultData = await getData(page, nx, ny, 'road');
  // 중간에 에러가 났으면 에러 메시지 반환됨
  if (resultData.message) {
    throw Error('getData내부에러');
  }
  // 만약 모든 resultData의 모든 값이 Null 일 경우 (더 이상 페이지가 존재하지 않을경우)
  const isNull = (value) => value == null;
  if (resultData.every(isNull)) {
    res.status(200).send({
      message: '더 이상 페이지가 존재하지 않습니다.'
    });
    return;
  }

  res.status(200).send({
    resultData
  });

  // 지도 표시 반경..? 알아야하나?
  // 내일 center 데이터도 파이썬으로 csv 파일 만들어서 올려놓기.
});

export const searchEnter = wrap(async (req, res) => {
  const { search, page, nx, ny } = req.body;
  verifyReq(page, nx, ny);
  // 1. search LIKE 기준으로 select 한다.
  const centerList = await pool.query(searchCenter, [`%${search}%`]);
  const roadList = await pool.query(searchRoad, [`%${search}%`]);
  let sortedtData = [];
  let resultObject;
  let placeLocation;
  // 현재 위치
  const currentLocation = {
    nx: nx,
    ny: ny
  };
  // 2. 현재위치기준 인증센터와 자전거길 거리 구해서 push
  for (let list of centerList.rows) {
    placeLocation = {
      nx: list.line_xp,
      ny: list.line_yp
    };
    let distance = calcDistance(currentLocation, placeLocation);
    resultObject = {
      center_idx: list.center_idx,
      center_name: list.center_name,
      center_address: list.center_address,
      distance: distance
    };
    sortedtData.push(resultObject);
  }

  for (let list of roadList.rows) {
    placeLocation = {
      nx: list.line_xp,
      ny: list.line_yp
    };
    let distance = calcDistance(currentLocation, placeLocation);
    resultObject = {
      road_idx: list.road_idx,
      road_name: list.road_name,
      road_type: list.road_type,
      road_address: list.road_address,
      distance: distance
    };
    sortedtData.push(resultObject);
  }
  // 3. 최종적으로 Push 한거 거리순으로 분류
  sortedtData.sort(sortCompare);

  // 4. 20개씩 나눠서 전달
  let resultData = [];
  for (let i = 0; i < 20; i++) {
    let startPoint = 20 * (page - 1);
    resultData.push(sortedtData[startPoint + i]);
  }
  const isNull = (value) => value == null;
  if (resultData.every(isNull)) {
    res.status(200).send({
      message: '더 이상 페이지가 존재하지 않습니다.'
    });
    return;
  }

  res.status(200).send({
    resultData
  });
});

export const roadLike = wrap(async (req, res) => {
  // 자전거길 좋아요. 자전거길 기준으로 좋아요가 되고.
  // 한번 누르면 좋아요 , 다시한 누르면 좋아요 취소
  const userIdx = req.accountIdx;
  const roadName = req.params['roadName'];
  // roadName param값 안오면 안되고
  if (!roadName) {
    throw new BadRequestError('올바른 req값이 아님.');
  }
  const testRoadName = await pool.query(selectRoadName, [roadName]);
  if (testRoadName.rows.length == 0) {
    throw new NotFoundError('알맞은 param값이 아님');
  }
  // 해당 유저가 해당 길을 좋아요 했는지 여부
  const likeStatus = await pool.query(selectAccountLike, [userIdx, roadName]);

  // 좋아요를 하지 않았으면 좋아요테이블에 추가하고 좋아요수 업데이트
  if (likeStatus.rows.length == 0) {
    await pool.query(insertAccountLike, [userIdx, roadName]);
    await pool.query(plusLikeNum, [roadName]);
  } else {
    // 좋아요 했었으면 좋아요 테이블에서 삭제하고 좋아요수 업데이트
    await pool.query(deleteAccountLike, [userIdx, roadName]);
    await pool.query(minusLikeNum, [roadName]);
  }

  const likeCount = await pool.query(selectLikeNum, [roadName]);
  res.status(200).send({
    'road likeCount': likeCount.rows[0].road_like
  });
});

export const centerLike = async (req, res) => {
  // 센터 좋아요. 센터 기준으로 좋아요가 되고.
  // 한번 누르면 좋아요 , 다시한 누르면 좋아요 취소
  const userIdx = req.accountIdx;
  const centerIdx = req.params['centerIdx'];

  // 해당 유저가 해당 길을 좋아요 했는지 여부
  // const likeStatus = await pool.query(selectAccountLike, [userIdx, roadName]);

  // // 좋아요를 하지 않았으면 좋아요테이블에 추가하고 좋아요수 업데이트
  // if (likeStatus.rows.length == 0) {
  //   await pool.query(insertAccountLike, [userIdx, roadName]);
  //   await pool.query(plusLikeNum, [roadName]);
  // } else {
  //   // 좋아요 했었으면 좋아요 테이블에서 삭제하고 좋아요수 업데이트
  //   await pool.query(deleteAccountLike, [userIdx, roadName]);
  //   await pool.query(minusLikeNum, [roadName]);
  // }

  // const likeCount = await pool.query(selectLikeNum, [roadName]);
  // res.status(200).send({
  //   'road likeCount': likeCount.rows[0].road_like
  // });
};
export const getPin = async (req, res) => {};
