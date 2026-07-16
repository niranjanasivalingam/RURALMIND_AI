import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parsing with a high limit for base64 image uploads
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Google GenAI initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Google GenAI:", error);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. Running in mock-AI fallback mode.");
}

// Ensure database directory and file exist
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial Mock Seed Data
const initialData = {
  users: [
    {
      id: "u-1",
      name: "Rajesh Kumar",
      email: "citizen@ruralmind.gov.in",
      password: "citizen123",
      role: "Citizen",
      phone: "+91 98765 43210",
      location: {
        panchayat: "Kuttanad Panchayat",
        taluk: "Kuttanad Taluk",
        district: "Alappuzha",
        state: "Kerala",
      },
      demographics: {
        age: 42,
        annualIncome: 95000,
        occupation: "Farmer",
        landSize: "2.5 Acres",
        hasBPLCard: true,
      },
    },
    {
      id: "u-2",
      name: "Senthil Balaji",
      email: "panchayat@ruralmind.gov.in",
      password: "officer123",
      role: "Panchayat Officer",
      phone: "+91 98765 43211",
      location: {
        panchayat: "Kuttanad Panchayat",
        taluk: "Kuttanad Taluk",
        district: "Alappuzha",
        state: "Kerala",
      },
    },
    {
      id: "u-3",
      name: "Meenakshi Sundaram",
      email: "taluk@ruralmind.gov.in",
      password: "officer123",
      role: "Taluk Officer",
      phone: "+91 98765 43212",
      location: {
        taluk: "Kuttanad Taluk",
        district: "Alappuzha",
        state: "Kerala",
      },
    },
    {
      id: "u-4",
      name: "Dr. Ananya Nair IAS",
      email: "district@ruralmind.gov.in",
      password: "officer123",
      role: "District Officer",
      phone: "+91 98765 43213",
      location: {
        district: "Alappuzha",
        state: "Kerala",
      },
    },
    {
      id: "u-5",
      name: "Shaji Mathew",
      email: "state@ruralmind.gov.in",
      password: "officer123",
      role: "State Officer",
      phone: "+91 98765 43214",
      location: {
        state: "Kerala",
      },
    },
    {
      id: "u-6",
      name: "Admin Officer",
      email: "admin@ruralmind.gov.in",
      password: "admin123",
      role: "Admin",
      phone: "+91 99999 99999",
      location: {
        state: "Kerala",
      },
    },
  ],
  complaints: [
    {
      id: "c-1",
      title: "Major road damage near Primary School",
      description: "The main access road to the Panchayat Union Primary School has deep potholes that collect water. This makes it extremely dangerous for children walking to school and agricultural tractors carrying paddy.",
      category: "Roads & Transport",
      priority: "HIGH",
      status: "ASSIGNED",
      location: {
        panchayat: "Kuttanad Panchayat",
        taluk: "Kuttanad Taluk",
        district: "Alappuzha",
        state: "Kerala",
        address: "School Street, Ward 4, Kuttanad",
      },
      assignedAuthority: "Taluk Officer",
      imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
      duplicateGroupId: null,
      createdDate: "2026-07-01T10:00:00Z",
      userEmail: "citizen@ruralmind.gov.in",
      trackingTimeline: [
        {
          timestamp: "2026-07-01T10:00:00Z",
          status: "PENDING",
          actor: "System AI",
          remarks: "Complaint registered. AI classified category as 'Roads & Transport' and set initial priority as 'HIGH'.",
        },
        {
          timestamp: "2026-07-01T10:05:00Z",
          status: "ASSIGNED",
          actor: "System AI Router",
          remarks: "Automatically routed to Kuttanad Taluk Officer based on category (Roads) and District.",
        },
      ],
      feedback: null,
    },
    {
      id: "c-2",
      title: "Borewell motor burnt out in Ward 2",
      description: "The common drinking water borewell in Ward 2 has a burnt-out motor. More than 45 agricultural families are currently without access to clean drinking water and are forced to walk 2 km.",
      category: "Water Supply",
      priority: "CRITICAL",
      status: "RESOLVED",
      location: {
        panchayat: "Kuttanad Panchayat",
        taluk: "Kuttanad Taluk",
        district: "Alappuzha",
        state: "Kerala",
        address: "Main Water Tank, Ward 2, Kuttanad",
      },
      assignedAuthority: "Panchayat Officer",
      imageUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=600",
      duplicateGroupId: null,
      createdDate: "2026-07-03T08:30:00Z",
      userEmail: "citizen@ruralmind.gov.in",
      trackingTimeline: [
        {
          timestamp: "2026-07-03T08:30:00Z",
          status: "PENDING",
          actor: "System AI",
          remarks: "Complaint registered. AI classified category as 'Water Supply' and predicted 'CRITICAL' priority due to high community impact.",
        },
        {
          timestamp: "2026-07-03T09:00:00Z",
          status: "ASSIGNED",
          actor: "System AI Router",
          remarks: "Routed to Panchayat Officer Senthil Balaji.",
        },
        {
          timestamp: "2026-07-04T11:00:00Z",
          status: "IN_PROGRESS",
          actor: "Panchayat Officer",
          remarks: "Plumber and motor technician dispatched. Replacement pump approved from Gram Panchayat emergency budget.",
        },
        {
          timestamp: "2026-07-05T15:30:00Z",
          status: "RESOLVED",
          actor: "Panchayat Officer",
          remarks: "New 5HP motor installed and water supply restored completely. Water quality verified.",
        },
      ],
      feedback: {
        rating: 5,
        remarks: "Superb quick action! Drinking water is flowing perfectly now. Thank you, Panchayat!",
        timestamp: "2026-07-05T18:00:00Z",
      },
    },
    {
      id: "c-3",
      title: "Broken Solar Streetlight",
      description: "The solar streetlight opposite the Panchayat Library is flickering and has stopped working completely, creating safety risks for women and elders at night.",
      category: "Streetlights",
      priority: "MEDIUM",
      status: "PENDING",
      location: {
        panchayat: "Kuttanad Panchayat",
        taluk: "Kuttanad Taluk",
        district: "Alappuzha",
        state: "Kerala",
        address: "Opposite Panchayat Library, Ward 1",
      },
      assignedAuthority: "Panchayat Officer",
      imageUrl: null,
      duplicateGroupId: null,
      createdDate: "2026-07-14T19:00:00Z",
      userEmail: "citizen@ruralmind.gov.in",
      trackingTimeline: [
        {
          timestamp: "2026-07-14T19:00:00Z",
          status: "PENDING",
          actor: "System AI",
          remarks: "Complaint registered. Classified under 'Streetlights' with 'MEDIUM' priority.",
        },
      ],
      feedback: null,
    },
  ],
  assets: [
    {
      id: "a-1",
      name: "Gram Panchayat Borewell & Tank",
      category: "Water Supply",
      location: "Ward 2, Kuttanad",
      healthStatus: "EXCELLENT",
      lastMaintained: "2026-07-05",
      description: "Main potable water resource powering Ward 2 and Ward 3. Features a 10,000L storage capacity.",
    },
    {
      id: "a-2",
      name: "Panchayat Union Primary School",
      category: "Education",
      location: "Ward 4, Kuttanad",
      healthStatus: "GOOD",
      lastMaintained: "2026-05-12",
      description: "Primary school building housing 120 rural children. Structure is sound; playground needs leveling.",
    },
    {
      id: "a-3",
      name: "Solar Streetlight Grid (30 lamps)",
      category: "Streetlights",
      location: "Panchayat Main Road",
      healthStatus: "NEEDS_REPAIR",
      lastMaintained: "2026-04-10",
      description: "Solar street lighting network. 28 working, 2 require bulb/battery replacements (1 complaint pending).",
    },
    {
      id: "a-4",
      name: "Panchayat Community Health Centre",
      category: "Public Health",
      location: "Ward 1, Kuttanad",
      healthStatus: "GOOD",
      lastMaintained: "2026-06-20",
      description: "Primary health centre catering to local healthcare. Features 4 beds, basic diagnostic tools, and emergency oxygen.",
    },
  ],
  projects: [
    {
      id: "p-1",
      name: "Kuttanad Paved Agricultural Road Layout",
      description: "Constructing 3.5 km of concrete roads joining rice fields directly to storage warehouses to simplify crop transportation.",
      status: "IN_PROGRESS",
      progress: 65,
      budget: "₹18,50,000",
      startDate: "2026-03-01",
      completionDate: "2026-08-15",
      authority: "Taluk Officer",
    },
    {
      id: "p-2",
      name: "High-Speed Fibernet Connection for Library",
      description: "Connecting the Panchayat Library and Study Circle with FTTH broadband to help students prepare for competitive examinations.",
      status: "COMPLETED",
      progress: 100,
      budget: "₹1,20,000",
      startDate: "2026-05-10",
      completionDate: "2026-06-25",
      authority: "Panchayat Officer",
    },
    {
      id: "p-3",
      name: "Gram Panchayat Rooftop Solar Installation",
      description: "Installing 10kW rooftop solar panels on the main administration building to cut carbon footprint and power outages.",
      status: "PLANNING",
      progress: 10,
      budget: "₹6,00,000",
      startDate: "2026-08-01",
      completionDate: "2026-11-30",
      authority: "District Officer",
    },
  ],
  schemes: [
    {
      id: "s-1",
      name: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
      description: "Provides 55% to 90% financial subsidy for drip and sprinkler irrigation systems to optimize agricultural water usage.",
      benefit: "90% subsidy for small/marginal farmers on drip irrigation kits.",
      category: "Agriculture",
      eligibility: {
        occupation: "Farmer",
        incomeLimit: 250000,
        landSizeMax: 5, // in Acres
      },
    },
    {
      id: "s-2",
      name: "Deen Dayal Upadhyaya Gram Jyoti Yojana (DDUGJY)",
      description: "Assists rural households under BPL with free electricity connections and high-efficiency LED kits.",
      benefit: "Free single-point connection + 3 free LED bulbs.",
      category: "Social Welfare",
      eligibility: {
        hasBPLCard: true,
        incomeLimit: 120000,
      },
    },
    {
      id: "s-3",
      name: "Panchayat Youth Skill Development Fellowship",
      description: "Offers skill building and dynamic technical internships for unemployed rural youth with a monthly stipend of ₹6,000.",
      benefit: "₹6,000/month stipend + government certification and job placement assistance.",
      category: "Education",
      eligibility: {
        ageMin: 18,
        ageMax: 35,
        incomeLimit: 300000,
      },
    },
    {
      id: "s-4",
      name: "Amrit Sarovar Wetland Rejuvenation Subsidy",
      description: "Funding support for farmers or communities looking to rebuild local farm ponds, rainwater storage, or small wetlands.",
      benefit: "Up to ₹1,50,000 in direct bank transfers for pond excavation.",
      category: "Water & Sanitation",
      eligibility: {
        occupation: "Farmer",
        landSizeMin: 1, // in Acres
      },
    },
  ],
  logs: [
    {
      id: "l-1",
      type: "SMS",
      recipient: "+91 98765 43210",
      subject: "Complaint Status Update - RuralMind AI",
      message: "Dear Rajesh, your water supply complaint (c-2) is RESOLVED. Plumber repaired the borewell motor.",
      timestamp: "2026-07-05T15:31:00Z",
    },
    {
      id: "l-2",
      type: "Email",
      recipient: "citizen@ruralmind.gov.in",
      subject: "Complaint Assigned To Authority - RuralMind AI",
      message: "Hello Rajesh, your complaint regarding 'Major road damage near Primary School' has been automatically routed to the Kuttanad Taluk Officer.",
      timestamp: "2026-07-01T10:05:00Z",
    },
  ],
};

