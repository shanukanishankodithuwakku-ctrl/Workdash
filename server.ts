import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(process.cwd(), "users.json");

app.use(express.json());

// Load users helper
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    return {};
  }
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading users file", err);
    return {};
  }
}

// Save users helper
function saveUsers(users: any) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing users file", err);
  }
}

// API: Register/Sign In a user
app.post("/api/register", (req, res) => {
  const { email, profileData } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const cleanEmail = email.toLowerCase().trim();
  const users = loadUsers();

  // If user doesn't exist, create profile
  if (!users[cleanEmail]) {
    users[cleanEmail] = {
      email: cleanEmail,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      profileData: profileData || null,
    };
  } else {
    // If logging in, optionally update profile data or update last active
    users[cleanEmail].lastActiveAt = new Date().toISOString();
    if (profileData) {
      // Merge/update
      users[cleanEmail].profileData = profileData;
    }
  }

  saveUsers(users);
  res.json({ success: true, user: users[cleanEmail] });
});

// API: Sign Up with password
app.post("/api/auth/signup", (req, res) => {
  const { email, password, profileData } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email address" });
  }
  if (!password || password.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters long" });
  }

  const cleanEmail = email.toLowerCase().trim();
  const users = loadUsers();

  if (users[cleanEmail] && users[cleanEmail].password) {
    return res.status(400).json({ error: "An account with this email already exists. Please Sign In." });
  }

  users[cleanEmail] = {
    email: cleanEmail,
    password: password, // simple storage in json DB
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    profileData: profileData || null,
  };

  saveUsers(users);
  res.json({ success: true, user: users[cleanEmail] });
});

// API: Sign In with password
app.post("/api/auth/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const cleanEmail = email.toLowerCase().trim();
  const users = loadUsers();

  if (!users[cleanEmail]) {
    return res.status(400).json({ error: "Account not found. Please Sign Up first." });
  }

  if (users[cleanEmail].password && users[cleanEmail].password !== password) {
    return res.status(400).json({ error: "Incorrect password. Please try again." });
  }

  // Support passwordless migration/fallback if user was created before password field was added
  if (!users[cleanEmail].password) {
    users[cleanEmail].password = password; // bind password on first setup
  }

  users[cleanEmail].lastActiveAt = new Date().toISOString();
  saveUsers(users);

  res.json({ success: true, user: users[cleanEmail] });
});

// API: Password Recovery Simulation
app.post("/api/auth/recover", (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const cleanEmail = email.toLowerCase().trim();
  const users = loadUsers();

  if (!users[cleanEmail]) {
    return res.status(400).json({ error: "No account registered with this email address." });
  }

  // Simulate recovery token dispatch
  res.json({ 
    success: true, 
    message: `A secure password recovery link has been dispatched to ${cleanEmail}. Please check your inbox and follow instructions.` 
  });
});

// API: Save User Profile Data
app.post("/api/profile/save", (req, res) => {
  const { email, profileData } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const cleanEmail = email.toLowerCase().trim();
  const users = loadUsers();

  if (!users[cleanEmail]) {
    users[cleanEmail] = {
      email: cleanEmail,
      createdAt: new Date().toISOString(),
    };
  }

  users[cleanEmail].lastActiveAt = new Date().toISOString();
  users[cleanEmail].profileData = profileData;

  saveUsers(users);
  res.json({ success: true, user: users[cleanEmail] });
});

// API: Load User Profile Data
app.get("/api/profile/:email", (req, res) => {
  const cleanEmail = req.params.email.toLowerCase().trim();
  const users = loadUsers();

  if (!users[cleanEmail]) {
    return res.status(404).json({ error: "User profile not found" });
  }

  res.json({ success: true, user: users[cleanEmail] });
});

// API: Get Admin Stats
app.get("/api/admin/stats", (req, res) => {
  const users = loadUsers();
  const userList = Object.values(users).map((u: any) => ({
    email: u.email,
    createdAt: u.createdAt,
    lastActiveAt: u.lastActiveAt,
    shiftsCount: u.profileData?.shifts?.length || 0,
    jobsCount: u.profileData?.jobs?.length || 0,
    country: u.profileData?.selectedCountryCode || "Unknown",
    earnings: u.profileData?.shifts?.reduce((sum: number, s: any) => sum + (Number(s.earnings) || 0), 0) || 0,
  }));

  res.json({
    totalUsers: userList.length,
    users: userList,
  });
});

// --- SUPPORT SYSTEM, FAQ & ISSUE PERSISTENCE LOGIC ---
const ISSUES_FILE = path.join(process.cwd(), "issues.json");
let geminiClient: GoogleGenAI | null = null;

