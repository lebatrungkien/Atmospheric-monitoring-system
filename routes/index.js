var express = require('express');
var router = express.Router();

const DataModel = require("../models/trungkienDataModel.js");

const secret = "123456";
let isLogin = false;

/* GET home page. */
router.get('/', function (req, res, next) {
  if (isLogin === true) {
    res.redirect("/home?");
  } else {
    res.sendFile('./views/login.html', { root: 'public' });
  }
});

router.post('/login', function (req, res, next) {
  if (isLogin === true) {
    res.status(200).json({ message: "success", nextUrl: "/home" })
  } else {
    const { pass } = req.body;
    if (pass === secret) {
      isLogin = true;
      res.status(200).json({ message: "success", nextUrl: "/home" })
    } else {
      res.status(200).json({ message: "failed", nextUrl: "/" })
    }
  }
})

router.get("/logout", function (req, res) {
  isLogin = false;
  res.redirect("/");
})

router.get("/home", function (req, res) {
  if (isLogin === false) {
    res.redirect("/");
  } else {
    res.sendFile('./views/home.html', { root: 'public' });
  }
})

router.get("/api/data", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const data = await DataModel.find()
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await DataModel.countDocuments();
    res.json({
      data,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      nextPageUrl: `/api/data?page=${parseInt(page) + 1}`,
    });
  } catch (err) {
    console.error(err.message);
  }
})

router.get("/api/data/:type", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { type } = req.params;
  console.log(type);
  try {
    //aggregation
    const data = await DataModel.aggregate([
      {
        $project: {
          [type]: 1,
          createdAt: 1,
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]).exec();

    const count = await DataModel.countDocuments();
    res.json({
      data,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      nextPageUrl: `/api/data/${type}?page=${parseInt(page) + 1}`,
    });
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;