// Database utility functions
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const content = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading db file:", error);
    return initialData;
  }
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing db file:", error);
  }
}

// REST APIs
// 1. Auth APIs
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, phone, role, location, demographics } = req.body;
  const db = readDB();

  if (db.users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ message: "User with this email already exists." });
  }

  const newUser = {
    id: `u-${db.users.length + 1}`,
    name,
    email: email.toLowerCase(),
    password, // in a real app, hash this password
    role: role || "Citizen",
    phone: phone || "+91 90000 00000",
    location: location || {
      panchayat: "Kuttanad Panchayat",
      taluk: "Kuttanad Taluk",
      district: "Alappuzha",
      state: "Kerala",
    },
    demographics: demographics || {
      age: 30,
      annualIncome: 120000,
      occupation: "Self-Employed",
      landSize: "0 Acres",
      hasBPLCard: false,
    },
  };

  db.users.push(newUser);
  writeDB(db);

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ user: userWithoutPassword, token: `mock-jwt-token-for-${newUser.id}` });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const db = readDB();

  const user = db.users.find(
    (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token: `mock-jwt-token-for-${user.id}` });
});

// 2. Complaints APIs
app.get("/api/complaints", (req, res) => {
  const { email, role, panchayat, district } = req.query;
  const db = readDB();
  let filtered = [...db.complaints];

  if (role === "Citizen" && email) {
    filtered = filtered.filter((c: any) => c.userEmail.toLowerCase() === (email as string).toLowerCase());
  } else if (role === "Panchayat Officer" && panchayat) {
    filtered = filtered.filter((c: any) => c.location.panchayat === panchayat);
  } else if (role === "Taluk Officer") {
    // Show all for Taluk or filtered
  } else if (role === "District Officer" && district) {
    filtered = filtered.filter((c: any) => c.location.district === district);
  }

  res.json(filtered);
});

