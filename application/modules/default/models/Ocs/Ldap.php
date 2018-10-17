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
 * Created: 01.08.2018
 */
class Default_Model_Ocs_Ldap
{
    /** @var string */
    protected $baseDnUser;
    /** @var Zend_Config */
    protected $config;
    protected $errMessages;
    protected $errCode;
    protected $baseDnGroup;
    /** @var Zend_Ldap */
    protected $identGroupServer;
    /** @var Zend_Ldap */
    private $identServer;

    /**
     * @inheritDoc
     */
    public function __construct($config = null)
    {
        if (isset($config)) {
            $this->config = $config;
        } else {
            $this->config = Zend_Registry::get('config')->settings->server->ldap;
        }
        $this->baseDnUser = $this->config->baseDn;
        $this->baseDnGroup = $this->config->baseGroupDn;
        $this->errMessages = array();
        $this->errCode = 0;
    }

    /**
     * @return string
     * @throws Zend_Exception
     */
    public static function getBaseDn()
    {
        try {
            return Zend_Registry::get('config')->settings->server->ldap->baseDn;
        } catch (Zend_Exception $e) {
            Zend_Registry::get('logger')->err($e->getMessage());
        }

        return '';
    }

    /**
     * @param int $member_id
     *
     * @return bool
     * @throws Zend_Exception
     * @throws Zend_Ldap_Exception
     */
    public function updateMail($member_id)
    {
        $connection = $this->getConnectionUser();
        $member_data = $this->getMemberData($member_id);

        try {
            $entry = $this->getEntryUser($member_data, $connection);
        } catch (Exception $e) {
            $this->errMessages[] = "Failed.";
            Zend_Registry::get('logger')->err(__METHOD__ . ' - ' . $e->getMessage());

            return false;
        }
        if (empty($entry)) {
            $this->errMessages[] = "Failed.";
            Zend_Registry::get('logger')->err(__METHOD__ . ' - ldap entry for member does not exists. Going to create it.');

            return false;
        }

        $oldUidAttribute = Zend_Ldap_Attribute::getAttribute($entry, 'email');
        Zend_Ldap_Attribute::removeFromAttribute($entry, 'uid', $oldUidAttribute);
        Zend_Ldap_Attribute::removeFromAttribute($entry, 'email', $oldUidAttribute);
        Zend_Ldap_Attribute::setAttribute($entry, 'email', $member_data['email_address']);
        Zend_Ldap_Attribute::setAttribute($entry, 'uid', $member_data['email_address'], true);
        $dn = $entry['dn'];
        $connection->update($dn, $entry);
        $connection->getLastError($this->errCode, $this->errMessages);

        return true;
    }

    /**
     * @return null|Zend_Ldap
     * @throws Zend_Ldap_Exception
     */
    private function getConnectionUser()
    {
        if (false === empty($this->identServer)) {
            return $this->identServer;
        }
        $this->identServer = new Zend_Ldap($this->config);
        $this->identServer->bind();

        return $this->identServer;
    }

    /**
     * @param int $member_id
     *
     * @return array
     * @throws Zend_Exception
     */
    private function getMemberData($member_id, $onlyActive = true)
    {

        $onlyActiveFilter = '';
        if ($onlyActive) {
            $onlyActiveFilter =
                " AND `m`.`is_active` = 1 AND `m`.`is_deleted` = 0 AND `me`.`email_checked` IS NOT NULL AND `me`.`email_deleted` = 0";
        }
        $sql = "
            SELECT `mei`.`external_id`,`m`.`member_id`, `m`.`username`, `me`.`email_address`, `m`.`password`, `m`.`roleId`, `m`.`firstname`, `m`.`lastname`, `m`.`profile_image_url`, `m`.`created_at`, `m`.`changed_at`, `m`.`source_id`
            FROM `member` AS `m`
            LEFT JOIN `member_email` AS `me` ON `me`.`email_member_id` = `m`.`member_id` AND `me`.`email_primary` = 1
            LEFT JOIN `member_external_id` AS `mei` ON `mei`.`member_id` = `m`.`member_id`
            WHERE `m`.`member_id` = :memberId {$onlyActiveFilter}
            ORDER BY `m`.`member_id` DESC
        ";

        $result = Zend_Db_Table::getDefaultAdapter()->fetchRow($sql, array('memberId' => $member_id));
        if (count($result) == 0) {
            throw new Default_Model_Ocs_Exception('member with id ' . $member_id . ' could not found.');
        }

        return $result;
    }

