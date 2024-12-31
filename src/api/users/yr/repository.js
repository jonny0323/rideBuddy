export const checkNaverId = `
    SELECT * FROM project.account 
    WHERE naver_id = $1;
`;

export const insertNaverId = `
    INSERT INTO project.account
    (account_name, naver_id)
    VALUES($1,$2);
`;

export const selectUserPw = `
    SELECT pw FROM project.account 
    WHERE id = $1;`;

export const selectNaverAccountIdx = `
    SELECT account_idx FROM project.account
    WHERE naver_id = $1;
`;

export const selectLocalAccountIdx = `
    SELECT account_idx FROM project.account
    WHERE id = $1;
`;

export const insertPw = `
    INSERT INTO project.account (account_id, pw, account_name) 
    VALUES($1,$2,$3);
`;

export const updatePw = `
    UPDATE project.account SET pw = $1 
    WHERE account_idx = $2
`;
