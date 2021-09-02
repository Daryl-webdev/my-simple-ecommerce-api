const Product = require("../model/productModel");

exports.getAllProduct = (req, res) =>
  Product.find({}, (err, result) =>
    err ? console.log(err) : res.send(result)
  );

exports.deleteAllProd = (req, res) =>
  Product.deleteMany({}, (err, result) =>
    err ? console.log(err) : res.send("All Products Deleted")
  );

exports.retrieveActiveProducts = (req, res) => {
  Product.find({ isActive: true }, (err, activeProducts) =>
    err ? console.log(err) : res.send(activeProducts)
  );
};

exports.getProduct = (req, res) => {
  let id = req.params.productId;
  Product.findOne({ _id: id }, (err, foundProduct) => {
    if (foundProduct) {
      if (foundProduct.isActive) {
        res.send(foundProduct);
      } else {
        if (req.accessToken === undefined) {
          res.send("This Product is not available");
        } else {
          if (req.decodedUser.isAdmin) {
            res.send(foundProduct);
          } else {
            res.send("This Product is not available");
          }
        }
      }
    } else {
      res.send(`Cant find the product please check your Product ID`);
    }
  });
};

exports.createProduct = (req, res, next) => {
  let { name, description, price, category } = req.body;
  if (name && description && price) {
    let newProduct = new Product({
      name: name,
      description: description,
      price: price,
      category: category,
      productImage: req.file.path,
    });
    newProduct
      .save()
      .then(() => res.send({ success: "You added a new product" }))
      .catch((err) => res.send({ error: err }));
  } else {
    res.send({ error: "Something went Wrong" });
  }
};

exports.updateProduct = (req, res) => {
  let id = req.params.prodId;
  let { name, description, price, category } = req.body;
  if (name && description && price) {
    let updates = {
      name: name,
      price: price,
      description: description,
      category: category,
      productImage: req.file.path,
    };
    let option = { new: true };
    Product.findByIdAndUpdate(id, { $set: updates }, option, (err, result) =>
      err ? console.log(err) : res.send(result)
    );
  } else {
    res.send(false);
  }
};

exports.archiveProduct = (req, res) => {
  let id = req.params.prodId;
  Product.findOne({ _id: id }, (err, result) => {
    if (err) {
      res.send(false);
    } else {
      if (result.isActive) {
        result.isActive = false;
        result.save();
      } else {
        result.isActive = true;
        result.save();
      }
      res.send(true);
    }
  });
};
