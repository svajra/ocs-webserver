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
 * Created: 26.01.2017
 */
class FileController extends Zend_Controller_Action
{

    public function linkAction()
    {
        if(false == $this->validateLink($this->getParam('u'))) {
            $this->_helper->json(false);
        }
        $modelPpLoad = new Default_Model_PpLoad();
        $project_id = (int) $this->getParam('project_id');
        $url = $this->getParam('u');
        $filename = $this->getParam('fn') ? $this->getParam('fn') : $this->getFilenameFromUrl($this->getParam('u'));
        $fileDescription = $this->getParam('fd');
        $result = $modelPpLoad->uploadEmptyFileWithLink($project_id, $url, $filename, $fileDescription);
        $this->_helper->json($result);
    }

    public function gitlinkAction()
    {
        if(false == $this->validateGithubLink($this->getParam('u'))) {
            $this->_helper->json(false);
        }
        $modelPpLoad = new Default_Model_PpLoad();
        $project_id = (int) $this->getParam('project_id');
        $url = $this->getParam('u');
        $filename = $this->getParam('fn') ? $this->getParam('fn') : $this->getFilenameFromUrl($this->getParam('u'));
        $fileDescription = $this->getParam('fd');
        $result = $modelPpLoad->uploadEmptyFileWithLink($project_id, $url, $filename, $fileDescription);
        $this->_helper->json($result);
    }

    private function getFilenameFromUrl($getParam)
    {
        $url = parse_url($getParam);
        return isset($url['path']) ? basename($url['path']) : 'link';
    }

    private function validateGithubLink($getParam)
    {
        /** regex tested in https://regex101.com/r/VFsvSd/1 */
        $validate = new Zend_Validate_Regex('/^https:\/\/(?:(?:(?:www\.)?github)?|(?:raw\.githubusercontent)?)\.com\/.+$/');
        return $validate->isValid($getParam);
    }

    private function validateLink($getParam)
    {
        // However, you can allow "unwise" characters
        Zend_Uri::setConfig(array('allow_unwise' => true));

        return Zend_Uri::check($getParam);
    }

}