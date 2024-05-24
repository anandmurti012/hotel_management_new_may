const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const session = require('express-session');
const Hotel = require('../models/hotel');
const HotelRoom = require('../models/hotelRooms');
const RoomType = require('../models/roomType');
const Users = require('../models/users');
const Admins = require('../models/admins');
const Bookings = require('../models/booking');
router.use(bodyParser.json());


router.use(session({
  secret: 'anandMurti',
  resave: false,
  saveUninitialized: false
}));

router.get('/', (req, res) => {
  res.render('hotels/home', { page: 'Home' });
});

router.get('/hotelIndex', async (req, res) => {
  const mHotel = await Hotel.find();
  res.render('hotels/hotelIndex', { mHotel, page: 'Hotel Index' });
});

router.get('/adminPanel', async (req, res) => {
  // if (req.session.admin) {
  //   try {
      const mHotel = await Hotel.find();
      const mUsers = await Users.find();
      const mBooking = await Bookings.find();
      const mRoom = await RoomType.find();
      const mAdmin = await Admins.find();
  res.render('hotels/adminPanel', { mHotel,mUsers,mBooking,mRoom,mAdmin, page: 'Admin Panel' });
// } catch (error) {
//   console.log(error);
// }
// } else {
//   res.redirect('/adminLogin');
// }
});

router.get('/adminLogin', async (req, res) => {
  // const mHotel = await Hotel.find();
 res.render('hotels/adminLogin', { page: 'Admin Login Panel' });
});

//==============Login system -Users================
router.post('/userRegister', async (req, res) => {
  const userData = new Users(req.body.users);  
  await userData.save();
  res.send('user successfully registered')
});

var globalUserId;
router.post('/login', async(req, res)=> {
const { userId, password} = req.body;
try {
  const User = await Users.findOne({userId, password});
  if(User === null){
    return res.status(401).send("Invalid userId or password")
  }
  globalUserId = User.userId;
  console.log('User Found:', User);
  //here req.session.User is a global user valid for full project /all files.
  req.session.User = {userName: User.userName, userId:User.userId,profilePic:User.profilePic, login:"true" };
  console.log("session User->", req.session.User);
res.redirect('/hotelIndex');
} catch (error) {
  console.error("Error:", error);
  res.send(500).send("Internal Server Error");
}
});


router.get('/check-login-status', (req, res) => {
  if(req.session.User){
    res.json({loggedIn: true, userName:req.session.User.userName, userId: req.session.User.userId, profilePic: req.session.User.profilePic});
  }else{
    res.json({loggedIn: false});
  }
});

router.get('/logout', (req, res)=> {
  if (req.session.User) {   
    delete req.session.User;  
    res.redirect('/hotelIndex');  
} else {
    res.redirect('/hotelIndex');  
}
});

router.get('/user-info', (req, res) => {
  if(req.session.User){
    res.json(req.session.User);
  }else{
    res.status(401).json({error: 'Not logged in'});
  }
});

//==============login System Admin=================
router.post('/adminRegister', async(req, res)=> {
  const adminData = new Admins(req.body.admins);
  await adminData.save();
  console.log("admin Data-> ", adminData);
  res.send('admin Successfully added');
});

router.post('/adminLogin', async(req, res)=>{
  const {adminId, password } = req.body;
  try {
    const Admin = await Admins.findOne({adminId, password});
    if(Admin===null){
      return res.status(401).send("Internal server Error");
    }
    globalAdminId = Admin.adminId;
    req.session.admin = {adminName: Admin.adminName, adminId:Admin.adminId,adminProfile:Admin.adminProfile, login:"true" };
   console.log("session data=>", req.session.admin);

   res.redirect('/adminPanel');
  } catch (error) {
    console.error("Error:", error);
    res.send(500).send("Internal Server Error");
  }
});

router.get('/check-admin-login-status', (req, res) => {
  if(req.session.admin){
    res.json({adminLoggedIn:true, adminName:req.session.admin.adminName,adminId:req.session.admin.adminId, adminProfile:req.session.admin.adminProfile});
  }else{
    res.json({adminLoggedIn:false});
  }
});

