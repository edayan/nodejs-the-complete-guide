const { validationResult } = require('express-validator');
const Product = require('../models/product');
const fileHelper = require('../util/file');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    isAuthenticated: req.session.isLoggedIn,
    validationErrors: [],
    errorMessage: null
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = +req.body.price;
  const description = req.body.description;

  console.log('image', image);

  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      hasError: true,
      editing: false,
      product: {
        title,
        image,
        price,
        description
      },
      errorMessage: 'Attached file is not an image',
      validationErrors: [],
      isAuthenticated: req.session.isLoggedIn
    });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      hasError: true,
      editing: false,
      product: {
        title,
        image,
        price,
        description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      isAuthenticated: req.session.isLoggedIn
    });
  }

  const imageUrl = image.path;

  req.user
    .createProduct({
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description,
      userId: req.user.id
    })
    .then(result => {
      res.redirect('/admin/products');
      //throw new Error('custom error') //to test 500
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }

  const prodId = req.params.productId;
  req.user
    .getProducts({ where: { id: prodId } })
    .then(products => {
      const product = products[0];
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        hasError: false,
        product: product,
        errorMessage: null,
        validationErrors: [],
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      hasError: true,
      editing: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        id: prodId
      },
      errorMessage: errors.array()[0].msg,
      isAuthenticated: req.session.isLoggedIn,
      validationErrors: errors.array()
    });
  }

  Product.findByPk(prodId)
    .then(product => {
      if (product.userId !== req.user.id) {
        res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }

      product.description = updatedDesc;
      return product.save().then(result => {
        res.redirect('/admin/products');
      });
    })

    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
    .then(product => {
      if (product.userId === req.user.id) {
        product.destroy();
        return fileHelper.deleteFile(product.imageUrl);
      }
    })
    .then(result => {
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId)
    .then(product => {
      if (product.userId === req.user.id) {
        product.destroy();
        return fileHelper.deleteFile(product.imageUrl);
      }
    })
    .then(result => {
      res.status(200).json({ message: 'Success!' });
    })
    .catch(err => {
      res.status(500).json({ message: 'Deleting product failed.' });
    });
};

exports.getProducts = (req, res, next) => {
  req.user
    .getProducts()
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
