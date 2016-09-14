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
class ProductController extends Local_Controller_Action_DomainSwitch
{

    const IMAGE_SMALL_UPLOAD = 'image_small_upload';
    const IMAGE_BIG_UPLOAD = 'image_big_upload';
    /** @var  int */
    protected $_projectId;
    /** @var  Zend_Auth */
    protected $_auth;
    /** @var  string */
    protected $_browserTitlePrepend;

    public function init()
    {
        parent::init();
        $this->_projectId = (int)$this->getParam('project_id');
        $this->_auth = Zend_Auth::getInstance();
        $this->_browserTitlePrepend = $this->templateConfigData['head']['browser_title_prepend'];
    }

    public function ratingAction()
    {
        $userRating = (int)$this->getParam('rate', 0);
        $modelRating = new Default_Model_DbTable_ProjectRating();
        $modelRating->rateForProject($this->_projectId, $this->_authMember->member_id, $userRating);

        $this->_helper->viewRenderer('index');
        $this->indexAction();
    }

    public function indexAction()
    {
        if (empty($this->_projectId)) {
            $this->redirect('/explore');
        }

        $this->view->authMember = $this->_authMember;

        $this->fetchDataForIndexView();

        //$this->view->headTitle($this->_browserTitlePrepend . $this->view->product->title, 'SET');
        $this->view->headTitle($this->view->product->title.' - '.$_SERVER['HTTP_HOST'] , 'SET');

        $this->view->cat_id = $this->view->product->project_category_id;

        $helperUserIsOwner = new Default_View_Helper_UserIsOwner();
        $helperIsProjectActive = new Default_View_Helper_IsProjectActive();
        if ((false === $helperIsProjectActive->isProjectActive($this->view->product->project_status)) AND (false === $helperUserIsOwner->UserIsOwner($this->view->product->member_id))) {
            throw new Zend_Controller_Action_Exception('This page does not exist', 404);
        }

        $tablePageViews = new Default_Model_DbTable_StatPageViews();
        $tablePageViews->savePageView($this->_projectId, $this->getRequest()->getClientIp(),
            $this->_authMember->member_id);


        $helperBaseUrl = new Default_View_Helper_BaseUrl();
        $helperServerUrl = new Zend_View_Helper_ServerUrl();
        $helperBuildProductUrl = new Default_View_Helper_BuildProductUrl();
        $helperTruncate = new Default_View_Helper_Truncate();
        $this->view->dataUrl = $helperServerUrl->serverUrl() . $helperBaseUrl->baseUrl() . $helperBuildProductUrl->buildProductUrl($this->_projectId);

        $this->view->doctype(Zend_View_Helper_Doctype::XHTML1_RDFA);

        $this->view->headMeta()->setName('description',
            $helperTruncate->truncate($this->view->product->description, 200, '...', false, true));
        $this->view->headMeta()->setName('title',
            $helperTruncate->truncate($this->view->product->description, 200, '...', false, true));


        $this->view->headMeta()->appendProperty('og:url',
            $helperServerUrl->serverUrl() . $helperBaseUrl->baseUrl() . $helperBuildProductUrl->buildProductUrl($this->_projectId));

        $this->view->headMeta()->appendProperty('og:type', 'website');
        $this->view->headMeta()->appendProperty('og:title', $this->view->product->title);
        $this->view->headMeta()->appendProperty('og:description',
            $helperTruncate->truncate($this->view->product->description, 200, '...', false, true));
        $helperImage = new Default_View_Helper_Image();
        $this->view->headMeta()->appendProperty('og:image',
            $helperImage->Image($this->view->product->image_small, array('width' => 400, 'height' => 400)));


    }

    protected function fetchDataForIndexView()
    {
        $tableProject = new Default_Model_Project();
        $this->view->product = $tableProject->fetchProductInfo($this->_projectId);
        if (false === isset($this->view->product)) {
            throw new Zend_Controller_Action_Exception('This page does not exist', 404);
        }

        $desc = $this->view->product->description;
        $newDesc = $this->bbcode2html($desc);
        $this->view->product->description = $newDesc;

        $this->view->supporting = $tableProject->fetchProjectSupporterWithPlings($this->_projectId);
        //$orgUpdates = $tableProjectUpdates->fetchLastProjectUpdate($this->_projectId);
        $tableProjectUpdates = new Default_Model_ProjectUpdates();
        $orgUpdates = $tableProjectUpdates->fetchProjectUpdates($this->_projectId);
        $newUpdates = array();
        foreach ($orgUpdates as $update) {
            $desc = $update['text'];
            $newDesc = $this->bbcode2html($desc);
            $update['text'] = $newDesc;
            $newUpdates[] = $update;
        }

        $this->view->updates = $newUpdates;
        $this->view->supporter = $tableProject->fetchProjectSupporter($this->_projectId);
        $this->view->galleryPictures = $tableProject->getGalleryPictureSources($this->_projectId);
        $this->view->product_views = $tableProject->fetchProjectViews($this->_projectId);

        $helperFetchCategory = new Default_View_Helper_CatTitle();
        $helperFetchCatParent = new Default_View_Helper_CatParent();

        $this->view->catId = $this->view->product->project_category_id;
        $this->view->catTitle = $helperFetchCategory->catTitle($this->view->product->project_category_id);
        $this->view->catParentId = $helperFetchCatParent->getCatParentId(array('project_category_id' => $this->view->product->project_category_id));
        if ($this->view->catParentId) {
            $this->view->catParentTitle = $helperFetchCategory->catTitle($this->view->catParentId);
        }

        /**
         * if(isset($this->view->catParentTitle) && 'root' == $this->view->catParentTitle) {
         * //OK, MainCat is set on product, we want see SubCat here
         * $tableCategory = new Default_Model_SubCategory();
         * $subCatArray = $tableCategory->fetchSubcategoriesForProduct($this->view->product->project_category_id);
         * if(isset($subCatArray) && count($subCatArray) > 0) {
         * //1 child, but is it a ParentCat?
         * $child = $subCatArray[0];
         * //ChildCat was writen in project as MainCat!
         * $subCatId = $child['project_sub_category_id'];
         * $this->view->catParentTitle .= ' ID: ' . $subCatId;
         * $this->view->catTitle = $helperFetchCategory->catTitle($subCatId);
         * $this->view->catId = $subCatId;
         * }
         *
         * }
         **/


        $AuthCodeExist = new Local_Verification_WebsiteAuthCodeExist();
        $this->view->websiteAuthCode = $AuthCodeExist->generateAuthCode(stripslashes($this->view->product->link_1));

        $modelComments = new Default_Model_ProjectComments();
        $offset = (int)$this->getParam('page');
        $paginationComments = $modelComments->getAllCommentsForProject($this->_projectId);
        $paginationComments->setItemCountPerPage(25);
        $paginationComments->setCurrentPageNumber($offset);
        $this->view->comments = $paginationComments;

        $modelPlings = new Default_Model_DbTable_Plings();
        $this->view->plings = $modelPlings->getDonationsForProject($this->_projectId, 10);

        $tableMember = new Default_Model_Member();
        $this->view->member = $tableMember->fetchMemberData($this->view->product->member_id);

        $this->view->more_products = $tableProject->fetchMoreProjects($this->view->product, 8);
        $this->view->more_products_otheruser = $tableProject->fetchMoreProjectsOfOtherUsr($this->view->product, 8);

        $widgetDefaultModel = new Default_Model_DbTable_ProjectWidgetDefault();
        $widgetDefault = $widgetDefaultModel->fetchConfig($this->_projectId);
        $widgetDefault->text->headline = $this->view->product->title;
        $widgetDefault->amounts->current = $this->view->product->amount_received;
        $widgetDefault->amounts->goal = $this->view->product->amount;
        $widgetDefault->project = $this->_projectId;
        $this->view->widgetConfig = $widgetDefault;

        $helperBuildProductUrl = new Default_View_Helper_BuildProductUrl();
        $this->view->permaLink = $helperBuildProductUrl->buildProductUrl($this->_projectId, null, null, true);
        $this->view->urlPay = $helperBuildProductUrl->buildProductUrl($this->_projectId, 'pay');

        $referrerUrl = $this->readExploreUrlFromReferrer();
        if (false === empty($referrerUrl)) {
            $this->view->referrerUrl = $referrerUrl;
        }
    }

