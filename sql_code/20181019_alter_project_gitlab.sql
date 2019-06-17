ALTER TABLE `project`
    ADD COLUMN `is_gitlab_project` INT(1) NOT NULL DEFAULT '0' AFTER `count_downloads_hive`,
    ADD COLUMN `gitlab_project_id` INT(11) NULL DEFAULT NULL AFTER `is_gitlab_project`,
    ADD COLUMN `show_gitlab_project_issues` INT(1) NOT NULL DEFAULT '0' AFTER `gitlab_project_id`,
    ADD COLUMN `use_gitlab_project_readme` INT(1) NOT NULL DEFAULT '0' AFTER `show_gitlab_project_issues`;