router.get('/adminLogout', (req, res)=>{
if (req.session.admin) {   
        delete req.session.admin;  
        res.redirect('/hotelIndex');  
    } else {
        res.redirect('/hotelIndex');  
    }
});

router.get('/admin-info', (req, res) => {
  if(req.session.admin){
    res.json(req.session.admin);
  }else{
    res.status(401).json({error: 'Not logged in'});
  }
});

const saveHotelRoom = async (fRoomId, fPrice, fRoomNumbers, fImage) => {
  try {
    const mRoomData = await RoomType.findOne({ roomId: fRoomId });
    console.log("roomdata->", mRoomData);
    const mHotelId = currentAdminHotel.hotelId;

    console.log('mHotel Id -> ', mHotelId);
    const mHotelRoomData = await HotelRoom.findOne({ hotelId: mHotelId });

    //data available
    if (mHotelRoomData != null) {
      const existingRoomIndex = mHotelRoomData.rooms.findIndex(
        (room) => room.roomId === fRoomId
      );
      if (existingRoomIndex !== -1) {
        mHotelRoomData.rooms[existingRoomIndex] = {
          roomId: mRoomData.roomId,
          roomName: mRoomData.roomName,
          personCount: mRoomData.personCount,
          price: fPrice,
          roomNumbers: fRoomNumbers,
          image: fImage
        };
      } else {
        mHotelRoomData.rooms.push({
          roomId: mRoomData.roomId,
          roomName: mRoomData.roomName,
          personCount: mRoomData.personCount,
          price: fPrice,
          roomNumbers: fRoomNumbers,
          image: fImage
        });
      }
      await mHotelRoomData.save();
    } else {
      const mHotelRoom = new HotelRoom({
        hotelId: mHotelId,
        rooms: [
          {
            roomId: mRoomData.roomId,
            roomName: mRoomData.roomName,
            personCount: mRoomData.personCount,
            price: fPrice,
            roomNumbers: fRoomNumbers,
            image: fImage
          },
        ],
      });
      await mHotelRoom.save();
      console.log("Hotel rooms saved successfully");
    }
  } catch (error) {
    console.error("Error saving Hotel room:", error);
  }
}
var currentAdminHotel
router.get('/admin/:hotelId', async (req, res) => {
  const mHotelView = await Hotel.findOne({ hotelId: req.params.hotelId });

  currentAdminHotel = mHotelView;
  const mRoomType = await RoomType.find();
  console.log("hotel details->", currentAdminHotel.hotelId);
  const mHotelRoom = await HotelRoom.findOne({hotelId:req.params.hotelId});
  console.log("fetched arrayList of rooms in HotelRoom collection on the behalf of hotelId matched", mHotelRoom);
  const mBookings = await Bookings.find({hotelId: req.params.hotelId});
    const mUsers = await Users.find();
  res.render('hotels/adminViewHotel', { mHotelView,mBookings,mUsers, mHotelRoom, mRoomType, page: mHotelView.name });
});
router.post('/saveRoom', (req, res) => {
  const { roomId, price, roomNumbers, image } = req.body;
  console.log("saveRoom Info ->", req.body);

  saveHotelRoom(roomId, price, roomNumbers, image);
  // Send a response back to the frontend
  res.json({ message: 'Data received successfully!', roomId, price, roomNumbers, image });
});

function generateSixDigitNumber() {
  return Math.floor(Math.random() * 900000) + 100000;
}