    /**
     * @param array     $member_data
     *
     * @param Zend_Ldap $ldap_connection
     *
     * @return array
     * @throws Default_Model_Ocs_Exception
     * @throws Zend_Ldap_Exception
     */
    public function getEntryUser($member_data, $ldap_connection)
    {
        if (empty($member_data)) {
            throw new Default_Model_Ocs_Exception('given member_data empty');
        }

        $filter = "(uidNumber={$member_data['member_id']})";
        $entries = $ldap_connection->searchEntries($filter, $this->baseDnUser);

        if (count($entries) > 1) {
            throw new Default_Model_Ocs_Exception('found member_id more than once. member_id: ' . $member_data['member_id']);
        }

        if (count($entries) == 1) {
            return $entries[0];
        }

        return array();
    }

    /**
     * @param string $username
     *
     * @return mixed
     * @throws Zend_Ldap_Exception
     */
    public function getEntryUserByDN($username)
    {
        $username = strtolower($username);
        $ldap_connection = $this->getConnectionUser();
        $entry = $ldap_connection->getEntry("cn={$username},{$this->baseDnUser}");

        return $entry;
    }

    /**
     * @param int $member_id
     *
     * @return bool
     * @throws Zend_Exception
     * @throws Zend_Ldap_Exception
     */
    public function updatePassword($member_id)
    {
        $connection = $this->getConnectionUser();
        $member_data = $this->getMemberData($member_id);
        try {
            $entry = $this->getEntryUser($member_data, $connection);
        } catch (Exception $e) {
            $this->errMessages[] = "Failed.";
            Zend_Registry::get('logger')->err(__METHOD__ . ' - ' . $e->getMessage());

            return false;
        }

        if (empty($entry)) {
            $this->errMessages[] = "Failed.";
            Zend_Registry::get('logger')->err(__METHOD__ . ' - ldap entry for member does not exists. member_id:' . $member_id);

            return false;
        }
        Zend_Ldap_Attribute::removeFromAttribute($entry, 'userPassword', Zend_Ldap_Attribute::getAttribute($entry, 'userPassword'));
        $password = '{MD5}' . base64_encode(pack("H*", $member_data['password']));
        Zend_Ldap_Attribute::setAttribute($entry, 'userPassword', $password);

        $connection->update($entry['dn'], $entry);
        $connection->getLastError($this->errCode, $this->errMessages);

        return true;
    }

    /**
     * @param int $member_id
     *
     * @return bool
     * @throws Zend_Exception
     * @throws Zend_Ldap_Exception
     */
    public function updateUser($member_id)
    {
        $connection = $this->getConnectionUser();
        $member_data = $this->getMemberData($member_id);
        try {
            $oldEntry = $this->getEntryUser($member_data, $connection);
        } catch (Exception $e) {
            $this->errMessages[] = "Failed.";
            Zend_Registry::get('logger')->err(__METHOD__ . ' - ' . $e->getMessage());

            return false;
        }
        if (empty($oldEntry)) {
            $this->errMessages[] = "user missing. Going to create one.";
            Zend_Registry::get('logger')->info(__METHOD__ . ' - ldap entry for member does not exists. Going to create it.');

            return $this->createUser($member_id);
        }
        if (strtolower($member_data['username']) != Zend_Ldap_Attribute::getAttribute($oldEntry, 'cn')) {
            $this->errMessages[] = "Fail. username changed. user should be deleted first and than user create.";

            return false;
        }

        $entry = $this->updateIdentEntry($member_data, $oldEntry);
        $connection->update($oldEntry['dn'], $entry);
        $connection->getLastError($this->errCode, $this->errMessages);

        return true;
    }

