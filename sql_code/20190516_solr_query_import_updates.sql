DELIMITER $$
drop PROCEDURE solr_query_fullimport_prepare;
CREATE  PROCEDURE `solr_query_fullimport_prepare`()
BEGIN
   

    DROP TABLE IF EXISTS tmp_solr_cat_tree;
    CREATE TEMPORARY TABLE tmp_solr_cat_tree 
   (PRIMARY KEY `primary` (project_category_id) )
   AS
      SELECT
        pc.project_category_id,
        pc.title,
        pc.is_active,
        count(pc.lft)                                            AS depth,
        GROUP_CONCAT(pc2.project_category_id ORDER BY pc2.lft)   AS ancestor_id_path,
        GROUP_CONCAT(pc2.title ORDER BY pc2.lft SEPARATOR ' | ') AS ancestor_path
      FROM project_category AS pc, project_category AS pc2
      WHERE (pc.lft BETWEEN pc2.lft AND pc2.rgt)
      GROUP BY pc.lft
      ORDER BY pc.lft;

    DROP TABLE IF EXISTS tmp_solr_cat_store;
    CREATE TEMPORARY TABLE tmp_solr_cat_store 
   (PRIMARY KEY `primary` (project_category_id) )
   AS
      SELECT
        tct.project_category_id,
        tct.ancestor_id_path,
        tct.title,
        tct.is_active,
        group_concat(store_id) AS stores
      FROM tmp_solr_cat_tree AS tct, config_store_category AS csc
      WHERE FIND_IN_SET(csc.project_category_id, tct.ancestor_id_path) > 0
      GROUP BY tct.project_category_id
      ORDER BY tct.project_category_id;

      DROP TABLE IF EXISTS tmp_solr_project_tags;
      CREATE TEMPORARY TABLE tmp_solr_project_tags
      (PRIMARY KEY `primary` (tag_project_id) )
     AS
        SELECT GROUP_CONCAT(tag.tag_name) AS tag_names
                  , tgo.tag_object_id AS tag_project_id
        FROM tag_object AS tgo
          JOIN tag ON tag.tag_id = tgo.tag_id          
        WHERE tgo.tag_type_id = 1 and tgo.tag_group_id in (5,6) and tgo.is_deleted = 0
        GROUP BY tgo.tag_object_id;

      DROP TABLE IF EXISTS tmp_solr_project_license;
      CREATE TEMPORARY TABLE tmp_solr_project_license
      (PRIMARY KEY `primary` (license_project_id))
        ENGINE MyISAM
        AS
          SELECT 
      t.tag_object_id as license_project_id,
      GROUP_CONCAT(DISTINCT ta.tag_name) AS `license_name_list`
      FROM tag_object t 
      INNER JOIN tag ta on ta.tag_id = t.tag_id 
      WHERE t.tag_type_id = 1 and t.tag_group_id = 7  AND t.is_deleted = 0
      group by tag_object_id
      ;

    DROP TABLE IF EXISTS tmp_solr_project_package_types;
    CREATE TEMPORARY TABLE tmp_solr_project_package_types
    (PRIMARY KEY `primary` (package_project_id))
      ENGINE MyISAM
      AS
        SELECT 
    t.tag_parent_object_id as package_project_id,
    GROUP_CONCAT(DISTINCT ta.tag_id) AS package_type_id_list,
    GROUP_CONCAT(DISTINCT ta.tag_name) AS `package_name_list`
    FROM tag_object t 
    INNER JOIN tag ta on ta.tag_id = t.tag_id 
    JOIN ppload.ppload_files files ON files.id = t.tag_object_id  AND files.active = 1
    WHERE t.tag_type_id = 3 and t.tag_group_id = 8  AND t.is_deleted = 0
    group by tag_parent_object_id
    ;
    
     DROP TABLE IF EXISTS tmp_solr_project_arch_types;
    CREATE TEMPORARY TABLE tmp_solr_project_arch_types
    (PRIMARY KEY `primary` (arch_project_id))
      ENGINE MyISAM
      AS
        SELECT 
    t.tag_parent_object_id as arch_project_id,
    GROUP_CONCAT(DISTINCT ta.tag_id) AS arch_type_id_list,
    GROUP_CONCAT(DISTINCT ta.tag_name) AS `arch_name_list`
    FROM tag_object t 
    INNER JOIN tag ta on ta.tag_id = t.tag_id 
    JOIN ppload.ppload_files files ON files.id = t.tag_object_id  AND files.active = 1
    WHERE t.tag_type_id = 3 and t.tag_group_id = 9  AND t.is_deleted = 0
    group by tag_parent_object_id
    ;
  
    DROP TABLE IF EXISTS tmp_solr_query_fullimport; 
    create table tmp_solr_query_fullimport as
    
    SELECT   
      project.project_id,
      project.member_id           AS project_member_id,
      project.project_category_id AS project_category_id,
      project.title               AS project_title,
      description,
      image_small,
      member.username,
      member.firstname,
      member.lastname,
      tcs.title                   AS cat_title,
      IFNULL(r.likes, 0) AS count_likes,
	    IFNULL(r.dislikes, 0) AS count_dislikes, 
      IFNULL(r.score_with_pling, 500) AS laplace_score,        
      DATE_FORMAT(project.created_at, '%Y-%m-%dT%TZ') AS created_at,
      DATE_FORMAT(project.changed_at, '%Y-%m-%dT%TZ') AS changed_at,
      tcs.stores,
      tcs.ancestor_id_path        AS `cat_id_ancestor_path`,      
      sppt.package_name_list      AS `package_names`,
      appt.arch_name_list         AS `arch_names`,
      c.license_name_list         AS `license_names`,
      t.tag_names                 AS `tags`
    FROM project
      JOIN member ON member.member_id = project.member_id
      LEFT JOIN tmp_solr_cat_store AS tcs ON project.project_category_id = tcs.project_category_id
      LEFT JOIN tmp_solr_project_package_types AS sppt ON sppt.package_project_id = project.project_id
      LEFT JOIN tmp_solr_project_arch_types AS appt ON appt.arch_project_id = project.project_id
      LEFT JOIN tmp_solr_project_license AS c ON c.license_project_id = project.project_id
      LEFT JOIN tmp_solr_project_tags AS t ON t.tag_project_id = project.project_id
	  LEFT JOIN stat_rating_project r ON r.project_id = project.project_id
    WHERE project.`status` = 100 AND project.`type_id` = 1 AND member.`is_active` = 1 AND tcs.`is_active` = 1;
    