    /**
     * transforms a string with bbcode markup into html
     *
     * @param string $txt
     * @param bool $nl2br
     * @return html-string
     */
    private function bbcode2html($txt, $nl2br = true, $forcecolor = '')
    {

        if (!empty($forcecolor)) {
            $fc = ' style="color:' . $forcecolor . ';"';
        } else {
            $fc = '';
        }
        $newtxt = htmlspecialchars($txt);
        if ($nl2br) {
            $newtxt = nl2br($newtxt);
        }

        $patterns = array(
            '`\[b\](.+?)\[/b\]`is',
            '`\[i\](.+?)\[/i\]`is',
            '`\[u\](.+?)\[/u\]`is',
            '`\[li\](.+?)\[/li\]`is',
            '`\[strike\](.+?)\[/strike\]`is',
            '`\[url\]([a-z0-9]+?://){1}([\w\-]+\.([\w\-]+\.)*[\w]+(:[0-9]+)?(/[^ \"\n\r\t<]*)?)\[/url\]`si',
            '`\[quote\](.+?)\[/quote\]`is',
            '`\[indent](.+?)\[/indent\]`is'
        );

        $replaces = array(
            '<strong' . $fc . '>\\1</strong>',
            '<em' . $fc . '>\\1</em>',
            '<span style="border-bottom: 1px dotted">\\1</span>',
            '<li' . $fc . ' style="margin-left:20px;">\\1</li>',
            '<strike' . $fc . '>\\1</strike>',
            '<a href="\1\2" rel="nofollow" target="_blank">\1\2</a>',
            '<strong' . $fc . '>Quote:</strong><div style="margin:0px 10px;padding:5px;background-color:#F7F7F7;border:1px dotted #CCCCCC;width:80%;"><em>\1</em></div>',
            '<pre' . $fc . '>\\1</pre>'
        );

        $newtxt = preg_replace($patterns, $replaces, $newtxt);
        return ($newtxt);
    }

    protected function readExploreUrlFromReferrer()
    {
        $helperBuildExploreUrl = new Default_View_Helper_BuildExploreUrl();
        $referrerExplore = $helperBuildExploreUrl->buildExploreUrl(null, null, null, null, true);

        /** @var Zend_Controller_Request_Http $request */
        $request = $this->getRequest();
        if (strpos($request->getHeader('referer'), $referrerExplore) !== false) {
            return $request->getHeader('referer');
        }
    }

    public function showAction()
    {
        $this->view->authMember = $this->_authMember;
        $this->_helper->viewRenderer('index');
        $this->indexAction();
    }

    public function addAction()
    {
        $form = new Default_Form_Product();

        $this->view->member = $this->_authMember;
        $this->view->form = $form;
        $this->view->mode = 'add';

        if ($this->_request->isGet()) {
            $modelProjectLicense = new Default_Model_DbTable_ProjectCcLicense();
            $dataProjectLicense = $modelProjectLicense->getDefaultValues();
            $form->populate($dataProjectLicense);
            return;
        }

        if (isset($_POST['cancel'])) { // user cancel function
            $this->redirect('/member/' . $this->_authMember->member_id . '/news/');
        }

        if (false === $form->isValid($_POST)) { // form not valid
            $form->initSubCatElement((int)$this->getParam('project_category_id'));
            $form->initSubSubCatElement((int)$this->getParam('project_subcategory_id'));
            $this->view->form = $form;
            $this->view->error = 1;
            return;
        }

        $values = $form->getValues();

        $imageModel = new Default_Model_DbTable_Image();
        try {
            $values['image_small'] = $imageModel->saveImage($form->getElement(self::IMAGE_SMALL_UPLOAD));
//            $values['image_big'] = $imageModel->saveImage($form->getElement(self::IMAGE_BIG_UPLOAD));
        } catch (Exception $e) {
            Zend_Registry::get('logger')->err(__METHOD__ . ' - ERROR upload productPicture - ' . print_r($e, true));
        }

        //update sub categories and save it in project
        $log = Zend_Registry::get('logger');
        $log->debug('**********' . __CLASS__ . '::' . __FUNCTION__ . ' - setCatId New: ' . $values['project_category_id'] . "\n");
        if (isset($values['project_subcategory_id']) AND is_array($values['project_subcategory_id']) AND count($values['project_subcategory_id'] == 1)) {
            $values['project_category_id'] = $values['project_subcategory_id'][0];
        }
        $log->debug('**********' . __CLASS__ . '::' . __FUNCTION__ . ' - setCatId New: ' . $values['project_category_id'] . "\n");

        // form was valid, so we can set status to inactive
        $values['status'] = Default_Model_DbTable_Project::PROJECT_ACTIVE;
        
        // save new project
        $modelProject = new Default_Model_Project();
        if (isset($values['project_id'])) {
            $newProject = $modelProject->updateProject($values['project_id'], $values);
        } else {
            $newProject = $modelProject->createProject($this->_authMember->member_id, $values,
                $this->_authMember->username);
        }

        //update the gallery pics
        $mediaServerUrls = $this->saveGalleryPics($form->gallery->upload->upload_picture);
        $modelProject->updateGalleryPictures($newProject->project_id, $mediaServerUrls);
        
        //If there is no Logo, we take the 1. gallery pic
        if(!isset($values['image_small']) || $values['image_small'] == '') {
        	$values['image_small'] = $mediaServerUrls[0];
        	$newProject = $modelProject->updateProject($newProject->project_id, $values);
        	$log->debug('**********' . __CLASS__ . '::' . __FUNCTION__ . ' - set image_small: '.$values['image_small'].'\n');
        } else {
        	$log->debug('**********' . __CLASS__ . '::' . __FUNCTION__ . ' - set image_small: Not neeed. '.$values['image_small'].'\n');
        	 
        }

        /*
        //save license information
        if ($values['cc_license'] == true) {
            $modelProjectLicense = new Default_Model_DbTable_ProjectCcLicense();
            $modelProjectLicense->saveByKey($values);
        }*/

        //New Project in Session, for AuthValidation (owner)
        $this->_auth->getIdentity()->projects[$newProject->project_id] = array('project_id' => $newProject->project_id);
//        $this->auth->getStorage()->write($this->auth->getIdentity());

        $this->createTaskWebsiteOwnerVerification($newProject);

        $activityLog = new Default_Model_ActivityLog();
        $activityLog->writeActivityLog($newProject->project_id, $newProject->member_id,
            Default_Model_ActivityLog::PROJECT_CREATED, $newProject->toArray());

        // ppload
        $this->processPploadId($newProject);

        //$helperBuildProductUrl = new Default_View_Helper_BuildProductUrl();
        //$urlProjectShow = $helperBuildProductUrl->buildProductUrl($newProject->project_id, 'preview');
        //$this->redirect($urlProjectShow);
        
        $this->redirect('/member/'.$newProject->member_id.'/products/');
    }

    private function saveGalleryPics($form_element)
    {
        $imageModel = new Default_Model_DbTable_Image();
        return $imageModel->saveImages($form_element);
    }

    /**
     * @param $projectData
     */
    protected function createTaskWebsiteOwnerVerification($projectData)
    {
        if (false == empty($projectData->link_1)) {
            $websiteOwner = new Local_Verification_WebsiteAuthCodeExist();
            $queue = Local_Queue_Factory::createQueue('validate');
            $command = new Local_Verification_Queue_Command_WebsiteAuthCodeExist($projectData, $projectData->link_1,
                $websiteOwner->generateAuthCode(stripslashes($projectData->link_1)));
            $queue->send(serialize($command));
        }
    }

    /**
     * @param $projectData
     */
    protected function processPploadId($projectData)
    {
        if ($projectData->ppload_collection_id) {
            // require_once 'Ppload/Api.php';
            $pploadApi = new Ppload_Api(array(
                'apiUri' => PPLOAD_API_URI,
                'clientId' => PPLOAD_CLIENT_ID,
                'secret' => PPLOAD_SECRET
            ));
            // Update collection information
            $collectionCategory = $projectData->project_category_id;
            if (Default_Model_Project::PROJECT_ACTIVE == $projectData->status) {
                $collectionCategory .= '-published';
            }
            $collectionRequest = array(
                'title' => $projectData->title,
                'description' => $projectData->description,
                'category' => $collectionCategory,
                'content_id' => $projectData->project_id
            );
            $collectionResponse = $pploadApi->putCollection(
                ltrim($projectData->ppload_collection_id, '!'),
                $collectionRequest
            );
            // Store product image as collection thumbnail
            $this->_updatePploadMediaCollectionthumbnail($projectData);
        }
    }

    /**
     * ppload
     */
    protected function _updatePploadMediaCollectionthumbnail($projectData)
    {
        if (empty($projectData->ppload_collection_id)
            || empty($projectData->image_small)
        ) {
            return false;
        }

        // require_once 'Ppload/Api.php';
        $pploadApi = new Ppload_Api(array(
            'apiUri' => PPLOAD_API_URI,
            'clientId' => PPLOAD_CLIENT_ID,
            'secret' => PPLOAD_SECRET
        ));

        $filename = sys_get_temp_dir() . '/' . $projectData->image_small;
        if (false === file_exists(dirname($filename))) {
            mkdir(dirname($filename), 0777, true);
        }
        $viewHelperImage = new Default_View_Helper_Image();
        $uri = $viewHelperImage->Image(
            $projectData->image_small,
            array(
                'width' => 600,
                'height' => 600
            )
        );

        file_put_contents($filename, file_get_contents($uri));

        $mediaCollectionthumbnailResponse = $pploadApi->postMediaCollectionthumbnail(
            $projectData->ppload_collection_id,
            array('file' => $filename)
        );

        unlink($filename);

        if (isset($mediaCollectionthumbnailResponse->status)
            && $mediaCollectionthumbnailResponse->status == 'success'
        ) {
            return true;
        }
        return false;
    }

