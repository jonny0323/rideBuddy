export const CenterByDistance = `
   SELECT center_idx, center_name, center_address, centerlist.cal 
   FROM (SELECT * , calcDistance($2, $3, latitude, longitude) AS cal 
   FROM project.center) AS centerlists
   ORDER BY centerlist.cal ASC
   LIMIT 20 offset $1 * 20;
`;
export const roadByDistance = `
   SELECT road_idx,road_name,road_type,road_address,roadlist.cal 
   FROM (SELECT * , calcDistance($2, $3, latitude, longitude) AS cal 
   FROM project.road) AS roadlist
   ORDER BY roadlist.cal ASC
   LIMIT 20 offset $1 * 20;
`;

export const searchData = `
    (select center_idx as idx, center_name as name, latitude, longitude, center_address as address , 'center_point' as type , calcDistance($3, $4, latitude, longitude) AS cal 
    from project.center 
    where center_name like $1)
    union all
    (select road_idx as idx, road_name as name, latitude, longitude, road_address as address , road_type as type ,calcDistance($3, $4, latitude, longitude) AS cal 
    from project.road 
    where road_name like $1) 
    order by cal ASC
    limit 20 offset $2;
`;

export const insertAddress = `
    UPDATE project.center
    SET center_address = $1
    WHERE center_idx = $2
`;

export const selectCenters = `
    SELECT * FROM project.center
`;

export const selectRoads = `
    SELECT * FROM project.road
`;

export const searchCenter = `
    SELECT * FROM project.center
    WHERE center_name LIKE $1
`;

export const searchRoad = `
    SELECT * FROM project.road
    WHERE road_name LIKE $1
`;

export const insertAccountRoadLike = `
    INSERT INTO project.account_road_like (account_idx, road_name)
    VALUES ($1,$2)
`;

export const selectAccountRoadLike = `
    SELECT * FROM project.account_road_like 
    WHERE account_idx = $1 AND road_name = $2
`;

export const deleteAccountRoadLike = `
    DELETE FROM project.account_road_like
    WHERE account_idx = $1 AND road_name = $2
`;
export const plusRoadLikeNum = `
    UPDATE project.road_like_count
    SET road_like = (SELECT road_like FROM project.road_like_count WHERE road_name = $1) + 1 
    WHERE road_name = $1
`;
export const minusRoadLikeNum = `
    UPDATE project.road_like_count
    SET road_like = (SELECT road_like FROM project.road_like_count WHERE road_name = $1) - 1 
    WHERE road_name = $1
`;
export const selectRoadLikeNum = `
    SELECT road_like FROM project.road_like_count
    WHERE road_name = $1
`;

export const selectRoadName = `
    SELECT * FROM project.road_like_count
    WHERE road_name = $1
`;

export const selectCenterIdx = `
    SELECT * FROM project.center
    WHERE center_idx = $1
`;
export const selectAccountCenterLike = `
    SELECT * FROM project.account_center_like
    WHERE account_idx = $1 AND center_idx = $2
`;
export const insertAccountCenterLike = `
    INSERT INTO project.account_center_like (account_idx, center_idx)
    VALUES ($1,$2)
`;
export const plusCenterLikeNum = `
    UPDATE project.center
    SET center_like = (SELECT center_like FROM project.center WHERE center_idx = $1) + 1 
    WHERE center_idx = $1
`;
export const deleteAccountCenterLike = `
    DELETE FROM project.account_center_like
    WHERE account_idx = $1 AND center_idx = $2
`;
export const minusCenterLikeNum = `
    UPDATE project.center
    SET center_like = (SELECT center_like FROM project.center WHERE center_idx = $1) - 1
    WHERE center_idx = $1   
`;
export const selectCenterLikeNum = `
    SELECT center_like FROM project.center
    WHERE center_idx = $1
`;

export const giveInformationRoadDB = `
    SELECT road_name, latitude, longitude, road_address, road_like FROM project.road
    WHERE road_idx = $1;
`;

export const giveInformationCenterDB = `
    SELECT center_name, latitude, longitude, center_address, center_like FROM project.center
    WHERE center_idx = $1;
`;

export const givePositionRoad = `
    SELECT latitude, longitude FROM project.road
    WHERE road_idx = $1;
`;

export const givePositionCenter = `
    SELECT latitude, longitude FROM project.center
    WHERE center_idx = $1;
`;