app.post("/api/complaints", async (req, res) => {
  const { title, description, location, imageUrl, userEmail, phone, voiceLang } = req.body;
  const db = readDB();

  // 1. Initial Local State Setup
  const newComplaintId = `c-${db.complaints.length + 1}`;
  let category = "Others";
  let priority = "MEDIUM";
  let routedAuthority = "Panchayat Officer";
  let reasoning = "Manual triage fallback.";
  let imageAnalysis: any = null;
  let isDuplicate = false;
  let duplicateOfId: string | null = null;
  let explanation = "No matching complaints found.";

  const promptText = `
    Analyze this public governance complaint. Classify it into one of these exact categories:
    - 'Water Supply'
    - 'Roads & Transport'
    - 'Sanitation & Waste'
    - 'Streetlights'
    - 'Public Health'
    - 'Agriculture & Irrigation'
    - 'Education'
    - 'Others'

    Determine its logical community priority ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').
    Predict the routing level ('Panchayat Officer', 'Taluk Officer', 'District Officer', 'State Officer') based on gravity. 
    (Panchayat for garbage, streetlights; Taluk for roads, pipelines; District for health, schools, major structural complaints).

    Complaint Title: "${title}"
    Complaint Description: "${description}"

    Provide output in strict JSON format matching this schema:
    {
      "category": "string",
      "priority": "string",
      "routingAuthority": "string",
      "reasoning": "string"
    }
  `;

  // 2. Call Gemini for Triage & Routing
  if (ai) {
    try {
      const triageRes = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              priority: { type: Type.STRING },
              routingAuthority: { type: Type.STRING },
              reasoning: { type: Type.STRING },
            },
            required: ["category", "priority", "routingAuthority", "reasoning"],
          },
        },
      });

      if (triageRes.text) {
        const parsed = JSON.parse(triageRes.text.trim());
        category = parsed.category || category;
        priority = parsed.priority || priority;
        routedAuthority = parsed.routingAuthority || routedAuthority;
        reasoning = parsed.reasoning || reasoning;
      }
    } catch (e) {
      console.error("Gemini classification failed, using fallbacks:", e);
    }

    // 3. Optional Image Analysis
    if (imageUrl && imageUrl.startsWith("data:image")) {
      try {
        const base64Data = imageUrl.split(",")[1];
        const mimeType = imageUrl.split(";")[0].split(":")[1];

        const imageAnalysisPrompt = `
          As a smart city/rural development inspector, inspect this uploaded picture which is attached to a public complaint titled: "${title}".
          Does it represent a genuine governance concern (e.g., potholes, trash dumps, broken infrastructure, water leaks)?
          Provide its severe score ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'), objects detected, and visual summary.

          Provide output in strict JSON:
          {
            "isAuthenticIssue": true/false,
            "detectedObjects": ["pothole", "leak", "trash", "etc"],
            "estimatedSeverity": "LOW/MEDIUM/HIGH/CRITICAL",
            "imageDescription": "brief description of what is visible"
          }
        `;

        const imgPart = {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        };

        const imageRes = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [imgPart, { text: imageAnalysisPrompt }],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isAuthenticIssue: { type: Type.BOOLEAN },
                detectedObjects: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                estimatedSeverity: { type: Type.STRING },
                imageDescription: { type: Type.STRING },
              },
              required: ["isAuthenticIssue", "detectedObjects", "estimatedSeverity", "imageDescription"],
            },
          },
        });

        if (imageRes.text) {
          imageAnalysis = JSON.parse(imageRes.text.trim());
          if (imageAnalysis.isAuthenticIssue && imageAnalysis.estimatedSeverity === "CRITICAL") {
            priority = "CRITICAL";
          }
        }
      } catch (imgError) {
        console.error("Gemini Image inspection failed:", imgError);
      }
    }

    // 4. Duplicate Detection (compare with complaints in database)
    const recentSimilar = db.complaints
      .filter((c: any) => c.location.panchayat === location.panchayat && c.status !== "RESOLVED")
      .slice(0, 5);

    if (recentSimilar.length > 0) {
      try {
        const comparePrompt = `
          We are analyzing a new citizen complaint against recent active complaints in the same Panchayat to detect duplicate issues.
          New Complaint:
          Title: "${title}"
          Description: "${description}"

          Recent Active Complaints in the area:
          ${recentSimilar.map((c: any) => `ID: ${c.id}, Title: "${c.title}", Description: "${c.description}"`).join("\n")}

          Compare them. Is the new complaint describing the exact same physical issue or location damage? 
          Output a JSON object indicating duplicate status:
          {
            "isDuplicate": true/false,
            "duplicateOfComplaintId": "id of matching complaint or null",
            "similarityScore": 0.0 to 1.0,
            "explanation": "brief description of why they match or don't"
          }
        `;

        const dupRes = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: comparePrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isDuplicate: { type: Type.BOOLEAN },
                duplicateOfComplaintId: { type: Type.STRING },
                similarityScore: { type: Type.NUMBER },
                explanation: { type: Type.STRING },
              },
              required: ["isDuplicate", "duplicateOfComplaintId", "similarityScore", "explanation"],
            },
          },
        });

        if (dupRes.text) {
          const dupParsed = JSON.parse(dupRes.text.trim());
          isDuplicate = dupParsed.isDuplicate;
          duplicateOfId = dupParsed.duplicateOfComplaintId === "null" ? null : dupParsed.duplicateOfComplaintId;
          explanation = dupParsed.explanation;
        }
      } catch (dupError) {
        console.error("Gemini Duplicate checking failed:", dupError);
      }
    }
  } else {
    // Simple Offline Mock Triage Logic based on keywords
    const lowerTitle = title.toLowerCase();
    const lowerDesc = description.toLowerCase();

    if (lowerTitle.includes("water") || lowerDesc.includes("pipe") || lowerDesc.includes("pump")) {
      category = "Water Supply";
      priority = "HIGH";
      routedAuthority = "Panchayat Officer";
    } else if (lowerTitle.includes("road") || lowerTitle.includes("pothole") || lowerDesc.includes("concrete")) {
      category = "Roads & Transport";
      priority = "MEDIUM";
      routedAuthority = "Taluk Officer";
    } else if (lowerTitle.includes("light") || lowerDesc.includes("dark") || lowerDesc.includes("flicker")) {
      category = "Streetlights";
      priority = "LOW";
      routedAuthority = "Panchayat Officer";
    } else if (lowerTitle.includes("health") || lowerDesc.includes("fever") || lowerDesc.includes("doctor")) {
      category = "Public Health";
      priority = "CRITICAL";
      routedAuthority = "District Officer";
    }
    reasoning = "Mock classified by localized keyword analyzer.";
  }

  // Create Complaint Object
  const newComplaint = {
    id: newComplaintId,
    title,
    description,
    category,
    priority,
    status: isDuplicate ? "ASSIGNED" : "PENDING",
    location: {
      panchayat: location.panchayat || "Kuttanad Panchayat",
      taluk: location.taluk || "Kuttanad Taluk",
      district: location.district || "Alappuzha",
      state: location.state || "Kerala",
      address: location.address || "Main Road, Ward 1",
    },
    assignedAuthority: routedAuthority,
    imageUrl: imageUrl || null,
    duplicateGroupId: isDuplicate ? (duplicateOfId || newComplaintId) : null,
    createdDate: new Date().toISOString(),
    userEmail: userEmail || "citizen@ruralmind.gov.in",
    trackingTimeline: [
      {
        timestamp: new Date().toISOString(),
        status: "PENDING",
        actor: "System AI",
        remarks: `Complaint registered. AI Triage classified: '${category}'. Predicted priority: '${priority}'. Reason: ${reasoning}`,
      },
    ],
    feedback: null,
    imageAnalysis,
    duplicateCheck: {
      isDuplicate,
      duplicateOfId,
      explanation,
    },
  };

  if (isDuplicate) {
    newComplaint.trackingTimeline.push({
      timestamp: new Date().toISOString(),
      status: "ASSIGNED",
      actor: "System AI Router",
      remarks: `Warning: This complaint has been identified as a likely DUPLICATE of ticket ${duplicateOfId}. Grouped together for quick officer response.`,
    });
  } else {
    newComplaint.trackingTimeline.push({
      timestamp: new Date().toISOString(),
      status: "ASSIGNED",
      actor: "System AI Router",
      remarks: `Automatically routed to ${routedAuthority} for immediate resolution.`,
    });
  }

  db.complaints.unshift(newComplaint);

  // Generate automated SMS and Email logs (Mocking Notifications)
  const smsLog = {
    id: `l-${db.logs.length + 1}`,
    type: "SMS" as const,
    recipient: phone || "+91 98765 43210",
    subject: "Complaint Registered - RuralMind AI",
    message: `Dear Citizen, your complaint (ID: ${newComplaintId}) has been successfully submitted. It is classified as '${category}' and assigned to '${routedAuthority}'. Track status online!`,
    timestamp: new Date().toISOString(),
  };

  const emailLog = {
    id: `l-${db.logs.length + 2}`,
    type: "Email" as const,
    recipient: userEmail || "citizen@ruralmind.gov.in",
    subject: `Complaint Triage Confirmation: #${newComplaintId}`,
    message: `Hello,\n\nWe have successfully received your complaint: "${title}".\n\nAI Engine Analysis:\n- Category: ${category}\n- Priority Score: ${priority}\n- Assigned Level: ${routedAuthority}\n- Duplicate Detected: ${isDuplicate ? "Yes (Linked to " + duplicateOfId + ")" : "No"}\n\nOur officials will review and update you regarding progress via SMS and email.\n\nRegards,\nPanchayat Digital Governance Desk`,
    timestamp: new Date().toISOString(),
  };

  db.logs.push(smsLog, emailLog);
  writeDB(db);

  res.status(201).json(newComplaint);
});

