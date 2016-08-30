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
class RssController extends Local_Controller_Action_DomainSwitch
{

    public function rssAction()
    {
        $this->_helper->layout()->disableLayout();
        $this->_helper->viewRenderer->setNoRender(true);

        $latestActions = $this->getLatestActivitiesForHost();
    }

    public function rdfAction()
    {
        $this->_helper->layout()->disableLayout();
        $this->_helper->viewRenderer->setNoRender(true);

        $latestProducts = $this->getLatestProductsForHost();

        $rssWriter = Zend_Feed::importArray($latestProducts);
        $rssWriter->send();
    }

    private function getLatestActivitiesForHost()
    {
    }

    private function getLatestProductsForHost()
    {
        $storeCatIds = Zend_Registry::isRegistered('store_category_list') ? Zend_Registry::get('store_category_list') : null;
        $filter['category'] = $storeCatIds;
        $filter['order'] = 'latest';
        $pageLimit = 10;
        $offset = 0;

        $modelProject = new Default_Model_Project();
        $requestedElements = $modelProject->fetchProjectsByFilter($filter, $pageLimit, $offset);

        $importArray = $this->createBaseInformation();
        $importArray['entries'] = $this->generateFeedData($requestedElements['elements']);

        return $importArray;
    }

    private function createBaseInformation()
    {
        $storeConfig = Zend_Registry::isRegistered('store_template') ? Zend_Registry::get('store_template') : null;
        return $importArray = array(
            'title'       => $storeConfig['head']['browser_title_prepend'] . ' Latest Products', //required
            'link'        => 'http://' . $_SERVER['HTTP_HOST'] . '/content.rdf', //required
            'lastUpdate'  => time(), // optional
//            'published'   => time(), //optional
            'charset'     => 'utf-8', // required
//            'description' => 'short description of the feed', //optional
            'author'      => $storeConfig['head']['meta_author'], //optional
            'email'       => 'contact@opendesktop.org', //optional
            'copyright'   => 'All rights reserved. All trademarks are copyright by their respective owners. All contributors are responsible for their uploads.', //optional
            'image'       => 'https://' . $_SERVER['HTTP_HOST'] . $storeConfig['logo'] , //optional
//            'generator'   => 'generator', // optional
            'language'    => 'en-us', // optional
            'ttl'         => '15' // optional, ignored if atom is used
        );
    }

    private function generateFeedData($requestedElements)
    {
        $helperBuildUrl = new Default_View_Helper_BuildProductUrl();
        $helperTruncate = new Default_View_Helper_Truncate();
        $returnValues = array();
        foreach ($requestedElements as $requestedElement) {
            $returnValues[] =
            array(
                'title' => $requestedElement->title, //required
                'link' => $helperBuildUrl->buildProductUrl($requestedElement->project_id, '', null, true, 'https'), //required
                'description' => $helperTruncate->truncate(strip_tags($requestedElement->description)), // only text, no html, required
//                'guid' => 'id of the article, if not given link value will used', //optional
                'content' => $requestedElement->description, // can contain html, optional
                'lastUpdate' => strtotime($requestedElement->project_changed_at), // optional
//                'comments' => 'comments page of the feed entry', // optional
//                'commentRss' => 'the feed url of the associated comments', // optional
                'category'     => array(
                    array(
                        'term' => $requestedElement->cat_title, // required,
                    ),
                ), // list of the attached categories // optional
//                'enclosure'    => array(
//                array(
//                    'url' => 'url of the linked enclosure', // required
//                    'type' => 'mime type of the enclosure', // optional
//                    'length' => 'length of the linked content in octets', // optional
//                ),
//                ) // list of the enclosures of the feed entry // optional
            );
        }
        return $returnValues;
    }

}