END$$
DELIMITER ;




DELIMITER $$
drop PROCEDURE solr_query_delta_import_new;
CREATE  PROCEDURE `solr_query_delta_import_new`(IN projectID INT(11))
BEGIN

     DROP TABLE IF EXISTS tmp_cat_tree;
    CREATE TEMPORARY TABLE  tmp_cat_tree
    (PRIMARY KEY `primary` (project_category_id) )
     AS
      SELECT
        pc.project_category_id,
        pc.title,
        pc.is_active,
        count(pc.lft)                                            AS depth,
        GROUP_CONCAT(pc2.project_category_id ORDER BY pc2.lft)   AS ancestor_id_path,
        GROUP_CONCAT(pc2.title ORDER BY pc2.lft SEPARATOR ' | ') AS ancestor_path
      FROM project_category AS pc, project_category AS pc2
      WHERE (pc.lft BETWEEN pc2.lft AND pc2.rgt)
      GROUP BY pc.lft
      ORDER BY pc.lft;

    DROP TABLE IF EXISTS tmp_solr_cat_store;
    CREATE  TEMPORARY  TABLE  tmp_solr_cat_store 
    (PRIMARY KEY `primary` (project_category_id) )
    AS
      SELECT
        tct.project_category_id,
        tct.ancestor_id_path,
        tct.title,
        tct.is_active,
        group_concat(store_id) AS stores
      FROM tmp_cat_tree AS tct, config_store_category AS csc
      WHERE FIND_IN_SET(csc.project_category_id, tct.ancestor_id_path) > 0
      GROUP BY tct.project_category_id
      ORDER BY tct.project_category_id;

    SELECT   
      project.project_id,
      project.member_id           AS project_member_id,
      project.project_category_id AS project_category_id,
      project.title               AS project_title,
      description,
      image_small,
      member.username,
      member.firstname,
      member.lastname,
      tcs.title                   AS cat_title,
      IFNULL(r.likes, 0) AS count_likes,
    IFNULL(r.dislikes, 0) AS count_dislikes, 
      IFNULL(r.score_with_pling, 500) AS laplace_score,
      DATE_FORMAT(project.created_at, '%Y-%m-%dT%TZ') AS created_at,
      DATE_FORMAT(project.changed_at, '%Y-%m-%dT%TZ') AS changed_at,
      tcs.stores,
      tcs.ancestor_id_path        AS `cat_id_ancestor_path`,  
        (
          
      SELECT GROUP_CONCAT(tag.tag_name) AS tag_names
      FROM tag_object , tag , ppload.ppload_files files   
      WHERE tag.tag_id = tag_object.tag_id and tag_object.tag_group_id = 8 and tag_object.tag_type_id = 3 and tag_object.is_deleted = 0 and tag_object.tag_parent_object_id = project.project_id
        and tag_object.tag_object_id = files.id and files.active = 1  
      ) as package_names , 
       (
        
      SELECT GROUP_CONCAT(tag.tag_name) AS tag_names
      FROM tag_object , tag  , ppload.ppload_files files      
      WHERE tag.tag_id = tag_object.tag_id and tag_object.tag_group_id = 9 and tag_object.tag_type_id = 3 and tag_object.is_deleted = 0 and tag_object.tag_parent_object_id = project.project_id
        and tag_object.tag_object_id = files.id and files.active = 1  
      ) as arch_names,    
       (        
              SELECT GROUP_CONCAT(tag.tag_name) AS tag_names
              FROM tag_object , tag  
              WHERE tag.tag_id = tag_object.tag_id and tag_object.tag_group_id = 7 and tag_object.tag_type_id = 1 and tag_object.is_deleted = 0 and tag_object.tag_object_id = project.project_id             
      ) as license_names,    
      (
      SELECT GROUP_CONCAT(tag.tag_name) AS tag_names
      FROM tag_object , tag      
      WHERE tag.tag_id = tag_object.tag_id and tag_object.tag_group_id in (5,6) and tag_object.tag_type_id = 1 and tag_object.is_deleted = 0 and tag_object.tag_object_id = project.project_id
      ) as tags          
    FROM project
      JOIN member ON member.member_id = project.member_id
      LEFT JOIN tmp_solr_cat_store AS tcs ON project.project_category_id = tcs.project_category_id   
      LEFT JOIN stat_rating_project r ON r.project_id = project.project_id
   WHERE project.project_id = projectID and project.status=100 and member.`is_active` = 1;
   

