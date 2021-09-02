const Order = require("../model/orderModel");
const Product = require("../model/productModel");
const User = require("../model/userModel");

exports.deleteAllOrders = (req, res) =>
  Order.deleteMany({}, (err, result) =>
    err ? console.log(err) : res.send(`All Orders Deleted `)
  );

exports.createOrder = (req, res) => {
  let userId = req.decodedUser.id;
  let userName = req.decodedUser.userName;
  let productId = req.params.prodId;
  Product.findOne({ _id: productId }, function (err, result) {
    if (err) {
      res.send({ error: err });
    } else {
      Order.findOne({ userId: userId }, (err, foundOrder) => {
        if (err) {
          res.send({ error: err });
        } else if (foundOrder) {
          let foundProductInfo = foundOrder.productInfo.find(
            (o) => o.productId === productId
          );
          if (foundProductInfo) {
            console.log(foundProductInfo);
            foundProductInfo.productQty += req.body.productQty;
            foundOrder.totalAmount +=
              foundProductInfo.productPrice * req.body.productQty;

            foundOrder.save((err, save) => {
              if (err) {
                res.send({ error: err });
              } else {
                res.send(save);
              }
            });
          } else {
            let newProductInfo = {
              productId: productId,
              productName: result.name,
              productPrice: result.price,
              productImage: result.productImage,
              productQty: req.body.productQty,
              productDescription: result.description,
            };
            foundOrder.productInfo.push(newProductInfo);
            foundOrder.totalAmount += result.price * req.body.productQty;
            foundOrder.save((err, save) =>
              err ? res.send({ error: err }) : res.send(save)
            );
          }
        } else {
          let newOrder = new Order({
            totalAmount: result.price * req.body.productQty,
            userName: userName,
            userId: userId,
            productInfo: [
              {
                productId: productId,
                productName: result.name,
                productPrice: result.price,
                productImage: result.productImage,
                productDescription: result.description,
                productQty: req.body.productQty,
              },
            ],
          });
          newOrder.save((err, save) => {
            if (err) {
              res.send({ error: err });
            } else {
              res.send(save);
            }
          });
        }
      });
    }
  });
};

exports.getOrder = (req, res) => {
  let id = req.decodedUser.id;

  Order.find({ userId: id }, (err, foundOrders) => {
    if (err) {
      console.log(err);
    } else {
      if (foundOrders.length > 0) {
        let orders = foundOrders.map((order) => {
          return order.productInfo;
        });
        let merged = [].concat.apply([], orders);
        res.send(merged);
      } else {
        res.send({ error: `You don't have any order` });
      }
    }
  });
};

exports.getAllOrder = (req, res) => {
  Order.find({}, (err, foundOrders) => {
    if (err) {
      console.log(err);
    } else {
      if (foundOrders.length == 0) {
        res.send({ error: "You dont have any order" });
      } else {
        res.send(`This are the Lists of All Orders \n ${foundOrders}`);
      }
    }
  });
};

// (err) ? console.log(err) : (foundOrders == undefined) ? res.send(`This are the Lists of All Orders \n ${foundOrders}`) : res.send("No Order as of now"))}

//add to cart
// exports.addToCart = (req, res) => {
//   let userId = req.decodedUser.id;
//   let userName = req.decodedUser.userName;
//   let productId = req.params.prodId;
//   Product.findOne({ _id: productId }, function (err, result) {
//     if (err) {
//       res.send({ error: err });
//     } else {
//       Order.findOne({ userId: userId }, (err, foundOrder) => {
//         if (err) {
//           res.send({ error: err });
//         } else if (foundOrder) {
//           let foundProductInfo = foundOrder.productInfo.find(
//             (o) => o.productId === productId
//           );
//           if (foundProductInfo) {
//             console.log(foundProductInfo);
//             foundProductInfo.productQty += req.body.productQty;
//             foundOrder.totalAmount +=
//               foundProductInfo.productPrice * req.body.productQty;

//             foundOrder.save((err, save) => {
//               if (err) {
//                 res.send({ error: err });
//               } else {
//                 res.send(save);
//               }
//             });
//           } else {
//             let newProductInfo = {
//               productId: productId,
//               productName: result.name,
//               productPrice: result.price,
//               productImage: result.productImage,
//               productQty: req.body.productQty,
//               productDescription: result.description,
//             };
//             foundOrder.productInfo.push(newProductInfo);
//             foundOrder.totalAmount += result.price * req.body.productQty;
//             foundOrder.save((err, save) =>
//               err ? res.send({ error: err }) : res.send(save)
//             );
//           }
//         } else {
//           let newOrder = new Order({
//             totalAmount: result.price * req.body.productQty,
//             userName: userName,
//             userId: userId,
//             productInfo: [
//               {
//                 productId: productId,
//                 productName: result.name,
//                 productPrice: result.price,
//                 productImage: result.productImage,
//                 productDescription: result.description,
//                 productQty: req.body.productQty,
//               },
//             ],
//           });
//           newOrder.save((err, save) => {
//             if (err) {
//               res.send({ error: err });
//             } else {
//               res.send(save);
//             }
//           });
//         }
//       });
//     }
//   });
// };
