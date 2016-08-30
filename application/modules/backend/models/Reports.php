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
class Backend_Model_Reports
{

    public function getReportsForComments($startIndex = 0, $pageSize = 10, $orderBy = 'counter DESC, reports_comment.project_id')
    {
        $sql = "select reports_comment.*, comments.comment_active, count(reports_comment.comment_id) as counter
                from reports_comment
                straight_join comments on comments.comment_id = reports_comment.comment_id
                group by reports_comment.comment_id
              ";
        $limit = ' limit ' . (int)$startIndex . ',' . (int)$pageSize;
        $orderBy = ' order by ' . $orderBy;

        $rowSet = Zend_Db_Table::getDefaultAdapter()->fetchAll($sql.$orderBy.$limit);
        if (0 == count($rowSet)) {
            return array();
        }

        return $rowSet;
    }

    public function getTotalCountForReportedComments()
    {
        $sql = "select '1'
                from reports_comment
                straight_join comments on comments.comment_id = reports_comment.comment_id
                group by reports_comment.comment_id
              ";

        $rowSet = Zend_Db_Table::getDefaultAdapter()->fetchAll($sql);

        return count($rowSet);
    }

    public function getReportsForProjects($startIndex = 0, $pageSize = 10)
    {
        $sql = "select reports_project.*, project.status, count(reports_project.project_id) as counter
                from reports_project
                straight_join project on project.project_id = reports_project.project_id
                group by reports_project.project_id
        ";

        $limit = ' limit ' . (int)$startIndex . ',' . (int)$pageSize;
        $orderBy = ' order by counter DESC, reports_project.project_id';

        $rowSet = Zend_Db_Table::getDefaultAdapter()->fetchAll($sql.$orderBy.$limit);
        if (0 == count($rowSet)) {
            return array();
        }

        return $rowSet;
    }

    public function getTotalCountForReportedProject()
    {
        $sql = "select '1'
                from reports_project
                straight_join project on project.project_id = reports_project.project_id
                group by reports_project.project_id
              ";

        $rowSet = Zend_Db_Table::getDefaultAdapter()->fetchAll($sql);

        return count($rowSet);
    }

}