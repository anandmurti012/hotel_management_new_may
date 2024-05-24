const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  bookingDate: Date,
  bookingId:String,
  userId:String,
  checkInDate:Date,
  checkOutDate:Date,
  price: Number,
  hotelId:String,
  roomId:String,
  roomName:String,
  personCount:Number,
  bookingStatus:String
});

const hotelBooking = mongoose.model('booking', bookingSchema);
module.exports = hotelBooking;