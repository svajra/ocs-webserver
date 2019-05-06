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
class Default_Model_DbTable_PploadFilesDownloaded extends Local_Model_Table
{
    /** @var  Zend_Cache_Core */
    protected $cache;
    
    protected $_name = "ppload.ppload_files_downloaded_all";

    protected $_keyColumnsForRow = array('id');

    protected $_key = 'id';

    
    public function generateId()
    {
        $id = time() + mt_rand(1, 1000);
        while (isset($this->$id)) {
            $id = time() + mt_rand(1, 1000);
        }
        return $id;
    }
    
    public function getNewId()
    {
        $result = $this->getAdapter()->query('SELECT UUID_SHORT()')->fetch();

        return $result['UUID_SHORT()'];
    }

    /**
     * @inheritDoc
     */
    public function init()
    {
        parent::init(); // TODO: Change the autogenerated stub
        $this->cache = Zend_Registry::get('cache');
    }
    
    public function fetchCountDownloadsTodayForProject($collection_id)
    {
        if(empty($collection_id)) {
            return 0;
        }
        
        $today = (new DateTime())->modify('-1 day');
        $filterDownloadToday = $today->format("Y-m-d H:i:s");

        $sql = "    SELECT COUNT(1) AS cnt
                    FROM ppload.ppload_files_downloaded_all f
                    WHERE f.collection_id = " . $collection_id . " 
                    AND f.downloaded_timestamp >= '" . $filterDownloadToday . "'               
                   ";        
        $result = $this->_db->query($sql)->fetchAll();      
        return $result[0]['cnt'];
    }     
    
    
    public function fetchCountDownloadsForFileAllTime($collectionId, $file_id)
    {
        if(empty($file_id) || empty($collectionId)) {
            return 0;
        }
        
        $sql = "    SELECT count_dl AS cnt
                    FROM ppload.ppload_files_downloaded_all f
                    WHERE f.collection_id = " . $collectionId . " 
                    AND f.file_id = " . $file_id . "
                   ";        
        $result = $this->_db->query($sql)->fetchAll();      
        return $result[0]['cnt'];
    }     

        public function fetchCountDownloadsForFileToday($collectionId, $file_id)
    {
        if(empty($file_id) || empty($collectionId)) {
            return 0;
        }
        
        $sql = "    SELECT COUNT(1) AS cnt
                    FROM ppload.ppload_files_downloaded_all f
                    WHERE f.collection_id = " . $collectionId . " 
                    AND f.file_id = " . $file_id . "
                    AND f.downloaded_timestamp >= DATE_FORMAT(NOW(),'%Y-%m-%d 00:00:01')  
                   ";        
        $result = $this->_db->query($sql)->fetchAll();      
        return $result[0]['cnt'];
    }     
    
}