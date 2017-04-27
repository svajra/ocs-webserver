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
class Default_Model_DbTable_ProjectCategory extends Local_Model_Table
{

    const CATEGORY_ACTIVE = 1;
    const CATEGORY_INACTIVE = 0;
    const CATEGORY_NOT_DELETED = 0;
    const CATEGORY_DELETED = 1;

    const ORDERED_TITLE = 'title';
    const ORDERED_ID = 'project_category_id';
    const ORDERED_HIERARCHIC = 'lft';

    protected $_keyColumnsForRow = array('project_category_id');

    protected $_key = 'project_category_id';

    /**
     * @var string
     */
    protected $_name = "project_category";
    /**
     * @var array
     */
    protected $_dependentTables = array('Default_Model_DbTable_Project');
    /**
     * @var array
     */
    protected $_referenceMap = array(
        'Category' => array(
            'columns' => 'project_category_id',
            'refTableClass' => 'Default_Model_Project',
            'refColumns' => 'project_category_id'
        )
    );

    /**
     * @return array
     * @deprecated
     */
    public function getSelectList()
    {
        $selectArr = $this->_db->fetchAll('SELECT project_category_id, title FROM project_category WHERE is_active=1 AND is_deleted=0 ORDER BY orderPos');

        $arrayModified = array();

        $arrayModified[0] = "ProjectAddFormCatSelect";
        foreach ($selectArr as $item) {
            $arrayModified[$item['project_category_id']] = stripslashes($item['title']);
        }

        return $arrayModified;
    }

    /**
     * @return array
     * @deprecated
     */
    public function getInternSelectList()
    {
        $selectArr = $this->_db->fetchAll('SELECT project_category_id, title FROM project_category WHERE is_deleted=0 ORDER BY orderPos');

        $arrayModified = array();

        $arrayModified[0] = "ProjectAddFormCatSelect";
        foreach ($selectArr as $item) {
            $arrayModified[$item['project_category_id']] = stripslashes($item['title']);
        }

        return $arrayModified;
    }

    /**
     * @param $status
     * @param $id
     *
     */
    public function setStatus($status, $id)
    {
        $updateValues = array(
            'is_active' => $status,
            'changed_at' => new Zend_Db_Expr('Now()')
        );

        $this->update($updateValues, 'project_category_id=' . $id);
    }

    /**
     * @param $id
     *
     */
    public function setDelete($id)
    {
        $updateValues = array(
            'is_active' => 0,
            'is_deleted' => 1,
            'deleted_at' => new Zend_Db_Expr('Now()')
        );

        $this->update($updateValues, 'project_category_id=' . $id);
    }

    /**
     * @return Zend_Db_Table_Rowset_Abstract
     * @deprecated
     */
    public function fetchAllActive()
    {

        $cache = Zend_Registry::get('cache');
        $cacheName = __FUNCTION__;
        if (!($categories = $cache->load($cacheName))) {
            $q = $this->select()
                ->where('is_active = ?', 1)
                ->where('is_deleted = ?', 0)
                ->order('orderPos');
            $categories = $this->fetchAll($q);
            $cache->save($categories, $cacheName);
        }

        return $categories;
    }

    /**
     * @param int|array $nodeId
     * @return array
     */
    public function fetchActive($nodeId)
    {
        $inQuery = '?';
        if (is_array($nodeId)) {
            $inQuery = implode(',', array_fill(0, count($nodeId), '?'));
        }

        $sql = "SELECT *,
                  (SELECT
                      `project_category_id`
                       FROM
                         `project_category` AS `t2`
                       WHERE
                         `t2`.`lft`  < `node`.`lft` AND
                         `t2`.`rgt` > `node`.`rgt`
                         AND `t2`.`is_deleted` = 0
                       ORDER BY
                         `t2`.`rgt`-`node`.`rgt` ASC
                       LIMIT 1) AS `parent`
                FROM {$this->_name} as node
                WHERE project_category_id IN ($inQuery)
                AND is_active = 1
                ";

        $active = $this->_db->query($sql, $nodeId)->fetchAll();
        if (count($active)) {
            return $active;
        } else {
            return array();
        }
    }

