import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { addComment, addnewpost,/* bookmarkspost*/ deletepost, dislikePost, getAllGroupPost, getcommentsofpost, getUserPost, likePost } from "../controller/post.controller.js";

const router = express.Router();

router.route("/addpost").post(isAuthenticated,upload.single('image'),addnewpost);
router.route("/:id/all").get(isAuthenticated,getAllGroupPost);
router.route("userpost/all").get(isAuthenticated,getUserPost);
router.route("/:id/like").get(isAuthenticated,likePost);
router.route("/:id/dislike").get(isAuthenticated,dislikePost);
router.route("/:id/comment").post(isAuthenticated, addComment);
router.route("/:id/comment/all").post(isAuthenticated,getcommentsofpost);
router.route("/delete/:id").delete(isAuthenticated,deletepost);
/*router.route("/:id/bookmark").get(isAuthenticated, bookmarkspost);*/

export default router;