END$$
DELIMITER ;



DELIMITER $$
drop procedure solr_query_delta_new;
CREATE PROCEDURE `solr_query_delta_new`(IN lastIndexed varchar(255))
BEGIN
  select distinct project_id
  from
  (
    SELECT project_id
    FROM project
    JOIN member ON member.member_id = project.member_id
    WHERE (project.`status` = 100 AND project.`type_id` = 1 AND member.`is_active` = 1 AND project.changed_at > timestamp(DATE_SUB(lastIndexed, INTERVAL 1 DAY)) )
    union 
    select distinct tag_object_id as project_id
    from tag_object
    where  tag_type_id = 1 and (tag_created >  timestamp(DATE_SUB(lastIndexed, INTERVAL 1 DAY))  or tag_changed > timestamp(DATE_SUB(lastIndexed, INTERVAL 1 DAY)) )
    union  select distinct tag_parent_object_id as project_id
    from tag_object
    where  tag_type_id in (8,9) and (tag_created >  timestamp(DATE_SUB(lastIndexed, INTERVAL 1 DAY))  or tag_changed > timestamp(DATE_SUB(lastIndexed, INTERVAL 1 DAY)) )    
    union
    select  project_id 
    from project 
    JOIN ppload.ppload_files files ON project.ppload_collection_id= files.collection_id AND files.updated_timestamp > timestamp(DATE_SUB(lastIndexed, INTERVAL 1 DAY)) 
    group by project_id  
    union
    select project_id from project_rating where created_at > timestamp(DATE_SUB(lastIndexed, INTERVAL 1 DAY))
    group by project_id 
  ) t ;
END$$
DELIMITER ;