// Update complaint status & add tracking node
app.put("/api/complaints/:id", (req, res) => {
  const { id } = req.params;
  const { status, remarks, actor } = req.body;
  const db = readDB();

  const idx = db.complaints.findIndex((c: any) => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ message: "Complaint not found." });
  }

  const oldComplaint = db.complaints[idx];
  oldComplaint.status = status;
  oldComplaint.trackingTimeline.push({
    timestamp: new Date().toISOString(),
    status,
    actor: actor || "Officer",
    remarks: remarks || `Status transitioned to ${status}`,
  });

  // Automatically trigger notifications when resolved/updated
  const user = db.users.find((u: any) => u.email === oldComplaint.userEmail) || { phone: "+91 98765 43210" };
  const smsNotification = {
    id: `l-${db.logs.length + 1}`,
    type: "SMS" as const,
    recipient: user.phone,
    subject: "Complaint Progress Update",
    message: `Dear Citizen, your complaint #${oldComplaint.id} has been updated to '${status}' by the authorities. Remarks: ${remarks}`,
    timestamp: new Date().toISOString(),
  };
  db.logs.push(smsNotification);

  writeDB(db);
  res.json(oldComplaint);
});

// Feedback & Rating
app.post("/api/complaints/:id/feedback", (req, res) => {
  const { id } = req.params;
  const { rating, remarks } = req.body;
  const db = readDB();

  const idx = db.complaints.findIndex((c: any) => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ message: "Complaint not found." });
  }

  db.complaints[idx].feedback = {
    rating,
    remarks,
    timestamp: new Date().toISOString(),
  };

  writeDB(db);
  res.json(db.complaints[idx]);
});

