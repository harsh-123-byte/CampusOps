export interface ChatAssistantInput {
  message: string;
  history?: Array<{ role: "user" | "model" | "assistant"; content: string }>;
  user: {
    id: string;
    name: string;
    email: string;
    role: "STUDENT" | "FACULTY" | "ADMIN";
    departmentName?: string;
    rollNumber?: string;
  };
  contextData?: {
    requests?: Array<{
      requestNumber: string;
      title: string;
      type: string;
      status: string;
      priority: string;
      createdAt?: string | Date;
      changeRequestComment?: string;
      rejectionReason?: string;
    }>;
    pendingCount?: number;
    totalCount?: number;
  };
}

export interface ChatAssistantOutput {
  reply: string;
  isFallback: boolean;
  provider: string;
  suggestions?: string[];
}

export class ChatService {
  private static getApiKey(): string | null {
    return process.env.GEMINI_API_KEY || null;
  }

  /**
   * Helper to invoke Gemini with conversational Markdown output using @google/genai with high-speed failover
   */
  private static async invokeGeminiText(
    prompt: string,
    systemInstruction?: string,
    history?: Array<{ role: "user" | "model" | "assistant"; content: string }>
  ): Promise<string | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    // Prioritize high-speed models (1.1-1.4s response times) to eliminate waiting
    const modelsToTry = [
      process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest",
      "gemini-3.8-flash",
    ];

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });

      const contents: Array<any> = [];

      // Keep recent 8 messages to prevent large context transfer latency
      if (history && history.length > 0) {
        const recentHistory = history.slice(-8);
        for (const item of recentHistory) {
          contents.push({
            role: item.role === "assistant" || item.role === "model" ? "model" : "user",
            parts: [{ text: item.content }],
          });
        }
      }

      contents.push({
        role: "user",
        parts: [{ text: prompt }],
      });

      for (const model of modelsToTry) {
        try {
          const timeoutMs = 12000;
          const generatePromise = ai.models.generateContent({
            model,
            contents,
            config: {
              temperature: 0.4,
              maxOutputTokens: 1000,
              ...(systemInstruction ? { systemInstruction } : {}),
            },
          });

          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
          );

          const response = await Promise.race([generatePromise, timeoutPromise]);

          if (response.text && response.text.trim().length > 0) {
            return response.text.trim();
          }
        } catch (mErr: any) {
          console.warn(`Gemini Chat model ${model} skipped (${mErr?.message || mErr})`);
        }
      }

      return null;
    } catch (err) {
      console.warn("Gemini Chat invocation failed, using deterministic fallback:", err);
      return null;
    }
  }

  /**
   * Conversational Assistant / Chatbot for Students, Faculty, and Admin
   */
  static async chatWithAssistant(input: ChatAssistantInput): Promise<ChatAssistantOutput> {
    const { message, history, user, contextData } = input;
    const lower = message.toLowerCase().trim();

    // 1. Prepare system instruction with university knowledge base & real-time user context
    const recentRequestsSummary =
      contextData?.requests && contextData.requests.length > 0
        ? contextData.requests
            .map(
              (r) =>
                `• [${r.requestNumber}] "${r.title}" (${r.type}) - Status: ${r.status}, Priority: ${r.priority}${
                  r.changeRequestComment ? ` | Reviewer Remark: "${r.changeRequestComment}"` : ""
                }${r.rejectionReason ? ` | Rejection Reason: "${r.rejectionReason}"` : ""}`
            )
            .join("\n")
        : "No recent requests found for this user in the database.";

    const systemPrompt = `You are CampusOps AI Copilot, a powerful, versatile, and highly intelligent conversational AI assistant powered by Google Gemini.
You have the full broad conversational intelligence of Google Gemini / ChatGPT, and can answer ANY user inquiry — including academic coursework, programming, debugging, math, science, creative writing, draft preparation, general knowledge, or analytical questions.

You are also deeply integrated into CampusOps, our comprehensive university operational workflow platform.
You are currently chatting with ${user.name} (Role: ${user.role}${user.departmentName ? `, Department: ${user.departmentName}` : ""}${user.rollNumber ? `, Roll Number: ${user.rollNumber}` : ""}).

REAL-TIME USER APPLICATIONS IN SYSTEM:
${recentRequestsSummary}

CAMPUS OPERATIONS & DOCUMENT KNOWLEDGE BASE:
1. REQUIRED DOCUMENTS & VERIFICATION:
   - Bonafide Certificate:
     • Required: Current student ID card copy, clearance of semester fees receipt, stated reason (Bank loan, Passport, Visa, Bus Pass, External scholarship).
     • SLA: 24 to 48 business hours.
   - NOC (No Objection Certificate) for Internships:
     • Required: Official company offer letter on employer letterhead with start/end dates, working hours, stipend, and mentor details.
     • Criteria: Minimum 75% attendance, no critical semester backlogs, Faculty Advisor sign-off.
     • SLA: 2 to 3 business days.
   - Event Permission:
     • Required: Proposal brief, event schedule, budget, faculty coordinator approval, auditorium/hall allocation request.
     • SLA: Submit at least 5 business days in advance.
   - Lab Access:
     • Required: Research/project proposal, equipment list, faculty supervisor endorsement, requested time slots.
     • SLA: 24 to 48 hours.
   - Maintenance Request:
     • Required: Building block, floor, room number, equipment description, clear photo.
     • SLA: Urgent issues: 4–12 hours; Normal issues: 24–48 hours.

2. SCHOLARSHIPS & FINANCIAL ASSISTANCE:
   - Merit-Based Scholarship:
     • Criteria: CGPA ≥ 8.5, zero active backlogs, top 5-10% of department rank.
     • Required: Semester marksheets, Bonafide certificate, Student ID.
     • SLA: 5 to 7 working days.
   - Need-Based & Means Scholarship / Fee Concession:
     • Criteria: Annual family income under ₹2.5 Lakhs (or government ceiling).
     • Required: Current fiscal year Government Income Certificate (Tahsildar/Revenue), Ration/BPL card, Bank passbook front page (IFSC & Account number), Bonafide certificate.
   - National Scholarship Portal (NSP) & State Government Schemes:
     • Procedure: File application on the official government portal, download submitted PDF, submit on CampusOps for "Institute Level Verification" -> Verified by Registrar / Dean office within 48–72 hours.

3. WORKFLOWS & TIMELINES:
   - Standard turnaround: 1 to 3 business days. Urgent priority: 24 hours.
   - Workflow Lifecycle:
     • DRAFT -> SUBMITTED -> IN_REVIEW -> (CHANGES_REQUESTED or APPROVED or REJECTED).
     • If CHANGES_REQUESTED: Student can edit and resubmit within 7 days.
     • If APPROVED: Digital certificate/document is immediately available.

BEHAVIOR GUIDELINES:
- You are an open, helpful AI like Gemini: you can answer any general question, solve technical challenges, explain concepts, write code, answer academic questions, or assist with anything else the user asks.
- When the user asks about campus procedures, application status, document prerequisites, or university deadlines, reference the real-time context and knowledge base above.
- Always respond in clean, well-structured GitHub-style Markdown (using headings, lists, bold text, code blocks, or tables as appropriate).
- Maintain an encouraging, articulate, and professional tone.`;

    // 2. Try invoking live Google Gemini with history
    const geminiReply = await this.invokeGeminiText(message, systemPrompt, history);

    if (geminiReply) {
      return {
        reply: geminiReply,
        isFallback: false,
        provider: "Google Gemini",
      };
    }

    // 3. Fallback Engine (Active if Gemini network or API key is unavailable)
    // A. Check for requests status lookup
    if (
      lower.includes("status") ||
      lower.includes("my request") ||
      lower.includes("track") ||
      lower.includes("pending") ||
      lower.includes("recent request") ||
      lower.includes("application status")
    ) {
      if (contextData?.requests && contextData.requests.length > 0) {
        const reqList = contextData.requests
          .map((r) => {
            const statusIcon =
              r.status === "APPROVED"
                ? "✅ **APPROVED**"
                : r.status === "IN_REVIEW"
                ? "⏳ **IN REVIEW**"
                : r.status === "SUBMITTED"
                ? "📝 **SUBMITTED**"
                : r.status === "CHANGES_REQUESTED"
                ? "⚠️ **CHANGES REQUESTED**"
                : r.status === "REJECTED"
                ? "❌ **REJECTED**"
                : `ℹ️ **${r.status}**`;

            let details = `• **${r.requestNumber}**: *${r.title}* (${r.type})\n  Status: ${statusIcon} | Priority: \`${r.priority}\``;
            if (r.changeRequestComment) {
              details += `\n  **Reviewer Comment**: _"${r.changeRequestComment}"_ — Please visit **My Requests** to update and resubmit.`;
            }
            if (r.rejectionReason) {
              details += `\n  **Reason**: _"${r.rejectionReason}"_`;
            }
            return details;
          })
          .join("\n\n");

        return {
          reply: `Here is the current status of your applications:\n\n${reqList}\n\n💡 **Next Step**: You can click on any request in your **My Requests** tab to view detailed approval progress or download issued certificates.`,
          isFallback: true,
          provider: "CampusOps Intelligence Engine",
          suggestions: [
            "What documents are required for Scholarship?",
            "What is the timeline for Bonafide certificate?",
            "How do I request an NOC?",
          ],
        };
      } else {
        return {
          reply: `You do not have any active or pending requests in the system right now.\n\nReady to get started? Head over to **New Request** in your navigation menu to submit an application for Bonafide Certificates, Internship NOCs, Lab Access, or Event Permissions!`,
          isFallback: true,
          provider: "CampusOps Intelligence Engine",
          suggestions: [
            "What documents do I need for Bonafide?",
            "Scholarship application guide",
            "How long does approval take?",
          ],
        };
      }
    }

    // B. Check for Scholarship queries
    if (
      lower.includes("scholarship") ||
      lower.includes("fee concession") ||
      lower.includes("financial aid") ||
      lower.includes("nsp") ||
      lower.includes("merit") ||
      lower.includes("freeship")
    ) {
      return {
        reply: `### 🎓 Campus Scholarship & Financial Aid Guide

Here is complete information regarding university scholarships and government financial assistance:

---

#### 1. Merit-Based Scholarship
* **Eligibility**: Minimum **8.5 CGPA**, top 5–10% of department rank, clean disciplinary record, zero active backlogs.
* **Required Documents**:
  1. Consolidated marksheets of all completed semesters.
  2. Official **Bonafide Certificate** (specify "Merit Scholarship" as purpose).
  3. Valid College Student ID card copy.
* **Processing Timeline**: **5 to 7 working days** after verification by Department HOD and Dean of Academic Affairs.

---

#### 2. Means / Need-Based Scholarship & Fee Waivers
* **Eligibility**: Annual family income below **₹2.5 Lakhs** (or state government ceiling).
* **Required Documents**:
  1. Government Income Certificate issued by Tahsildar / Revenue Authority (valid for current financial year).
  2. Ration Card / BPL Certificate copy.
  3. Student Bank Passbook front page (with legible Account Number and IFSC).
  4. College **Bonafide Certificate**.
* **Processing Timeline**: Disbursed within **3 to 4 weeks** following administrative audit.

---

#### 3. National Scholarship Portal (NSP) & State Government Schemes
* **Procedure**:
  1. Complete and submit your application on the official [National Scholarship Portal (NSP)](https://scholarships.gov.in/).
  2. Download your filled application form PDF.
  3. Submit an application under **New Request** in CampusOps with type **"BONAFIDE / OTHER"** and upload the NSP PDF for **"Institute Level Verification"**.
* **Verification Timeline**: Verified by College Nodal Officer within **48 to 72 hours**.

💡 **Pro Tip**: Need a Bonafide Certificate for your scholarship? Apply now through the **[New Request](/student/requests/new)** tab!`,
        isFallback: true,
        provider: "CampusOps Intelligence Engine",
        suggestions: [
          "What is the timeline for Bonafide certificate?",
          "What documents are needed for an NOC?",
          "Check status of my recent requests",
        ],
      };
    }

    // C. Check for Timeline / SLA queries
    if (
      lower.includes("timeline") ||
      lower.includes("how long") ||
      lower.includes("turnaround") ||
      lower.includes("sla") ||
      lower.includes("days") ||
      lower.includes("duration") ||
      lower.includes("when will") ||
      lower.includes("time take")
    ) {
      return {
        reply: `### ⏱️ CampusOps Service Timelines & SLAs

Standard processing windows across all university departments:

| Request Type | Normal SLA | Urgent SLA | Primary Approver |
| :--- | :---: | :---: | :--- |
| **Bonafide Certificate** | **24 – 48 Hours** | 12 – 24 Hours | Faculty Advisor & Admin Office |
| **Internship NOC** | **2 – 3 Working Days** | 24 Hours | Faculty Mentor & Department HOD |
| **Lab Access Permission** | **24 – 48 Hours** | 12 Hours | Lab In-Charge & Supervisor |
| **Event Permission** | **3 – 5 Working Days** | 48 Hours | Faculty Coordinator & Dean Student Welfare |
| **Campus Maintenance** | **24 – 48 Hours** | 4 – 12 Hours | Estate Officer / Facility Admin |
| **Scholarship Verification** | **2 – 4 Working Days** | 24 Hours | Nodal Officer & Registrar |

---

#### 🔄 Multi-Stage Approval Workflow
1. **Submission**: Instant. Automated AI pre-check validates completeness and attaches recommendations.
2. **Faculty Evaluation**: Assigned faculty reviews supporting documents within **24–48 hours**.
3. **Department / Admin Sign-off**: HOD or Admin performs final authorization.
4. **Completion**: Digital certificate or approval stamp generated instantly.

> ℹ️ *Note: Business hours run Monday through Friday, 9:00 AM – 5:00 PM. Weekend hours do not count toward official SLAs.*`,
        isFallback: true,
        provider: "CampusOps Intelligence Engine",
        suggestions: [
          "What documents are required for an NOC?",
          "What documents are required for Scholarship?",
          "Check status of my recent requests",
        ],
      };
    }

    // D. Check for Document / NOC / Bonafide queries
    if (
      lower.includes("document") ||
      lower.includes("bonafide") ||
      lower.includes("noc") ||
      lower.includes("internship") ||
      lower.includes("lab") ||
      lower.includes("event") ||
      lower.includes("maintenance") ||
      lower.includes("complaint")
    ) {
      return {
        reply: `### 📄 University Document Requirements & Application Checklist

Find the checklist for your desired request below:

---

#### 1. Bonafide Certificate
* **Primary Uses**: Bus/Train concession pass, Passport application, Visa interview, Education loan, External scholarships.
* **Required Uploads**:
  • Clear copy of current Student ID Card.
  • Fee payment receipt of current academic semester.
* **Timeline**: **1 – 2 business days**.

---

#### 2. No Objection Certificate (NOC) for Internships
* **Primary Uses**: Off-campus internships, industrial training, live research projects.
* **Required Uploads**:
  • Formal **Offer Letter** on official company letterhead containing start & end dates, stipend, work mode (in-person/hybrid/remote), and supervisor contact.
  • Parent/Guardian consent letter (if required by department).
* **Eligibility**: Minimum **75% aggregate attendance** and endorsement from your Faculty Advisor.
* **Timeline**: **2 – 3 working days**.

---

#### 3. Event & Hackathon Permission
* **Required Uploads**:
  • Event proposal document (agenda, schedule, expected participant count).
  • Faculty Coordinator recommendation letter.
  • Auditorium or seminar hall booking requisition.
* **Timeline**: Apply at least **5 business days** prior to event start.

---

#### 4. Lab Access & Facility Maintenance
* **Lab Access**: Requires project proposal, tool list, and supervisor approval (**24–48 hours**).
* **Maintenance**: Mention exact building block, room number, and attach a photo (**4–48 hours**).

🚀 **Ready to submit?** Head over to **[New Request](/student/requests/new)** to submit in minutes!`,
        isFallback: true,
        provider: "CampusOps Intelligence Engine",
        suggestions: [
          "What is the timeline for approval?",
          "How to apply for Scholarship?",
          "Check status of my recent requests",
        ],
      };
    }

    // E. Faculty-specific guidance
    if (user.role === "FACULTY" || lower.includes("faculty") || lower.includes("how to approve") || lower.includes("review")) {
      return {
        reply: `### 👨‍🏫 Faculty Approver Operations Guide

Hello Professor! Here is your quick guide to processing student submissions in CampusOps:

---

#### 1. Accessing Your Queue
* Open **[Approval Inbox](/faculty/inbox)** from the left sidebar to view all applications awaiting your review.

#### 2. Review Actions Available
* **Approve**: Validates student credentials and advances the request to the next departmental tier (e.g. HOD or Registrar).
* **Request Changes**: Halts workflow without rejecting. Leave a clear, constructive note (e.g. *"Please re-upload internship offer letter with explicit start/end dates"*). The student receives an immediate notification and 7 days to update.
* **Reject**: Permanently declines the application. A formal rejection justification is mandatory and permanently logged for student transparency and audit records.

#### 3. Verification Standards
* **Bonafide**: Confirm active semester registration and fee clearance.
* **Internship NOC**: Check minimum 75% attendance criteria and company legitimacy.
* **Scholarships**: Verify marksheets against university internal ERP records.`,
        isFallback: true,
        provider: "CampusOps Intelligence Engine",
        suggestions: [
          "What are the SLA turnaround timelines?",
          "What documents are required for Scholarship?",
          "How do audit logs work?",
        ],
      };
    }

    // F. Admin-specific guidance
    if (user.role === "ADMIN" || lower.includes("admin") || lower.includes("audit") || lower.includes("department")) {
      return {
        reply: `### 🛡️ CampusOps Administrative Operations

Administrator tools and guidelines:

---

* **User Management** (\`/admin/users\`): Create student/faculty profiles, manage role assignments, and deactivate inactive accounts.
* **Department Configuration** (\`/admin/departments\`): Manage departmental codes, assign Heads of Departments (HODs), and configure approval hierarchies.
* **Audit Logs** (\`/admin/audit-logs\`): Review tamper-evident security and workflow records tracking login attempts, approvals, and status transitions.
* **Analytics & Trends** (\`/admin/analytics\`): Monitor turnaround velocities, identify departmental bottlenecks, and track volume trends.
* **Scholarship Verification**: Coordinate with the Registrar office for bulk signing and institutional endorsements on the National Scholarship Portal.`,
        isFallback: true,
        provider: "CampusOps Intelligence Engine",
        suggestions: [
          "Campus approval workflows & SLA matrix",
          "Scholarship verification procedures",
          "How to manage departments and roles",
        ],
      };
    }

    // G. Default Universal Fallback
    return {
      reply: `### 👋 Hi ${user.name}!

I am your **CampusOps AI Copilot**, ready to help you with anything across your campus journey and general inquiries:

* 📄 **Document Requirements**: Clear guides for Bonafide, NOC, Lab Access, and Event Permissions.
* ⏱️ **Timelines & SLAs**: Instant reference for departmental turnaround expectations.
* 🎓 **Scholarships & Financial Aid**: Guidance on merit scholarships and NSP portal verifications.
* 🔍 **Application Tracking**: Check live progress on your pending campus requests.
* 💡 **General Questions**: Ask me about code, math, research, study topics, or drafting!

What would you like to explore?`,
      isFallback: true,
      provider: "CampusOps Intelligence Engine",
      suggestions: [
        "What documents are required for Scholarship?",
        "What is the timeline for Bonafide certificate?",
        "How do I get an NOC for an internship?",
        "Check status of my recent requests",
      ],
    };
  }
}

export async function chatWithAssistant(input: ChatAssistantInput): Promise<ChatAssistantOutput> {
  return ChatService.chatWithAssistant(input);
}

export default ChatService;
