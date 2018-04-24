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
class Default_Model_DbTable_Tags extends Local_Model_Table
{
    /** @var  Zend_Cache_Core */
    protected $cache;
    
    protected $_name = "tag";

    protected $_keyColumnsForRow = array('tag_id');

    protected $_key = 'tag_id';

    protected $_defaultValues = array(
        'tag_id'   => null,
        'tag_name' => null
    );
    
    const TAG_TYPE_PROJECT = 1;
    
    const TAG_GROUP_USER = 5;
    const TAG_GROUP_CATEGORY = 6;
    const TAG_GROUP_LICENSE = 7;
    const TAG_GROUP_PACKAGETYPE = 8;
    const TAG_GROUP_ARCHITECTURE = 9;


    /**
     * @inheritDoc
     */
    public function init()
    {
        parent::init(); // TODO: Change the autogenerated stub
        $this->cache = Zend_Registry::get('cache');
    }
    
    
    /**
     * @param string $tags
     *
     * @return array
     */
    public function storeTags($tags)
    {
        $arrayTags = explode(',', $tags);
        $sqlFetchTag = "SELECT `tag_id` FROM tag WHERE tag_name = :name";
        $resultIds = array();
        foreach ($arrayTags as $tag) {
            $resultRow = $this->_db->fetchRow($sqlFetchTag, array('name' => $tag));
            if (empty($resultRow)) {
                $this->_db->insert($this->_name, array('tag_name' => $tag));
                $resultIds[] = $this->_db->lastInsertId();
            } else {
                $resultIds[] = $resultRow['tag_id'];
            }
        }

        return $resultIds;
    }

     /**
     * @param string $tags
     *
     * @return array
     */
    public function storeTagsUser($tags)
    {
        $arrayTags = explode(',', strtolower($tags));
        $sqlFetchTag = "SELECT `tag_id` FROM tag WHERE tag_name = :name";
        $resultIds = array();
        foreach ($arrayTags as $tag) {
            if(strlen(trim($tag))==0) 
            {
                continue;
            }
        
            $resultRow = $this->_db->fetchRow($sqlFetchTag, array('name' => $tag));
            if (empty($resultRow)) {
                $this->_db->insert($this->_name, array('tag_name' => $tag));
                $tagId = $this->_db->lastInsertId();
                $resultIds[] = $tagId;

                $sql = "SELECT tag_group_item_id FROM tag_group_item WHERE tag_group_id = :group_id AND tag_id = :tag_id";
                $resultSet = $this->_db->fetchRow($sql, array('group_id' => Default_Model_DbTable_Tags::TAG_GROUP_USER, 'tag_id' =>$tagId));
                if (empty($resultSet)) {
                    $this->_db->insert('tag_group_item', array('tag_group_id' => Default_Model_DbTable_Tags::TAG_GROUP_USER, 'tag_id' => $tagId));                    
                }

            } else {
                $resultIds[] = $resultRow['tag_id'];

                $sql = "SELECT tag_group_item_id FROM tag_group_item WHERE tag_group_id = :group_id AND tag_id = :tag_id";
                $resultSet = $this->_db->fetchRow($sql, array('group_id' => Default_Model_DbTable_Tags::TAG_GROUP_USER, 'tag_id' =>$resultRow['tag_id']));
                if (empty($resultSet)) {
                    $this->_db->insert('tag_group_item', array('tag_group_id' => Default_Model_DbTable_Tags::TAG_GROUP_USER, 'tag_id' => $resultRow['tag_id']));                    
                }
            }
        }

        return $resultIds;
    }
    
    
    /**
     * @return array
     */
    public function fetchArchitectureTagsForSelect()
    {
        return $this->fetchForGroupForSelect(Default_Model_DbTable_Tags::TAG_GROUP_ARCHITECTURE);
    }
    
    
    
    /**
     * @return array
     */
    public function fetchLicenseTagsForSelect()
    {
        return $this->fetchForGroupForSelect(Default_Model_DbTable_Tags::TAG_GROUP_LICENSE);
    }
    
    /**
     * @param int|array $groupId
     * @return array
     */
    public function fetchForGroupForSelect($groupId)
    {
        $str = is_array($groupId) ? implode(',', $groupId) : $groupId;
        /** @var Zend_Cache_Core $cache */
        $cache = $this->cache;
        $cacheName = __FUNCTION__ . '_' . md5($str);

        if (false === ($tags = $cache->load($cacheName))) {
            $inQuery = '?';
            if (is_array($groupId)) {
                $inQuery = implode(',', array_fill(0, count($groupId), '?'));
            }

            $sql = "
                SELECT t.* FROM tag t
                JOIN tag_group_item g on g.tag_id = t.tag_id
                WHERE g.tag_group_id IN ($inQuery)
                ORDER BY t.tag_fullname
                ";

            $tagsList = $this->_db->query($sql, $groupId)->fetchAll();
            
            foreach ($tagsList as $tag) {
               $tags[$tag['tag_id']] = $tag['tag_fullname']; 
            }
            
            if (count($tags) == 0) {
                $tags = array();
            }
            $cache->save($tags, $cacheName, array(), 3600);
        }
        return $tags;
    }
    
    /**
     * @param int $projectId
     * @return array
     */
    public function fetchLicenseTagsForProject($projectId)
    {
        return $this->fetchTagsForProject($projectId, $this::TAG_GROUP_LICENSE);
    }
    
    
    /**
     * @param int $projectId
     * @return array
     */
    public function fetchArchitectureTagsForProject($projectId)
    {
        return $this->fetchTagsForProject($projectId, $this::TAG_GROUP_ARCHITECTURE);
    }
    
    
    /**
     * @param int $projectId Description
     * @param int|array $groupId
     * @return array
     */
    public function fetchTagsForProject($projectId, $groupId)
    {
        $typeId = $this::TAG_TYPE_PROJECT;

        $sql = "
            SELECT `to`.*, t.tag_fullname FROM tag_object `to`
            JOIN tag t on t.tag_id = to.tag_id
            JOIN tag_group_item g on g.tag_id = t.tag_id 
            WHERE g.tag_group_id = $groupId 
            and `to`.tag_type_id = $typeId 
            and `to`.tag_object_id = $projectId
            ";
        
        $tagsList = $this->_db->query($sql)->fetchAll();
        $tags = $tagsList;
        return $tags;
    }
    
    

}