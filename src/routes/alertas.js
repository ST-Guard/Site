const express = require("express");
const router = express.Router();

const { obterS3UrlController } = require("../controllers/s3Controller");

router.get("/obter-url-s3", obterS3UrlController);

module.exports = router;
