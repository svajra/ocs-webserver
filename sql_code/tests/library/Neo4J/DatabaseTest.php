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

class Neo4j_DatabaseTest extends PHPUnit_Framework_TestCase
{

    protected function setUp()
    {
        require_once APPLICATION_LIB . '/Local/Application.php';

        // Create application, bootstrap, and run
        $this->bootstrap = new Local_Application(
            APPLICATION_ENV,
            Zend_Registry::get('configuration'),
            Zend_Registry::get('cache')
        );

        parent::setUp(); // TODO: Change the autogenerated stub
    }

    protected function tearDown()
    {
        parent::tearDown(); // TODO: Change the autogenerated stub
    }

    public function testFirstRequest()
    {
        $database = new Neo4j_Database();
        $response = $database->query('match (employee:Person)-[:WORKS_AT|LEAD_BY]-(:Dept)-[:IS_PART_OF]->(department:Dept{name:\"GraphIT\"}) return employee;');
        print_r($response);
    }

}
