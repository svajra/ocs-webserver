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

class Local_Controller_Action_DomainSwitch extends Zend_Controller_Action
{

    /** @var  object */
    protected $_authMember;
    protected $templateConfigData;
    protected $defaultConfigName;

    public function init()
    {
        $this->initDefaultConfigName();
        $this->initAuth();
        $this->initTemplateData();
        $this->initView();
        $this->setLayout();
        $this->_initResponseHeader();
    }

    protected function initAuth()
    {
        $auth = Zend_Auth::getInstance();

        // Design issue: getStorage()->read() should return an empty member object for unknown user. This is a workaround for the moment.
        if ($auth->hasIdentity()) {
            $this->_authMember = $auth->getStorage()->read();
        } else {
            $tableMember = new Default_Model_Member();
            $this->_authMember = $tableMember->createRow();
        }
    }

    private function initTemplateData()
    {
        if (Zend_Registry::isRegistered('store_template')) {
            $this->templateConfigData = Zend_Registry::get('store_template');
        } else {
            $fileNameConfig = APPLICATION_PATH . '/configs/client' . $this->getDomainPostfix() . '.ini.php';
            if (file_exists($fileNameConfig)) {
                $this->templateConfigData = require APPLICATION_PATH . '/configs/client' . $this->getDomainPostfix() . '.ini.php';
            } else {
                $this->templateConfigData = require APPLICATION_PATH . '/configs/client_' . $this->defaultConfigName . '.ini.php';
            }
        }
    }

    /**
     * @return string
     */
    protected function getDomainPostfix()
    {
        return '_' . $this->getNameForStoreClient();
    }

    /**
     * Returns the name for the emporium client. If no name were found, the name for the standard client will be returned.
     *
     * @return string
     */
    public function getNameForStoreClient()
    {
        $clientName = 'pling'; // set to default

        if (Zend_Registry::isRegistered('store_config_name')) {
            $clientName = Zend_Registry::get('store_config_name');
        }
        
        return $clientName;
    }

    public function initView()
    {
        $headTitle = $this->templateConfigData['head']['browser_title'];
        //set default site-title
        $this->view->headTitle($headTitle, Zend_View_Helper_Placeholder_Container_Abstract::SET);

        $this->view->headMeta()
            ->appendName('author', $this->templateConfigData['head']['meta_author'])
            ->appendName('robots', 'all')
            ->appendName('robots', 'index')
            ->appendName('robots', 'follow')
            ->appendName('revisit-after', '3 days')
            ->appendName('title', $this->templateConfigData['head']['browser_title'])
            ->appendName('description', $this->templateConfigData['head']['meta_description'], array('lang' => 'en-US'))
            ->appendName('keywords', $this->templateConfigData['head']['meta_keywords'], array('lang' => 'en-US'));
        
        $this->view->template = $this->templateConfigData;
    }

    protected function setLayout()
    {
        $layoutName = 'flat_ui_template';

        $this->_helper->layout()->setLayout($layoutName);
    }

    protected function _initResponseHeader()
    {
        $duration = 3600; // in seconds
        $expires = gmdate("D, d M Y H:i:s", time() + $duration) . " GMT";

        $this->getResponse()
            ->setHeader('X-FRAME-OPTIONS', 'SAMEORIGIN', true)
//            ->setHeader('Last-Modified', $modifiedTime, true)
            ->setHeader('Expires', $expires, true)
            ->setHeader('Pragma', 'no-cache', true)
            ->setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate, post-check=0, pre-check=0', true)
//            ->setHeader('Pragma', 'cache', true)
//            ->setHeader('Cache-Control', 'private, max-age=300, pre-check=300', true)
        ;
    }

    protected function initDefaultConfigName()
    {
        $config = Zend_Registry::get('config');
        $this->defaultConfigName = $config->settings->client->default->name;
    }

}