    /**
     * @param int $member_id
     *
     * @return bool
     * @throws ImagickException
     * @throws Zend_Exception
     * @throws Zend_Ldap_Exception
     */
    public function createUser($member_id)
    {
        $connection = $this->getConnectionUser();
        $member_data = $this->getMemberData($member_id);

        //Only create, if user do not exisits
        try {
            $entry = $this->getEntryUser($member_data, $connection);
        } catch (Exception $e) {
            $this->errMessages[] = "Failed.";
            Zend_Registry::get('logger')->err(__METHOD__ . ' - ' . $e->getMessage());

            return false;
        }
        if (false === empty($entry)) {
            $this->errMessages[] = "user already exists.";
            Zend_Registry::get('logger')->err(__METHOD__ . ' - ldap entry for member does not exists. Going to create it.');

            return false;
        }

        $entry = $this->createEntryUser($member_data);
        $dn = $this->getDnUser($member_data['username']);
        $connection->add($dn, $entry);
        //set avatar
        $this->updateAvatar($member_id);
        $connection->getLastError($this->errCode, $this->errMessages);

        return true;
    }

    /**
     * @param array $member
     *
     * @return array
     */
    private function createEntryUser($member)
    {
        $username = strtolower($member['username']);
        $password = '{MD5}' . base64_encode(pack("H*", $member['password']));
        $jpegPhoto = $this->createJpegPhoto($member['member_id'], $member['profile_image_url']);

        $entry = array();
        Zend_Ldap_Attribute::setAttribute($entry, 'objectClass', 'top');
        Zend_Ldap_Attribute::setAttribute($entry, 'objectClass', 'account', true);
        Zend_Ldap_Attribute::setAttribute($entry, 'objectClass', 'extensibleObject', true);
        Zend_Ldap_Attribute::setAttribute($entry, 'uid', $username);
        Zend_Ldap_Attribute::setAttribute($entry, 'uid', $member['email_address'], true);
        Zend_Ldap_Attribute::setAttribute($entry, 'userPassword', $password);
        Zend_Ldap_Attribute::setAttribute($entry, 'cn', $username);
        Zend_Ldap_Attribute::setAttribute($entry, 'email', $member['email_address']);
        Zend_Ldap_Attribute::setAttribute($entry, 'uidNumber', $member['member_id']);
        Zend_Ldap_Attribute::setAttribute($entry, 'gidNumber', $member['roleId']);
        Zend_Ldap_Attribute::setAttribute($entry, 'memberUid', $member['external_id']);
        if (false === empty(trim($member['firstname']))) {
            Zend_Ldap_Attribute::setAttribute($entry, 'gn', $member['firstname']);
        }
        if (false === empty(trim($member['lastname']))) {
            Zend_Ldap_Attribute::setAttribute($entry, 'sn', $member['lastname']);
        }

        Zend_Ldap_Attribute::setAttribute($entry, 'memberUid', $member['external_id']);
        Zend_Ldap_Attribute::setAttribute($entry, 'jpegPhoto', $jpegPhoto);

        return $entry;
    }

    /**
     * @param int    $member_id
     * @param string $profile_image_url
     *
     * @return bool|string
     * @throws Zend_Exception
     */
    private function createJpegPhoto($member_id, $profile_image_url)
    {
        $imgTempPath = APPLICATION_DATA . '/uploads/tmp/' . $member_id . "_avatar.jpg";

        try {
            $im = new imagick($profile_image_url);
            $im = $im->flattenImages();
        } catch (ImagickException $e) {
            Zend_Registry::get('logger')->err(__METHOD__ . ' - error during converting avatar image. ' . $e->getMessage());

            return false;
        }

        // convert to jpeg
        $im->setImageFormat('jpeg');
        //write image on server
        $im->writeImage($imgTempPath);
        $blob = $im->getImageBlob();
        $im->clear();
        $im->destroy();

        $avatarBase64 = file_get_contents($imgTempPath);

        return $avatarBase64;
    }