    /**
     * @param int|array $nodeId
     * @return array
     */
    public function fetchActiveOrder($nodeId)
    {
        $inQuery = '?';
        if (is_array($nodeId)) {
            $inQuery = implode(',', array_fill(0, count($nodeId), '?'));
        }

        $sql = "SELECT *,
                  (SELECT
                      `project_category_id`
                       FROM
                         `project_category` AS `t2`
                       WHERE
                         `t2`.`lft`  < `node`.`lft` AND
                         `t2`.`rgt` > `node`.`rgt`
                         AND `t2`.`is_deleted` = 0
                       ORDER BY
                         `t2`.`rgt`-`node`.`rgt`ASC
                       LIMIT
                         1) AS `parent`
                FROM {$this->_name} as node
                WHERE project_category_id IN ($inQuery)
                AND is_active = 1
                ";

        $active = $this->_db->query($sql, $nodeId)->fetchAll();
        if (count($active)) {
            return $active;
        } else {
            return array();
        }
    }

    /* ------------------------ */
    /* New Nested Set Functions */
    /* ------------------------ */

    /**
     * @param $title
     * @return null|Zend_Db_Table_Row_Abstract
     */
    public function appendNewElement($title)
    {
        $root = $this->fetchRoot();

        $data['rgt'] = $root->rgt - 1;
        $data['title'] = $title;

        return $this->addNewElement($data);
    }

    public function fetchRoot()
    {
        return $this->fetchRow('`lft` = 0');
    }

    /**
     * @param array $data
     * @return null|Zend_Db_Table_Row_Abstract
     */
    public function addNewElement($data)
    {
        $this->_db->beginTransaction();
        try {
            $this->_db->query("UPDATE {$this->_name} SET rgt = rgt + 2 WHERE rgt > :param_right;",
                array('param_right' => $data['rgt']));
            $this->_db->query("UPDATE {$this->_name} SET lft = lft + 2 WHERE lft > :param_right;",
                array('param_right' => $data['rgt']));
            $this->_db->query("INSERT INTO {$this->_name} (`lft`, `rgt`, `title`, `is_active`, `name_legacy`, `xdg_type`) VALUES (:param_right + 1, :param_right + 2, :param_title, :param_status, :param_legacy, :param_xgd);",
                array(
                    'param_right' => $data['rgt'],
                    'param_title' => $data['title'],
                    'param_status' => $data['is_active'],
                    'param_legacy' => $data['name_legacy'],
                    'param_xgd' => $data['xdg_type']
                ));
            $this->_db->commit();
        } catch (Exception $e) {
            $this->_db->rollBack();
            Zend_Registry::get('logger')->err(__METHOD__ . ' - ' . print_r($e, true));
        }

        return $this->fetchRow('lft = ' . ($data['rgt'] + 1));
    }

    public function fetchMainCatForSelect($orderBy = self::ORDERED_HIERARCHIC)
    {
        $root = $this->fetchRoot();
        $resultRows = $this->fetchImmediateChildren($root['project_category_id'], $orderBy);

        $resultForSelect = $this->prepareDataForFormSelect($resultRows);

        return $resultForSelect;
    }

    /**
     * @param int|array $nodeId
     * @param string $orderBy
     * @return array
     */
    public function fetchImmediateChildren($nodeId, $orderBy = 'lft')
    {
        $inQuery = '?';
        if (is_array($nodeId)) {
            $inQuery = implode(',', array_fill(0, count($nodeId), '?'));
        }
        $sql = '
            SELECT node.*, (SELECT parent.project_category_id FROM project_category AS parent WHERE parent.lft < node.lft AND parent.rgt > node.rgt ORDER BY parent.rgt-node.rgt LIMIT 1) AS parent
            FROM project_category AS node
            WHERE node.is_active = 1
            HAVING parent IN (' . $inQuery . ')
            ORDER BY node.' . $orderBy . '
            ';
        $children = $this->_db->query($sql, $nodeId)->fetchAll();
        if (count($children)) {
            return $children;
        } else {
            return array();
        }
    }

    /**
     * @return array
     */
    public function fetchTreeForJTable($cat_id)
    {
        $resultRows = $this->fetchTree(1000, 0, false, true, 5, true);

        $resultForSelect = array();
        foreach ($resultRows as $row) {
            if (($row['project_category_id'] == $cat_id) OR ($row['parent'] == $cat_id)) {
                continue;
            }
            $resultForSelect[] = array('DisplayText' => $row['title_show'], 'Value' => $row['project_category_id']);
        }

        return $resultForSelect;
    }

