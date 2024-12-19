import express from 'express';
import {} from './users.tj/users.service.js';
import {
  userNaverLogin,
  userNaverCallback,
  userLocalDBCheck,
  createToken,
  verifyToken,
} from './users.yr/users.service.js';
import { checkRegx } from '../../module/util/checkRegx.js';
const router = express.Router();

//로컬 로그인
router.post('/login/local', userLocalDBCheck, createToken); //checkRegx 해야해
router.post('/login/naver', userNaverLogin);
router.get('/login/naver/callback', userNaverCallback, createToken);
router.get('/find-id');
router.get('/change-pw');
router.put('/change-pw');

// Google OAuth 시작
router.get('/google');

// Google OAuth 콜백 처리
router.get('/google/callback');

router.get('/duplicate-id');
router.post('/register');
router.post('/mail');
router.get('/mail/check');
router.delete('/my', verifyToken);

export default router;