// Lazy initialization of Gemini client
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined in system secrets.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Load issues from JSON
function loadIssues(): any[] {
  if (!fs.existsSync(ISSUES_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(ISSUES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading issues file", err);
    return [];
  }
}

// Save issues to JSON
function saveIssues(issues: any[]) {
  try {
    fs.writeFileSync(ISSUES_FILE, JSON.stringify(issues, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing issues file", err);
  }
}

// API: Ask Gemini Support Representative
app.post("/api/support/query", async (req, res) => {
  const { query, history } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const client = getGeminiClient();
    const systemInstruction = `You are WorkDash Pro's virtual AI Support Assistant. Your job is to answer customer questions about the WorkDash platform (including payroll calculations, Google Sheets synchronization, work shift logging, PIN security, settings, and HR executive tools).

Provide helpful, professional, polite, and direct answers. 
Keep your answers brief and readable. Use markdown lists and bullet points if explaining steps.
WorkDash Pro is developed by Shanuka Kodithuwakku (LinkedIn: https://www.linkedin.com/in/shanuka-kodithuwakku/).

If the user's issue cannot be resolved through your answers, or if they ask to speak to a human/lodge an official support ticket, kindly instruct them to click the 'Still need help? Lodge an Issue' button to submit an official support ticket directly to our engineering team.`;

    // format history properly for SDK: { role: 'user'|'model', parts: [{ text: '...' }] }
    const formattedHistory = (history || []).map((h: any) => ({
      role: h.role === "assistant" ? "model" : h.role,
      parts: [{ text: h.content || "" }]
    }));

    const chat = client.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
        temperature: 0.7,
      },
      history: formattedHistory,
    });

    const result = await chat.sendMessage({ message: query });
    res.json({ text: result.text || "I apologize, I didn't receive a response." });
  } catch (error: any) {
    console.error("Gemini support assistant error:", error);
    // If key is missing or invalid, return a helpful fallback message
    const isMissingKey = error.message && error.message.includes("GEMINI_API_KEY");
    res.json({
      text: isMissingKey 
        ? "WorkDash Support AI is currently operating in offline backup mode as the host is configuring credentials. You can still read our verified FAQs or lodge a support ticket directly below, and our engineering team will get back to you!"
        : "I'm having trouble connecting to my central brain. You can still read our verified FAQs or lodge an official support ticket directly below!"
    });
  }
});

// API: Lodge a Support Issue
app.post("/api/support/lodge-issue", (req, res) => {
  const { name, email, issueType, description } = req.body;
  if (!name || !email || !issueType || !description) {
    return res.status(400).json({ error: "All fields are required to lodge an issue." });
  }

  const issues = loadIssues();
  const newIssue = {
    id: `ticket-${Date.now()}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    issueType,
    description: description.trim(),
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  issues.push(newIssue);
  saveIssues(issues);

  res.json({ success: true, issue: newIssue });
});

// API: Retrieve Issues (Filtered by user email, or all for Admin)
app.get("/api/support/issues", (req, res) => {
  const { email } = req.query;
  const issues = loadIssues();

  if (email) {
    const cleanEmail = String(email).toLowerCase().trim();
    // Host admin gets all issues!
    if (cleanEmail === "shanukanishankodithuwakku@gmail.com") {
      return res.json({ success: true, issues });
    }
    // Users get their own
    const userIssues = issues.filter((i: any) => i.email === cleanEmail);
    return res.json({ success: true, issues: userIssues });
  }

  res.json({ success: true, issues: [] });
});

// API: Update Support Ticket Status (Admin only)
app.post("/api/support/update-issue-status", (req, res) => {
  const { id, status } = req.body;
  if (!id || !status) {
    return res.status(400).json({ error: "ID and status are required." });
  }

  const issues = loadIssues();
  const issue = issues.find((i: any) => i.id === id);
  if (!issue) {
    return res.status(404).json({ error: "Support ticket not found." });
  }

  issue.status = status;
  saveIssues(issues);

  res.json({ success: true, issue });
});

// API: Save shifts to Google Drive
app.post("/api/drive/save-shifts", async (req, res) => {
  const { token, shifts, stats } = req.body;
  if (!token || !shifts) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const { google } = await import("googleapis");
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    const fileMetadata = {
      name: `WorkDash_Shifts_${new Date().toISOString().split("T")[0]}.json`,
      mimeType: "application/json",
    };

    const fileContent = JSON.stringify({ shifts, stats, savedAt: new Date().toISOString() }, null, 2);

    const media = {
      mimeType: "application/json",
      body: fileContent,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, webViewLink",
    });

    res.json({ success: true, file: response.data });
  } catch (error: any) {
    console.error("Error saving to Drive:", error);
    res.status(500).json({ error: error.message || "Failed to save to Drive." });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