    /**
     * @param int $pageSize
     * @param int $startIndex
     * @param bool $isActive
     * @param bool $withRoot
     * @param int $depth
     * @return array
     */
    public function fetchTree(
        $pageSize = 10,
        $startIndex = 0,
        $isActive = false,
        $withRoot = true,
        $depth = null,
        $clearCache = false
    ) {
        /** @var Zend_Cache_Core $cache */
        $cache = Zend_Registry::get('cache');
        $cacheName = __FUNCTION__ . '_' . md5((string)$pageSize . (string)$startIndex . (int)$isActive . (int)$withRoot . (string)$depth);
        if ($clearCache) {
            $cache->remove($cacheName);
        }
        if (!($tree = $cache->load($cacheName))) {
            $whereWithRoot = $withRoot == true ? '' : ' AND node.lft > 0';
            $whereActive = $isActive == true ? ' AND node.is_active = 1 AND node.is_deleted = 0' : '';
            $sqlGetDepth = false === is_null($depth) ? $this->_db->quoteInto(' having depth <= ?', $depth) : '';


            $limit = " LIMIT {$startIndex},{$pageSize} ;";
            $sql = "
                SELECT node.*,CONCAT( REPEAT( '&nbsp;&nbsp;', (COUNT(parent.title) - 1) ), node.title) AS title_show, pc.product_counter, (COUNT(parent.title) - 1) as depth,
                  (SELECT
                      `project_category_id`
                       FROM
                         `project_category` AS `t2`
                       WHERE
                         `t2`.`lft`  < `node`.`lft` AND
                         `t2`.`rgt` > `node`.`rgt`
                         AND `t2`.`is_deleted` = 0
                       ORDER BY
                         `t2`.`rgt`-`node`.`rgt`ASC
                       LIMIT
                         1) AS `parent`
                FROM {$this->_name} AS node
                INNER JOIN {$this->_name} AS parent
                LEFT JOIN
                     (SELECT
                        project.project_category_id,
                        count(project.project_category_id) AS product_counter
                        FROM
                            project
                        WHERE project.is_active = 1 AND project.is_deleted = 0 and project.type_id = 1
                        GROUP BY project.project_category_id) AS pc ON pc.project_category_id = node.project_category_id
                    WHERE node.lft BETWEEN parent.lft AND parent.rgt
                " . $whereActive . $whereWithRoot . "
                GROUP BY node.project_category_id
                " . $sqlGetDepth . "
                ORDER BY node.lft
            ";

            $tree = $this->_db->query($sql . $limit)->fetchAll();
            $cache->save($tree, $cacheName);
        }
        return $tree;
    }

    /**
     * @return array
     */
    public function fetchTreeForJTableStores($cat_id)
    {
        $resultRows = $this->fetchTree(1000, 0, true, true, 5, true);

        $resultForSelect = array();
        foreach ($resultRows as $row) {
            if (($row['project_category_id'] == $cat_id) OR ($row['parent'] == $cat_id)) {
                continue;
            }
            $resultForSelect[] = array('DisplayText' => $row['title_show'], 'Value' => $row['project_category_id']);
        }

        return $resultForSelect;
    }

    /**
     * @param array $node
     * @param int $newLeftPosition
     * @return bool
     * @throws Zend_Exception
     * @deprecated use moveTo instead
     */
    public function moveElement($node, $newLeftPosition)
    {

        $space = $node['rgt'] - $node['lft'] + 1;
        $distance = $newLeftPosition - $node['lft'];
        $srcPosition = $node['lft'];

        //for backwards movement, we have to fix some values
        if ($distance < 0) {
            $distance -= $space;
            $srcPosition += $space;
        }

        $this->_db->beginTransaction();

        try {
            // create space for subtree
            $this->_db->query("UPDATE {$this->_name} SET rgt = rgt + :space WHERE rgt >= :newLeftPosition;",
                array('space' => $space, 'newLeftPosition' => $newLeftPosition));
            $this->_db->query("UPDATE {$this->_name} SET lft = lft + :space WHERE lft >= :newLeftPosition;",
                array('space' => $space, 'newLeftPosition' => $newLeftPosition));

            // move tree
            $this->_db->query("UPDATE {$this->_name} SET lft = lft + :distance, rgt = rgt + :distance WHERE lft >= :srcPosition AND rgt < :srcPosition + :space;",
                array('distance' => $distance, 'srcPosition' => $srcPosition, 'space' => $space));

            // remove old space
            $this->_db->query("UPDATE {$this->_name} SET rgt = rgt - :space WHERE rgt > :srcPosition;",
                array('space' => $space, 'srcPosition' => $srcPosition));
            $this->_db->query("UPDATE {$this->_name} SET lft = lft - :space WHERE lft >= :srcPosition;",
                array('space' => $space, 'srcPosition' => $srcPosition));

            // move it
            $this->_db->commit();
        } catch (Exception $e) {
            $this->_db->rollBack();
            Zend_Registry::get('logger')->err(__METHOD__ . ' - ' . print_r($e, true));
            return false;
        }

        return true;

    }

