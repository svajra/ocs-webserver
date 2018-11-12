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
 * Created: 31.05.2017
 */
class DuplicatesController extends Local_Controller_Action_DomainSwitch
{

    /** @var Default_Model_Project */
    protected $_model;
   
    protected $_modelName = 'Default_Model_Project';
    protected $_pageTitle = 'Duplicates source_url';
    const RESULT_OK = "OK";
    const RESULT_ERROR = "ERROR";
    public function init()
    {
        $this->_model = new $this->_modelName();
        $this->view->pageTitle = $this->_pageTitle;
        parent::init();
    }


    public function indexAction()
    {
        $this->view->headTitle('Duplicates','SET');
        $this->view->page = (int)$this->getParam('page', 1);        
    }

    public function listAction()
    {
    	$startIndex = (int)$this->getParam('jtStartIndex');
    	$pageSize = (int)$this->getParam('jtPageSize');
    	$sorting = $this->getParam('jtSorting');
    	if($sorting==null)
    	{
    		$sorting = 'cnt desc';
    	}
    	

    	$mod = new Default_Model_Project();    
    	$reports = $mod->fetchDuplatedSourceProjects($sorting,(int)$pageSize,$startIndex);

        //  Zend_Registry::get('logger')->info(__METHOD__ . ' - ===================================' );
        // Zend_Registry::get('logger')->info(__METHOD__ . ' - ' . sizeof($reports));

        $helperTruncate = new Default_View_Helper_Truncate();   
        foreach ($reports as &$r) {                    
                    $r['pids'] = $helperTruncate->truncate($r['pids']);
                }
    	// foreach ($reports as &$r) {
     //        $pids = $r['pids'];
     //        $list = $mod->fetchProjects($pids);
     //        $r['projects'] = $list;
     //    }


    	$totalRecordCount = $mod->getTotalCountDuplicates();
    	
    	$jTableResult = array();
    	$jTableResult['Result'] = self::RESULT_OK;
    	$jTableResult['Records'] = $reports;
    	$jTableResult['TotalRecordCount'] = $totalRecordCount;

    	$this->_helper->json($jTableResult);
    }

  
      

}