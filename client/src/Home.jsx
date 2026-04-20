import React, { useState } from "react";
import "./Home.css";

function Home({ setCurrentPage, setCompanyType: setAppCompanyType, setSkills, setPreparationTime: setAppPreparationTime }) {
  const [companyType, setCompanyType] = useState(null);
  const [skillset, setSkillset] = useState("");
  const [preparationTime, setPreparationTime] = useState(4);

  const handleGeneratePlan = () => {
    if (!companyType && !skillset) {
      alert("Please select a company type or enter your skillset");
      return;
    }

    // If custom skillset provided, use it; otherwise use company type
    const skillsToUse = skillset 
      ? skillset.split(",").map((s) => s.trim())
      : [];

    // send values to App.jsx
    setAppCompanyType(companyType);
    setSkills(skillsToUse);
    setAppPreparationTime(preparationTime);

    setCurrentPage("dashboard");
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="hero-section">
          <span className="ai-badge">⚡ AI-Powered Prep Planner</span>
          <h1 className="main-title">
            Crack Your Next <br />
            <span className="highlight">Interview with Confidence</span>
          </h1>
          <p className="subtitle">
            Generate a personalized study roadmap tailored to your skills, timeline,
            <br />
            and target company type.
          </p>
        </div>

        <div className="form-container">
          <div className="form-panel">
            <div className="form-section">
              <h3 className="form-title">🏢 Target Company Type</h3>
              <div className="company-type-grid">
                <button
                  className={`company-btn ${
                    companyType === "product" ? "active" : ""
                  }`}
                  onClick={() => setCompanyType("product")}
                >
                  <span className="code-icon">&lt;/&gt;</span>
                  <h4>Product Based</h4>
                  <p>Focus on DSA, System Design, Core CS</p>
                </button>
                <button
                  className={`company-btn ${
                    companyType === "service" ? "active" : ""
                  }`}
                  onClick={() => setCompanyType("service")}
                >
                  <span className="building-icon">🏢</span>
                  <h4>Service Based</h4>
                  <p>Focus on Aptitude, Basics, Communication</p>
                </button>
              </div>
              
            </div>

            <div className="form-section">
              <h3 className="form-title">💻 Target Skills (Optional)</h3>
              <textarea
                className="skillset-input"
                placeholder="e.g. Java, Python, Machine Learning... (leave empty to use company type defaults)"
                value={skillset}
                onChange={(e) => setSkillset(e.target.value)}
              />
            </div>

            <div className="form-section">
              <h3 className="form-title">⏱️ Preparation Time (Weeks)</h3>
              <div className="time-input-group">
                <input
                  type="number"
                  className="time-input"
                  value={preparationTime}
                  onChange={(e) =>
                    setPreparationTime(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  min="1"
                  max="52"
                />
                <span className="time-label">Weeks</span>
              </div>
            </div>

            <button className="generate-btn" onClick={handleGeneratePlan}>
              Generate My Plan
            </button>
          </div>

          <div className="features-panel">
            <div className="feature-card purple">
              <h3>📚 Targeted Curriculum</h3>
              <p>
                We analyze thousands of interview experiences to prioritize
                high-yield topics.
              </p>
            </div>

            <div className="feature-card purple">
              <h3>🔗 Resource Aggregation</h3>
              <p>
                Get direct links to the best tutorials, documentation, and
                practice problems.
              </p>
            </div>

            <div className="feature-card green">
              <h3>⏰ Smart Scheduling</h3>
              <p>
                Adaptive timelines that respect your current proficiency and
                available time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
