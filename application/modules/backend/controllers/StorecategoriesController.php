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
class Backend_StorecategoriesController extends Local_Controller_Action_Backend
{

    const RESULT_OK = "OK";
    const RESULT_ERROR = "ERROR";
    const DATA_ID_NAME = 'store_category_id';

    /** @var Default_Model_DbTable_ConfigStoreCategory */
    protected $_model;

    protected $_modelName = 'Default_Model_DbTable_ConfigStoreCategory';
    protected $_pageTitle = 'Manage Store Categories';

    public function init()
    {
        $this->_model = new $this->_modelName();

        $this->view->pageTitle = $this->_pageTitle;

        parent::init();
    }

    public function indexAction()
    {

    }

    public function createAction()
    {
        $jTableResult = array();
        try {
            $newRow = $this->_model->createRow($this->prepareEmptyValues($this->getAllParams()));
            $result = $newRow->save();

            $this->cacheClear();

            $jTableResult['Result'] = self::RESULT_OK;
            $jTableResult['Record'] = $newRow->toArray();
        } catch (Exception $e) {
            Zend_Registry::get('logger')->err(__METHOD__ . ' - ' . print_r($e, true));
            $translate = Zend_Registry::get('Zend_Translate');
            $jTableResult['Result'] = self::RESULT_ERROR;
            $jTableResult['Message'] = $translate->_('Error while processing data.');
        }

        $this->_helper->json($jTableResult);
    }

    /**
     * @param $inputParams
     * @return array
     */
    protected function prepareEmptyValues($inputParams)
    {
        return array_map(function ($value) {
            return empty($value) ? new Zend_Db_Expr('NULL') : $value;
        }, $inputParams);
    }

    protected function cacheClear()
    {
        /** @var Zend_Cache_Core $cache */
        $cache = Zend_Registry::get('cache');
        if ($cache->test('application_store_category_list')) {
            $cache->remove('application_store_category_list');
        }
        if ($cache->test('fetchDomainCatPostfixConfig')) {
            $cache->remove('fetchDomainCatPostfixConfig');
        }
        if ($cache->test('fetchDomains')) {
            $cache->remove('fetchDomains');
        }
        if ($cache->test('fetchDomainCatConfig')) {
            $cache->remove('fetchDomainCatConfig');
        }
    }

    public function updateAction()
    {
        $jTableResult = array();
        try {
            $values = $this->getAllParams();

            foreach ($values as $key => $value) {
                if ($value == '') {
                    $values[$key] = new Zend_Db_Expr('NULL');
                }
            }

            $record = $this->_model->save($values);

            $this->cacheClear();

            $jTableResult = array();
            $jTableResult['Result'] = self::RESULT_OK;
            $jTableResult['Record'] = $record->toArray();
        } catch (Exception $e) {
            Zend_Registry::get('logger')->err(__METHOD__ . ' - ' . print_r($e, true));
            $translate = Zend_Registry::get('Zend_Translate');
            $jTableResult['Result'] = self::RESULT_ERROR;
            $jTableResult['Message'] = $translate->_('Error while processing data.');
        }

        $this->_helper->json($jTableResult);
    }

    public function deleteAction()
    {
        $dataId = (int)$this->getParam(self::DATA_ID_NAME, null);

        $this->_model->deleteId($dataId);

        $this->cacheClear();

        $jTableResult = array();
        $jTableResult['Result'] = self::RESULT_OK;

        $this->_helper->json($jTableResult);
    }

    public function listAction()
    {
        $startIndex = (int)$this->getParam('jtStartIndex');
        $pageSize = (int)$this->getParam('jtPageSize');
        $sorting = $this->getParam('jtSorting');
        $filter['hostname'] = $this->getParam('filter_hostname');
        $filter['category_id'] = $this->getParam('filter_category_id');


        $select = $this->_model->select()->order($sorting)->limit($pageSize, $startIndex);
        foreach ($filter as $key => $value) {
            if (false === empty($value)) {
                $select->where("{$key} like ?", $value);
            }
        }

        $reports = $this->_model->fetchAll($select);

        $reportsAll = $this->_model->fetchAll($select->limit(null,
            null)->reset('columns')->columns(array('countAll' => new Zend_Db_Expr('count(*)'))));

        $jTableResult = array();
        $jTableResult['Result'] = self::RESULT_OK;
        $jTableResult['Records'] = $reports->toArray();
        $jTableResult['TotalRecordCount'] = $reportsAll->current()->countAll;

        $this->_helper->json($jTableResult);
    }

}