    public function editAction()
    {
        if (empty($this->_projectId)) {
            $this->redirect($this->_helper->url('add'));
            return;
        }

        $this->_helper->viewRenderer('add'); // we use the same view as you can see at add a product
        $this->view->mode = 'edit';

        $projectTable = new Default_Model_DbTable_Project();
        $projectModel = new Default_Model_Project();

        //check if product with given id exists
        $projectData = $projectTable->find($this->_projectId)->current();
        if (empty($projectData)) {
            $this->redirect($this->_helper->url('add'));
            return;
        }

        // load license information
        $modelProjectLicense = new Default_Model_ProjectLicense();
        /** @var Default_Model_DbRow_ProjectCcLicense $dataProjectLicense */
        $dataProjectLicense = $modelProjectLicense->findOneProject($this->_projectId);

        //set ppload-collection-id in view
        $this->view->ppload_collection_id = $projectData->ppload_collection_id;
        $this->view->project_id = $projectData->project_id;

        //read the already existing gallery pics and add them to the form
        $sources = $projectModel->getGalleryPictureSources($this->_projectId);

        //read category
        $tableCategory = new Default_Model_DbTable_ProjectCategory();
        $childsArray = $tableCategory->fetchChildElements($projectData->project_category_id);
        $isChildCat = false;
        if (isset($childsArray) && count($childsArray) == 1) {
            //1 child, but is it a ParentCat?
            $child = $childsArray[0];
            if ($child['project_category_id'] == $projectData->project_category_id) {
                //ChildCat was writen in project as MainCat!
                $isChildCat = true;
            }
        }

        //setup form
        $form = new Default_Form_Product(array('pictures' => $sources));
        if (false === empty($projectData->image_small)) {
            $form->getElement('image_small_upload')->setRequired(false);
        }
        $form->getElement('preview')->setLabel('Save');


        //read the subcategories
        $tableSubCategory = new Default_Model_SubCategory();
        $subcategories = $tableSubCategory->fetchAllSubCategories($projectData->project_category_id, $tableSubCategory::ORDERED_TITLE);
        $selectedSubCategories = $tableSubCategory->fetchSelectedSubCategories($this->_projectId);
//        $modelSubSubCategories = new Default_Model_SubSubCategory();
//        $subSubCategories = $modelSubSubCategories->fetchAllSubCategories($selectedSubCategories);
//        $selectedSubSubCategories = $modelSubSubCategories->fetchSelectedSubCategories($this->_projectId);

        $form->getElement('project_subcategory_id')->setMultiOptions($subcategories);
//        $form->getElement('project_sub_subcategory_id')->setMultiOptions($subSubCategories);
        $form->removeElement('project_id'); // we don't need this field in edit mode

        $this->view->member = $this->_authMember;

        if ($this->_request->isGet()) {
            $form->populate($projectData->toArray());
            $form->populate($dataProjectLicense->toArray());
            $form->getElement('cc_license')->setValue($dataProjectLicense->isStoredLicense());
            $form->getElement('image_small')->setValue($projectData->image_small);
//            $form->getElement('image_big')->setValue($projectData->image_big);


            if ($isChildCat) {
                $mainCat = $tableCategory->fetchParentForId($projectData);
                $main_category_id = 'LEER';
                if (isset($mainCat)) {
                    $main_category_id = $mainCat->project_category_id;
                }

                $tableSubCategory = new Default_Model_SubCategory();
                $subcategories = $tableSubCategory->fetchAllSubCategories($main_category_id, $tableSubCategory::ORDERED_TITLE);
                $form->getElement('project_subcategory_id')->setMultiOptions($subcategories);

                $form->getElement('project_category_id')->setValue($main_category_id);
                $form->getElement('project_subcategory_id')->setValue($projectData->project_category_id);
            } else {
                $form->getElement('project_subcategory_id')->setValue($selectedSubCategories);
                $form->getElement('project_sub_subcategory_id')->setValue($selectedSubSubCategories);
            }
            //Bilder voreinstellen
            $form->getElement(self::IMAGE_SMALL_UPLOAD)->setValue($projectData->image_small);
//            $form->getElement(self::IMAGE_BIG_UPLOAD)->setValue($projectData->image_big);

            $this->view->form = $form;
            return;
        }

        if (isset($_POST['cancel'])) { // user cancel function
            $this->redirect('/member/' . $this->_authMember->member_id . '/news/');
        }

        if (false === $form->isValid($_POST, $this->_projectId)) { // form not valid
            $this->view->form = $form;
            $this->view->error = 1;
            return;
        }

        $values = $form->getValues();

        $log = Zend_Registry::get('logger');
        $log->debug('**********' . __CLASS__ . '::' . __FUNCTION__ . ' - setCatId New: ' . $values['project_category_id'] . "\n");
        if (isset($values['project_subcategory_id']) AND is_array($values['project_subcategory_id']) AND count($values['project_subcategory_id'] == 1)) {
            $values['project_category_id'] = $values['project_subcategory_id'][0];
        }
        $log->debug('**********' . __CLASS__ . '::' . __FUNCTION__ . ' - setCatId New: ' . $values['project_category_id'] . "\n");


        $imageModel = new Default_Model_DbTable_Image();
        try {
            $uploadedSmallImage = $imageModel->saveImage($form->getElement(self::IMAGE_SMALL_UPLOAD));
            $values['image_small'] = $uploadedSmallImage ? $uploadedSmallImage : $values['image_small'];
//            $uploadedBigImage = $imageModel->saveImage($form->getElement(self::IMAGE_BIG_UPLOAD));
//            $values['image_big'] = $uploadedBigImage ? $uploadedBigImage : $values['image_big'];
        } catch (Exception $e) {
            Zend_Registry::get('logger')->err(__METHOD__ . ' - ERROR upload productPicture - ' . print_r($e, true));
        }

        // save changes
        $projectData->setFromArray($values);
        $projectData->changed_at = new Zend_Db_Expr('NOW()');
        

        // store license data
        if ($values['cc_license'] == true) {
            $modelProjectLicense->saveLicenseData($this->_projectId, $values);
        } else {
            $modelProjectLicense->deleteLicenseData($this->_projectId);
        }

        //update the gallery pics
        $pictureSources = array_merge($values['gallery']['online_picture'],
            $this->saveGalleryPics($form->gallery->upload->upload_picture));
        $projectModel->updateGalleryPictures($this->_projectId, $pictureSources);
        
        //If there is no Logo, we take the 1. gallery pic
        if(!isset($projectData->image_small) || $projectData->image_small == '') {
        	$projectData->image_small = $pictureSources[0];
        	$log->debug('**********' . __CLASS__ . '::' . __FUNCTION__ . ' - set image_small: '.$projectData->image_small.'\n');
        } else {
        	$log->debug('**********' . __CLASS__ . '::' . __FUNCTION__ . ' - set image_small: Not neeed. '.$projectData->image_small.'\n');
        
        }
        $projectData->save();

        $this->createTaskWebsiteOwnerVerification($projectData);

        $activityLog = new Default_Model_ActivityLog();
        $activityLog->writeActivityLog($this->_projectId, $projectData->member_id,
            Default_Model_ActivityLog::PROJECT_EDITED,
            $projectData->toArray());

        //update search index
        $productInfo = $projectModel->fetchProductInfo($projectData->project_id);
        $modelSearch = new Default_Model_Search_Lucene();
        $modelSearch->updateDocument($productInfo->toArray());

        // ppload
        $this->processPploadId($projectData);

        $helperBuildMemberUrl = new Default_View_Helper_BuildMemberUrl();
        $this->redirect($helperBuildMemberUrl->buildMemberUrl($this->_authMember->member_id, 'products'));
    }

    public function getupdatesajaxAction()
    {
        $this->view->authMember = $this->_authMember;
        $tableProject = new Default_Model_ProjectUpdates();

        $updates = $tableProject->fetchProjectUpdates($this->_projectId);

        $this->_helper->layout->disableLayout();
        $params = $this->getAllParams();

        $result['status'] = 'success';
        $result['ResultSize'] = count($updates);
        $result['updates'] = $updates;

        $this->_helper->json($result);

    }

    public function saveupdateajaxAction()
    {
        $this->view->authMember = $this->_authMember;
        $tableProjectUpdates = new Default_Model_ProjectUpdates();
        $tableProject = new Default_Model_Project();

        $params = $this->getAllParams();
        $update_id = $params['update_id'];

        //Save version number
        $version = "";
        if(isset($params['product_version']))
        	$version = $params['product_version'];

        $updateArray = array();
        $updateArray['version'] = $version;
        $tableProject->update($updateArray, 'project_id = ' . $this->_projectId);

        //Save title and Text
        $title = null;
        $text = null;
        if (isset($params['title'])) {
            $title = $params['title'];
        }
        if (isset($params['text'])) {
            $text = $params['text'];
        }


        if (!empty($title) && !empty($text)) {
            //Save update
            if (!empty($update_id)) {
                //Update old update
                $updateArray = array();
                $updateArray['title'] = $title;
                $updateArray['text'] = $text;
                $updateArray['changed_at'] = new Zend_Db_Expr('Now()');
                $project_update_id = $tableProjectUpdates->update($updateArray, 'project_update_id = ' . $update_id);

            } else {
                //Add new update
                $updateArray = array();
                $updateArray['title'] = $title;
                $updateArray['text'] = $text;
                $updateArray['public'] = 1;
                $updateArray['project_id'] = $this->_projectId;
                $updateArray['member_id'] = $this->_authMember->member_id;
                $updateArray['created_at'] = new Zend_Db_Expr('Now()');
                $updateArray['changed_at'] = new Zend_Db_Expr('Now()');
                $project_update_id = $tableProjectUpdates->save($updateArray);
            }
        }

        $result['status'] = 'success';
        $result['update_id'] = $project_update_id;

        $this->_helper->json($result);

    }