    /**
     * @param string $user_name
     *
     * @return string
     */
    private function getDnUser($user_name)
    {
        $username = strtolower($user_name);
        $dn = "cn={$username},{$this->baseDnUser}";

        return $dn;
    }

    /**
     * @param int $member_id
     *
     * @return bool
     * @throws ImagickException
     * @throws Zend_Exception
     * @throws Zend_Ldap_Exception
     */
    public function updateAvatar($member_id)
    {

        $member_data = $this->getMemberData($member_id);
        $imgTempPath = 'img/data/' . $member_id . "_avatar.jpg";
        $im = new imagick($member_data['profile_image_url']);
        $im = $im->flattenImages();

        // convert to jpeg
        $im->setImageFormat('jpeg');
        //write image on server
        $im->writeImage($imgTempPath);
        $im->clear();
        $im->destroy();

        $avatarJpeg = $imgTempPath;
        $avatarBase64 = file_get_contents($avatarJpeg);

        $connection = $this->getConnectionUser();

        try {
            $entry = $this->getEntryUser($member_data, $connection);
        } catch (Exception $e) {
            $this->errMessages[] = "Failed.";
            Zend_Registry::get('logger')->err(__METHOD__ . ' - ' . $e->getMessage());

            return false;
        }
        if (empty($entry)) {
            $this->errMessages[] = "Failed.";
            Zend_Registry::get('logger')->err(__METHOD__ . ' - ldap entry for member does not exists. Going to create it.');

            return false;
        }

        Zend_Ldap_Attribute::removeFromAttribute($entry, 'jpegPhoto', Zend_Ldap_Attribute::getAttribute($entry, 'jpegPhoto'));

        Zend_Ldap_Attribute::setAttribute($entry, 'jpegPhoto', $avatarBase64);

        $dn = $entry['dn'];
        $connection->update($dn, $entry);
        $connection->getLastError($this->errCode, $this->errMessages);

        unlink($imgTempPath);

        return true;
    }

    private function updateIdentEntry($member_data, $oldEntry)
    {
        $entry = $oldEntry;
        Zend_Ldap_Attribute::removeFromAttribute($entry, 'uidNumber', Zend_Ldap_Attribute::getAttribute($oldEntry, 'uidNumber'));
        Zend_Ldap_Attribute::setAttribute($entry, 'uidNumber', $member_data['member_id']);

        Zend_Ldap_Attribute::removeFromAttribute($entry, 'memberUid', Zend_Ldap_Attribute::getAttribute($oldEntry, 'memberUid'));
        Zend_Ldap_Attribute::setAttribute($entry, 'memberUid', $member_data['external_id']);

        Zend_Ldap_Attribute::removeFromAttribute($entry, 'gidNumber', Zend_Ldap_Attribute::getAttribute($oldEntry, 'gidNumber'));
        Zend_Ldap_Attribute::setAttribute($entry, 'gidNumber', $member_data['role_id']);

        Zend_Ldap_Attribute::removeFromAttribute($entry, 'email', Zend_Ldap_Attribute::getAttribute($oldEntry, 'email'));
        Zend_Ldap_Attribute::setAttribute($entry, 'email', $member_data['email_address']);

        Zend_Ldap_Attribute::removeFromAttribute($entry, 'cn', Zend_Ldap_Attribute::getAttribute($oldEntry, 'cn'));
        Zend_Ldap_Attribute::setAttribute($entry, 'cn', $member_data['username']);

        Zend_Ldap_Attribute::removeFromAttribute($entry, 'uid', Zend_Ldap_Attribute::getAttribute($oldEntry, 'uid'));
        Zend_Ldap_Attribute::setAttribute($entry, 'uid', $member_data['username']);

        Zend_Ldap_Attribute::removeFromAttribute($entry, 'uid', Zend_Ldap_Attribute::getAttribute($oldEntry, 'uid'));
        Zend_Ldap_Attribute::setAttribute($entry, 'uid', $member_data['email']);

        Zend_Ldap_Attribute::removeFromAttribute($entry, 'userPassword', Zend_Ldap_Attribute::getAttribute($oldEntry, 'userPassword'));
        $password = '{MD5}' . base64_encode(pack("H*", $member_data['password']));
        Zend_Ldap_Attribute::setAttribute($entry, 'userPassword', $password);

        if (false === empty(trim($member_data['firstname']))) {
            Zend_Ldap_Attribute::removeFromAttribute($entry, 'gn', Zend_Ldap_Attribute::getAttribute($oldEntry, 'gn'));
            Zend_Ldap_Attribute::setAttribute($entry, 'gn', $member_data['firstname']);
        }
        if (false === empty(trim($member_data['lastname']))) {
            Zend_Ldap_Attribute::removeFromAttribute($entry, 'sn', Zend_Ldap_Attribute::getAttribute($oldEntry, 'sn'));
            Zend_Ldap_Attribute::setAttribute($entry, 'sn', $member_data['lastname']);
        }

        //Avatar
        $imgTempPath = 'img/data/' . $member_data['member_id'] . "_avatar.jpg";
        $im = new imagick($member_data['profile_image_url']);
        $im = $im->flattenImages();

        // convert to jpeg
        $im->setImageFormat('jpeg');
        //write image on server
        $im->writeImage($imgTempPath);
        $im->clear();
        $im->destroy();
        $avatarJpeg = $imgTempPath;
        $avatarFileData = file_get_contents($avatarJpeg);
        Zend_Ldap_Attribute::removeFromAttribute($entry, 'jpegPhoto', Zend_Ldap_Attribute::getAttribute($entry, 'jpegPhoto'));
        Zend_Ldap_Attribute::setAttribute($entry, 'jpegPhoto', $avatarFileData);

        return $entry;
    }

