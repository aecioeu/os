const router = require('express').Router();
const passport = require('passport');
const { isLoggedIn } = require('../config/functions')

//Estrutura /

router.get("/register", async function (req, res, next) {
  res.render("admin/register.ejs");
});

router.post(
  "/signup",
  passport.authenticate("local-signup", {
    failureRedirect: "/register", // redirect back to the signup page if there is an error
    failureFlash: true, // allow flash messages
  }),
  function (req, res) {
    req.session.save(() => {
      res.redirect("/dashboard?tour=true");
    });
  }
);


router.get("/login", async function (req, res, next) {
  res.render("admin/login.ejs");
});


router.post(
  "/signin",
  passport.authenticate("local-login", {
    failureRedirect: "/login",
    failureFlash: true, // allow flash messages
  }),
  function (req, res) {
    req.session.save(() => {
      res.redirect(
        req.session.urlRedirect ? req.session.urlRedirect : "/dashboard"
      );
    });
  }
);



router.get("/dashboard", isLoggedIn, async function (req, res, next) {
  res.render("admin/dashboard.ejs", {
    user : req.user
  });
});

module.exports = router;