    public function deleteupdateajaxAction()
    {
        $this->view->authMember = $this->_authMember;
        $tableProject = new Default_Model_ProjectUpdates();

        $params = $this->getAllParams();
        $project_update_id = $params['update_id'];
        $updateArray = array();
        $updateArray['public'] = 0;
        $updateArray['changed_at'] = new Zend_Db_Expr('Now()');
        $tableProject->update($updateArray, 'project_update_id = ' . $project_update_id);

        $result['status'] = 'success';
        $result['update_id'] = $project_update_id;

        $this->_helper->json($result);

    }

    public function updatesAction()
    {
        $this->view->authMember = $this->_authMember;
        $tableProject = new Default_Model_Project();
        $this->view->product = $tableProject->fetchProductInfo($this->_projectId);
        if (false === isset($this->view->product)) {
            throw new Zend_Controller_Action_Exception('This page does not exist', 404);
        }
        $this->view->relatedProducts = $tableProject->fetchSimilarProjects($this->view->product, 6);
        $this->view->supporter = $tableProject->fetchProjectSupporter($this->_projectId);
        $this->view->product_views = $tableProject->fetchProjectViews($this->_projectId);

        $modelPlings = new Default_Model_DbTable_Plings();
        $this->view->comments = $modelPlings->getCommentsForProject($this->_projectId, 10);

        $tableMember = new Default_Model_Member();
        $this->view->member = $tableMember->fetchMemberData($this->view->product->member_id);


        $this->view->updates = $tableProject->fetchProjectUpdates($this->_projectId);

        $tablePageViews = new Default_Model_DbTable_StatPageViews();
        $tablePageViews->savePageView($this->_projectId, $this->getRequest()->getClientIp(),
            $this->_authMember->member_id);
    }

    public function updateAction()
    {

        $this->_helper->layout()->setLayout('flat_ui');

        $this->view->headScript()->setFile('');
        $this->view->headLink()->setStylesheet('');

        $this->_helper->viewRenderer('add');

        $form = new Default_Form_ProjectUpdate();
        $projectTable = new Default_Model_Project();
        $projectData = null;
        $projectUpdateId = (int)$this->getParam('upid');

        $this->view->member = $this->_authMember;
        $this->view->title = 'Add an update for your product';

        $activityLogType = Default_Model_ActivityLog::PROJECT_ITEM_CREATED;

        if (false === empty($projectUpdateId)) {
            $this->view->title = 'Edit an product update';
            $projectData = $projectTable->find($projectUpdateId)->current();
            $form->populate($projectData->toArray());
            $form->getElement('upid')->setValue($projectUpdateId);
            $activityLogType = Default_Model_ActivityLog::PROJECT_ITEM_EDITED;
        }

        $this->view->form = $form;

        if ($this->_request->isGet()) {
            return;
        }

        if (isset($_POST['cancel'])) { // user cancel function
            $this->_redirect('/member/' . $this->_authMember->member_id . '/news/');
        }

        if (false === $form->isValid($_POST)) { // form not valid
            $this->view->form = $form;
            $this->view->error = 1;
            return;
        }

        $values = $form->getValues();

        $projectUpdateRow = $projectTable->find($values['upid'])->current();

        if (count($projectUpdateRow) == 0) {
            $projectUpdateRow = $projectTable->createRow($values);
            $projectUpdateRow->project_id = $values['upid'];
            $projectUpdateRow->created_at = new Zend_Db_Expr('NOW()');
            $projectUpdateRow->start_date = new Zend_Db_Expr('NOW()');
            $projectUpdateRow->member_id = $this->_authMember->member_id;
            $projectUpdateRow->creator_id = $this->_authMember->member_id;
            $projectUpdateRow->status = Default_Model_Project::PROJECT_ACTIVE;
            $projectUpdateRow->type_id = 2;
            $projectUpdateRow->pid = $this->_projectId;
        } else {
            $projectUpdateRow->setFromArray($values);
            $projectUpdateRow->changed_at = new Zend_Db_Expr('NOW()');
        }

        $lastId = $projectUpdateRow->save();

        //New Project in Session, for AuthValidation (owner)
        $this->_auth->getIdentity()->projects[$lastId] = array('project_id' => $lastId);

        $tableProduct = new Default_Model_Project();
        $product = $tableProduct->find($this->_projectId)->current();
        $activityLogValues = $projectUpdateRow->toArray();
        $activityLogValues['image_small'] = $product->image_small;
        $activityLog = new Default_Model_ActivityLog();
        $activityLog->writeActivityLog($lastId, $projectUpdateRow->member_id, $activityLogType, $activityLogValues);

        $helperBuildProductUrl = new Default_View_Helper_BuildProductUrl();
        $urlProjectShow = $helperBuildProductUrl->buildProductUrl($this->_projectId);

        $this->redirect($urlProjectShow);

    }

    public function previewAction()
    {
        $this->view->authMember = $this->_authMember;

        $form = new Default_Form_ProjectConfirm();

        if ($this->_request->isGet()) {
            $form->populate(get_object_vars($this->_authMember));
            $this->view->form = $form;
            $this->fetchDataForIndexView();
            $this->view->preview = $this->view->render('product/index.phtml');
            return;
        }

        if (isset($_POST['save'])) {
            $projectTable = new Default_Model_Project();
            $projectTable->setStatus(Default_Model_Project::PROJECT_INACTIVE, $this->_projectId);

            //todo: maybe we have to delete the project data from database otherwise we produce many zombies
            $this->redirect('/member/' . $this->_authMember->member_id . '/products/');
        }

        if (isset($_POST['back'])) {
            $helperBuildProductUrl = new Default_View_Helper_BuildProductUrl();
            $this->redirect($helperBuildProductUrl->buildProductUrl($this->_projectId, 'edit'));
        }

        if (false === $form->isValid($_POST)) { // form not valid
            $this->view->form = $form;
            $this->fetchDataForIndexView();
            $this->view->preview = $this->view->render('product/index.phtml');
            $this->view->error = 1;
            return;
        }

        $projectTable = new Default_Model_Project();
        $projectTable->setStatus(Default_Model_Project::PROJECT_ACTIVE, $this->_projectId);

        // add to search index
        $modelProject = new Default_Model_Project();
        $productInfo = $modelProject->fetchProductInfo($this->_projectId);
        $modelSearch = new Default_Model_Search_Lucene();
        $modelSearch->addDocument($productInfo->toArray());

        $this->redirect('/member/' . $this->_authMember->member_id . '/products/');
    }

    public function plingAction()
    {

        if (empty($this->_projectId)) {
            $this->redirect('/explore');
        }

        $this->view->authMember = $this->_authMember;

        $this->fetchDataForIndexView();
        $helperBuildProductUrl = new Default_View_Helper_BuildProductUrl();
        $this->view->urlPay = $helperBuildProductUrl->buildProductUrl($this->_projectId, 'pay');
        $this->view->amount = (float)$this->getParam('amount', 1);
        $this->view->comment = html_entity_decode(strip_tags($this->getParam('comment'), null), ENT_QUOTES, 'utf-8');
        $this->view->provider = mb_strtolower(html_entity_decode(strip_tags($this->getParam('provider'), null),
            ENT_QUOTES, 'utf-8'), 'utf-8');

        $this->view->headTitle($this->_browserTitlePrepend . $this->view->product->title, 'SET');

        $helperUserIsOwner = new Default_View_Helper_UserIsOwner();
        $helperIsProjectActive = new Default_View_Helper_IsProjectActive();
        if ((false === $helperIsProjectActive->isProjectActive($this->view->product->project_status)) AND (false === $helperUserIsOwner->UserIsOwner($this->view->product->member_id))) {
            throw new Zend_Controller_Action_Exception('This page does not exist', 404);
        }

        $tableProject = new Default_Model_Project();
        $this->view->supporting = $tableProject->fetchProjectSupporterWithPlings($this->_projectId);
    }

