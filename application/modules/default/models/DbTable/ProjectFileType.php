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
class Default_Model_DbTable_ProjectFileType extends Local_Model_Table
{

    protected $_keyColumnsForRow = array('project_id', 'file_id');

    protected $_key = array('project_id', 'file_id');

    /**
     * @var string
     */
    protected $_name = "project_file_type";
    /**
     * @var array
     */
    protected $_dependentTables = array('Default_Model_DbTable_Project');
    /**
     * @var array
     */
    protected $_referenceMap = array(
        'Category' => array(
            'columns' => 'project_id',
            'refTableClass' => 'Default_Model_Project',
            'refColumns' => 'project_id'
        )
    );

    /**
     * @return array
     * @deprecated
     */
    public function getSelectList()
    {
        $selectArr = $this->_db->fetchAll('SELECT filetype_id, name FROM file_types WHERE is_active=1 ORDER BY order');

        $arrayModified = array();

        $arrayModified[0] = "ProjectFileTypesSelect";
        foreach ($selectArr as $item) {
            $arrayModified[$item['filetype_id']] = stripslashes($item['name']);
        }

        return $arrayModified;
    }

    public function addFileTypeToProject($projectId, $fileId, $fileTypeId)
    {
        //first delte old
        $this->delete('project_id = ' . $projectId . ' AND file_id = ' . $fileId);

        if ($fileTypeId != null && $fileTypeId != 0) {
            $data = array();
            $data['project_id'] = $projectId;
            $data['file_id'] = $fileId;
            $data['filetype_id'] = $fileTypeId;

            return $this->save($data);
        }
        return false;
    }
    
    public function deleteFileTypeOnProject($projectId, $fileId)
    {
        return $this->delete('project_id = ' . $projectId . ' AND file_id = ' . $fileId);
    }

    /**
     * @param int $projectId
     * @param int $fileId
     * @return string
     */
    public function getFileType($projectId, $fileId)
    {
        $sql = 'SELECT f.name FROM project_file_type p join file_types f on p.filetype_id = f.filetype_id WHERE p.project_id = :project_id and p.file_id= :file_id';
        $resultSet = $this->_db->fetchAll($sql, array('project_id' => $projectId, 'file_id' => $fileId));

        if (count($resultSet) > 0) {
            return $resultSet[0]['name'];
        } else {
            return '';
        }
    }

    /**
     * @param int $projectId
     * @return array|null
     */
    public function getProjectFileTypes($projectId)
    {
        $sql = 'SELECT p.project_id,p.file_id,p.filetype_id,f.name FROM project_file_type p join file_types f on p.filetype_id = f.filetype_id WHERE p.project_id = :project_id';
        $resultSet = $this->_db->fetchAll($sql, array('project_id' => $projectId));
        if (count($resultSet) > 0) {
            return $resultSet;
        } else {
            return null;
        }
    }

    public function getProjectFileTypesString($projectId)
    {
        $sql = 'SELECT DISTINCT f.name FROM project_file_type p join file_types f on p.filetype_id = f.filetype_id WHERE p.project_id = :project_id';
        $resultSet = $this->_db->fetchAll($sql, array('project_id' => $projectId));
        $resultString = '';
        if (count($resultSet) > 0) {
            foreach ($resultSet as $item) {                
                $resultString = $resultString . ' <span class="filetypeos" > ' . stripslashes($item['name']) . '</span>';
            }
            return $resultString;
        }
        return '';
    }

}