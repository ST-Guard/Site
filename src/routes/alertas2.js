const express = require("express");
const router = express.Router();

const { obterS3UrlController2 } = require("../controllers/s3Controller2");

router.get("/obter-url-s3", obterS3UrlController2);

module.exports = router;