    /**
     * @param int $member_id
     *
     * @return bool
     * @throws Zend_Exception
     * @throws Zend_Ldap_Exception
     */
    public function deleteUser($member_id)
    {
        if (empty($member_id)) {
            return false;
        }
        $connection = $this->getConnectionUser();
        $member_data = $this->getMemberData($member_id, false);
        try {
            $entry = $this->getEntryUser($member_data, $connection);
        } catch (Exception $e) {
            $this->errMessages[] = "Failed.";
            Zend_Registry::get('logger')->err(__METHOD__ . ' - ' . $e->getMessage());

            return false;
        }
        $connection->delete($entry['dn']);
        $connection->getLastError($this->errCode, $this->errMessages);

        return true;
    }

    /**
     * @param string $username
     *
     * @throws Zend_Exception
     * @throws Zend_Ldap_Exception
     */
    public function deleteByUsername($username)
    {
        if (empty($username)) {
            throw new Default_Model_Ocs_Exception('given username is empty.');
        }
        $connection = $this->getConnectionUser();
        $username = strtolower($username);
        if (false === $connection->exists("cn={$username},{$this->baseDnUser}")) {
            $connection->getLastError($this->errCode, $this->errMessages);

            return;
        }
        $connection->delete("cn={$username},{$this->baseDnUser}");
        $connection->getLastError($this->errCode, $this->errMessages);
    }

    /**
     * @param      $member_data
     *
     * @param bool $force
     *
     * @return array
     * @throws Zend_Ldap_Exception
     */
    public function createUserFromArray($member_data, $force = false)
    {
        $this->errMessages = array();

        $connection = $this->getConnectionUser();
        $entry = $this->createEntryUser($member_data);
        $dn = $this->getDnUser($member_data['username']);
        $user = null;

        try {
            $user = $this->hasUser($member_data['member_id'], $member_data['username']);
        } catch (Exception $e) {
            $this->errCode = 998;
            $this->errMessages[] = $e->getMessage();
            $user = null;

            return array();
        }

        if (empty($user)) {
            $connection->add($dn, $entry);
            $connection->getLastError($this->errCode, $this->errMessages);

            return $entry;
        }

        if (true === $force) {
            $connection->update($dn, $entry);
            $connection->getLastError($this->errCode, $this->errMessages);
            $this->errMessages[] = "overwritten : " . json_encode($user);

            return $entry;
        }

        $this->errCode = 999;
        $this->errMessages[] = "user already exists.";

        return $user;
    }