router.post("/addHotels", async (req, res) => {
  try {
    const randomNumber = generateSixDigitNumber();
    console.log("Generated hotelId:", "hotel" + randomNumber);

    req.body.hotel.hotelId = "hotel" + randomNumber;
    req.body.hotel.nameSearch = req.body.hotel.name.toLowerCase();

    const addHotels = new Hotel(req.body.hotel);
    currentHotel = addHotels;
    console.log("addHotels-> ", addHotels);
    await addHotels.save();
    // res.send('data saved');
    res.redirect('/adminPanel');
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

var currentHotel;
router.get('/hotels/:hotelId', async (req, res) => {
  const hotelData = await Hotel.findOne({ hotelId: req.params.hotelId });
  currentHotel = hotelData;
  const mHotelRooms = await HotelRoom.findOne({hotelId:req.params.hotelId});
  console.log("hotelData->", hotelData);
  console.log("hotelRoom->", mHotelRooms);
  res.render('hotels/userViewHotel', { hotelData, mHotelRooms, page: hotelData.name });
});

router.post('/addRooms', async (req, res) => {
  const mRoomType = new RoomType(req.body.room);
  console.log("saved rooms->", mRoomType);
  await mRoomType.save();
  res.send('room Saved successfully');
});

let mStartDate, mEndDate;
const saveBookingInfo = async (f_RoomId, pStartDate, pEndDate, pNumDays, pTotalPrice, pHotelId, f_PersonCount) => {
  console.log("roomId->" + f_RoomId, ", ", "start date->" + pStartDate, ",", "end date->" + pEndDate, 
  ",", "No. of days->" + pNumDays, ",", "Total price->" + pTotalPrice, ",", "HotelId->" + pHotelId, ",",
   "userId->" + globalUserId, ",", "personCount->"+f_PersonCount);


  function getDateRange(startDateStr, endDateStr) {
    const [startDay, startMonth, startYear] = startDateStr.split('-').map(Number);
    const [endDay, endMonth, endYear] = endDateStr.split('-').map(Number);

    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);
    mStartDate = startDate;
    mEndDate = endDate;
    const dateRange = [];

  
    // Loop from start date to one day before the end date
    for (let date = startDate; date < endDate; date.setDate(date.getDate() + 1)) {
      // Push the current date to the dateRange array
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
      dateRange.push(formattedDate);
    }
    return dateRange;
  }
   
  var checkInDate = pStartDate.split("-");
  var checkOutDate = pEndDate.split("-");

  var convertedCheckInDate = new Date(checkInDate[2], checkInDate[1] - 1, checkInDate[0]);
  var convertedCheckOutDate = new Date(checkOutDate[2], checkOutDate[1] - 1, checkOutDate[0]);

  const generateSixDigitNumber = function() {
    return Math.floor(Math.random() * 900000) + 100000;
  }
  const dateRange = getDateRange(sStartDate, sEndDate);
  const sHotelRoom = await HotelRoom.findOne({ hotelId: pHotelId });
  for (let room of sHotelRoom.rooms) {
    if (room.roomId === f_RoomId) {
      const bookingId = generateSixDigitNumber();
      const myBooking = new Bookings({
        bookingDate:new Date(),
        bookingId: bookingId,
        userId: globalUserId,
        checkInDate: convertedCheckInDate,
        checkOutDate: convertedCheckOutDate,
        price: sTotalPrice,
        hotelId: sHotelId,
        roomId: sRoomId,
        personCount: sPersonCount,
        bookingStatus: "booked",
      });
      await myBooking.save();

      dateRange.forEach(date => {
        // Push the booking object into the bookings array of the current room
        room.bookings.push({
          dateId: date,
          bookingId: bookingId,
          userId: globalUserId,
          bookingStatus: "booked",
          personCount: f_PersonCount
        });
      });
      break;
    }
  }
  // Save the updated sHotelRoom document
  await sHotelRoom.save();
};

let sRoomId, sStartDate, sEndDate, sNumDays, sTotalPrice, sHotelId, sPersonCount;
router.post("/saveUserInfo", (req, res) => {
  const { roomId, startDate, endDate, numDays, totalPrice, hotelId, personCount } = req.body;
  sRoomId = roomId;
  sStartDate = startDate;
  sEndDate = endDate;
  sNumDays = numDays;
  sTotalPrice = totalPrice;
  sHotelId = hotelId;
  sPersonCount = personCount;

  console.log("request body saveBookingInfo -->", req.body);
  saveBookingInfo(roomId, startDate, endDate, numDays, totalPrice, hotelId, personCount);
});

module.exports = router;