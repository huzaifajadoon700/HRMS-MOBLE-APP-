const mongoose = require('mongoose');
const Room = require('./Models/Room');
const Table = require('./Models/Table');
const Menu = require('./Models/Menu');

async function checkData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hrms');
    console.log('Connected to MongoDB');
    
    const roomCount = await Room.countDocuments();
    const tableCount = await Table.countDocuments();
    const menuCount = await Menu.countDocuments();
    
    console.log('\n=== CURRENT DATABASE STATE ===');
    console.log('Rooms:', roomCount);
    console.log('Tables:', tableCount);
    console.log('Menu Items:', menuCount);
    
    // Get categories breakdown
    const menuCategories = await Menu.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\nMenu Categories:');
    menuCategories.forEach(cat => console.log('  ' + cat._id + ':', cat.count));
    
    // Room types
    const roomTypes = await Room.aggregate([
      { $group: { _id: '$roomType', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\nRoom Types:');
    roomTypes.forEach(type => console.log('  ' + type._id + ':', type.count, 'rooms, Avg Rs.' + Math.round(type.avgPrice)));
    
    // Table types
    const tableTypes = await Table.aggregate([
      { $group: { _id: '$tableType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\nTable Types:');
    tableTypes.forEach(type => console.log('  ' + type._id + ':', type.count));
    
    // Sample data
    const sampleRoom = await Room.findOne();
    const sampleTable = await Table.findOne();
    const sampleMenu = await Menu.findOne();
    
    console.log('\n=== SAMPLE DATA ===');
    console.log('Room:', sampleRoom ? `${sampleRoom.roomNumber} - ${sampleRoom.roomType} - Rs.${sampleRoom.price}` : 'None');
    console.log('Table:', sampleTable ? `${sampleTable.tableName} - ${sampleTable.capacity} seats` : 'None');
    console.log('Menu:', sampleMenu ? `${sampleMenu.name} - Rs.${sampleMenu.price} (${sampleMenu.category})` : 'None');
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkData();