    public function findAncestor($data)
    {
        $resultRow = $this->fetchRow("rgt = {$data['lft']} - 1");

        if (($resultRow->rgt - $resultRow->lft) > 1) {
            $resultRow = $this->fetchRow("lft = {$resultRow->lft} - 2");
        }

        return $resultRow;
    }

    /**
     * @param $catId
     * @return array|mixed
     */
    public function fetchAncestorsAsId($catId)
    {
        $sql = '
        SELECT node.title, GROUP_CONCAT(parent.project_category_id ORDER BY parent.lft) AS ancestors 
        FROM project_category AS node
        LEFT JOIN project_category AS parent ON parent.lft < node.lft AND parent.rgt > node.rgt AND parent.lft > 0
        WHERE node.project_category_id = :categoryId
        GROUP BY node.project_category_id
        HAVING ancestors IS NOT NULL
        ';

        $result = $this->_db->fetchRow($sql, array('categoryId' => $catId));

        if ($result AND count($result) > 0) {
            return $result;
        } else {
            return array();
        }
    }

    /**
     * @param $data
     * @return array|null
     */
    public function findPreviousSibling($data)
    {
        $parent = $this->fetchParentForId($data);
        $parent_category_id = $parent->project_category_id;

        $sql = "SELECT node.project_category_id, node.lft, node.rgt, node.title, (SELECT
                       `project_category_id`
                        FROM
                          `project_category` AS `t2`
                        WHERE
                          `t2`.`lft`  < `node`.`lft` AND
                          `t2`.`rgt` > `node`.`rgt`
                        ORDER BY
                          `t2`.`rgt`-`node`.`rgt`ASC
                        LIMIT
                          1) AS `parent_category_id`
                FROM project_category AS node,
                     project_category AS parent
                WHERE node.lft BETWEEN parent.lft AND parent.rgt
                GROUP BY node.project_category_id
                HAVING parent_category_id = :parent_category_id
                ORDER BY node.lft";

        $siblings = $this->_db->query($sql, array('parent_category_id' => $parent_category_id))->fetchAll();

        $resultRow = null;
        $bufferRow = null;

        foreach ($siblings as $row) {
            if ($row['project_category_id'] != $data['project_category_id']) {
                $bufferRow = $row;
                continue;
            }
            $resultRow = $bufferRow;
        }