    public function payAction()
    {
        $this->_helper->layout()->disableLayout();
        $tableProject = new Default_Model_Project();
        $project = $tableProject->fetchProductInfo($this->_projectId);

        //get parameter
        $amount = (float)$this->getParam('amount', 1);
        $comment = html_entity_decode(strip_tags($this->getParam('comment'), null), ENT_QUOTES, 'utf-8');;
        $paymentProvider = mb_strtolower(html_entity_decode(strip_tags($this->getParam('provider'), null), ENT_QUOTES,
            'utf-8'), 'utf-8');
        $hideIdentity = (int)$this->getParam('hideId', 0);

        $paymentGateway = $this->createPaymentGateway($paymentProvider);
        $paymentGateway->getUserDataStore()->generateFromArray($project->toArray());

        $requestMessage = 'Thank you for supporting: ' . $paymentGateway->getUserDataStore()->getProductTitle();

        $response = null;
        try {
            $response = $paymentGateway->requestPayment($amount, $requestMessage);
            $this->view->checkoutEndpoint = $paymentGateway->getCheckoutEndpoint();
            $this->view->paymentKey = $response->getPaymentId();
            $this->_helper->viewRenderer->setRender('pay_' . $paymentProvider);
        } catch (Exception $e) {
            throw new Zend_Controller_Action_Exception('payment error', 500, $e);
        }

        if (false === $response->isSuccessful()) {
            throw new Zend_Controller_Action_Exception('payment failure', 500);
        }

        if (empty($this->_authMember->member_id) or ($hideIdentity == 1)) {
            $memberId = 1;
        } else {
            $memberId = $this->_authMember->member_id;
        }

        //Add pling
        $modelPlings = new Default_Model_DbTable_Plings();
        $plingId = $modelPlings->createNewPlingFromResponse($response, $memberId, $project->project_id, $amount);

        if (false == empty($comment)) {
            $modelComments = new Default_Model_ProjectComments();
            $dataComment = array(
                'comment_type' => Default_Model_DbTable_Comments::COMMENT_TYPE_PLING,
                'comment_target_id' => $project->project_id,
                'comment_member_id' => $memberId,
                'comment_pling_id' => $plingId,
                'comment_text' => $comment
            );
            $modelComments->save($dataComment);
        }

        $activityLog = new Default_Model_ActivityLog();
        $activityLog->writeActivityLog($this->_projectId, $memberId, Default_Model_ActivityLog::PROJECT_PLINGED,
            $project->toArray());
    }

    /**
     * @param string $paymentProvider
     * @throws Zend_Controller_Exception
     * @return Local_Payment_GatewayInterface
     */
    protected function createPaymentGateway($paymentProvider)
    {
        $httpHost = $this->getRequest()->getHttpHost();
        /** @var Zend_Config $config */
        $config = Zend_Registry::get('config');
        $helperBuildProductUrl = new Default_View_Helper_BuildProductUrl();
        switch ($paymentProvider) {
            case 'paypal':
                $paymentGateway = new Default_Model_PayPal_Gateway($config->third_party->paypal);
                $paymentGateway->setIpnNotificationUrl('http://' . $httpHost . '/gateway/paypal');
//                $paymentGateway->setIpnNotificationUrl('http://' . $httpHost . '/gateway/paypal?XDEBUG_SESSION_START=1');
                $paymentGateway->setCancelUrl($helperBuildProductUrl->buildProductUrl($this->_projectId,
                    'paymentcancel', null, true));
                $paymentGateway->setReturnUrl($helperBuildProductUrl->buildProductUrl($this->_projectId, 'paymentok',
                    null, true));
                break;

            case 'dwolla':
                $paymentGateway = new Default_Model_Dwolla_Gateway($config->third_party->dwolla);
                $paymentGateway->setIpnNotificationUrl('http://' . $httpHost . '/gateway/dwolla');
//                $paymentGateway->setIpnNotificationUrl('http://' . $_SERVER ['HTTP_HOST'] . '/gateway/dwolla?XDEBUG_SESSION_START=1');
                $paymentGateway->setReturnUrl($helperBuildProductUrl->buildProductUrl($this->_projectId, 'dwolla', null,
                    true));
                break;

            case 'amazon':
                $paymentGateway = new Default_Model_Amazon_Gateway($config->third_party->amazon);
                $paymentGateway->setIpnNotificationUrl('http://' . $httpHost . '/gateway/amazon');
//                $paymentGateway->setIpnNotificationUrl('http://' . $httpHost . '/gateway/amazon?XDEBUG_SESSION_START=1');
                $paymentGateway->setCancelUrl($helperBuildProductUrl->buildProductUrl($this->_projectId,
                    'paymentcancel', null, true));
                $paymentGateway->setReturnUrl($helperBuildProductUrl->buildProductUrl($this->_projectId, 'paymentok',
                    null, true));
                break;

            default:
                throw new Zend_Controller_Exception('No known payment provider found in parameters.');
                break;
        }

        return $paymentGateway;
    }

    public function dwollaAction()
    {
        $modelPling = new Default_Model_DbTable_Plings();
        $plingData = $modelPling->fetchRow(array('payment_reference_key = ?' => $this->getParam('checkoutId')));
        $plingData->payment_transaction_id = (int)$this->getParam('transaction');
        $plingData->save();

        if ($this->_getParam('status') == 'Completed') {
            $this->_helper->viewRenderer('paymentok');
            $this->paymentokAction();
        } else {
            $this->_helper->viewRenderer('paymentcancel');
            $this->paymentcancelAction();
        }
    }

    public function paymentokAction()
    {
        $this->_helper->layout()->disableLayout();
        $this->view->paymentStatus = 'success';
        $this->view->paymentMessage = 'Payment successful.';
        $this->fetchDataForIndexView();
    }

    public function paymentcancelAction()
    {
        $this->_helper->layout()->disableLayout();
        $this->view->paymentStatus = 'danger';
        $this->view->paymentMessage = 'Payment cancelled.';
        $this->fetchDataForIndexView();
    }

    public function deleteAction()
    {
        $this->_helper->layout()->setLayout('flat_ui');

        $memberId = (int)$this->getParam('m');

        if ((empty($this->_authMember->member_id))
            OR
            (empty($memberId))
            OR
            ($this->_authMember->member_id != $memberId)
        ) {
            $this->forward('products', 'user', 'default');
            return;
        }

        $tableProduct = new Default_Model_Project();
        $tableProduct->setDeleted($this->_projectId);

        $product = $tableProduct->find($this->_projectId)->current();

        // delete product from search index
        $modelSearch = new Default_Model_Search_Lucene();
        $modelSearch->deleteDocument($product->toArray());
//        $command = new Backend_Commands_DeleteProductExtended($product);
//        $command->doCommand();
//        $queue = Local_Queue_Factory::getQueue('search');
//        $command = new Backend_Commands_DeleteProductFromIndex($product->project_id, $product->project_category_id);
//        $msg = $queue->send(serialize($command));

        // ppload
        // Delete collection
        if ($product->ppload_collection_id) {
            // require_once 'Ppload/Api.php';
            $pploadApi = new Ppload_Api(array(
                'apiUri' => PPLOAD_API_URI,
                'clientId' => PPLOAD_CLIENT_ID,
                'secret' => PPLOAD_SECRET
            ));
            $collectionResponse = $pploadApi->deleteCollection(ltrim($product->ppload_collection_id, '!'));
        }

        $activityLog = new Default_Model_ActivityLog();
        $activityLog->writeActivityLog($this->_projectId, $memberId, Default_Model_ActivityLog::PROJECT_DELETED,
            $product->toArray());

        $this->forward('products', 'user', 'default');
    }

    public function unpublishAction()
    {
        $this->_helper->layout()->setLayout('flat_ui');

        $memberId = (int)$this->getParam('m');

        if ((empty($this->_authMember->member_id))
            OR (empty($memberId))
            OR ($this->_authMember->member_id != $memberId)
        ) {
            return;
        }

        $tableProduct = new Default_Model_Project();
        $tableProduct->setInActive($this->_projectId);

        $product = $tableProduct->find($this->_projectId)->current();

        if (isset($product->type_id) && $product->type_id == Default_Model_Project::PROJECT_TYPE_UPDATE) {
            $parentProduct = $tableProduct->find($product->pid)->current();
            $product->image_small = $parentProduct->image_small;
        }

        $activityLog = new Default_Model_ActivityLog();
        $activityLog->writeActivityLog($this->_projectId, $memberId, Default_Model_ActivityLog::PROJECT_UNPUBLISHED,
            $product->toArray());

        // remove unpublished project from search index
        $modelSearch = new Default_Model_Search_Lucene();
        $modelSearch->deleteDocument($product);

        // ppload
        if ($product->ppload_collection_id) {
            // require_once 'Ppload/Api.php';
            $pploadApi = new Ppload_Api(array(
                'apiUri' => PPLOAD_API_URI,
                'clientId' => PPLOAD_CLIENT_ID,
                'secret' => PPLOAD_SECRET
            ));
            // Update collection information
            $collectionRequest = array(
                'category' => $product->project_category_id
            );
            $collectionResponse = $pploadApi->putCollection(
                ltrim($product->ppload_collection_id, '!'),
                $collectionRequest
            );
        }

//        $this->setViewDataForMyProducts($memberId);
//
//        $this->renderScript('user/products.phtml');
        $this->forward('products', 'user', 'default');
    }

