import express from 'express';
import {
  userGoogleLogin,
  googleCreateToken,
  deleteuser,
  register,
  duplicateId,
  mailSendRegister,
  mailSendChangePw,
  mailCheck,
  duplicateMail
} from './tj/service.js';

import { localCreateToken, naverLogin, naverCreateToken, findId, changePw } from './yr/service.js';
import { verifyLoginToken } from '#middleware/verifyLoginToken.js';
import { verifyMailToken } from './middleware/verifyMailToken.js';
import { validateRegx } from '#middleware/validateRegx.js';
import checkMailStatus from './middleware/checkMailStatus.js';
import { idRegx, pwRegx, nameRegx, mailRegx, codeRegx } from '#utility/regx.js';

const router = express.Router();
// prettier-ignore
router.post('/login/local',validateRegx([['id', idRegx],['pw', pwRegx]]),localCreateToken);
router.post('/login/naver', naverLogin);
router.get('/login/naver/callback', naverCreateToken);
router.get('/login/google', userGoogleLogin); //완료
router.get('/google/callback', googleCreateToken); //완료
// prettier-ignore
router.get('/find-id',validateRegx([['name', nameRegx],['mail', mailRegx]]),findId);
router.put('/change-pw', validateRegx([['pw', pwRegx]]), checkMailStatus, changePw);
router.put('/change-pw/mypages', verifyLoginToken, validateRegx([['pw', pwRegx]]), changePw);
router.get('/duplicate-id', validateRegx([['id', idRegx]]), duplicateId); //완료
router.get('/duplicate-mail', validateRegx([['mail', mailRegx]]), duplicateMail); //완료
// prettier-ignore
router.post('/register',validateRegx([['id', idRegx],['pw', pwRegx],['name', nameRegx],['mail', mailRegx]]),
  checkMailStatus,
  register
); //완료
router.post('/mail', validateRegx([['mail', mailRegx]]), mailSendRegister);
// prettier-ignore
router.post('/mail/withId',validateRegx([['mail', mailRegx],['id', idRegx]]),mailSendChangePw);
router.get('/mail/check', verifyMailToken, validateRegx([['code', codeRegx]]), mailCheck);
router.delete('/my', verifyLoginToken, deleteuser);

export default router;
