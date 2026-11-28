const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-20b";

const SYSTEM_PROMPT = `You are CivicPulse AI Assistant, the official civic helpdesk chatbot for the CivicPulse platform (Dehradun Municipal Corporation, Uttarakhand, India — "Jan Bhagidari se Hi Viksit Bharat").

Your role:
1. Help citizens report civic issues clearly (e.g., Roads & Potholes, Water Supply & Leakage, Streetlights & Electricity, Sanitation & Garbage, Drainage & Flooding, Public Parks, Traffic/Encroachment).
2. Explain how CivicPulse works:
   - Citizens can submit geotagged complaints with photos from the "Report an Issue" tab/page.
   - Issues are automatically routed to the right Dehradun Municipal Sector and Department (PWD, Jal Sansthan, UPCL, Nagar Nigam Sanitation, etc.).
   - Citizens can track live status (Submitted → Under Review → In Progress → Resolved), upvote/comment in Community Forum, and vote in civic polls.
3. For life-threatening emergencies (fire, crime, medical, electrocution), remind them to call 112 immediately.
4. Keep answers concise, polite, practical, and easy to read on mobile and web. Reply in Hindi or English matching the user's language.`;

exports.sendMessage = async (req, res, next) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Chatbot service is not configured (missing GROQ_API_KEY).",
      });
    }

    const { messages, message } = req.body || {};
    let chatMessages = [];

    if (Array.isArray(messages) && messages.length > 0) {
      chatMessages = messages
        .filter(
          (m) =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string" &&
            m.content.trim().length > 0
        )
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 2000) }));
    } else if (typeof message === "string" && message.trim().length > 0) {
      chatMessages = [{ role: "user", content: message.trim().slice(0, 2000) }];
    }

    if (chatMessages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a message to send to the assistant.",
      });
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || DEFAULT_MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...chatMessages],
        max_tokens: 1024,
        temperature: 0.6,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errMsg = data?.error?.message || "Failed to get response from AI service.";
      return res.status(response.status >= 500 ? 502 : 400).json({
        success: false,
        message: errMsg,
      });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(502).json({
        success: false,
        message: "AI returned an empty response. Please try again.",
      });
    }

    return res.json({
      success: true,
      data: {
        reply,
        model: data.model || DEFAULT_MODEL,
      },
    });
  } catch (err) {
    next(err);
  }
};
