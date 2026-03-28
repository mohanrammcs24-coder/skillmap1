const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config(); 
const db = require("./db");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const roleDatabase = [
  {
    role: "Frontend Developer",
    category: "Web Development",
    requiredSkills: ["HTML", "CSS", "JavaScript", "React", "Git", "Responsive Design", "APIs"],
    roadmap: [
      "Master HTML, CSS, and JavaScript fundamentals",
      "Learn React component-based development",
      "Build responsive projects and connect APIs",
      "Learn Git and GitHub for version control",
      "Create portfolio projects and deploy them"
    ],
    resumeTips: [
      "Highlight React projects with screenshots and live links",
      "Mention responsive UI and API integration experience",
      "Add GitHub and deployment links clearly"
    ],
    weeklyPlan: [
      "Week 1: HTML, CSS, Flexbox, Grid revision",
      "Week 2: JavaScript ES6 and DOM practice",
      "Week 3: React basics and components",
      "Week 4: API fetch, routing, and project build"
    ]
  },
  {
    role: "Backend Developer",
    category: "Backend Development",
    requiredSkills: ["Java", "Spring Boot", "Node.js", "Express", "MySQL", "REST API", "Git"],
    roadmap: [
      "Learn server-side programming concepts",
      "Build REST APIs using Node.js or Spring Boot",
      "Understand database design and SQL queries",
      "Practice authentication and CRUD operations",
      "Deploy backend services and test APIs"
    ],
    resumeTips: [
      "Mention CRUD, REST API, and database projects",
      "Add tech stack clearly: Node/Express or Java/Spring Boot",
      "Show backend architecture understanding"
    ],
    weeklyPlan: [
      "Week 1: REST API and Express basics",
      "Week 2: CRUD with MySQL",
      "Week 3: Authentication and middleware",
      "Week 4: Build and document a backend project"
    ]
  },
  {
    role: "Full Stack Developer",
    category: "Full Stack",
    requiredSkills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "MySQL", "Git", "APIs"],
    roadmap: [
      "Strengthen frontend fundamentals",
      "Learn React for UI development",
      "Build REST APIs using Node and Express",
      "Integrate frontend with backend",
      "Store data using MySQL and deploy the app"
    ],
    resumeTips: [
      "Show end-to-end projects with frontend, backend, and database",
      "Highlight authentication, CRUD, and deployment work",
      "Use strong project titles and outcomes"
    ],
    weeklyPlan: [
      "Week 1: Frontend revision and React",
      "Week 2: Backend APIs with Express",
      "Week 3: Database and integration",
      "Week 4: Final full stack project and deployment"
    ]
  },
  {
    role: "Data Analyst",
    category: "Data",
    requiredSkills: ["Python", "SQL", "Excel", "Pandas", "Data Visualization", "Statistics"],
    roadmap: [
      "Learn Python basics for data analysis",
      "Practice SQL queries and data cleaning",
      "Use Pandas for data manipulation",
      "Create charts and dashboards",
      "Work on business datasets and case studies"
    ],
    resumeTips: [
      "Add dashboard and analytics projects",
      "Mention SQL, Python, and visualization tools",
      "Use measurable results in project descriptions"
    ],
    weeklyPlan: [
      "Week 1: SQL and Excel basics",
      "Week 2: Python and Pandas",
      "Week 3: Data cleaning and charts",
      "Week 4: Dashboard or analysis project"
    ]
  },
  {
    role: "AI/ML Engineer",
    category: "AI / ML",
    requiredSkills: ["Python", "Machine Learning", "NumPy", "Pandas", "Scikit-learn", "Data Preprocessing"],
    roadmap: [
      "Build strong Python and math basics",
      "Learn machine learning algorithms",
      "Practice data preprocessing and feature engineering",
      "Train models using scikit-learn",
      "Build mini ML projects and explain results"
    ],
    resumeTips: [
      "Show datasets, models used, and evaluation metrics",
      "Explain your problem statement and result clearly",
      "Mention ML libraries and deployment if done"
    ],
    weeklyPlan: [
      "Week 1: Python and NumPy/Pandas",
      "Week 2: Supervised learning basics",
      "Week 3: Model training and evaluation",
      "Week 4: Small ML project with explanation"
    ]
  }
];