// 3. Public Assets & Development Projects
app.get("/api/assets", (req, res) => {
  const db = readDB();
  res.json(db.assets);
});

app.post("/api/assets", (req, res) => {
  const { name, category, location, healthStatus, description } = req.body;
  const db = readDB();

  const newAsset = {
    id: `a-${db.assets.length + 1}`,
    name,
    category,
    location,
    healthStatus: healthStatus || "GOOD",
    lastMaintained: new Date().toISOString().split("T")[0],
    description,
  };

  db.assets.unshift(newAsset);
  writeDB(db);
  res.status(201).json(newAsset);
});

app.get("/api/projects", (req, res) => {
  const db = readDB();
  res.json(db.projects);
});

app.post("/api/projects", (req, res) => {
  const { name, description, status, progress, budget, authority, completionDate } = req.body;
  const db = readDB();

  const newProject = {
    id: `p-${db.projects.length + 1}`,
    name,
    description,
    status: status || "PLANNING",
    progress: progress || 0,
    budget: budget || "₹0",
    startDate: new Date().toISOString().split("T")[0],
    completionDate: completionDate || "2026-12-31",
    authority: authority || "Panchayat Officer",
  };

  db.projects.unshift(newProject);
  writeDB(db);
  res.status(201).json(newProject);
});

