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
 **/
class Default_Model_Session extends Default_Model_DbTable_Session
{

    /**
     * @param string $identifier
     * @return null|Zend_Db_Table_Row_Abstract
     */
    public function updateOrCreateSession($identifier)
    {
        $newSessionData = $this->createSessionData($identifier);

        $currentSession = $this->readCurrentSessionCookie();
        $rowSessionData = $this->findCurrentSession($currentSession);

        if ($rowSessionData) {
            $rowSessionData->setFromArray($newSessionData);
            $rowSessionData->changed = new Zend_Db_Expr('NOW()');
            $rowSessionData->save();
        } else {
            $rowSessionData = $this->createRow($newSessionData);
            $rowSessionData->save();
        }

        return $rowSessionData;
    }

    /**
     * @param string $identifier
     * @return array
     */
    public function createSessionData($identifier)
    {
        $sessionData = array();
        $sessionData['member_id'] = $identifier;
        $sessionData['uuid'] = Local_Tools_UUID::generateUUID();

        return $sessionData;
    }

    /**
     * @return null|array
     */
    public function readCurrentSessionCookie()
    {
        $config = Zend_Registry::get('config');
        $cookieName = $config->settings->auth_session->remember_me->name;
        if (false === isset($_COOKIE[$cookieName])) {
            return null;
        }
        $cookie = $_COOKIE[$cookieName];
        $cookieLogin = unserialize($cookie);

        if (empty($cookieLogin)) {
            return null;
        }

        $cookieData = array();
        $cookieData['member_id'] = $cookieLogin['mi'];
        $cookieData['uuid'] = $cookieLogin['u'];
        return $cookieData;
    }

    /**
     * @param array $sessionData
     * @return null|Zend_Db_Table_Row_Abstract
     */
    public function findCurrentSession($sessionData)
    {
        if (empty($sessionData)) {
            return null;
        }

        $select = $this->select();
        foreach ($sessionData as $key => $element) {
            $select->where($this->getAdapter()->quoteIdentifier($key) . ' = ?', $element);
        }

        return $this->fetchRow($select);
    }

} 