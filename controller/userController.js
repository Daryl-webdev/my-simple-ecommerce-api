const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const { createAccessToken } = require("../auth");
const { OAuth2Client } = require("google-auth-library");
const _ = require("lodash");
const client = new OAuth2Client(
  "179012172148-9ro5ak1uts4dt5frs1oeer1j34ntuega.apps.googleusercontent.com"
);
const fetch = require("node-fetch");

exports.getAllUsers = (req, res) => {
  User.find({}, (err, result) => {
    res.send(result);
  });
};

exports.deleteAll = (req, res) => {
  User.deleteMany({}, (err, result) =>
    res.send("All user successfully deleted")
  );
};

exports.toNonAdmin = (req, res) => {
  let id = req.params.id;
  User.findByIdAndUpdate(
    id,
    { $set: { isAdmin: false } },
    { new: true },
    (err, updatedProfile) =>
      err ? console.log(err) : res.send("Update Success!: \n" + updatedProfile)
  );
};

exports.profile = (req, res) => {
  User.findOne({ _id: req.decodedUser.id }, (err, foundUser) => {
    err ? console.log(err) : res.send(foundUser);
  });
};

exports.registerUser = (req, res) => {
  let { email, password, isAdmin, firstName, lastName, suffix, userName } =
    req.body;
  if (email && password && firstName && lastName && userName) {
    let hashedPassword = bcrypt.hashSync(password, 10);
    User.findOne({ email: email }, (err, foundUser) => {
      if (foundUser) {
        res.send({ error: "Email already exist" });
      } else {
        User.findOne({ userName: userName }, (err, foundUserName) => {
          if (foundUserName) {
            res.send({ error: "Username already exist" });
          } else {
            let newUser = User({
              firstName: firstName,
              lastName: lastName,
              userName: userName,
              email: email,
              password: hashedPassword,
            });
            if (suffix) {
              newUser.suffix = suffix;
            }
            newUser.save((err, newUserRegistered) =>
              err
                ? console.log(err)
                : res.send({
                    success: `You successfully registered ${newUserRegistered.firstName}`,
                  })
            );
          }
        });
      }
    });
  } else {
    res.send({ error: "Something went wrong" });
  }
};

exports.login = (req, res) => {
  let { email, password, userName } = req.body;
  let { body } = req;
  if ((email && password) || (body.userName && password)) {
    User.findOne(
      { $or: [{ email: email }, { userName: userName }] },
      (err, foundUser) => {
        if (err) {
          console.log(err);
        } else {
          if (foundUser) {
            let passwordComfirmed = bcrypt.compareSync(
              password,
              foundUser.password
            );

            if (passwordComfirmed) {
              res.send({ authUser: createAccessToken(foundUser) });
            } else {
              res.send({ error: "Oopps wrong password" });
            }
          } else {
            res.send({ error: "Invalid cridential" });
          }
        }
      }
    );
  } else {
    res.send(`All fields required '—email/userName' '—password' `);
  }
};

exports.toAdmin = (req, res) => {
  if (req.params.id == "email") {
    if (req.body.email) {
      User.findOne({ email: req.body.email }, (err, foundUser) => {
        if (foundUser) {
          if (foundUser.isAdmin) {
            res.send(
              `${foundUser.firstName} is Already an Admin no need for Update`
            );
          } else {
            res.send(
              `Update Success! ${foundUser.firstName} is now an Admin: \n ${foundUser}`
            );
          }
        } else {
          res.send("Cant find your Email please try again tot tot tot");
        }
      });
    } else {
      res.send("ERROR! Please input email");
    }
  } else if (req.params.id == "username") {
    if (req.body.userName) {
      User.findOne({ userName: req.body.userName }, (err, foundUser) => {
        if (foundUser) {
          if (foundUser.isAdmin) {
            res.send(
              `${foundUser.firstName} is Already an Admin no need for Update`
            );
          } else {
            res.send(
              `Update Success! ${foundUser.firstName} is now an Admin: \n ${foundUser}`
            );
          }
        } else {
          res.send("Cant find your Username please try again tot tot tot");
        }
      });
    } else {
      res.send("ERROR! Please input userName");
    }
  } else {
    let id = req.params.id;
    User.findByIdAndUpdate(
      id,
      { $set: { isAdmin: true } },
      { new: true },
      (err, updatedProfile) =>
        err
          ? console.log(err)
          : res.send("Update Success!: \n" + updatedProfile)
    );
  }
};

//added for frontend
//for register form
exports.getEmail = (req, res) => {
  let { email } = req.body;
  User.findOne({ email: email }, (err, foundUser) => {
    if (foundUser) {
      res.send(false);
    } else {
      res.send(true);
    }
  });
};

exports.getUsername = (req, res) => {
  let { userName } = req.body;
  User.findOne({ userName: userName }, (err, foundUser) => {
    if (foundUser) {
      res.send(false);
    } else {
      res.send(true);
    }
  });
};

exports.googleLogin = (req, res) => {
  const { tokenId } = req.body;
  client
    .verifyIdToken({
      idToken: tokenId,
      audience:
        "179012172148-9ro5ak1uts4dt5frs1oeer1j34ntuega.apps.googleusercontent.com",
    })
    .then((response) => {
      const { email_verified, name, given_name, family_name, email } =
        response.payload;
      console.log(response);
      if (email_verified) {
        User.findOne({ email }, (err, result) => {
          if (err) {
            return res.status(400).json({ error: "Something went wrong" });
          } else {
            if (result) {
              res.send({ authUser: createAccessToken(result) });
            } else {
              let hashedPassword = bcrypt.hashSync(family_name, 10);
              let newUserName =
                _.upperCase(
                  given_name
                    .split(" ")
                    .map((x) => x[0])
                    .join("") + family_name.substr(0, 3)
                ) +
                "_" +
                Math.random().toString(36).substr(2, 9);
              let newUser = User({
                firstName: given_name,
                lastName: family_name,
                userName: newUserName,
                email: email,
                password: hashedPassword,
              });
              newUser
                .save()
                .then((savedUser) => {
                  res.send({ authUser: createAccessToken(savedUser) });
                })
                .catch((err) => {
                  return res.status(400).json({ error: err.message });
                });
            }
          }
        });
      }
    });
};

exports.facebookLogin = (req, res) => {
  const { accessToken, userID } = req.body;
  let urlGraphFB = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;
  fetch(urlGraphFB, {
    method: "GET",
  })
    .then((res) => res.json())
    .then((data) => {
      const { name, email } = data;
      User.findOne({ email }, (err, result) => {
        if (err) {
          res.send({ error: err.message });
        } else if (result) {
          res.send({ authUser: createAccessToken(result) });
        } else {
          let newUserName =
            _.upperCase(
              name
                .split(" ")
                .map((x) => x[0])
                .join("") +
                name.substr(name.lastIndexOf(" ")).slice(1).substr(0, 3)
            ).replace(" ", "") +
            "_" +
            Math.random().toString(36).substr(2, 9);

          let newUser = User({
            name: name,
            userName: newUserName,
            email: email,
            facebookUserId: userID,
          });
          newUser
            .save()
            .then((savedUser) => {
              res.send({ authUser: createAccessToken(savedUser) });
            })
            .catch((err) => {
              return res.status(400).json({ error: err.message });
            });
        }
      });
    })
    .catch((err) => res.send({ error: err.message }));
};
