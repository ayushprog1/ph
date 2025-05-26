import express from "express";
import {acceptFriendRequest, addTokensToAllOldGroups, createGroup, editGroupProfile, editprofile, friendornot, getAllUser, getGroupById, getGroups, getprofile, joinGroupByToken, login, logout, register, removeFriend, sendFriendRequest } from "../controller/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router =express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/:id/profile').get(isAuthenticated,getprofile);
router.route('/profile/edit').post(isAuthenticated,upload.single('profilephoto'), editprofile);
router.route('/users').get(isAuthenticated, getAllUser);
router.route('/friend/:id').post(isAuthenticated, friendornot);
router.route('/creategroup').post(isAuthenticated, createGroup);
router.route('/groups').get(isAuthenticated, getGroups);
router.route('/request/:id').get(isAuthenticated,sendFriendRequest);
router.route('/accept/:id').get(isAuthenticated,acceptFriendRequest);
router.route('/remove/:id').get(isAuthenticated,removeFriend);
router.route('/join/:token').get(isAuthenticated, joinGroupByToken);
router.route('/group/:id').get(isAuthenticated, getGroupById);
//router.route('/groupaddtokensbulk').get(isAuthenticated, addTokensToAllOldGroups);
router.route('/group/:id/edit').post(isAuthenticated,upload.single('groupprofilephoto'),editGroupProfile);








export default router;