app.put("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const { status, progress } = req.body;
  const db = readDB();

  const idx = db.projects.findIndex((p: any) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ message: "Project not found" });
  }

  db.projects[idx].status = status;
  db.projects[idx].progress = progress;
  writeDB(db);
  res.json(db.projects[idx]);
});

// 4. Schemes & Recommendations APIs
app.get("/api/schemes", (req, res) => {
  const db = readDB();
  res.json(db.schemes);
});

app.post("/api/schemes/recommend", async (req, res) => {
  const { demographics } = req.body;
  const db = readDB();

  const userAge = Number(demographics.age) || 30;
  const userIncome = Number(demographics.annualIncome) || 120000;
  const userOcc = (demographics.occupation || "Farmer").toLowerCase();
  const hasBPL = Boolean(demographics.hasBPLCard);

  let recommendationText = "";
  let recommendedIds: string[] = [];

  const schemesPrompt = `
    Given a rural citizen with these demographics:
    - Age: ${userAge}
    - Annual Income: ₹${userIncome}
    - Occupation: "${demographics.occupation}"
    - Land Holding size: "${demographics.landSize || '0 Acres'}"
    - Has Below Poverty Line (BPL) Card: ${hasBPL ? "Yes" : "No"}

    And these available Government Schemes:
    ${db.schemes.map((s: any) => `ID: ${s.id}, Name: "${s.name}", Description: "${s.description}", Eligibility Rules: Occupation=${s.eligibility.occupation || "Any"}, IncomeLimit=${s.eligibility.incomeLimit || "None"}, BPLRequired=${s.eligibility.hasBPLCard ? "Yes" : "No"}`).join("\n")}

    Identify which of these schemes this citizen is eligible for. 
    Explain the reasoning for each match in 2 sentences. Include helpful steps they should take to apply.
    Provide your output in valid JSON structure matching this exact schema:
    {
      "recommendedSchemeIds": ["s-1", "s-3"],
      "analysis": "A brief encouraging dynamic message addressing the user",
      "reasons": [
        {
          "schemeId": "s-1",
          "reason": "Matching reason here.",
          "howToApply": "Go to Panchayat Union Office with land records."
        }
      ]
    }
  `;

  if (ai) {
    try {
      const recRes = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: schemesPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendedSchemeIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              analysis: { type: Type.STRING },
              reasons: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    schemeId: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    howToApply: { type: Type.STRING },
                  },
                  required: ["schemeId", "reason", "howToApply"],
                },
              },
            },
            required: ["recommendedSchemeIds", "analysis", "reasons"],
          },
        },
      });

      if (recRes.text) {
        const parsed = JSON.parse(recRes.text.trim());
        return res.json(parsed);
      }
    } catch (err) {
      console.error("Gemini Scheme recommendations failed, fallback to local match:", err);
    }
  }

  // Fallback Local Filtering
  const matched = db.schemes.filter((s: any) => {
    let eligible = true;
    if (s.eligibility.hasBPLCard && !hasBPL) eligible = false;
    if (s.eligibility.incomeLimit && userIncome > s.eligibility.incomeLimit) eligible = false;
    if (s.eligibility.occupation && s.eligibility.occupation.toLowerCase() !== userOcc) eligible = false;
    return eligible;
  });

  res.json({
    recommendedSchemeIds: matched.map((s: any) => s.id),
    analysis: "Based on local Panchayat rule constraints, we have pre-filtered matching welfare and agricultural subsidies for your immediate attention.",
    reasons: matched.map((s: any) => ({
      schemeId: s.id,
      reason: `You qualify because your income is below the limit of ₹${s.eligibility.incomeLimit || 'unlimited'} and you match the occupation of ${s.eligibility.occupation || 'all residents'}.`,
      howToApply: "Submit an application form with your Income and Caste certificates to the Gram Panchayat Seva Kendra.",
    })),
  });
});

