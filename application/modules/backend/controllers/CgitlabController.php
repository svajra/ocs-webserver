<?php

/**
 *  ocs-webserver
 *
 *  Copyright 2016 by pling GmbH.
 *
 *    This file is part of ocs-webserver.
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License as
 *    published by the Free Software Foundation, either version 3 of the
 *    License, or (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Created: 06.08.2018
 */
class Backend_CgitlabController extends Local_Controller_Action_CliAbstract
{
    const filename = "members.log";
    const filename_errors = "members.error.log";

    protected $logfile;
    protected $errorlogfile;

    public function runAction()
    {
        ini_set('memory_limit', '1024M');
        $logFileName = Zend_Registry::get('config')->settings->server->opencode->user_logfilename;
        $this->logfile = realpath(APPLICATION_DATA . "/logs") . DIRECTORY_SEPARATOR . $logFileName . '_' . self::filename;
        $this->errorlogfile = realpath(APPLICATION_DATA . "/logs") . DIRECTORY_SEPARATOR . $logFileName . '_' . self::filename_errors;
        $this->initFiles($this->logfile, $this->errorlogfile);
        $members = $this->getMemberList();
        $this->exportMembers($members);
    }

    /**
     * @param string $file
     * @param string $errorfile
     */
    private function initFiles($file, $errorfile)
    {
        if (file_exists($file)) {
            file_put_contents($file, "1");
            unlink($file);
        }
        if (file_exists($errorfile)) {
            file_put_contents($errorfile, "1");
            unlink($errorfile);
        }
    }

    /**
     * @return Zend_Db_Statement_Interface
     */
    private function getMemberList()
    {
        $sql = "
            SELECT `mei`.`external_id`,`m`.`member_id`, `m`.`username`, `me`.`email_address`, `m`.`password`, `m`.`roleId`, `m`.`firstname`, `m`.`lastname`, `m`.`profile_image_url`, `m`.`created_at`, `m`.`changed_at`, `m`.`source_id`, `m`.`biography`
            FROM `member` AS `m`
            LEFT JOIN `member_email` AS `me` ON `me`.`email_member_id` = `m`.`member_id` AND `me`.`email_primary` = 1
            LEFT JOIN `member_external_id` AS `mei` ON `mei`.`member_id` = `m`.`member_id`
            WHERE `m`.`is_active` = 1 AND `m`.`is_deleted` = 0 AND `me`.`email_checked` IS NOT NULL AND `me`.`email_deleted` = 0 # AND (me.email_address like '%opayq%' OR m.username like '%rvs%')
            ORDER BY `m`.`member_id` ASC
            # LIMIT 200
        ";

        $result = Zend_Db_Table::getDefaultAdapter()->query($sql);

        return $result;
    }

    /**
     * @param Zend_Db_Statement_Interface $members
     *
     * @return bool
     * @throws Zend_Exception
     * @throws Zend_Validate_Exception
     */
    private function exportMembers($members)
    {
        // only usernames which are valid in github/gitlab
        $usernameValidChars = new Zend_Validate_Regex('/^(?=.{3,40}$)(?![-_.])(?!.*[-_.]{2})[a-zA-Z0-9._-]+(?<![-_.])$/');
        $modelOpenCode = new Default_Model_Ocs_OpenCode(Zend_Registry::get('config')->settings->server->opencode);

        while ($member = $members->fetch()) {
            if (false === $usernameValidChars->isValid($member['username'])) {
                file_put_contents($this->errorlogfile, print_r($member, true) . "user name validation error". "\n\n" , FILE_APPEND);
                continue;
            }
            file_put_contents($this->logfile, print_r($member, true), FILE_APPEND);
            try {
                $modelOpenCode->exportUser($member);
            } catch (Exception $e) {
                Zend_Registry::get('logger')->err($e->getMessage() . PHP_EOL . $e->getTraceAsString());
            }
            $messages = $modelOpenCode->getMessages();
            file_put_contents($this->logfile, print_r($messages, true), FILE_APPEND);
        }

        return true;
    }


}