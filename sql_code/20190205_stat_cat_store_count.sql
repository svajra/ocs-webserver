DROP PROCEDURE IF EXISTS `generate_stat_store_prod_count`;

DELIMITER $$
CREATE PROCEDURE `generate_stat_store_prod_count`()
BEGIN
		      
DECLARE v_finished INTEGER DEFAULT 0;
DECLARE v_store_id varchar(255) DEFAULT "";
DECLARE v_store_tag_ids varchar(255) DEFAULT "";

declare idx,prev_idx int;
declare v_id varchar(10);
 
-- declare cursor for employee email
DECLARE store_cursor CURSOR FOR 
 SELECT * FROM tmp_stat_store_tagids;
 
-- declare NOT FOUND handler
DECLARE CONTINUE HANDLER 
FOR NOT FOUND SET v_finished = 1;


DROP TABLE IF EXISTS `tmp_stat_store_tagids`;
CREATE TEMPORARY TABLE `tmp_stat_store_tagids`
AS
SELECT
 `cs`.`store_id`,
 GROUP_CONCAT(`ct`.`tag_id`
              ORDER BY `ct`.`tag_id`) AS `tag_ids`
FROM
 `config_store` `cs`
JOIN
 `config_store_tag` `ct` ON `ct`.`store_id` = `cs`.`store_id`
AND `ct`.`is_active` = 1
#WHERE `cs`.`store_id` = 7
GROUP BY `cs`.`store_id`;


DROP TABLE IF EXISTS `tmp_stat_store_prod_count`;
 CREATE TABLE `tmp_stat_store_prod_count`
 (
   `project_category_id` INT(11)      NOT NULL,
   `tag_id`              VARCHAR(255) NULL,
   `count_product`       INT(11)      NULL,
   `stores`              VARCHAR(255) NULL,
   INDEX `idx_tag` (`project_category_id`, `tag_id`)
 )
   ENGINE MyISAM
   AS
     SELECT
          sct2.project_category_id,
          NULL as tag_id,
          count(distinct p.project_id) as count_product,
          NULL as stores
        FROM stat_cat_tree as sct1
          JOIN stat_cat_tree as sct2 ON sct1.lft between sct2.lft AND sct2.rgt
          LEFT JOIN stat_projects as p ON p.project_category_id = sct1.project_category_id
        WHERE p.amount_reports is null
        GROUP BY sct2.project_category_id;
        

OPEN store_cursor;

get_store: LOOP
 
 FETCH store_cursor INTO v_store_id, v_store_tag_ids;
 
 IF v_finished = 1 THEN 
 LEAVE get_store;
 END IF;
 
 -- build email list
 
 
  SET @sql = '
      INSERT INTO tmp_stat_store_prod_count
        SELECT
          sct2.project_category_id,
          tg.tag_ids as tag_id,
          count(distinct p.project_id) as count_product,
          tg.store_id
        FROM stat_cat_tree as sct1
          JOIN stat_cat_tree as sct2 ON sct1.lft between sct2.lft AND sct2.rgt
          JOIN stat_projects as p ON p.project_category_id = sct1.project_category_id
          JOIN tmp_stat_store_tagids tg
          
        WHERE p.amount_reports is null
        ';
   SET @sql = CONCAT(@sql,' AND tg.store_id = ', v_store_id, ' ');     
   SET @sql = CONCAT(@sql,' AND (1=1 ');  
	
	set idx := locate(',',v_store_tag_ids,1);
	
	if LENGTH(v_store_tag_ids) > 0 then
	
		if idx > 0 then
			set prev_idx := 1;
			WHILE idx > 0 DO
			 set v_id := substr(v_store_tag_ids,prev_idx,idx-prev_idx);
			 SET @sql = CONCAT(@sql,' AND FIND_IN_SET(', v_id, ', p.tag_ids) ');
			 set prev_idx := idx+1;
			 set idx := locate(',',v_store_tag_ids,prev_idx);
			 
			 if idx = 0 then
			 	set v_id := substr(v_store_tag_ids,prev_idx);
			 	SET @sql = CONCAT(@sql,' AND FIND_IN_SET(', v_id, ', p.tag_ids) ');
			 end if;
			 
			 
			END WHILE;   
		else 
		
			SET @sql = CONCAT(@sql,' AND FIND_IN_SET(', v_store_tag_ids, ', p.tag_ids) ');
		
		end if;
	end if;
        
    SET @sql = CONCAT(@sql,') ');     
    SET @sql = CONCAT(@sql,'GROUP BY sct2.lft, tg.tag_ids,tg.store_id');
    
    #select @sql;
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
 
 END LOOP get_store;

CLOSE store_cursor;


 IF EXISTS(SELECT `table_name`
              FROM `INFORMATION_SCHEMA`.`TABLES`
              WHERE `table_schema` = DATABASE()
                    AND `table_name` = 'stat_store_prod_count')

    THEN

      RENAME TABLE
          `stat_store_prod_count` TO `old_stat_store_prod_count`,
          `tmp_stat_store_prod_count` TO `stat_store_prod_count`;

    ELSE

      RENAME TABLE
          `tmp_stat_store_prod_count` TO `stat_store_prod_count`;

    END IF;


    DROP TABLE IF EXISTS `old_stat_store_prod_count`;

END$$