    public function publishAction()
    {
        $memberId = (int)$this->getParam('m');

        if ((empty($this->_authMember->member_id))
            OR (empty($memberId))
            OR ($this->_authMember->member_id != $memberId)
        ) {
            return;
        }

        $tableProduct = new Default_Model_Project();
        $tableProduct->setActive($this->_projectId);

        $product = $tableProduct->find($this->_projectId)->current();

        if (isset($product->type_id) && $product->type_id == Default_Model_Project::PROJECT_TYPE_UPDATE) {
            $parentProduct = $tableProduct->find($product->pid)->current();
            $product->image_small = $parentProduct->image_small;
        }

        $activityLog = new Default_Model_ActivityLog();
        $activityLog->writeActivityLog($this->_projectId, $memberId, Default_Model_ActivityLog::PROJECT_PUBLISHED,
            $product->toArray());

        // add published project to search index
        $productInfo = $tableProduct->fetchProductInfo($this->_projectId);
        $modelSearch = new Default_Model_Search_Lucene();
        $modelSearch->addDocument($productInfo);

        // ppload
        if ($product->ppload_collection_id) {
            // require_once 'Ppload/Api.php';
            $pploadApi = new Ppload_Api(array(
                'apiUri' => PPLOAD_API_URI,
                'clientId' => PPLOAD_CLIENT_ID,
                'secret' => PPLOAD_SECRET
            ));
            // Update collection information
            $collectionRequest = array(
                'category' => $product->project_category_id . '-published'
            );
            $collectionResponse = $pploadApi->putCollection(
                ltrim($product->ppload_collection_id, '!'),
                $collectionRequest
            );
        }

//        $this->setViewDataForMyProducts($memberId);
//
//        $this->renderScript('user/products.phtml');
        $this->forward('products', 'user', 'default');
    }

    public function followAction()
    {
        $this->_helper->layout()->disableLayout();
//        $this->_helper->viewRenderer->setNoRender(true);

        $this->view->product_id = $this->_projectId;
        $this->view->authMember = $this->_authMember;

        if (array_key_exists($this->_projectId, $this->_authMember->projects)) {
            return;
        }

        $projectFollowTable = new Default_Model_DbTable_ProjectFollower();

        $newVals = array('project_id' => $this->_projectId, 'member_id' => $this->_authMember->member_id);
        $where = $projectFollowTable->select()
            ->where('member_id = ?', $this->_authMember->member_id)
            ->where('project_id = ?', $this->_projectId, 'INTEGER');
        $result = $projectFollowTable->fetchRow($where);
        if (null === $result) {
            $projectFollowTable->createRow($newVals)->save();

            $tableProduct = new Default_Model_Project();
            $product = $tableProduct->find($this->_projectId)->current();

            $activityLog = new Default_Model_ActivityLog();
            $activityLog->writeActivityLog($this->_projectId, $this->_authMember->member_id,
                Default_Model_ActivityLog::PROJECT_FOLLOWED, $product->toArray());

        }

        // ppload
        // Add collection to favorite
        $projectTable = new Default_Model_DbTable_Project();
        $projectData = $projectTable->find($this->_projectId)->current();
        if ($projectData->ppload_collection_id) {
            // require_once 'Ppload/Api.php';
            $pploadApi = new Ppload_Api(array(
                'apiUri' => PPLOAD_API_URI,
                'clientId' => PPLOAD_CLIENT_ID,
                'secret' => PPLOAD_SECRET
            ));
            $favoriteRequest = array(
                'user_id' => $this->_authMember->member_id,
                'collection_id' => ltrim($projectData->ppload_collection_id, '!')
            );
            $favoriteResponse = $pploadApi->postFavorite($favoriteRequest);
        }
    }

    public function unfollowAction()
    {
        $this->_helper->layout()->disableLayout();
        $this->_helper->viewRenderer('follow');

        $this->view->product_id = $this->_projectId;
        $this->view->authMember = $this->_authMember;

        $projectFollowTable = new Default_Model_DbTable_ProjectFollower();

        $projectFollowTable->delete('member_id=' . $this->_authMember->member_id . ' AND project_id=' . $this->_projectId);

        $tableProduct = new Default_Model_Project();
        $product = $tableProduct->find($this->_projectId)->current();

        $activityLog = new Default_Model_ActivityLog();
        $activityLog->writeActivityLog($this->_projectId, $this->_authMember->member_id,
            Default_Model_ActivityLog::PROJECT_UNFOLLOWED, $product->toArray());

        // ppload
        // Delete collection from favorite
        $projectTable = new Default_Model_DbTable_Project();
        $projectData = $projectTable->find($this->_projectId)->current();
        if ($projectData->ppload_collection_id) {
            // require_once 'Ppload/Api.php';
            $pploadApi = new Ppload_Api(array(
                'apiUri' => PPLOAD_API_URI,
                'clientId' => PPLOAD_CLIENT_ID,
                'secret' => PPLOAD_SECRET
            ));
            $favoriteRequest = array(
                'user_id' => $this->_authMember->member_id,
                'collection_id' => ltrim($projectData->ppload_collection_id, '!')
            );
            $favoriteResponse = $pploadApi->postFavorite($favoriteRequest); // This post call will retrieve existing favorite info
            if (!empty($favoriteResponse->favorite->id)) {
                $favoriteResponse = $pploadApi->deleteFavorite($favoriteResponse->favorite->id);
            }
        }
    }

    public function followsAction()
    {
        $projectFollowTable = new Default_Model_Member();

        $memberId = $this->_authMember->member_id;
        $this->view->productList = $projectFollowTable->fetchFollowedProjects($memberId);

        $projectArray = $this->generateFollowedProjectsViewData($this->view->productList);

        $this->view->productArray['followedProjects'] = $projectArray;

    }

    /**
     * @param $list
     * @return array
     */
    protected function generateFollowedProjectsViewData($list)
    {
        $viewArray = array();

        if (count($list) == 0) {
            return $viewArray;
        }

        $helperBuildProductUrl = new Default_View_Helper_BuildProductUrl();
        foreach ($list as $element) {
            $arr = array();
            $arr['id'] = $element->project_id;
            $arr['name'] = $element->title;
            $arr['image'] = $element->image_small;
            $arr['url'] = $helperBuildProductUrl->buildProductUrl($element->project_id);
            $arr['urlUnFollow'] = $helperBuildProductUrl->buildProductUrl($element->project_id, 'unfollow');
            #$arr['showUrlUnFollow'] = $this->view->isMember;

            $viewArray[] = $arr;
        }

        return $viewArray;
    }

    public function verifycodeAction()
    {
        $this->_helper->layout()->disableLayout();

        if ($this->_request->isXmlHttpRequest()) {
            $tabProject = new Default_Model_DbTable_Project();
            $dataProject = $tabProject->find($this->_projectId)->current();
            $websiteOwner = new Local_Verification_WebsiteAuthCodeExist();
            $this->view->html_verifier = $websiteOwner->generateAuthCode(stripslashes($dataProject->link_1));
            if (false == empty($dataProject->link_1)) {
                $queue = Local_Queue_Factory::createQueue('validate');
                $command = new Local_Verification_Queue_Command_WebsiteAuthCodeExist($dataProject, $dataProject->link_1,
                    $websiteOwner->generateAuthCode(stripslashes($dataProject->link_1)));
                $queue->send(serialize($command));
            }
            $this->view->message = 'Your product page is stored for validation.';
            return;
        }

        $this->view->message = 'This service is not available at the moment. Please try again later.';
    }

    public function fetchAction()
    {
        $this->_helper->layout()->disableLayout();

        if ($this->_request->isXmlHttpRequest()) {
            $this->view->authMember = $this->_authMember;

            $this->fetchDataForIndexView();
            $tableProject = new Default_Model_Project();
            $this->view->supporting = $tableProject->fetchProjectSupporterWithPlings($this->_projectId);

            if (false === isset($this->view->product)) {
                throw new Zend_Controller_Action_Exception('This page does not exist', 404);
            }

            $helperUserIsOwner = new Default_View_Helper_UserIsOwner();
            $helperIsProjectActive = new Default_View_Helper_IsProjectActive();
            if ((false === $helperIsProjectActive->isProjectActive($this->view->product->project_status)) AND (false === $helperUserIsOwner->UserIsOwner($this->view->product->member_id))) {
                throw new Zend_Controller_Action_Exception('This page does not exist', 404);
            }

            $tablePageViews = new Default_Model_DbTable_StatPageViews();
            $tablePageViews->savePageView($this->_projectId, $this->getRequest()->getClientIp(),
                $this->_authMember->member_id);

        }

        $this->_helper->json(get_object_vars($this->view));
    }

    public function claimAction()
    {
        $modelProduct = new Default_Model_Project();
        $productInfo = $modelProduct->fetchProductInfo($this->_projectId);
        if ($productInfo->claimable != Default_Model_Project::PROJECT_CLAIMABLE) {
            throw new Zend_Controller_Action_Exception('Method not available', 404);
        }
        $helperBuildProductUrl = new Default_View_Helper_BuildProductUrl();
        if (empty($productInfo->claimed_by_member)) {
            $modelProduct->setClaimedByMember($this->_authMember->member_id, $this->_projectId);

            $claimMail = new Default_Plugin_SendMail('tpl_mail_claim_product');
            $claimMail->setTemplateVar('sender', $this->_authMember->mail);
            $claimMail->setTemplateVar('productid', $productInfo->project_id);
            $claimMail->setTemplateVar('producttitle', $productInfo->title);
            $claimMail->setTemplateVar('userid', $this->_authMember->member_id);
            $claimMail->setTemplateVar('username', $this->_authMember->username);
            $claimMail->setTemplateVar('usermail', $this->_authMember->mail);
            $claimMail->setReceiverMail(array('contact@opendesktop.org'));
            $claimMail->send();

            $claimMailConfirm = new Default_Plugin_SendMail('tpl_mail_claim_confirm');
            $claimMailConfirm->setTemplateVar('sender', 'contact@opendesktop.org');
            $claimMailConfirm->setTemplateVar('producttitle', $productInfo->title);
            $claimMailConfirm->setTemplateVar('productlink',
                'http://' . $this->getRequest()->getHttpHost() . $helperBuildProductUrl->buildProductUrl($productInfo->project_id));
            $claimMailConfirm->setTemplateVar('username', $this->_authMember->username);
            $claimMailConfirm->setReceiverMail($this->_authMember->mail);
            $claimMailConfirm->send();
        }

        $this->_helper->viewRenderer('index');
        $this->indexAction();
    }