        return $resultRow;
    }

    public function fetchParentForId($data)
    {
        $sql = "
        SELECT title, (SELECT
              `project_category_id`
               FROM
                 `project_category` AS `t2`
               WHERE
                 `t2`.`lft`  < `node`.`lft` AND
                 `t2`.`rgt` > `node`.`rgt`
               ORDER BY
                 `t2`.`rgt`-`node`.`rgt`ASC
               LIMIT
                 1) AS `parent`
        FROM project_category AS node
        WHERE `project_category_id` = :category_id
        ORDER BY (rgt-lft) DESC
        ";
        $resultRow = $this->_db->query($sql, array('category_id' => $data['project_category_id']))->fetch();

        return $this->find($resultRow['parent'])->current();
    }

    /**
     * @param $data
     * @return array|null
     */
    public function findNextSibling($data)
    {
        $parent = $this->fetchParentForId($data);
        $parent_category_id = $parent->project_category_id;

        $sql = "SELECT node.project_category_id, node.lft, node.rgt, node.title, (SELECT
                       `project_category_id`
                        FROM
                          `project_category` AS `t2`
                        WHERE
                          `t2`.`lft`  < `node`.`lft` AND
                          `t2`.`rgt` > `node`.`rgt`
                        ORDER BY
                          `t2`.`rgt`-`node`.`rgt`ASC
                        LIMIT
                          1) AS `parent_category_id`
                FROM project_category AS node,
                     project_category AS parent
                WHERE node.lft BETWEEN parent.lft AND parent.rgt
                GROUP BY node.project_category_id
                HAVING parent_category_id = :parent_category_id
                ORDER BY node.lft";

        $siblings = $this->_db->query($sql, array('parent_category_id' => $parent_category_id))->fetchAll();

        $resultRow = null;
        $found = false;

        foreach ($siblings as $row) {
            if ($found == true) {
                $resultRow = $row;
                break;
            }
            if ($row['project_category_id'] == $data['project_category_id']) {
                $found = true;
                continue;
            }
        }

        return $resultRow;
    }

    public function findPreviousElement($data)
    {
        $resultRow = $this->fetchRow("rgt = {$data['lft']} - 1");

        if (($resultRow->rgt - $resultRow->lft) > 1) {
            $resultRow = $this->fetchRow("lft = {$resultRow->rgt} - 2");
        }

        return $resultRow;
    }

    public function findNextElement($data)
    {
        $resultRow = $this->fetchRow("lft = {$data['rgt']} + 1");

        if (($resultRow->rgt - $resultRow->lft) > 1) {
            $resultRow = $this->fetchRow("lft = {$resultRow->lft} + 2");
        }

        return $resultRow;
    }

    /**
     * @param string|array $nodeId
     * @param array $options
     * @return array
     * @throws Zend_Exception
     */
    public function fetchChildTree($nodeId, $options = array())
    {
        $clearCache = false;
        if (isset($options['clearCache'])) {
            $clearCache = $options['clearCache'];
            unset($options['clearCache']);
        }

        /** @var Zend_Cache_Core $cache */
        $cache = Zend_Registry::get('cache');
        $cacheName = __FUNCTION__ . '_' . md5(serialize($nodeId) . serialize($options));

        if ($clearCache) {
            $cache->remove($cacheName);
        }

        if (!($tree = $cache->load($cacheName))) {

            $extSqlWhereActive = " AND o.is_active = 1";
            if (isset($options['isActive']) AND $options['isActive'] == false) {
                $extSqlWhereActive = '';
            }

            $extSqlHavingDepth = '';
            if (isset($options['depth'])) {
                $extSqlHavingDepth = " HAVING depth <= " . (int)$options['depth'];
            }

            $inQuery = '?';
            if (is_array($nodeId)) {
                $inQuery = implode(',', array_fill(0, count($nodeId), '?'));
            }

            $sql = "SELECT o.*,
                      COUNT(p.project_category_id)-1 AS depth,
                      CONCAT( REPEAT( '&nbsp;&nbsp;', (COUNT(p.title) - 1) ), o.title) AS title_show,
                      pc.product_counter
                    FROM project_category AS n
                    INNER JOIN project_category AS p
                    INNER JOIN project_category AS o
                    LEFT JOIN (SELECT
                                 project.project_category_id,
                                 count(project.project_category_id) AS product_counter
                               FROM
                                 project
                               WHERE project.is_active = 1 AND project.is_deleted = 0 and project.type_id = 1
                               GROUP BY project.project_category_id) AS pc ON pc.project_category_id = o.project_category_id
                    WHERE o.lft BETWEEN p.lft AND p.rgt
                          AND o.lft BETWEEN n.lft AND n.rgt
                          AND n.project_category_id IN ({$inQuery})
                          AND o.lft > p.lft AND o.lft > n.lft
                          {$extSqlWhereActive}
                    GROUP BY o.lft
                    {$extSqlHavingDepth}
                    ORDER BY o.lft;
                    ;
                    ";
            $tree = $this->_db->query($sql, $nodeId)->fetchAll();
            $cache->save($tree, $cacheName);
        }

        return $tree;
    }

    /**
     * @param int|array $nodeId
     * @param bool $isActive
     * @return array Set of subnodes
     */
    public function fetchChildElements($nodeId, $isActive = true)
    {
        if (is_null($nodeId) OR $nodeId == '') {
            return array();
        }

        $inQuery = '?';
        if (is_array($nodeId)) {
            $inQuery = implode(',', array_fill(0, count($nodeId), '?'));
        }
        $whereActive = $isActive == true ? ' AND o.is_active = 1' : '';
        $sql = "
            SELECT o.*,
                   COUNT(p.project_category_id)-2 AS depth
                FROM project_category AS n,
                     project_category AS p,
                     project_category AS o
               WHERE o.lft BETWEEN p.lft AND p.rgt
                 AND o.lft BETWEEN n.lft AND n.rgt
                 AND n.project_category_id IN ({$inQuery})
                 {$whereActive}
            GROUP BY o.lft
            HAVING depth > 0
            ORDER BY o.lft;
        ";
        $children = $this->_db->query($sql, $nodeId)->fetchAll();
        if (count($children)) {
            return $children;
        } else {
            return array();
        }
    }

    /**
     * @param int|array $nodeId
     * @param bool $isActive
     * @return array Set of subnodes
     */
    public function fetchChildIds($nodeId, $isActive = true)
    {
        if (empty($nodeId) OR $nodeId == '') {
            return array();
        }

        /** @var Zend_Cache_Core $cache */
        $cache = Zend_Registry::get('cache');
        $cacheName = __FUNCTION__ . '_' . md5(serialize($nodeId) . (int)$isActive);

        if (($children = $cache->load($cacheName))) {
            return $children;
        }

        $inQuery = '?';
        if (is_array($nodeId)) {
            $inQuery = implode(',', array_fill(0, count($nodeId), '?'));
        }
        $whereActive = $isActive == true ? ' AND o.is_active = 1' : '';
        $sql = "
            SELECT o.project_category_id
                FROM project_category AS n,
                     project_category AS p,
                     project_category AS o
               WHERE o.lft BETWEEN p.lft AND p.rgt
                 AND o.lft BETWEEN n.lft AND n.rgt
                 AND n.project_category_id IN ({$inQuery})
                 {$whereActive}
            GROUP BY o.lft
            HAVING COUNT(p.project_category_id)-2 > 0
            ORDER BY o.lft;
        ";
        $children = $this->_db->query($sql, $nodeId)->fetchAll();
        if (count($children)) {
            $result = $this->flattenArray($children);
            $cache->save($result, $cacheName);
            return $result;
        } else {
            return array();
        }
    }

    /**
     *
     * @flatten multi-dimensional array
     *
     * @param array $array
     *
     * @return array
     *
     */
    private function flattenArray(array $array)
    {
        $ret_array = array();
        foreach (new RecursiveIteratorIterator(new RecursiveArrayIterator($array)) as $value) {
            $ret_array[] = $value;
        }
        return $ret_array;
    }

    public function fetchImmediateChildrenIds($nodeId, $orderBy = self::ORDERED_HIERARCHIC)
    {
        $sql = "
                SELECT node.project_category_id
                FROM project_category AS node
                WHERE node.is_active = 1
                HAVING (SELECT parent.project_category_id FROM project_category AS parent WHERE parent.lft < node.lft AND parent.rgt > node.rgt ORDER BY parent.rgt-node.rgt LIMIT 1) = ?
                ORDER BY node.`{$orderBy}`;
            ";
        $children = $this->_db->query($sql, $nodeId)->fetchAll(Zend_Db::FETCH_NUM);
        if (count($children)) {
            return $this->flattenArray($children);
        } else {
            return array();
        }
    }

    /**
     * @param Zend_Db_Table_Row $first
     * @param Zend_Db_Table_Row $second
     * @return \Zend_Db_Table_Row
     * @deprecated
     */
    public function switchElements($first, $second)
    {
        $bufferLeft = $first->lft;
        $bufferRight = $first->rgt;

        $this->_db->beginTransaction();
        try {
            $this->_db->query("UPDATE {$this->_name} SET rgt = {$second->rgt} WHERE project_category_id = {$first->project_category_id};");
            $this->_db->query("UPDATE {$this->_name} SET lft = {$second->lft} WHERE project_category_id = {$first->project_category_id};");

            $this->_db->query("UPDATE {$this->_name} SET rgt = {$bufferRight} WHERE project_category_id = {$second->project_category_id};");
            $this->_db->query("UPDATE {$this->_name} SET lft = {$bufferLeft} WHERE project_category_id = {$second->project_category_id};");
            $this->_db->commit();
        } catch (Exception $e) {
            $this->_db->rollBack();
            Zend_Registry::get('logger')->err(__METHOD__ . ' - ' . print_r($e, true));
        }

        $first->refresh();

        return $first;
    }

    /**
     * @param int $returnAmount
     * @param int $fetchLimit
     * @return array|false|mixed
     */
    public function fetchMainCategories($returnAmount = 25, $fetchLimit = 25)
    {
        $categories = $this->fetchTree($fetchLimit, 0, true, false, 1);
        return array_slice($categories, 0, $returnAmount);
    }

    /**
     * @return array
     */
    public function fetchMainCatIdsOrdered()
    {
        /** @var Zend_Cache_Core $cache */
        $cache = Zend_Registry::get('cache');
        $cacheName = __FUNCTION__;

        if (($returnValue = $cache->load($cacheName))) {
            return $returnValue;
        }

        $sql = "
                SELECT
                    node.project_category_id
                FROM
                    project_category AS node
                INNER JOIN
                    project_category AS parent
                WHERE
                    node.lft BETWEEN parent.lft AND parent.rgt
                        AND node.is_active = 1
                        AND node.is_deleted = 0
                        AND node.lft > 0
                GROUP BY node.project_category_id
                HAVING (COUNT(parent.title) - 1) = 1
                ORDER BY node.orderPos, node.lft;
        ";

        $result = $this->_db->query($sql)->fetchAll(Zend_Db::FETCH_NUM);
        if (count($result) > 0) {
            $returnValue = $this->flattenArray($result);
            $cache->save($returnValue, $cacheName, array(), 900);
            return $returnValue;
        } else {
            return array();
        }
    }

    /**
     * @return array
     */
    public function fetchMainCatsOrdered()
    {
        $sql = "
                SELECT
                    node.project_category_id, node.title, node.lft, node.rgt
                FROM
                    project_category AS node
                INNER JOIN
                    project_category AS parent
                WHERE
                    node.lft BETWEEN parent.lft AND parent.rgt
                        AND node.is_active = 1
                        AND node.is_deleted = 0
                        AND node.lft > 0
                GROUP BY node.project_category_id
                HAVING (COUNT(parent.title) - 1) = 1
                ORDER BY node.orderPos, node.lft;
        ";
        $result = $this->_db->query($sql)->fetchAll();
        if (count($result) > 0) {
            return $result;
        } else {
            return array();
        }
    }

    /**
     * @param int $cat_id
     * @param string $orderBy
     * @return array
     */
    public function fetchSubCatIds($cat_id, $orderBy = self::ORDERED_HIERARCHIC)
    {
        $sql = "
                SELECT
                    node.project_category_id
                FROM
                    project_category AS node
                INNER JOIN
                    project_category AS parent
                WHERE
                    parent.project_category_id IN (:cat_id)
                        --  AND node.lft BETWEEN parent.lft AND parent.rgt
                        AND node.lft > parent.lft AND node.rgt < parent.rgt
                        AND node.is_active = 1
                        AND node.is_deleted = 0
                        AND node.lft > 0
                GROUP BY node.project_category_id
                ORDER BY node.`{$orderBy}`
                ;
        ";
        $result = $this->_db->query($sql, array('cat_id' => $cat_id))->fetchAll(Zend_Db::FETCH_NUM);
        if (count($result) > 0) {
//            array_shift($result);
            return $this->flattenArray($result);
        } else {
            return array();
        }
    }

    /**
     * @param int $returnAmount
     * @param int $fetchLimit
     * @return array
     */
    public function fetchRandomCategories($returnAmount = 5, $fetchLimit = 25)
    {
        $categories = $this->fetchTree($fetchLimit, 0, true, false, 1);
        return $this->_array_random($categories, $returnAmount);
    }

    /**
     * @param array $categories
     * @param int $count
     * @return array
     */
    protected function _array_random($categories, $count = 1)
    {
        shuffle($categories);
        return array_slice($categories, 0, $count);
    }

    /**
     * @param int $currentNodeId
     * @param int $newParentNodeId
     * @return bool
     */
    public function moveToParent($currentNodeId, $newParentNodeId, $position = 'top')
    {
        if ($currentNodeId <= 0) {
            return false;
        }
        $currentNode = $this->fetchElement($currentNodeId);
        $currentParentNode = $this->fetchParentForId($currentNode);

        if ($newParentNodeId == $currentParentNode->project_category_id) {
            return false;
        }

        $newParentNode = $this->fetchElement($newParentNodeId);

        if ($position == 'top') {
            return $this->moveTo($currentNode, $newParentNode['lft'] + 1);
        } else {
            return $this->moveTo($currentNode, $newParentNode['rgt']); // move to bottom otherwise
        }
    }

    /**
     * @param int $nodeId
     * @return array Returns Element as array or (if empty) an array with empty values
     */
    public function fetchElement($nodeId)
    {
        if (is_null($nodeId) OR $nodeId == '') {
            return $this->createRow();
        }

        $currentNode = $this->find($nodeId)->current();

        if ($currentNode === null) {
            $resultValue = $this->createRow()->toArray();
        } else {
            $resultValue = $currentNode->toArray();
        }

        return $resultValue;
    }

    /**
     * @param array $node complete node data
     * @param int $newLeftPosition new left position for the node
     * @return bool
     * @throws Zend_Exception
     */
    public function moveTo($node, $newLeftPosition)
    {
        $space = $node['rgt'] - $node['lft'] + 1;
        $distance = $newLeftPosition - $node['lft'];
        $srcPosition = $node['lft'];

        //for backwards movement, we have to fix some values
        if ($distance < 0) {
            $distance -= $space;
            $srcPosition += $space;
        }

        $this->_db->beginTransaction();

        try {
            // create space for subtree
            $this->_db->query("UPDATE {$this->_name} SET lft = lft + :space WHERE lft >= :newLeftPosition;",
                array('space' => $space, 'newLeftPosition' => $newLeftPosition));
            $this->_db->query("UPDATE {$this->_name} SET rgt = rgt + :space WHERE rgt >= :newLeftPosition;",
                array('space' => $space, 'newLeftPosition' => $newLeftPosition));

            // move tree
            $this->_db->query("UPDATE {$this->_name} SET lft = lft + :distance, rgt = rgt + :distance WHERE lft >= :srcPosition AND rgt < :srcPosition + :space;",
                array('distance' => $distance, 'srcPosition' => $srcPosition, 'space' => $space));

            // remove old space
            $this->_db->query("UPDATE {$this->_name} SET rgt = rgt - :space WHERE rgt > :srcPosition;",
                array('space' => $space, 'srcPosition' => $srcPosition));
            $this->_db->query("UPDATE {$this->_name} SET lft = lft - :space WHERE lft >= :srcPosition;",
                array('space' => $space, 'srcPosition' => $srcPosition));

            // move it
            $this->_db->commit();
        } catch (Exception $e) {
            $this->_db->rollBack();
            Zend_Registry::get('logger')->err(__METHOD__ . ' - ' . print_r($e, true));
            return false;
        }

        return true;
    }

    public function fetchMainCategoryForProduct($productId)
    {
        $sql = "SELECT pc.project_category_id, pc.title
                FROM project_category AS pc
                JOIN project AS p ON p.project_category_id = pc.project_category_id
                WHERE p.project_id = :projectId
                ;";
        return $this->_db->fetchAll($sql, array('projectId' => $productId));
    }

    /**
     * @param $productId
     * @return array
     * @deprecated
     */
    public function fetchAllCategoriesForProduct($productId)
    {
        $sql = "SELECT p.project_id, pc.project_category_id AS category_id, pc.title AS category, ps.project_category_id AS sub_category_id, ps.title AS sub_category
                FROM project AS p
                JOIN project_category AS pc ON p.project_category_id = pc.project_category_id
                LEFT JOIN (SELECT prc.project_category_id, psc.project_id, prc.title FROM project_subcategory AS psc JOIN project_category AS prc ON psc.project_sub_category_id) AS ps ON p.project_id = ps.project_id
                WHERE p.project_id = :projectId
                ";
        return $this->_db->fetchAll($sql, array('projectId' => $productId));
    }

    /**
     * @param int $cat_id
     * @return int|string
     */
    public function countSubCategories($cat_id)
    {
        $cat = $this->findCategory($cat_id);

        $countSubCat = (int)$cat->rgt - (int)$cat->lft - 1;

        if ($countSubCat < 0) {
            return 0;
        } else {
            return $countSubCat;
        }
    }

    /**
     * @param int $nodeId
     * @return Zend_Db_Table_Row_Abstract
     */
    public function findCategory($nodeId)
    {
        if (is_null($nodeId) OR $nodeId == '') {
            return $this->createRow();
        }

        $result = $this->find($nodeId);
        if (count($result) > 0) {
            return $result->current();
        } else {
            return $this->createRow();
        }
    }

    public function fetchCategoriesForForm($valueCatId)
    {
        $level = 0;
        $ancestors = array("catLevel-{$level}"=>$this->fetchMainCatForSelect(Default_Model_DbTable_ProjectCategory::ORDERED_TITLE));
        $level++;

        if (false == empty($valueCatId))
        {
            $categoryAncestors = $this->fetchAncestorsAsId($valueCatId);
            $categoryPath = explode(',',$categoryAncestors['ancestors']);
            foreach ($categoryPath as $element) {
                $ancestors["catLevel-{$level}"] = $this->prepareDataForFormSelect($this->fetchImmediateChildren($element, Default_Model_DbTable_ProjectCategory::ORDERED_TITLE));
                $level++;
            }
        }

        return $ancestors;
    }

    /**
     * @param $resultRows
     * @return array
     */
    protected function prepareDataForFormSelect($resultRows)
    {
        $resultForSelect = array();
        //$resultForSelect[''] = '';
        foreach ($resultRows as $row) {
            $resultForSelect[$row['project_category_id']] = $row['title'];
        }
        return $resultForSelect;
    }

    /**
     * @param $resultRows
     * @return array
     */
    protected function prepareDataForFormSelectWithTitleKey($resultRows)
    {
        $resultForSelect = array();
        //$resultForSelect[''] = '';
        foreach ($resultRows as $row) {
            $resultForSelect[$row['title']] = $row['project_category_id'];
        }
        return $resultForSelect;
    }

}