// 5. Intelligent AI Chatbot
app.post("/api/chatbot", async (req, res) => {
  const { message, history, userProfile } = req.body;
  const db = readDB();

  const chatPrompt = `
    You are 'RuralMind AI Advisor', an empathetic, smart, bilingual digital governance chatbot designed to assist villagers and Panchayat officers in Kuttanad, Alappuzha, Kerala (and rural India in general).
    
    Current User Profile:
    - Name: ${userProfile?.name || "Guest Citizen"}
    - Role: ${userProfile?.role || "Citizen"}
    - Location: ${JSON.stringify(userProfile?.location || {})}
    - Income: ${userProfile?.demographics?.annualIncome || "Unknown"}
    - Occupation: ${userProfile?.demographics?.occupation || "Unknown"}

    Database context:
    - Total Active Complaints: ${db.complaints.length}
    - Total Infrastructure Projects: ${db.projects.length}
    - Active Public Assets: ${db.assets.length}
    - Available Government Schemes: ${db.schemes.length}

    Provide advice on how to file complaints, eligibility for schemes (PMKSY, DDUGJY), status of roads or water pumps, or direct them to Panchayat offices.
    Maintain a warm, polite, professional, and helpful tone. You can reply in English, and throw in occasional simple Tamil/Malayalam greetings if helpful, but stick to clear formatting.
    
    User message: "${message}"
  `;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatPrompt,
      });

      return res.json({ reply: response.text || "I am processing your query. Please stand by." });
    } catch (err) {
      console.error("Chatbot generation error:", err);
    }
  }

  // Local fallback responder
  let reply = `Namaste ${userProfile?.name || "Citizen"}. Thank you for reaching out to RuralMind AI Support. Our AI engine is currently running in offline mode. For urgent issues with your complaints or to check welfare scheme eligibility, please visit the main Panchayat office or call Kuttanad Helplines: +91 94470 12345.`;
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes("scheme") || lowerMsg.includes("welfare") || lowerMsg.includes("subsidy")) {
    reply = `Hello! Based on our schemes library, you might be interested in 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)' for farm irrigation subsidies, or 'Deen Dayal Upadhyaya Gram Jyoti Yojana' for free solar power connections. Which one would you like to explore?`;
  } else if (lowerMsg.includes("complaint") || lowerMsg.includes("file") || lowerMsg.includes("status")) {
    reply = `You can easily lodge a new complaint using our 'Lodge Complaint' tab. You can type in details, record a voice memo, or upload an image. The AI will automatically route your complaint to the appropriate Taluk or Panchayat engineer!`;
  }

  res.json({ reply });
});