    public function makerconfigAction()
    {
        $this->_helper->layout()->disableLayout();

        $widgetProjectId = (int)$this->getParam('project_id');
        if (false == isset($widgetProjectId)) {
            throw new Zend_Controller_Action_Exception('This page does not exist', 404);
        }
        $widgetDefaultModel = new Default_Model_DbTable_ProjectWidgetDefault();
        $widgetDefault = $widgetDefaultModel->fetchConfig($widgetProjectId);
        if (!isset($widgetDefault)) {
            throw new Zend_Controller_Action_Exception('This page does not exist', 404);
        } else {
            $this->view->widgetConfig = $widgetDefault;
            $productModel = new Default_Model_Project();
            $this->view->product = $productModel->fetchProductInfo($widgetProjectId);
            $this->view->supporting = $productModel->fetchProjectSupporterWithPlings($widgetProjectId);
            $plingModel = new Default_Model_DbTable_Plings();
            $this->view->comments = $plingModel->getCommentsForProject($widgetProjectId, 10);
            $websiteOwner = new Local_Verification_WebsiteAuthCodeExist();
            $this->view->authCode = '<meta name="ocs-site-verification" content="' . $websiteOwner->generateAuthCode(stripslashes($this->view->product->link_1)) . '" />';
        }

    }

    /**
     * ppload
     */
    public function addpploadfileAction()
    {
        $this->_helper->layout()->disableLayout();
        $log = Zend_Registry::get('logger');
        $log->debug('**********' . __CLASS__ . '::' . __FUNCTION__ . '**********' . "\n");

        $projectTable = new Default_Model_DbTable_Project();
        $projectData = $projectTable->find($this->_projectId)->current();

        // Add file to ppload collection (does not append to finalized collection)
        if ((!$projectData->ppload_collection_id || $projectData->ppload_collection_id[0] != '!')
            && !empty($_FILES['file_upload']['tmp_name'])
            && $_FILES['file_upload']['error'] == UPLOAD_ERR_OK
        ) {
            $tmpFilename = dirname($_FILES['file_upload']['tmp_name']) . '/' . basename($_FILES['file_upload']['name']);
            $log->debug(__CLASS__ . '::' . __FUNCTION__ . '::' . print_r($tmpFilename, true) . "\n");
            move_uploaded_file($_FILES['file_upload']['tmp_name'], $tmpFilename);

            // require_once 'Ppload/Api.php';
            $pploadApi = new Ppload_Api(array(
                'apiUri' => PPLOAD_API_URI,
                'clientId' => PPLOAD_CLIENT_ID,
                'secret' => PPLOAD_SECRET
            ));

            $fileRequest = array(
                'file' => $tmpFilename,
                'owner_id' => $this->_authMember->member_id
            );
            if ($projectData->ppload_collection_id) {
                // Append to existing collection
                $fileRequest['collection_id'] = $projectData->ppload_collection_id;
            }
            //if (isset($_POST['file_description'])) {
            //	$fileRequest['description'] = mb_substr($_POST['file_description'], 0, 140);
            //}
            $fileResponse = $pploadApi->postFile($fileRequest);
            $log->debug(__CLASS__ . '::' . __FUNCTION__ . '::' . print_r($fileResponse, true) . "\n");

            unlink($tmpFilename);

            $error_text = '';

            if (!empty($fileResponse->file->collection_id)) {
                if (!$projectData->ppload_collection_id) {
                    // Save collection ID
                    $projectData->ppload_collection_id = $fileResponse->file->collection_id;
                    $projectData->changed_at = new Zend_Db_Expr('NOW()');
                    $projectData->save();

                    $activityLog = new Default_Model_ActivityLog();
                    $activityLog->writeActivityLog(
                        $this->_projectId,
                        $projectData->member_id,
                        Default_Model_ActivityLog::PROJECT_EDITED,
                        $projectData->toArray()
                    );
                    // Update profile information
                    $memberTable = new Default_Model_DbTable_Member();
                    $memberSettings = $memberTable->find($this->_authMember->member_id)->current();
                    $mainproject = $projectTable->find($memberSettings->main_project_id)->current();
                    $profileName = '';
                    if ($memberSettings->firstname
                        || $memberSettings->lastname
                    ) {
                        $profileName = trim(
                            $memberSettings->firstname
                            . ' '
                            . $memberSettings->lastname
                        );
                    } else {
                        if ($memberSettings->username) {
                            $profileName = $memberSettings->username;
                        }
                    }
                    $profileRequest = array(
                        'owner_id' => $this->_authMember->member_id,
                        'name' => $profileName,
                        'email' => $memberSettings->mail,
                        'homepage' => $memberSettings->link_website,
                        'description' => $mainproject->description
                    );
                    $profileResponse = $pploadApi->postProfile($profileRequest);
                    // Update collection information
                    $collectionCategory = $projectData->project_category_id;
                    if (Default_Model_Project::PROJECT_ACTIVE == $projectData->status) {
                        $collectionCategory .= '-published';
                    }
                    $collectionRequest = array(
                        'title' => $projectData->title,
                        'description' => $projectData->description,
                        'category' => $collectionCategory,
                        'content_id' => $projectData->project_id
                    );
                    $collectionResponse = $pploadApi->putCollection(
                        $projectData->ppload_collection_id,
                        $collectionRequest
                    );
                    // Store product image as collection thumbnail
                    $this->_updatePploadMediaCollectionthumbnail($projectData);
                }

                $this->_helper->json(array(
                    'status' => 'ok',
                    'file' => $fileResponse->file
                ));
                return;
            }
        }

        $log->debug('********** END ' . __CLASS__ . '::' . __FUNCTION__ . '**********' . "\n");
        $this->_helper->json(array('status' => 'error', 'error_text' => $error_text));
    }

    /**
     * ppload
     */
    public function updatepploadfileAction()
    {
        $this->_helper->layout()->disableLayout();

        $projectTable = new Default_Model_DbTable_Project();
        $projectData = $projectTable->find($this->_projectId)->current();

        $error_text = "";

        // Update a file information in ppload collection (does not update it if in finalized collection)
        if ((!$projectData->ppload_collection_id || $projectData->ppload_collection_id[0] != '!')
            && !empty($_POST['file_id'])
        ) {
            // require_once 'Ppload/Api.php';
            $pploadApi = new Ppload_Api(array(
                'apiUri' => PPLOAD_API_URI,
                'clientId' => PPLOAD_CLIENT_ID,
                'secret' => PPLOAD_SECRET
            ));

            $fileResponse = $pploadApi->getFile($_POST['file_id']);
            if (isset($fileResponse->file->collection_id)
                && $fileResponse->file->collection_id == $projectData->ppload_collection_id
            ) {
                $fileRequest = array();
                if (isset($_POST['file_description'])) {
                    $fileRequest['description'] = mb_substr($_POST['file_description'], 0, 140);
                }
                if (isset($_POST['file_category'])) {
                    $fileRequest['category'] = $_POST['file_category'];
                }
                if (isset($_POST['file_tags'])) {
                    $fileRequest['tags'] = $_POST['file_tags'];
                }
                if (isset($_POST['file_version'])) {
                    $fileRequest['version'] = $_POST['file_version'];
                }
                $fileResponse = $pploadApi->putFile($_POST['file_id'], $fileRequest);
                if (isset($fileResponse->status)
                    && $fileResponse->status == 'success'
                ) {
                    $this->_helper->json(array(
                        'status' => 'ok',
                        'file' => $fileResponse->file
                    ));
                    return;
                } else {
                    $error_text .= 'Response: $pploadApi->putFile(): ' . json_encode($fileResponse) . '; $fileResponse->status: ' . $fileResponse->status;
                }
            } else {
                $error_text .= 'PPload Response: ' . json_encode($fileResponse) . '; fileResponse->file->collection_id: ' . $fileResponse->file->collection_id . ' != $projectData->ppload_collection_id: ' . $projectData->ppload_collection_id;
            }
        } else {
            $error_text .= 'No CollectionId or no FileId. CollectionId: ' . $projectData->ppload_collection_id . ', FileId: ' . $_POST['file_id'];
        }

        $this->_helper->json(array('status' => 'error', 'error_text' => $error_text));
    }
    
