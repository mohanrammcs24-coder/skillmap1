import { useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;
const skillOptions = [
  "HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "MySQL",
  "Java", "Spring Boot", "Python", "Pandas", "NumPy", "Scikit-learn",
  "Excel", "SQL", "Git", "APIs", "Responsive Design", "Machine Learning",
  "Data Visualization", "Statistics"
];

const interestOptions = [
  "Web Development",
  "Backend Development",
  "Full Stack",
  "Data",
  "AI / ML"
];

function App() {
  const [form, setForm] = useState({
    name: "",
    degree: "",
    interestArea: "",
    targetRole: "",
    knownSkills: []
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCount = useMemo(() => form.knownSkills.length, [form.knownSkills]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const toggleSkill = (skill) => {
    const exists = form.knownSkills.includes(skill);

    if (exists) {
      setForm({
        ...form,
        knownSkills: form.knownSkills.filter((item) => item !== skill)
      });
    } else {
      setForm({
        ...form,
        knownSkills: [...form.knownSkills, skill]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      setResult(data);
    } catch (err) {
      setError("Could not connect to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>

      <header className="hero">
        <div className="hero-badge">Advanced AI Career Guidance Project</div>
        <h1>SkillBridge AI</h1>
        <p>
          A modern skill-gap analysis platform that recommends career paths,
          missing skills, learning roadmap, resume improvements, and action plans.
        </p>
      </header>

      <main className="main-grid">
        <section className="glass-card form-card">
          <div className="card-title-row">
            <div>
              <h2>Analyze Your Skills</h2>
              <p>Fill the form and get a complete career recommendation report.</p>
            </div>
            <div className="mini-pill">{selectedCount} skills selected</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Degree</label>
                <input
                  type="text"
                  name="degree"
                  placeholder="Example: B.E CSE"
                  value={form.degree}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Interest Area</label>
                <select
                  name="interestArea"
                  value={form.interestArea}
                  onChange={handleChange}
                >
                  <option value="">Select interest area</option>
                  {interestOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Target Role (optional)</label>
                <input
                  type="text"
                  name="targetRole"
                  placeholder="Example: Full Stack Developer"
                  value={form.targetRole}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="skills-box">
              <div className="skills-head">
                <h3>Known Skills</h3>
                <span>Select the skills you already know</span>
              </div>

              <div className="skill-chip-wrap">
                {skillOptions.map((skill) => (
                  <button
                    type="button"
                    key={skill}
                    className={form.knownSkills.includes(skill) ? "skill-chip active" : "skill-chip"}
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Analyzing..." : "Generate Recommendation"}
            </button>
          </form>

          {error && <div className="error-box">{error}</div>}
        </section>

        <section className="side-panel">
             

              
           
        </section>
      </main>

      {result && (
        <section className="results-section">
          <div className="results-header">
            <div>
              <h2>Recommendation Report</h2>
              <p>
                Personalized result for <strong>{result.user.name}</strong> • {result.user.degree}
              </p>
            </div>
            <div className="score-ring">
              <span>{result.bestRecommendation.confidenceScore}%</span>
              <small>Match</small>
            </div>
          </div>

          <div className="results-grid">
            <div className="glass-card result-card highlight">
              <div className="label">Best Career Match</div>
              <h3>{result.bestRecommendation.role}</h3>
              <p>{result.bestRecommendation.category}</p>
            </div>

            <div className="glass-card result-card">
              <div className="label">Matched Skills</div>
              <div className="tag-wrap">
                {result.bestRecommendation.matchedSkills.length ? (
                  result.bestRecommendation.matchedSkills.map((skill) => (
                    <span className="tag success" key={skill}>{skill}</span>
                  ))
                ) : (
                  <span className="muted-text">No matched skills yet</span>
                )}
              </div>
            </div>

            <div className="glass-card result-card">
              <div className="label">Missing Skills</div>
              <div className="tag-wrap">
                {result.bestRecommendation.missingSkills.map((skill) => (
                  <span className="tag danger" key={skill}>{skill}</span>
                ))}
              </div>
            </div>

            <div className="glass-card result-card">
              <div className="label">What to Learn Next</div>
              <ul className="clean-list">
                {result.bestRecommendation.nextSteps.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="glass-card large-card">
              <div className="label">Learning Roadmap</div>
              <ol className="clean-list ordered">
                {result.bestRecommendation.roadmap.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>
            </div>

            <div className="glass-card large-card">
              <div className="label">Resume Improvement Suggestions</div>
              <ul className="clean-list">
                {result.bestRecommendation.resumeTips.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="glass-card large-card">
              <div className="label">Weekly Action Plan</div>
              <ul className="clean-list">
                {result.bestRecommendation.weeklyPlan.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="glass-card large-card">
              <div className="label">Other Recommended Roles</div>
              <div className="other-grid">
                {result.otherRecommendations.length ? (
                  result.otherRecommendations.map((item) => (
                    <div className="mini-reco-card" key={item.role}>
                      <h4>{item.role}</h4>
                      <p>{item.confidenceScore}% match</p>
                      <span>{item.matchedSkills} matched skills</span>
                    </div>
                  ))
                ) : (
                  <p className="muted-text">No additional roles found</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
