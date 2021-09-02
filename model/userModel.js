const mongoose = require("mongoose");
const { Schema } = mongoose;

let userSchema = new Schema({
  firstName: { type: String, dafault: undefined },
  lastName: { type: String, dafault: undefined },
  name: { type: String, dafault: undefined },
  userName: { type: String, required: true, unique: true },
  suffix: { type: String, default: undefined },
  email: { type: String, required: true, unique: true },
  password: { type: String, dafault: undefined },
  facebookUserId: { type: String, dafault: undefined },

  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
