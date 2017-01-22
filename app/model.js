var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Set the expected fields for the position. Mongoose will throw an error if a
// field is added that does not meet the type criteria 

var positionSchema = new Schema({
  path : String,
  name : String,
  team : String,
  cloud : String,
  parent : String,
  description : String,
  reports: Array,
  primary: Array,
  secondary: Array,
  resources: Schema.Types.Mixed
});

// Expose this for use elsewhere
module.exports = mongoose.model('job', positionSchema); 