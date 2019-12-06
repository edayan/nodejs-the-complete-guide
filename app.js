const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');

const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

var SequelizeStore = require('connect-session-sequelize')(session.Store);

const app = express();

const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true); // accept this kind of file
  } else {
    cb(null, false); // reject this kind of file
  }
};

app.use(bodyParser.urlencoded({ extended: false })); //to extract string data from request.

const upload = multer({ storage: fileStorage, fileFilter: fileFilter }) //to extract image file uploads from request.
  .single('image');
app.use(upload);

app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my long string secret',
    store: new SequelizeStore({
      db: sequelize
    }),
    resave: false,
    saveUnInitialized: false
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findByPk(req.session.user.id)
    .then(user => {
      //throw new Error ('dummy');
      if (!user) {
        next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render('500', {
    pageTitle: 'Error occured',
    path: '/500',
    isAuthenticated: true, //hard coding for now TODO:check why session is undefined
    csrfToken: req.csrfToken
  });
  //req.redirect('/500');
});

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });
//Product.belongsToMany(Order, { through: OrderItem });

sequelize
  //.sync({force: true})// overwrite the existing tables
  .sync()
  .then(user => {
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`App listening in port:${PORT}`);
    });
  })
  .catch(err => {
    console.log(err);
  });