// 6. AI Reports & Officers Performance Analytics
app.get("/api/officers", (req, res) => {
  const db = readDB();
  // Compile performance data for officers based on complaint resolutions
  const complaints = db.complaints;
  const officers = [
    {
      name: "Senthil Balaji",
      role: "Panchayat Officer",
      department: "Gram Panchayat Operations",
      resolved: complaints.filter((c: any) => c.assignedAuthority === "Panchayat Officer" && c.status === "RESOLVED").length,
      pending: complaints.filter((c: any) => c.assignedAuthority === "Panchayat Officer" && c.status !== "RESOLVED").length,
      rating: 4.8,
      onTimeCompletion: "92%",
    },
    {
      name: "Meenakshi Sundaram",
      role: "Taluk Officer",
      department: "Taluk Civil Engineering",
      resolved: complaints.filter((c: any) => c.assignedAuthority === "Taluk Officer" && c.status === "RESOLVED").length,
      pending: complaints.filter((c: any) => c.assignedAuthority === "Taluk Officer" && c.status !== "RESOLVED").length,
      rating: 4.5,
      onTimeCompletion: "88%",
    },
    {
      name: "Dr. Ananya Nair IAS",
      role: "District Officer",
      department: "District Administration",
      resolved: complaints.filter((c: any) => c.assignedAuthority === "District Officer" && c.status === "RESOLVED").length,
      pending: complaints.filter((c: any) => c.assignedAuthority === "District Officer" && c.status !== "RESOLVED").length,
      rating: 4.9,
      onTimeCompletion: "96%",
    },
  ];

  res.json(officers);
});

app.post("/api/reports/generate", async (req, res) => {
  const { panchayatName } = req.body;
  const db = readDB();

  const reportPrompt = `
    Analyze the following village governance status data and generate an "Executive Panchayat Progress & Strategic Action Plan" report.
    Panchayat: ${panchayatName || "Kuttanad Panchayat"}
    
    Current Complaints:
    ${JSON.stringify(db.complaints.map((c: any) => ({ category: c.category, priority: c.priority, status: c.status })))}

    Public Assets:
    ${JSON.stringify(db.assets.map((a: any) => ({ name: a.name, status: a.healthStatus })))}

    Development Projects:
    ${JSON.stringify(db.projects.map((p: any) => ({ name: p.name, status: p.status, progress: p.progress, budget: p.budget })))}

    Please generate a highly structured administrative report (in clean Markdown format) with these exact sections:
    1. Executive Summary & Governance Scorecard (0-100 rating based on resolved vs pending and project progress)
    2. Infrastructure & Asset Health Analysis (identifying critical assets needing repair)
    3. AI Recommendations for Budget Allocations (suggesting which projects to fund next or how to optimize)
    4. Citizens Welfare Index & Dynamic Sentiment Review (analyzing feedback ratings)
    
    Output in strict JSON format:
    {
      "markdownReport": "complete markdown text here with subheadings",
      "governanceScore": 82,
      "recommendedBudgetShifts": "₹2,50,000 to Water Supply restoration"
    }
  `;

  if (ai) {
    try {
      const repRes = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: reportPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              markdownReport: { type: Type.STRING },
              governanceScore: { type: Type.NUMBER },
              recommendedBudgetShifts: { type: Type.STRING },
            },
            required: ["markdownReport", "governanceScore", "recommendedBudgetShifts"],
          },
        },
      });

      if (repRes.text) {
        const parsed = JSON.parse(repRes.text.trim());
        return res.json(parsed);
      }
    } catch (err) {
      console.error("AI report generator failed, fallback to local templates:", err);
    }
  }

  // Local fallback Report
  res.json({
    markdownReport: `### # RuralMind AI Governance Review: ${panchayatName || "Kuttanad Panchayat"}\n\n**1. Executive Summary**\nThe overall village infrastructure progress index is currently positive, driven by the successful installation of high-speed fibernet for libraries. However, unresolved streetlighting outages require immediate intervention.\n\n**2. Infrastructure & Asset Health**\n- **Critical Status**: Solar Streetlight Grid (30 lamps) requires maintenance. 2 lamps are inactive.\n- **Optimized Assets**: Water supply borewells are operating at 100% capacity after plumbers replaced the motor pump.\n\n**3. Action Plan & Recommendations**\n- Shift ₹75,000 from general administration to Panchayat Solar Energy repair budgets.\n- Accelerate concrete layout construction on Agricultural Road Ward 4 before the heavy monsoon rains set in.`,
    governanceScore: 78,
    recommendedBudgetShifts: "₹75,000 to Streetlight battery procurement",
  });
});

app.get("/api/logs", (req, res) => {
  const db = readDB();
  res.json(db.logs);
});

// Configure Vite middleware in development or express static in production
async function setupServer() {
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
