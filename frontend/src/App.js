import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const API = "http://localhost:8000/api";

// --- Visual Diagram Component ---
const LiveDiagram = ({ projects, tasks, members, skills }) => {
  const containerRef = useRef(null);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const updateLines = () => {
      const newLines = [];
      
      // 1. One-to-Many Lines (Projects -> Tasks)
      tasks.forEach(task => {
        const projectEl = document.getElementById(`project-${task.projectId?._id}`);
        const taskEl = document.getElementById(`task-${task._id}`);
        if (projectEl && taskEl && containerRef.current) {
          const rectP = projectEl.getBoundingClientRect();
          const rectT = taskEl.getBoundingClientRect();
          const rectC = containerRef.current.getBoundingClientRect();

          newLines.push({
            x1: rectP.right - rectC.left,
            y1: rectP.top + rectP.height/2 - rectC.top,
            x2: rectT.left - rectC.left,
            y2: rectT.top + rectT.height/2 - rectC.top,
            color: "#4f46e5",
            type: "one-to-many"
          });
        }
      });

      // 2. Many-to-Many Lines (Members <-> Skills)
      members.forEach(member => {
        member.skills.forEach(skill => {
          const memberEl = document.getElementById(`member-${member._id}`);
          const skillEl = document.getElementById(`skill-${skill._id || skill}`);
          if (memberEl && skillEl && containerRef.current) {
            const rectM = memberEl.getBoundingClientRect();
            const rectS = skillEl.getBoundingClientRect();
            const rectC = containerRef.current.getBoundingClientRect();

            newLines.push({
              x1: rectM.right - rectC.left,
              y1: rectM.top + rectM.height/2 - rectC.top,
              x2: rectS.left - rectC.left,
              y2: rectS.top + rectS.height/2 - rectC.top,
              color: "#10b981",
              type: "many-to-many"
            });
          }
        });
      });

      setLines(newLines);
    };

    const timer = setTimeout(updateLines, 500); // Wait for DOM to render
    window.addEventListener("resize", updateLines);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateLines);
    };
  }, [projects, tasks, members, skills]);

  return (
    <div className="section" style={{ padding: 0, overflow: "visible" }}>
      <div className="diagram-container" ref={containerRef}>
        <div className="diagram-label">Live Relationship Engine</div>
        
        <svg className="diagram-lines">
          {lines.map((line, i) => (
            <line 
              key={i} 
              x1={line.x1} y1={line.y1} 
              x2={line.x2} y2={line.y2} 
              stroke={line.color} 
              strokeWidth="2" 
              strokeDasharray={line.type === "many-to-many" ? "5,5" : "0"}
            />
          ))}
        </svg>

        <div className="node-group">
          <strong>Projects</strong>
          {projects.map(p => <div key={p._id} id={`project-${p._id}`} className="diagram-node">{p.name}</div>)}
        </div>

        <div className="node-group">
          <strong>Tasks</strong>
          {tasks.map(t => <div key={t._id} id={`task-${t._id}`} className="diagram-node" style={{ borderColor: "#818cf8" }}>{t.title}</div>)}
        </div>

        <div className="node-group">
          <strong>Team Members</strong>
          {members.map(m => <div key={m._id} id={`member-${m._id}`} className="diagram-node" style={{ borderColor: "#10b981" }}>{m.name}</div>)}
        </div>

        <div className="node-group">
          <strong>Specialist Skills</strong>
          {skills.map(s => <div key={s._id} id={`skill-${s._id}`} className="diagram-node" style={{ borderColor: "#34d399" }}>{s.title}</div>)}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [editProjectId, setEditProjectId] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  const [members, setMembers] = useState([]);
  const [skills, setSkills] = useState([]);

  const [memberName, setMemberName] = useState("");
  const [skillName, setSkillName] = useState("");

  const [selectedMember, setSelectedMember] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");

  // API Calls
  const fetchData = async () => {
    try {
      const p = await axios.get(`${API}/project`); setProjects(p.data);
      const t = await axios.get(`${API}/task`); setTasks(t.data);
      const m = await axios.get(`${API}/member`); setMembers(m.data);
      const s = await axios.get(`${API}/skill`); setSkills(s.data);
    } catch (e) {}
  };

  useEffect(() => { fetchData(); }, []);

  const addProject = async () => {
    if (!projectName) return;
    if (editProjectId) {
      await axios.put(`${API}/project/${editProjectId}`, { name: projectName });
      setEditProjectId(null);
    } else {
      await axios.post(`${API}/project`, { name: projectName });
    }
    setProjectName(""); fetchData();
  };

  const addTask = async () => {
    if (!taskTitle || !selectedProject) return;
    await axios.post(`${API}/task`, { title: taskTitle, projectId: selectedProject });
    setTaskTitle(""); fetchData();
  };

  const assignSkill = async () => {
    if (!selectedMember || !selectedSkill) return;
    await axios.post(`${API}/assign-skill`, { memberId: selectedMember, skillId: selectedSkill });
    fetchData();
  };

  return (
    <div className="container">
      <header style={{ marginBottom: "40px" }}>
        <h1 style={{ marginBottom: "5px" }}>ProManage Dashboard</h1>
        <p style={{ textAlign: "center", color: "#64748b" }}>Enterprise Project & Resource Tracker</p>
      </header>

      {/* LIVE DIAGRAM */}
      <LiveDiagram projects={projects} tasks={tasks} members={members} skills={skills} />

      <div className="flex-row">
        {/* PROJECTS */}
        <div className="flex-col section">
          <h2>Projects</h2>
          <div className="input-group">
            <input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Project Name" />
            <button onClick={addProject}>{editProjectId ? "Update" : "Create"}</button>
          </div>
          {projects.map(p => (
            <div key={p._id} className="list-item">
              {p.name}
              <div>
                <button className="secondary" onClick={() => { setProjectName(p.name); setEditProjectId(p._id); }}>Edit</button>
                <button className="danger" onClick={async () => { await axios.delete(`${API}/project/${p._id}`); fetchData(); }}>×</button>
              </div>
            </div>
          ))}
        </div>

        {/* TASKS */}
        <div className="flex-col section">
          <h2>Tasks <small style={{ fontSize: "0.7rem", color: "#6366f1" }}>(One-to-Many)</small></h2>
          <select onChange={e => setSelectedProject(e.target.value)} value={selectedProject}>
            <option value="">Assign to Project</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <div className="input-group" style={{ marginTop: "10px" }}>
            <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Task Title" />
            <button onClick={addTask}>Add</button>
          </div>
          {tasks.map(t => (
            <div key={t._id} className="list-item">
              <div>
                {t.title}
                <div className="relationship-info">Project: {t.projectId?.name || "None"}</div>
              </div>
              <button className="danger" onClick={async () => { await axios.delete(`${API}/task/${t._id}`); fetchData(); }}>×</button>
            </div>
          ))}
        </div>
      </div>

      {/* TEAM & SKILLS */}
      <div className="section">
        <h2>Team Resources <small style={{ fontSize: "0.7rem", color: "#10b981" }}>(Many-to-Many)</small></h2>
        <div className="flex-row">
          <div className="flex-col">
            <div className="input-group">
              <input value={memberName} onChange={e => setMemberName(e.target.value)} placeholder="Member Name" />
              <button onClick={async () => { await axios.post(`${API}/member`, { name: memberName }); setMemberName(""); fetchData(); }}>Add</button>
            </div>
          </div>
          <div className="flex-col">
            <div className="input-group">
              <input value={skillName} onChange={e => setSkillName(e.target.value)} placeholder="New Skill" />
              <button onClick={async () => { await axios.post(`${API}/skill`, { title: skillName }); setSkillName(""); fetchData(); }}>Add</button>
            </div>
          </div>
        </div>

        <div className="input-group" style={{ marginTop: "20px", background: "#f8fafc", padding: "15px", borderRadius: "8px" }}>
          <select onChange={e => setSelectedMember(e.target.value)} value={selectedMember}>
            <option value="">Select Member</option>
            {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
          <select onChange={e => setSelectedSkill(e.target.value)} value={selectedSkill}>
            <option value="">Select Skill</option>
            {skills.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
          </select>
          <button style={{ background: "#10b981" }} onClick={assignSkill}>Assign Skill</button>
        </div>

        <div className="flex-row" style={{ marginTop: "20px" }}>
          <div className="flex-col">
            <strong>Team Members</strong>
            {members.map(m => (
              <div key={m._id} className="list-item" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                {m.name}
                <div className="relationship-info">Skills: {m.skills.map(s => s.title).join(", ") || "None"}</div>
              </div>
            ))}
          </div>
          <div className="flex-col">
            <strong>Skill Matrix</strong>
            {skills.map(s => (
              <div key={s._id} className="list-item" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                {s.title}
                <div className="relationship-info">Experts: {s.members.map(m => m.name).join(", ") || "None"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;