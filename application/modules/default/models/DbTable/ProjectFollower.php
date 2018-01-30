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
class Default_Model_DbTable_ProjectFollower extends Zend_Db_Table_Abstract
{

    protected $_name = "project_follower";

    public function countForMember($memberId)
    {
        $select = $this->_db->select()
            ->from('project_follower')
            ->joinUsing('stat_projects', 'project_id')
            ->where('stat_projects.status = ?',100)
            ->where('project_follower.member_id = ?', $memberId);
        return count($select->query()->fetchAll());
    }

    public function countLikesHeGave($memberId)
    {
        $select = $this->_db->select()
            ->from('project_follower')
            ->joinUsing('stat_projects', 'project_id')
            ->where('stat_projects.status = ?', 100)
            ->where('project_follower.member_id = ?', $memberId);
        return count($select->query()->fetchAll());
    }

    public function countLikesHeGot($memberId)
    {
        $select = $this->_db->select()
            ->from('project_follower')
            ->joinUsing('stat_projects', 'project_id')
            ->where('stat_projects.status = ?', 100)            
            ->where('stat_projects.member_id = ?', $memberId);
        return count($select->query()->fetchAll());
    }

     public function countForProject($project_id)
    {
            $selectArr = $this->_db->fetchRow('SELECT count(*) AS count FROM ' . $this->_name . ' WHERE project_id = ' . $project_id);
            return $selectArr ['count'];      
    }

     public function fetchLikesForMember($memberId)
    {
            // $select = $this->_db->select()
            //     ->from('project_follower')
            //     ->joinUsing('stat_projects', 'project_id')
            //     ->where('stat_projects.status = ?',100)
            //     ->where('project_follower.member_id = ?', $memberId);                
            //  $result = $select->query()->fetchAll();

             $sql = "
                        SELECT 
                        f.project_id
                        ,f.member_id
                        ,f.created_at
                        ,p.member_id as project_member_id
                        ,p.project_category_id
                        ,p.status
                        ,p.title
                        ,p.description
                        ,p.image_small
                        ,p.project_created_at
                        ,p.project_changed_at
                        ,p.laplace_score
                        ,p.cat_title
                        ,p.count_likes
                        ,p.count_dislikes
                        FROM project_follower f
                        INNER JOIN stat_projects p ON p.project_id = f.project_id 
                        WHERE (p.status = 100) AND (f.member_id = :member_id) 
                        order by f.created_at desc
             ";

            $resultSet = $this->_db->fetchAll($sql, array('member_id' => $memberId));
            return new Zend_Paginator(new Zend_Paginator_Adapter_Array($resultSet ));     
    }

    /**
     * Override method to update member_ref table.
     *
     * @see Zend_Db_Table_Abstract::insert()
     */
    /*public function insert(array $data)
    {
        Zend_Registry::get('logger')->debug(__METHOD__ . ' - ' . print_r(func_get_args(), true));

        // //if a user follows a project, then we add this project to his
        // //refference table. if there are childs (not project items),
        // //then we will add alos these child-projects
        // $projectTable = new Default_Model_DbTable_Project();
        // $projectRowset = $projectTable->find($data['project_id']);
        // $project = $projectRowset->current();

        // if ($project->type_id == 0) {
        //     //follows a user
        //     $memberRefTable = new Default_Model_DbTable_MemberRef();
        //     $newRef = array(
        //         'member_id' => $data['member_id'],
        //         'project_id' => $data['project_id']
        //     );
        //     $memberRefTable->insert($newRef);
        // } elseif ($project->type_id == 1) {
        //     //follows a project
        //     $memberRefTable = new Default_Model_DbTable_MemberRef();
        //     $newRef = array(
        //         'member_id' => $data['member_id'],
        //         'project_id' => $data['project_id']
        //     );
        //     $memberRefTable->insert($newRef);
        // }

        $memberRefTable = new Default_Model_DbTable_MemberRef();
        $newRef = array(
            'member_id' => $data['member_id'],
            'project_id' => $data['project_id']
        );
        $memberRefTable->insert($newRef);

        return parent::insert($data);
    }*/

    /*public function delete($where)
    {

        $memberRefTable = new Default_Model_DbTable_MemberRef();

        $memberRefTable->delete($where);

        return parent::delete($where);
    }*/


}