import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { getmessage, sendmessage } from "../controller/message.controller.js";

const router =express.Router();

router.route('/send/:id/:pid').post(isAuthenticated, sendmessage);
router.route('/all/:id').get(isAuthenticated, getmessage);

export default router;