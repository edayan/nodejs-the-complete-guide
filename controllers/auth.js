exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: true
  });
};

exports.postLogin = (req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      res.redirect('/');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postLogOut = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
