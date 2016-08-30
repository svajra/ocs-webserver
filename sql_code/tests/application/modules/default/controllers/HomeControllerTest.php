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

class HomeControllerTest extends Zend_Test_PHPUnit_ControllerTestCase
{

    public function setUp()
    {
        require_once APPLICATION_LIB . '/Local/Application.php';

        // Create application, bootstrap, and run
        $this->bootstrap = new Local_Application(
            APPLICATION_ENV,
            Zend_Registry::get('configuration'),
            Zend_Registry::get('cache')
        );

        parent::setUp();
    }

    public function tearDown()
    {
        Zend_Controller_Front::getInstance()->resetInstance();
        $this->resetRequest();
        $this->resetResponse();

        $this->request->setPost(array());
        $this->request->setQuery(array());
    }

    public function testHomepage()
    {
        $this->dispatch('/');
        $this->assertController('home');
        $this->assertAction('index');
        $this->assertResponseCode(200);
    }

    public function testSetLayoutDefault()
    {
        $this->dispatch('/');

        $this->assertController('home');
        $this->assertAction('index');
        $this->assertResponseCode(200);
        $layout =  Zend_Layout::getMvcInstance();
        $this->assertEquals('home_template', $layout->getLayout());
    }

    public function testSetLayoutExample()
    {
        $_SERVER['REQUEST_URI'] = '/';
        $_SERVER['SERVER_NAME'] = 'expert.pling.cc';
        $_SERVER['HTTP_HOST'] = 'expert.pling.cc';
        $this->dispatch('/');
        $this->assertController('home');
        $this->assertAction('index');
        $this->assertResponseCode(200);
        $layout =  Zend_Layout::getMvcInstance();
        $this->assertEquals('home_template', $layout->getLayout());
    }

    public function testSetLayoutOcsStore()
    {
        $_SERVER['REQUEST_URI'] = '/';
        $_SERVER['SERVER_NAME'] = 'ocsstore.pling.cc';
        $_SERVER['HTTP_HOST'] = 'ocsstore.pling.cc';
        $this->dispatch('/');
        $this->assertController('home');
        $this->assertAction('index');
        $this->assertResponseCode(200);
        $layout =  Zend_Layout::getMvcInstance();
        $this->assertEquals('home_ocsstore', $layout->getLayout());
    }

}
 