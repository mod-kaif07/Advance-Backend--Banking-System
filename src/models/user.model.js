const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Email address is required"],
      unique: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please enter a valid email address",
      },
    },

    name: {
      type: String,
      required: [true, "Name required"],
    },

    password: {
      type: String,
      required: [true, "Password Required "],
      minlength: [6, "Password at least 6 characters long "],
      select: false,
    },
    systemUser: {
      type: Boolean,
      default: false,
      immutable: true,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
