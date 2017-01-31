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
class Default_Plugin_AclRules extends Zend_Acl
{
    const ROLENAME_GUEST = 'guest';
    const ROLENAME_COOKIEUSER = 'cookieuser';
    const ROLENAME_FEUSER = 'feuser';
    const ROLENAME_STAFF = 'staff';
    const ROLENAME_ADMIN = 'admin';

    function __construct()
    {
        $this->addRole(new Zend_Acl_Role (self::ROLENAME_GUEST));
        $this->addRole(new Zend_Acl_Role (self::ROLENAME_COOKIEUSER), self::ROLENAME_GUEST);
        $this->addRole(new Zend_Acl_Role (self::ROLENAME_FEUSER), self::ROLENAME_COOKIEUSER);
        $this->addRole(new Zend_Acl_Role (self::ROLENAME_STAFF), self::ROLENAME_FEUSER);
        $this->addRole(new Zend_Acl_Role (self::ROLENAME_ADMIN));

        $this->addResource(new Zend_Acl_Resource ('default_logout'));
        $this->addResource(new Zend_Acl_Resource ('default_oauth'));

        $this->addResource(new Zend_Acl_Resource ('default_authorization'));
        $this->addResource(new Zend_Acl_Resource ('default_button'));
        $this->addResource(new Zend_Acl_Resource ('default_categories'));
        $this->addResource(new Zend_Acl_Resource ('default_community'));
        $this->addResource(new Zend_Acl_Resource ('default_content'));
        $this->addResource(new Zend_Acl_Resource ('default_discovery'));
        $this->addResource(new Zend_Acl_Resource ('default_donationlist'));
        $this->addResource(new Zend_Acl_Resource ('default_error'));
        $this->addResource(new Zend_Acl_Resource ('default_explore'));
        $this->addResource(new Zend_Acl_Resource ('default_gateway'));
        $this->addResource(new Zend_Acl_Resource ('default_hive'));
        $this->addResource(new Zend_Acl_Resource ('default_home'));
        $this->addResource(new Zend_Acl_Resource ('default_ocsv1')); // OCS API
        $this->addResource(new Zend_Acl_Resource ('default_productcategory'));
        $this->addResource(new Zend_Acl_Resource ('default_productcomment'));
        $this->addResource(new Zend_Acl_Resource ('default_product'));
        $this->addResource(new Zend_Acl_Resource ('default_report'));
        $this->addResource(new Zend_Acl_Resource ('default_rss'));
        $this->addResource(new Zend_Acl_Resource ('default_settings'));
        $this->addResource(new Zend_Acl_Resource ('default_supporterbox'));
        $this->addResource(new Zend_Acl_Resource ('default_user'));
        $this->addResource(new Zend_Acl_Resource ('default_widget'));
        $this->addResource(new Zend_Acl_Resource ('default_file'));

        $this->addResource(new Zend_Acl_Resource ('backend_categories'));
        $this->addResource(new Zend_Acl_Resource ('backend_claim'));
        $this->addResource(new Zend_Acl_Resource ('backend_comments'));
        $this->addResource(new Zend_Acl_Resource ('backend_content'));
        $this->addResource(new Zend_Acl_Resource ('backend_faq'));
        $this->addResource(new Zend_Acl_Resource ('backend_hive'));
        $this->addResource(new Zend_Acl_Resource ('backend_hiveuser'));
        $this->addResource(new Zend_Acl_Resource ('backend_index'));
        $this->addResource(new Zend_Acl_Resource ('backend_mail'));
        $this->addResource(new Zend_Acl_Resource ('backend_member'));
        $this->addResource(new Zend_Acl_Resource ('backend_operatingsystem'));
        $this->addResource(new Zend_Acl_Resource ('backend_project'));
        $this->addResource(new Zend_Acl_Resource ('backend_ranking'));
        $this->addResource(new Zend_Acl_Resource ('backend_reportcomments'));
        $this->addResource(new Zend_Acl_Resource ('backend_reportproducts'));
        $this->addResource(new Zend_Acl_Resource ('backend_search'));
        $this->addResource(new Zend_Acl_Resource ('backend_storecategories'));
        $this->addResource(new Zend_Acl_Resource ('backend_store'));
        $this->addResource(new Zend_Acl_Resource ('backend_tag'));
        $this->addResource(new Zend_Acl_Resource ('backend_user'));


        $this->allow(self::ROLENAME_GUEST, array(
            'default_authorization',
            'default_button',
            'default_categories',
            'default_content',
            'default_community',
            'default_donationlist',
            'default_error',
            'default_explore',
            'default_gateway',
            'default_hive',
            'default_home',
            'default_ocsv1', // OCS API
            'default_productcategory',
            'default_report',
            'default_rss',
            'default_supporterbox',
            'default_oauth'
        ));

        $this->allow(self::ROLENAME_COOKIEUSER, array(
                'default_logout',
                'default_productcomment',
                'default_settings'
            )
        );

        $this->allow(self::ROLENAME_STAFF, array(
                'backend_index',
                'backend_categories',
                'backend_claim',
                'backend_comments',
                'backend_content',
                'backend_store',
                'backend_storecategories',
                'backend_operatingsystem',
                'backend_reportcomments',
                'backend_reportproducts',
                'backend_search',
            )
        );

        $this->allow(self::ROLENAME_ADMIN);

        // resource access rights in detail

        // resource default_product
        $this->allow(self::ROLENAME_GUEST, 'default_product',
            array('index', 'show', 'getupdatesajax', 'updates', 'follows', 'fetch'));

        $this->allow(self::ROLENAME_COOKIEUSER, 'default_product',
            array(
                'add',
                'rating',
                'follow',
                'unfollow',
                'add',
                'pling',
                'pay',
                'dwolla',
                'paymentok',
                'paymentcancel',
                'saveproduct',
                'claim'
            )
        );

        $this->allow(self::ROLENAME_COOKIEUSER, 'default_product', array(
            'edit',
            'saveupdateajax',
            'deleteupdateajax',
            'update',
            'preview',
            'delete',
            'unpublish',
            'publish',
            'verifycode',
            'makerconfig',
            'addpploadfile',
            'updatepploadfile',
            'deletepploadfile',
            'deletepploadfiles',
            'finalizepploadcollection',
            'updatepackagetype',

        ), new Default_Plugin_Acl_IsProjectOwnerAssertion());


        // resource default_widget
        $this->allow(self::ROLENAME_GUEST, 'default_widget', array('index', 'render'));
        $this->allow(self::ROLENAME_COOKIEUSER, 'default_widget',
            array('save', 'savedefault', 'config'),
            new Default_Plugin_Acl_IsProjectOwnerAssertion()
        );

        $this->allow(self::ROLENAME_COOKIEUSER, 'default_file', array(
            'gitlink',
        ), new Default_Plugin_Acl_IsProjectOwnerAssertion());

        // resource default_user
        $this->allow(self::ROLENAME_GUEST, 'default_user', array('index', 'aboutme', 'share', 'report'));

        $this->allow(self::ROLENAME_COOKIEUSER, 'default_user',
            array('follow', 'unfollow', 'settings', 'products', 'news', 'activities', 'payments', 'income'));
    }

}