    /**
     * @param $member_id
     * @param $username
     *
     * @return array|null
     * @throws Default_Model_Ocs_Exception
     * @throws Zend_Ldap_Exception
     */
    public function hasUser($member_id, $username)
    {
        if (empty($member_id)) {
            throw new Default_Model_Ocs_Exception('given $member_id empty');
        }

        $ldap = $this->getConnectionUser();
        $filter = "(uidNumber={$member_id})";
        $entries = $ldap->searchEntries($filter, $this->baseDnUser);

        if (count($entries) > 1) {
            throw new Default_Model_Ocs_Exception("{$member_id} is ambiguous");
        }

        $username = strtolower($username);
        $entry = $ldap->getEntry("cn={$username},{$this->baseDnUser}");

        if (empty($entry) AND empty($entries)) {
            return null;
        }
        if (empty($entry) AND !empty($entries)) {
            return $entries[0];
        }
        if (!empty($entry) AND empty($entries)) {
            return $entry;
        }

        return $entry;
    }

    /**
     * @param array $member_data
     *
     * @return array|bool
     * @throws Zend_Exception
     * @throws Zend_Ldap_Exception
     */
    public function updateUserFromArray($member_data)
    {
        $newEntry = $this->createEntryUser($member_data);
        $connection = $this->getConnectionUser();
        try {
            $oldEntry = $this->getEntryUser($member_data, $connection);
        } catch (Exception $e) {
            $this->errMessages[] = "Failed.";
            Zend_Registry::get('logger')->warn(__METHOD__ . ' - ' . $e->getMessage());

            return false;
        }
        if (empty($oldEntry)) {
            $this->errMessages[] = "ldap entry for user missing. " . $member_data['member_id'];
            Zend_Registry::get('logger')->warn(__METHOD__ . ' - ldap entry for member does not exists.');

            return false;
        }

        $dn = $oldEntry['dn'];
        $connection->update($dn, $newEntry);
        $connection->getLastError($this->errCode, $this->errMessages);

        return $newEntry;
    }

    /**
     * @return array
     */
    public function getMessages()
    {
        return $this->errMessages;
    }

    /**
     * @param array $errMessages
     *
     * @return Default_Model_Ocs_Ldap
     */
    public function setErrMessages($errMessages)
    {
        $this->errMessages = $errMessages;

        return $this;
    }

    /**
     * @param string $group_name
     * @param int    $group_id
     * @param        $group_path
     * @param        $user_name
     * @param        $group_access
     *
     * @throws Zend_Exception
     * @throws Zend_Ldap_Exception
     */
    public function createGroup($group_name, $group_id, $group_path, $user_name, $group_access)
    {
        $newGroup = $this->createEntryGroup($group_name, $group_id, $group_path, $user_name, $group_access);
        $connection = $this->getConnectionGroup();

        $groupDn = $this->getDnGroup($group_name);

        if ($connection->exists($groupDn)) {
            $this->errMessages[] = "group already exists: {$groupDn}";

            return false;
        }

        $connection->add($groupDn, $newGroup);
        $connection->getLastError($this->errCode, $this->errMessages);

        return $newGroup;
    }

    /**
     * @param string $name
     * @param int    $group_id
     * @param string $group_path
     * @param string $user_name
     * @param string $group_access
     *
     * @return array
     */
    private function createEntryGroup($name, $group_id, $group_path, $user_name, $group_access)
    {
        $entry = array();
        Zend_Ldap_Attribute::setAttribute($entry, 'objectClass', 'top');
        Zend_Ldap_Attribute::setAttribute($entry, 'objectClass', 'groupOfNames', true);
        Zend_Ldap_Attribute::setAttribute($entry, 'objectClass', 'extensibleObject', true);
        Zend_Ldap_Attribute::setAttribute($entry, 'cn', $name);
        Zend_Ldap_Attribute::setAttribute($entry, 'member', null);
        Zend_Ldap_Attribute::setAttribute($entry, 'gidNumber', $group_id);
        Zend_Ldap_Attribute::setAttribute($entry, 'labeledURI', $group_path . ' group_path');
        $entry = $this->addMemberToGroupEntry($entry, $user_name, $group_access);

        return $entry;
    }

