import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import Home from "./Home";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [tab, setTab] = useState("technical");
  const [search, setSearch] = useState("");
  const [companyType, setCompanyType] = useState("product");
  const [skills, setSkills] = useState([]);
  const [preparationTime, setPreparationTime] = useState(4);
  const [questions, setQuestions] = useState({ technical: [], hr: [] });
  const [resources, setResources] = useState([]);
  const [roadmap, setRoadmap] = useState([]);
  const [skillRoadmap, setSkillRoadmap] = useState({});
  const [weeklyQuestions, setWeeklyQuestions] = useState({});
  const [weeklyChecklist, setWeeklyChecklist] = useState({});
  const [currentWeek, setCurrentWeek] = useState(1);
  const [skillsToImprove, setSkillsToImprove] = useState([]);

  // Map company type to skills
  const companyTypeSkills = {
    product: ["DSA", "System Design", "DBMS", "OOP"],
    service: ["Aptitude", "Java", "Communication", "SQL"],
    startup: ["JavaScript", "React", "Node", "API"]
  };

useEffect(() => {
  if (currentPage !== "home") {
    // Use custom skills if provided, otherwise use company type skills
    const skillsToSend = skills.length > 0 ? skills : (companyTypeSkills[companyType] || []);
    
    if (skillsToSend.length === 0) return;

    fetch("http://localhost:5000/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        skills: skillsToSend,
        weeks: preparationTime
      })
    })
      .then((res) => res.json())
      .then((data) => {
        // Handle new API response format
        setSkillsToImprove(data.recognizedSkills || []);
        
        // Convert new plan format to roadmap
        const convertedRoadmap = (data.plan || []).map((week) => ({
          title: week.title,
          points: week.topics || []
        }));
        setRoadmap(convertedRoadmap);
        
        // Convert questions format for UI compatibility - distribute across weeks
        const allQuestions = data.questions?.all || [];
        
        // Separate technical and HR questions
        const technicalQuestions = allQuestions.filter(q => q.skill !== "HR");
        const hrQuestions = allQuestions.filter(q => q.skill === "HR");
        
        const techPerWeek = Math.ceil(technicalQuestions.length / preparationTime);
        const hrPerWeek = Math.ceil(hrQuestions.length / preparationTime);
        
        const newWeeklyQuestions = {};
        for (let week = 1; week <= preparationTime; week++) {
          // Technical questions
          const techStartIdx = (week - 1) * techPerWeek;
          const techEndIdx = Math.min(techStartIdx + techPerWeek, technicalQuestions.length);
          const weekTechQuestions = technicalQuestions.slice(techStartIdx, techEndIdx);
          
          // HR questions
          const hrStartIdx = (week - 1) * hrPerWeek;
          const hrEndIdx = Math.min(hrStartIdx + hrPerWeek, hrQuestions.length);
          const weekHrQuestions = hrQuestions.slice(hrStartIdx, hrEndIdx);
          
          newWeeklyQuestions[`week${week}`] = {
            technical: weekTechQuestions.map(q => `[${q.skill}] ${q.question}`),
            hr: weekHrQuestions.map(q => `[${q.skill}] ${q.question}`)
          };
        }
        setWeeklyQuestions(newWeeklyQuestions);
        
        // Create dynamic checklist for each week based on weekType
        const newWeeklyChecklist = {};
        const getChecklistForWeekType = (weekType) => {
          switch(weekType) {
            case "fundamentals":
              return [
                "Study core concepts and theory",
                "Create notes and flashcards",
                "Review prerequisites",
                "Practice basic problems",
                "Join study group discussion",
                "Consolidate learning"
              ];
            case "practice":
              return [
                "Solve 10+ coding problems",
                "Review problem solutions",
                "Identify patterns and approaches",
                "Practice similar problems",
                "Improve code efficiency",
                "Build confidence"
              ];
            case "advanced":
              return [
                "Deep dive into advanced concepts",
                "Solve complex scenarios",
                "Analyze real-world applications",
                "Optimize solutions",
                "Study edge cases",
                "Document learnings"
              ];
            case "interview":
              return [
                "Review common interview questions",
                "Practice with whiteboard",
                "Do mock interview session",
                "Analyze interview feedback",
                "Work on weak areas",
                "Final preparation"
              ];
            default:
              return [
                "Study today's topics",
                "Complete practice exercises",
                "Review key concepts",
                "Solve challenges",
                "Document learnings",
                "Plan for next day"
              ];
          }
        };
        
        for (let week = 1; week <= preparationTime; week++) {
          const weekData = convertedRoadmap[week - 1];
          const weekType = data.plan[week - 1]?.weekType || "generic";
          const weekChecklistItems = getChecklistForWeekType(weekType);
          newWeeklyChecklist[`week${week}`] = weekChecklistItems.map(item => ({
            text: item,
            done: false
          }));
        }
        setWeeklyChecklist(newWeeklyChecklist);
        
        // All questions for search
        const questionsForUI = {
          technical: allQuestions.map(q => `[${q.skill}] ${q.question}`),
          hr: []
        };
        setQuestions(questionsForUI);
        setResources(data.resources || []);
        setCurrentWeek(1);
      })
      .catch((err) => console.error("Error fetching data:", err));
  }
}, [currentPage, companyType, skills, preparationTime]);

  // Get current week's questions and checklist
  const currentWeekKey = `week${currentWeek}`;
  const currentWeekQuestions = weeklyQuestions[currentWeekKey] || { technical: [], hr: [] };
  const currentWeekChecklistItems = weeklyChecklist[currentWeekKey] || [];

  // Calculate progress from all weeks' checklist items
  const progress = useMemo(() => {
    let totalItems = 0;
    let doneItems = 0;
    
    for (let week = 1; week <= preparationTime; week++) {
      const weekKey = `week${week}`;
      const weekItems = weeklyChecklist[weekKey] || [];
      totalItems += weekItems.length;
      doneItems += weekItems.filter(item => item.done).length;
    }
    
    return totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
  }, [weeklyChecklist, preparationTime]);

  const filteredQuestions = (currentWeekQuestions[tab] || []).filter((q) =>
    q.toLowerCase().includes(search.toLowerCase())
  );

  const toggleWeeklyChecklist = (index) => {
    const updated = [...currentWeekChecklistItems];
    updated[index].done = !updated[index].done;
    setWeeklyChecklist({
      ...weeklyChecklist,
      [currentWeekKey]: updated
    });
  };

  if (currentPage === "home") {
    return (
      <Home
        setCurrentPage={setCurrentPage}
        setCompanyType={setCompanyType}
        setSkills={setSkills}
        setPreparationTime={setPreparationTime}
      />
    );
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-left">
          <span className="badge">Placement Preparation Portal</span>
          <h1>Interview Prep Guide for Campus Placements</h1>
          <p>
            Prepare smarter with aptitude practice, technical interview
            questions, HR guidance, daily checklists, and useful resources.
          </p>
          <div className="hero-buttons">
            <button onClick={() => setCurrentPage("home")}>Home</button>
          </div>
        </div>

        <div className="hero-right card">
          <h3>Preparation Progress</h3>
          <p>{progress}% completed</p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </header>

      <section>
        <h2>Preparation Roadmap</h2>
        <div className="grid three">
          {roadmap.map((item, index) => (
            <div className="card" key={index}>
              <h3>{item.title}</h3>
              <ul>
                {item.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>Week {currentWeek} - Focus Area</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            {Array.from({ length: preparationTime }, (_, i) => i + 1).map((week) => (
              <button
                key={week}
                onClick={() => setCurrentWeek(week)}
                style={{
                  padding: "8px 12px",
                  backgroundColor: currentWeek === week ? "#007bff" : "#e9ecef",
                  color: currentWeek === week ? "white" : "black",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: currentWeek === week ? "bold" : "normal"
                }}
              >
                Week {week}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid two">
        <div className="card">
          <h2>Question Bank - Week {currentWeek}</h2>
          <input
            type="text"
            placeholder="Search interview questions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="tabs">
            <button
              className={tab === "technical" ? "active" : ""}
              onClick={() => setTab("technical")}
            >
              Technical ({currentWeekQuestions.technical?.length || 0})
            </button>
            <button
              className={tab === "hr" ? "active" : ""}
              onClick={() => setTab("hr")}
            >
              HR ({currentWeekQuestions.hr?.length || 0})
            </button>
          </div>

          <div className="question-list">
            {filteredQuestions.map((q, index) => (
              <div className="question" key={index}>
                {q}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Daily Checklist - Week {currentWeek}</h2>
          <div className="checklist">
            {currentWeekChecklistItems.map((item, index) => (
              <label className="check-item" key={index}>
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleWeeklyChecklist(index)}
                />
                {item.text}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2>Useful Resources</h2>
        <div className="grid four">
          {resources.map((item, index) => (
            <div className="card" key={index}>
              <h3>{item.name}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App; 