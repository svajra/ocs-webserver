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

/**
 * Class Backend_MemberController
 *
 * @deprecated
 */
class Backend_MemberController extends Zend_Controller_Action
{

    /** @var Default_Model_Member */
    protected $_model = null;

    public function init()
    {
        $this->_model = new Default_Model_Member();
        $this->initView();
    }


    public function initView()
    {
        parent::initView(); // TODO: Change the autogenerated stub

        $this->_helper->layout()->setLayoutPath(APPLICATION_PATH . "/modules/backend/layout");
        $this->_helper->layout()->setLayout('layout');

        return $this->view;
    }

    public function indexAction()
    {

    }


    public function getmemberAction()
    {
        $this->_helper->layout->disableLayout();

        $start = $this->getParam('start', 0);
        $count = $this->getParam('count', 20);
        $sort = $this->getParam('sort', 'username');
        $dir = $this->getParam('dir', 'yui-dt-desc');
        $dir = ($dir == 'yui-dt-desc') ? 'DESC' : 'ASC';
        $filter = $this->getParam('filter', null);

        $sel = $this->_model->select()->setIntegrityCheck(false);
        $sel->from($this->_model, array(
            'member_id',
            'firstname',
            'lastname',
            'username',
            'mail',
            'paypal_mail',
            'created_at',
            'last_online',
            'mail_checked',
            'agb',
            'newsletter'
        ))->where('is_deleted=0')->where('is_active=1')->order($sort . ' ' . $dir)->limit($count, $start)
        ;

        if ($filter) {
            foreach ($filter as $field => $value) {
                $sel->where($field . ' like "' . $value . '%"');
            }
        }

        $memberData = $this->_model->fetchAll($sel);
        $memberData = $memberData->toArray();

        $responsData['results'] = $memberData;

        $sel2 = $this->_model->select();
        $sel2->where('is_deleted=0')->where('is_active=1');

        $responsData['totalRecords'] = count($this->_model->fetchAll($sel2)->toArray());

        $this->_helper->json($responsData);
    }


    public function detailsAction()
    {
        $memberId = $this->getParam('id');

        $member = $this->_model->fetchRow('member_id=' . $memberId);

        $this->view->member = $member;
    }


    public function editAction()
    {

    }


    public function deleteAction()
    {
        $this->_helper->layout->disableLayout();

        $member_id = $this->getParam('member_id');

        $this->_model->setDeleted($member_id);

        $identity = Zend_Auth::getInstance()->getIdentity();

        try {
            Default_Model_ActivityLog::logActivity($member_id,
                null,
                $identity->member_id,
                Default_Model_ActivityLog::BACKEND_USER_DELETE,
                null);

            $id_server = new Default_Model_IdServer();
            $id_server->deactivateLoginForUser($member_id);

        } catch (Exception $e) {
            Zend_Registry::get('logger')->err($e->getTraceAsString());
        }

        $this->_helper->json(true);
    }


    public function closeAction()
    {

    }

    public function activateAction()
    {
        $this->_helper->layout->disableLayout();

        $member_id = $this->getParam('member_id');

        $this->_model->setActivated($member_id);

        $this->_helper->json(true);
    }

    private function getMemberForm()
    {

        $form = new Zend_Form();
    }
    
    public function doexcludeAction()
    {
        $memberId = (int)$this->getParam('member_id', null);
        $member = $this->_model->find($memberId)->current();
        $exclude = (int)$this->getParam('pling_excluded', null);

        $sql = "UPDATE member SET pling_excluded = :exclude WHERE member_id = :member_id";
        $this->_model->getAdapter()->query($sql, array('exclude' => $exclude, 'member_id' => $memberId));

        $auth = Zend_Auth::getInstance();
        $identity = $auth->getIdentity();
        Default_Model_ActivityLog::logActivity($memberId, $memberId, $identity->member_id,
            Default_Model_ActivityLog::BACKEND_USER_PLING_EXCLUDED, $member);

        $jTableResult = array();
        $jTableResult['Result'] = self::RESULT_OK;

        $this->_helper->json($jTableResult);
    }
}