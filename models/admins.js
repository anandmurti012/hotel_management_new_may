const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  adminName: String,
  adminId: String,
  password:String,
  confirmPassword:String,
  adminProfile:String,
  address:String,
  email:String
});

const adminModel = mongoose.model('admins', adminSchema);
module.exports = adminModel;