    /**
     * @param array  $group
     * @param string $user_username
     * @param string $group_access
     *
     * @return mixed
     */
    private function addMemberToGroupEntry($group, $user_username, $group_access)
    {
        $dn = $this->getDnUser($user_username);
        Zend_Ldap_Attribute::setAttribute($group, 'member', $dn, true);
        if ('owner' == strtolower($group_access)) {
            Zend_Ldap_Attribute::setAttribute($group, 'owner', $dn, true);
        }
        Zend_Ldap_Attribute::removeDuplicatesFromAttribute($group, 'member');
        Zend_Ldap_Attribute::removeDuplicatesFromAttribute($group, 'owner');

        return $group;
    }

    /**
     * @return null|Zend_Ldap
     * @throws Zend_Exception
     * @throws Zend_Ldap_Exception
     */
    private function getConnectionGroup()
    {
        if (false === empty($this->identGroupServer)) {
            return $this->identGroupServer;
        }
        $config = $this->config;
        $config->baseDn = Zend_Registry::get('config')->settings->server->ldap_group->baseDn;
        $this->identGroupServer = new Zend_Ldap($config);
        $this->identGroupServer->bind();

        return $this->identGroupServer;
    }

    /**
     * @param $group_name
     *
     * @return string
     */
    private function getDnGroup($group_name)
    {
        $baseDn = '';
        try {
            $baseDn = Zend_Registry::get('config')->settings->server->ldap_group->baseDn;
        } catch (Zend_Exception $e) {
        }
        $dnGroup = "cn={$group_name},{$baseDn}";

        return $dnGroup;
    }

    public function addGroupMember($user_username, $group_name, $group_access, $group_id = null, $group_path = null)
    {
        $connection = $this->getConnectionGroup();
        $dnGroup = $this->getDnGroup($group_name);

        //Only update, if member exists
        try {
            $entry = $this->getEntryUserByDN($user_username);
        } catch (Exception $e) {
            $this->errMessages[] = "Failed.";
            Zend_Registry::get('logger')->warn(__METHOD__ . ' - ' . $e->getMessage());

            return false;
        }
        if (empty($entry)) {
            $this->errMessages[] = "user not exists. nothing to update.";
            Zend_Registry::get('logger')->warn(__METHOD__ . ' - ldap entry for new group user does not exists.' . $user_username);

            return false;
        }

        //Only update, if group exists
        try {
            $entry = $connection->getEntry($dnGroup);
        } catch (Exception $e) {
            $this->errMessages[] = "Failed.";
            Zend_Registry::get('logger')->warn(__METHOD__ . ' - ' . $e->getMessage());

            return false;
        }
        if (empty($entry) AND (strtolower($group_access) != 'owner')) {
            $this->errMessages[] = "group not exists. nothing to update.";
            Zend_Registry::get('logger')->warn(__METHOD__ . ' - ldap entry for group does not exists.');

            return false;
        }
        if (empty($entry) AND (strtolower($group_access) == 'owner')) {
            if (empty($group_id) OR empty($group_path)) {
                Zend_Registry::get('logger')->warn(__METHOD__ . ' - ldap entry for group does not exists and owner is given. But group_id or group_path is empty.');

                return false;
            }
            $group = $this->createGroup($group_name, $group_id, $group_path, $user_username, $group_access);

            return $group;
        }


        $group = $this->addMemberToGroupEntry($entry, $user_username, $group_access);

        $connection->update($dnGroup, $group);
        $connection->getLastError($this->errCode, $this->errMessages);

        return $group;
    }

}