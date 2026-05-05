const express = require("express");
const router = express.Router();

const Project = require("../models/Project");
const Task = require("../models/Task");
const TeamMember = require("../models/TeamMember");
const Skill = require("../models/Skill");

// ===== PROJECT CRUD =====
router.post("/project", async (req,res)=>{
  res.send(await Project.create(req.body));
});

router.get("/project", async (req,res)=>{
  res.send(await Project.find());
});

router.put("/project/:id", async (req,res)=>{
  res.send(await Project.findByIdAndUpdate(req.params.id, req.body, {new:true}));
});

router.delete("/project/:id", async (req,res)=>{
  await Project.findByIdAndDelete(req.params.id);
  res.send("Project Deleted");
});

// ===== TASK CRUD (One-to-Many) =====
router.post("/task", async (req,res)=>{
  res.send(await Task.create(req.body));
});

router.get("/task", async (req,res)=>{
  res.send(await Task.find().populate("projectId"));
});

router.delete("/task/:id", async (req,res)=>{
  await Task.findByIdAndDelete(req.params.id);
  res.send("Task Deleted");
});

// ===== TEAM MEMBER CRUD =====
router.post("/member", async (req,res)=>{
  res.send(await TeamMember.create(req.body));
});

router.get("/member", async (req,res)=>{
  res.send(await TeamMember.find().populate("skills"));
});

router.delete("/member/:id", async (req,res)=>{
  await TeamMember.findByIdAndDelete(req.params.id);
  res.send("Member Deleted");
});

// ===== SKILL CRUD =====
router.post("/skill", async (req,res)=>{
  res.send(await Skill.create(req.body));
});

router.get("/skill", async (req,res)=>{
  res.send(await Skill.find().populate("members"));
});

router.delete("/skill/:id", async (req,res)=>{
  await Skill.findByIdAndDelete(req.params.id);
  res.send("Skill Deleted");
});

// ===== ENROLL SKILL (Many-to-Many) =====
router.post("/assign-skill", async (req,res)=>{
  const {memberId, skillId} = req.body;

  await TeamMember.findByIdAndUpdate(memberId, {
    $addToSet: { skills: skillId }
  });

  await Skill.findByIdAndUpdate(skillId, {
    $addToSet: { members: memberId }
  });

  res.send("Skill Assigned");
});

router.post("/remove-skill", async (req,res)=>{
  const {memberId, skillId} = req.body;

  await TeamMember.findByIdAndUpdate(memberId, {
    $pull: { skills: skillId }
  });

  await Skill.findByIdAndUpdate(skillId, {
    $pull: { members: memberId }
  });

  res.send("Skill Removed");
});

module.exports = router;