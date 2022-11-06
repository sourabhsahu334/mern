const auth = require( "../midelware/auth");
const express= require("express");
const {about,login, network}= require( '../path/paths');

const router=express.Router();
router.route("/about",auth).get(about);
router.route("/").get(login);
//router.route('/network').get(network)
module.exports=router;