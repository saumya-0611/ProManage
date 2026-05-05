const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema({
  name: String,
  skills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Skill"
  }]
});

module.exports = mongoose.model("TeamMember", teamMemberSchema);