    public function updatefiletypeAction()
    {
    	$this->_helper->layout()->disableLayout();
    
    	$error_text = "";
    
    	// Update a file information in ppload collection (does not update it if in finalized collection)
    	if (!empty($_POST['file_id'])) {
    		$typeId = null;
    		if(isset($_POST['file_type_id']))
				$typeId = $_POST['file_type_id'];
			
			$fileTypeTable = new Default_Model_DbTable_ProjectFiletype();
			$fileTypeTable->addFileTypeToProject($this->_projectId, $_POST['file_id'], $typeId);
			
    	} else {
    		$error_text .= 'No FileId. , FileId: ' . $_POST['file_id'];
    	}
    	
    	$this->_helper->json(array('status' => 'error', 'error_text' => $error_text));
    }

    /**
     * ppload
     */
    public function deletepploadfileAction()
    {
        $this->_helper->layout()->disableLayout();

        $projectTable = new Default_Model_DbTable_Project();
        $projectData = $projectTable->find($this->_projectId)->current();

        $error_text = '';

        // Delete file from ppload collection (does not delete it from finalized collection)
        if ((!$projectData->ppload_collection_id || $projectData->ppload_collection_id[0] != '!')
            && !empty($_POST['file_id'])
        ) {
            // require_once 'Ppload/Api.php';
            $pploadApi = new Ppload_Api(array(
                'apiUri' => PPLOAD_API_URI,
                'clientId' => PPLOAD_CLIENT_ID,
                'secret' => PPLOAD_SECRET
            ));

            $fileResponse = $pploadApi->getFile($_POST['file_id']);
            if (isset($fileResponse->file->collection_id)
                && $fileResponse->file->collection_id == $projectData->ppload_collection_id
            ) {
                $fileResponse = $pploadApi->deleteFile($_POST['file_id']);
                if (isset($fileResponse->status)
                    && $fileResponse->status == 'success'
                ) {
                    $this->_helper->json(array('status' => 'ok'));
                    return;
                } else {
                    $error_text .= 'Response: $pploadApi->putFile(): ' . json_encode($fileResponse) . '; $fileResponse->status: ' . $fileResponse->status;
                }
            }
        }

        $this->_helper->json(array('status' => 'error', 'error_text' => $error_text));
    }

    /**
     * ppload
     */
    public function deletepploadfilesAction()
    {
        $this->_helper->layout()->disableLayout();

        $projectTable = new Default_Model_DbTable_Project();
        $projectData = $projectTable->find($this->_projectId)->current();

        // Delete all files in ppload collection
        if ($projectData->ppload_collection_id) {
            // require_once 'Ppload/Api.php';
            $pploadApi = new Ppload_Api(array(
                'apiUri' => PPLOAD_API_URI,
                'clientId' => PPLOAD_CLIENT_ID,
                'secret' => PPLOAD_SECRET
            ));

            $filesRequest = array(
                'collection_id' => ltrim($projectData->ppload_collection_id, '!'),
                'perpage' => 100
            );
            $filesResponse = $pploadApi->getFiles($filesRequest);

            if (isset($filesResponse->status)
                && $filesResponse->status == 'success'
            ) {
                foreach ($filesResponse->files as $file) {
                    $fileResponse = $pploadApi->deleteFile($file->id);
                    if (!isset($fileResponse->status)
                        || $fileResponse->status != 'success'
                    ) {
                        $this->_helper->json(array('status' => 'error'));
                        return;
                    }
                }
            }

            $this->_helper->json(array('status' => 'ok'));
            return;
        }

        $this->_helper->json(array('status' => 'error'));
    }

    /**
     * ppload
     */
    public function finalizepploadcollectionAction()
    {
        $this->_helper->layout()->disableLayout();

        $projectTable = new Default_Model_DbTable_Project();
        $projectData = $projectTable->find($this->_projectId)->current();

        // '!' mark as finalized collection, and does not append file.
        if ($projectData->ppload_collection_id
            && $projectData->ppload_collection_id[0] != '!'
        ) {
            $projectData->ppload_collection_id = '!' . $projectData->ppload_collection_id;
            $projectData->changed_at = new Zend_Db_Expr('NOW()');
            $projectData->save();

            $activityLog = new Default_Model_ActivityLog();
            $activityLog->writeActivityLog(
                $this->_projectId,
                $projectData->member_id,
                Default_Model_ActivityLog::PROJECT_EDITED,
                $projectData->toArray()
            );

            $this->_helper->json(array('status' => 'ok'));
            return;
        }

        $this->_helper->json(array('status' => 'error'));
    }

    /**
     * ppload
     */
    /*public function deletepploadcollectionAction()
    {
        $this->_helper->layout()->disableLayout();

        $projectTable = new Default_Model_DbTable_Project();
        $projectData = $projectTable->find($this->_projectId)->current();

        // Delete ppload collection
        if ($projectData->ppload_collection_id) {
            // require_once 'Ppload/Api.php';
            $pploadApi = new Ppload_Api(array(
                'apiUri' => PPLOAD_API_URI,
                'clientId' => PPLOAD_CLIENT_ID,
                'secret' => PPLOAD_SECRET
            ));

            $collectionResponse = $pploadApi->deleteCollection(ltrim($projectData->ppload_collection_id, '!'));

            if (isset($collectionResponse->status)
                && $collectionResponse->status == 'success'
            ) {
                $projectData->ppload_collection_id = null;
                $projectData->changed_at = new Zend_Db_Expr('NOW()');
                $projectData->save();

                $activityLog = new Default_Model_ActivityLog();
                $activityLog->writeActivityLog(
                    $this->_projectId,
                    $projectData->member_id,
                    Default_Model_ActivityLog::PROJECT_EDITED,
                    $projectData->toArray()
                );

                $this->_helper->json(array('status' => 'ok'));
                return;
            }
        }

        $this->_helper->json(array('status' => 'error'));
    }*/

    public function saveproductAction()
    {
        $form = new Default_Form_Product();

        // we don't need to test a file which doesn't exist in this case. The Framework stumbles if $_FILES is empty.
        if ($this->_request->isXmlHttpRequest() AND (count($_FILES) == 0)) {
            $form->removeElement('image_small_upload');
//            $form->removeElement('image_big_upload');
            $form->removeSubForm('gallery');
            $form->removeElement('project_id'); //(workaround: Some Browsers send "0" in some cases.)
        }

        if (false === $form->isValid($_POST)) {
            $errors = $form->getMessages();
            $messages = $this->getErrorMessages($errors);
            $this->_helper->json(array('status' => 'error', 'messages' => $messages));
        }

        $formValues = $form->getValues();
        $formValues['status'] = Default_Model_Project::PROJECT_INCOMPLETE;

        $modelProject = new Default_Model_Project();
        $newProject = $modelProject->createProject($this->_authMember->member_id, $formValues,
            $this->_authMember->username);

        //New Project in Session, for AuthValidation (owner)
        $this->_auth->getIdentity()->projects[$newProject->project_id] = array('project_id' => $newProject->project_id);

        $this->_helper->json(array('status' => 'ok', 'project_id' => $newProject->project_id));
    }

    /**
     * @param $errors
     * @return array
     */
    protected function getErrorMessages($errors)
    {
        $messages = array();
        foreach ($errors as $element => $row) {
            if (!empty($row) && $element != 'submit') {
                foreach ($row as $validator => $message) {
                    $messages[$element][] = $message;
                }
            }
        }
        return $messages;
    }

    /**
     * @param $memberId
     */
    protected function setViewDataForMyProducts($memberId)
    {
        $tableMember = new Default_Model_Member();
        $this->view->member = $tableMember->find($memberId)->current();

        $tableProduct = new Default_Model_Project();
        $this->view->products = $tableProduct->fetchAllProjectsForMember($memberId);
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
            ->setHeader('Cache-Control', 'private, no-cache, must-revalidate', true);
    }

    /**
     * @param $hits
     * @return array
     */
    protected function generateProjectsArrayForView($hits)
    {
        $viewArray = array();
        $helperBuildProductUrl = new Default_View_Helper_BuildProductUrl();
        /** @var $hit Zend_Search_Lucene_Search_QueryHit */
        foreach ($hits as $hit) {
            $project = $hit->getDocument();
            if (null != $project->username) {
                $isUpdate = ($project->type_id == 2);
                if ($isUpdate) {
                    $showUrl = $helperBuildProductUrl->buildProductUrl($project->pid) . '#anker_' . $project->project_id;
                    $plingUrl = $helperBuildProductUrl->buildProductUrl($project->pid, 'pling');
                } else {
                    $showUrl = $helperBuildProductUrl->buildProductUrl($project->project_id);
                    $plingUrl = $helperBuildProductUrl->buildProductUrl($project->project_id, 'pling');
                }
                $projectArr = array(
                    'score' => $hit->score,
                    'id' => $project->project_id,
                    'type_id' => $project->type_id,
                    'title' => $project->title,
                    'description' => $project->description,
                    'image' => $project->image_small,
                    'plings' => 0,
                    'urlGoal' => $showUrl,
                    'urlPling' => $plingUrl,
                    'showUrlPling' => ($project->paypal_mail != null),
                    'member' => array(
                        'name' => $project->username,
                        'url' => 'member/' . $project->member_id,
                        'image' => $project->profile_image_url,
                        'id' => $project->member_id
                    )
                );
                $viewArray[] = $projectArr;
            }
        }
        return $viewArray;
    }

}