function normalizeSkill(skill) {
  return skill.trim().toLowerCase();
}

function analyzeRole(knownSkills, targetRole, interest) {
  const normalizedKnown = knownSkills.map(normalizeSkill);

  let filteredRoles = roleDatabase;

  if (targetRole) {
    filteredRoles = roleDatabase.filter(
      (item) => item.role.toLowerCase() === targetRole.toLowerCase()
    );
  } else if (interest) {
    filteredRoles = roleDatabase.filter(
      (item) =>
        item.category.toLowerCase().includes(interest.toLowerCase()) ||
        item.role.toLowerCase().includes(interest.toLowerCase())
    );

    if (filteredRoles.length === 0) {
      filteredRoles = roleDatabase;
    }
  }

  const scored = filteredRoles.map((item) => {
    const matchedSkills = item.requiredSkills.filter((skill) =>
      normalizedKnown.includes(skill.toLowerCase())
    );

    const missingSkills = item.requiredSkills.filter(
      (skill) => !normalizedKnown.includes(skill.toLowerCase())
    );

    const confidenceScore = Math.round(
      (matchedSkills.length / item.requiredSkills.length) * 100
    );

    return {
      ...item,
      matchedSkills,
      missingSkills,
      confidenceScore
    };
  });

  scored.sort((a, b) => b.confidenceScore - a.confidenceScore);
  return scored;
}

app.get("/api/reports", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        analysis_reports.id,
        users.name,
        users.degree,
        users.interest_area,
        users.target_role,
        analysis_reports.recommended_role,
        analysis_reports.category,
        analysis_reports.confidence_score,
        analysis_reports.created_at
      FROM analysis_reports
      JOIN users ON analysis_reports.user_id = users.id
      ORDER BY analysis_reports.id DESC
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error: error.message });
  }
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { name, degree, interestArea, targetRole, knownSkills } = req.body;

    if (!name || !degree || !interestArea || !knownSkills || !Array.isArray(knownSkills)) {
      return res.status(400).json({ message: "Please fill all required fields correctly" });
    }

    const results = analyzeRole(knownSkills, targetRole, interestArea);

    if (results.length === 0) {
      return res.status(404).json({ message: "No matching roles found" });
    }

    const best = results[0];

    const nextSteps = best.missingSkills.slice(0, 3).map((skill, index) => {
      return `${index + 1}. Learn ${skill} through one mini project`;
    });

    const [userResult] = await db.query(
      "INSERT INTO users (name, degree, interest_area, target_role) VALUES (?, ?, ?, ?)",
      [name, degree, interestArea, targetRole || null]
    );

    const userId = userResult.insertId;

    await db.query(
      `INSERT INTO analysis_reports
      (user_id, recommended_role, category, confidence_score, matched_skills, missing_skills, roadmap, resume_tips, weekly_plan)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        best.role,
        best.category,
        best.confidenceScore,
        JSON.stringify(best.matchedSkills),
        JSON.stringify(best.missingSkills),
        JSON.stringify(best.roadmap),
        JSON.stringify(best.resumeTips),
        JSON.stringify(best.weeklyPlan)
      ]
    );

    res.json({
      user: {
        name,
        degree,
        interestArea,
        targetRole: targetRole || "Not specified"
      },
      bestRecommendation: {
        role: best.role,
        category: best.category,
        confidenceScore: best.confidenceScore,
        matchedSkills: best.matchedSkills,
        missingSkills: best.missingSkills,
        roadmap: best.roadmap,
        resumeTips: best.resumeTips,
        weeklyPlan: best.weeklyPlan,
        nextSteps
      },
      otherRecommendations: results.slice(1, 4).map((item) => ({
        role: item.role,
        confidenceScore: item.confidenceScore,
        matchedSkills: item.matchedSkills.length,
        missingSkills: item.missingSkills.length
      }))
    });
  } catch (error) {
    console.log("POST /api/analyze error:", error);
    res.status(500).json({
      message: "Error analyzing data",
      error: error.message
    });
  }
});
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
