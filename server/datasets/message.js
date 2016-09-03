var mongoose = require("mongoose");

module.exports = mongoose.model('Message', {
	created: {type: Date, default: Date.now()},
	user: String,
	message: String,
	room: String
});