CREATE EVENT `e_generate_stat_store_prod_count`
	ON SCHEDULE
		EVERY 30 MINUTE STARTS '2019-02-05 15:01:03'
	ON COMPLETION NOT PRESERVE
	ENABLE
	COMMENT ''
	DO BEGIN
	CALL generate_stat_store_prod_count();
END$$





CREATE PROCEDURE `fetchCatTreeForStore`(
	IN `STORE_ID` int(11)
)
BEGIN
    DROP TABLE IF EXISTS `tmp_store_cat`;
    CREATE TEMPORARY TABLE `tmp_store_cat`
    (INDEX `idx_cat_id` (`project_category_id`) )
      ENGINE MEMORY
      AS
        SELECT `csc`.`store_id`, `csc`.`project_category_id`, `csc`.`order`, `pc`.`title`, `pc`.`lft`, `pc`.`rgt`
        FROM `config_store_category` AS `csc`
          JOIN `project_category` AS `pc` ON `pc`.`project_category_id` = `csc`.`project_category_id`
        WHERE `csc`.`store_id` = STORE_ID
        GROUP BY `csc`.`store_category_id`
        ORDER BY `csc`.`order`, `pc`.`title`
    ;

    SET @NEW_ORDER := 0;

    UPDATE `tmp_store_cat` SET `order` = (@NEW_ORDER := @NEW_ORDER + 10);

    SELECT `sct`.`lft`, `sct`.`rgt`, `sct`.`project_category_id` AS `id`, `sct`.`title`, `scpc`.`count_product` AS `product_count`, `sct`.`xdg_type`, `sct`.`name_legacy`, if(`sct`.`rgt`-`sct`.`lft` = 1, 0, 1) AS `has_children`, (SELECT `project_category_id` FROM `stat_cat_tree` AS `sct2` WHERE `sct2`.`lft` < `sct`.`lft` AND `sct2`.`rgt` > `sct`.`rgt` ORDER BY `sct2`.`rgt` - `sct`.`rgt` LIMIT 1) AS `parent_id`
    FROM `tmp_store_cat` AS `cfc`
      JOIN `stat_cat_tree` AS `sct` ON find_in_set(`cfc`.`project_category_id`, `sct`.`ancestor_id_path`)
      #JOIN `stat_cat_prod_count` AS `scpc` ON `sct`.`project_category_id` = `scpc`.`project_category_id` AND `scpc`.`tag_id` is null
      JOIN `stat_store_prod_count` AS `scpc` ON `sct`.`project_category_id` = `scpc`.`project_category_id` AND `scpc`.`tag_id` is null
    WHERE cfc.store_id = STORE_ID
    ORDER BY cfc.`order`, sct.lft;
END$$



CREATE PROCEDURE `fetchCatTreeWithTagsForStore`(
	IN `STORE_ID` INT(11),
	IN `TAGS` VARCHAR(255)
)
BEGIN
    DROP TABLE IF EXISTS `tmp_store_cat_tags`;
    CREATE TEMPORARY TABLE `tmp_store_cat_tags`
    (
      INDEX `idx_cat_id` (`project_category_id`)
    )
      ENGINE MEMORY
      AS
        SELECT
          `csc`.`store_id`,
          `csc`.`project_category_id`,
          `csc`.`order`,
          `pc`.`title`,
          `pc`.`lft`,
          `pc`.`rgt`
        FROM `config_store_category` AS `csc`
          JOIN `project_category` AS `pc` ON `pc`.`project_category_id` = `csc`.`project_category_id`
        WHERE `csc`.`store_id` = STORE_ID
        GROUP BY `csc`.`store_category_id`
        ORDER BY `csc`.`order`, `pc`.`title`;

    SET @`NEW_ORDER` := 0;

    UPDATE `tmp_store_cat_tags`
    SET `order` = (@`NEW_ORDER` := @`NEW_ORDER` + 10);

    SELECT
      `sct`.`lft`,
      `sct`.`rgt`,
      `sct`.`project_category_id`             AS `id`,
      `sct`.`title`,
      `scpc`.`count_product`                  AS `product_count`,
      `sct`.`xdg_type`,
      `sct`.`name_legacy`,
      if(`sct`.`rgt` - `sct`.`lft` = 1, 0, 1) AS `has_children`,
      (SELECT `project_category_id`
       FROM `stat_cat_tree` AS `sct2`
       WHERE `sct2`.`lft` < `sct`.`lft` AND `sct2`.`rgt` > `sct`.`rgt`
       ORDER BY `sct2`.`rgt` - `sct`.`rgt`
       LIMIT 1)                               AS `parent_id`
    FROM `tmp_store_cat_tags` AS `cfc`
      JOIN `stat_cat_tree` AS `sct` ON find_in_set(`cfc`.`project_category_id`, `sct`.`ancestor_id_path`)
      #LEFT JOIN `stat_cat_prod_count` AS `scpc` ON `sct`.`project_category_id` = `scpc`.`project_category_id` AND `scpc`.`tag_id` = TAGS
      JOIN `stat_store_prod_count` AS `scpc` ON `sct`.`project_category_id` = `scpc`.`project_category_id` AND `scpc`.`stores` = STORE_ID
    WHERE `cfc`.`store_id` = STORE_ID
    ORDER BY `cfc`.`order`, `sct`.`lft`;
END$$
