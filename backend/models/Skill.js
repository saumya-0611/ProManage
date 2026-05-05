const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  title: String,
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "TeamMember"
  }]
});

module.exports = mongoose.model("Skill", skillSchema);
