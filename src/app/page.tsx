"use client";

import { useState, useRef } from "react";
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";
import { BrainCircuit, AlertCircle, CheckCircle2, ChevronRight, Loader2, Bot, Send, Download, FileText, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  // Input States
  const [caScore, setCaScore] = useState("");
  const [attendance, setAttendance] = useState("");
  const [studyHours, setStudyHours] = useState("");

  // UI States
  const [isPredicting, setIsPredicting] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  
  // Chat States
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);

  // Prediction State (Now includes At-Risk and projectedScore)
  const [prediction, setPrediction] = useState<{ status: "Pass" | "At-Risk" | "Fail" | null; grade: string; confidence: number; projectedScore: number }>({
    status: null, grade: "", confidence: 0, projectedScore: 0
  });

  // PDF Target Reference
  const reportRef = useRef<HTMLDivElement>(null);

  const isFormValid = caScore !== "" && attendance !== "" && studyHours !== "";

  // The PDF Generation Function 
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      reportRef.current.classList.add("pdf-export-mode");
      
      const imgData = await htmlToImage.toPng(reportRef.current, { 
        quality: 1, 
        pixelRatio: 2,
        backgroundColor: '#ffffff' 
      });
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("FUTMINNA_AI_Student_Report.pdf");

      reportRef.current.classList.remove("pdf-export-mode");
    } catch (error) {
      console.error("Failed to generate PDF", error);
      reportRef.current.classList.remove("pdf-export-mode");
    }
  };

  // Function 1: Handle the DYNAMIC Initial Prediction
  const handlePredict = async () => {
    if (!isFormValid) return;
    
    setIsPredicting(true);
    setHasResult(false);
    setChatHistory([]); // Clear old chats

    // --- DYNAMIC ALGORITHM ---
    const ca = Number(caScore);
    const att = Number(attendance);
    const hours = Number(studyHours);

    // Predict Exam Score (max 70)
    // High attendance gives up to 30 marks. Study hours give up to 40 marks (capped at 25 hrs).
    const predictedExam = (att / 100) * 30 + Math.min(hours, 25) * 1.6;
    const projectedTotal = Math.round(ca + predictedExam);

    // Standard A-F Grading Scale Mapping
    let calcGrade = "F";
    let calcStatus: "Pass" | "At-Risk" | "Fail" = "Fail";

    if (projectedTotal >= 70) { calcGrade = "A"; calcStatus = "Pass"; }
    else if (projectedTotal >= 60) { calcGrade = "B"; calcStatus = "Pass"; }
    else if (projectedTotal >= 50) { calcGrade = "C"; calcStatus = "Pass"; }
    else if (projectedTotal >= 45) { calcGrade = "D"; calcStatus = "At-Risk"; }
    else if (projectedTotal >= 40) { calcGrade = "E"; calcStatus = "At-Risk"; }
    else { calcGrade = "F"; calcStatus = "Fail"; }

    // Dynamic Confidence Score (75% to 98%)
    // Less confident on borderline grades, more confident on extreme highs/lows + slight randomization
    const distanceToBorderline = Math.abs(projectedTotal - 40);
    const calcConfidence = Math.min(98, 75 + Math.round(distanceToBorderline * 0.4) + Math.floor(Math.random() * 5));

    setPrediction({
      status: calcStatus,
      grade: calcGrade,
      confidence: calcConfidence,
      projectedScore: projectedTotal
    });

    const systemPrompt = `You are a supportive AI Academic Advisor at the Federal University of Technology, Minna. 
    A student has the following metrics: Continuous Assessment: ${caScore}/30, Attendance: ${attendance}%, Weekly Study Hours: ${studyHours}.
    Our predictive model projects they will score ${projectedTotal}/100, resulting in a grade of ${calcGrade}. Their trajectory is classified as ${calcStatus.toUpperCase()}. 
    Speak directly to the advisor. In 3 to 4 sentences, generate a formal, professional intervention plan based on these specific numbers and grade. 
    Do not use bolding or markdown asterisks in your response.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: systemPrompt })
      });
      const data = await res.json();
      
      setChatHistory([{ role: "ai", text: data.reply }]);
      setHasResult(true);
    } catch (error) {
      setChatHistory([{ role: "ai", text: "Error connecting to the AI brain. Please verify network configuration." }]);
      setHasResult(true);
    } finally {
      setIsPredicting(false);
    }
  };

  // Function 2: Handle Follow-Up Conversational Questions
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput("");
    
    setChatHistory(prev => [...prev, { role: "user", text: userMessage }]);
    setIsChatting(true);

    const followUpPrompt = `You are a supportive AI Academic Advisor at FUTMINNA. 
    Context: Model predicted a ${prediction.projectedScore}/100 (Grade ${prediction.grade}, Status: ${prediction.status}).
    Metrics - CA: ${caScore}, Attendance: ${attendance}%, Study: ${studyHours}.
    The user just asked you this follow-up question regarding the prediction: "${userMessage}"
    Respond concisely and helpfully. Do not use bolding or markdown asterisks.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: followUpPrompt })
      });
      const data = await res.json();
      
      setChatHistory(prev => [...prev, { role: "ai", text: data.reply }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: "ai", text: "Connection error. Unable to retrieve response." }]);
    } finally {
      setIsChatting(false);
    }
  };

  // Helper function to dynamically color the UI badges
  const getStatusStyle = () => {
    if (prediction.status === "Pass") return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", val: "text-emerald-600", Icon: CheckCircle2 };
    if (prediction.status === "At-Risk") return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", val: "text-amber-600", Icon: AlertTriangle };
    return { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", val: "text-red-600", Icon: AlertCircle };
  };

  const statusStyle = getStatusStyle();

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="text-blue-600 w-6 h-6" />
            Performance Predictor Model
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Input student metrics to generate predictive analytics and prescriptive interventions.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100 whitespace-nowrap">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Model Status: Online
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Data Input */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1 h-fit">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Student Parameters</h2>
            <p className="text-xs text-slate-500">Enter current semester data.</p>
          </div>
          
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Continuous Assessment (0-30)</label>
              <input 
                type="number" max="30" min="0" value={caScore} onChange={(e) => setCaScore(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900"
                placeholder="e.g. 24"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Attendance Rate (%)</label>
              <input 
                type="number" max="100" min="0" value={attendance} onChange={(e) => setAttendance(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900"
                placeholder="e.g. 85"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Weekly Study Hours</label>
              <input 
                type="number" min="0" value={studyHours} onChange={(e) => setStudyHours(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900"
                placeholder="e.g. 12"
              />
            </div>

            <button 
              type="button" onClick={handlePredict} disabled={!isFormValid || isPredicting}
              className={`w-full flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-lg transition-all ${
                !isFormValid ? "bg-slate-100 text-slate-400 cursor-not-allowed" : isPredicting ? "bg-blue-600 text-white cursor-wait" : "bg-slate-900 text-white hover:bg-slate-800 shadow-md"
              }`}
            >
              {isPredicting ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Variables...</> : <>Generate Prediction <ChevronRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>

        {/* Right Column: AI Output & Chat Console */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col min-h-[500px]">
          
          {/* Header & Export Button */}
          <div className="mb-6 pb-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Diagnostic Output</h2>
              <p className="text-xs text-slate-500">Real-time model execution.</p>
            </div>
            {hasResult && !isPredicting && (
              <button 
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors border border-blue-200 shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export Official Report
              </button>
            )}
          </div>

          {!hasResult && !isPredicting && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <BrainCircuit className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-slate-500 font-medium">System Ready</h3>
              <p className="text-sm text-slate-400 max-w-xs mt-1">Enter parameters and initialize the prediction model to view results.</p>
            </div>
          )}

          {isPredicting && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="relative w-16 h-16 flex items-center justify-center mb-4">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <BrainCircuit className="w-6 h-6 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-slate-700 font-medium animate-pulse">Running Neural Pathway...</h3>
            </div>
          )}

          {hasResult && !isPredicting && (
            <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-500">
              
              {/* === THIS IS THE PDF TARGET AREA === */}
              <div ref={reportRef} className="bg-white p-2 flex flex-col gap-4">
                
                {/* Official PDF Header */}
                <div className="flex items-center gap-3 border-b border-slate-200 pb-3 mb-2">
                  <FileText className="w-6 h-6 text-slate-800" />
                  <div>
                    <h3 className="font-bold text-slate-900">FUTMINNA Academic AI Report</h3>
                    <p className="text-xs text-slate-500">Generated automatically by Predictive Early Warning System</p>
                  </div>
                </div>

                {/* Input Summary */}
                <div className="flex gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div><span className="text-xs text-slate-500 font-bold block">CA Score</span><span className="font-mono text-slate-900 font-bold">{caScore}/30</span></div>
                  <div><span className="text-xs text-slate-500 font-bold block">Attendance</span><span className="font-mono text-slate-900 font-bold">{attendance}%</span></div>
                  <div><span className="text-xs text-slate-500 font-bold block">Study Hours</span><span className="font-mono text-slate-900 font-bold">{studyHours} hrs</span></div>
                </div>

                {/* Dynamic Prediction Badges */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border ${statusStyle.bg} ${statusStyle.border}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <statusStyle.Icon className={`w-5 h-5 ${statusStyle.val}`} />
                      <span className={`text-sm font-bold ${statusStyle.text}`}>Predicted Trajectory</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <div className={`text-3xl font-black ${statusStyle.val}`}>{prediction.grade}</div>
                      <div className={`text-sm font-semibold ${statusStyle.text}`}>({prediction.status} - {prediction.projectedScore}/100)</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border bg-slate-50 border-slate-200">
                    <div className="text-sm font-bold text-slate-700 mb-1">Model Confidence</div>
                    <div className="text-3xl font-black text-slate-900">{prediction.confidence}%</div>
                  </div>
                </div>

                {/* Official AI Prescription */}
                <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 text-slate-300">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-400" />
                    Official Intervention Plan
                  </h3>
                  <div className="text-sm font-mono leading-relaxed text-slate-300">
                    {chatHistory.length > 0 ? chatHistory[0].text : "Generating plan..."}
                  </div>
                </div>
              </div>
              {/* === END OF PDF TARGET AREA === */}

              <hr className="border-slate-200 my-2" />

              {/* === CHAT INTERFACE === */}
              <div className="flex flex-col flex-1 mt-2">
                <h3 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
                  <Bot className="w-4 h-4" /> Ask Follow-Up Questions
                </h3>
                
                <div className="flex-1 flex flex-col bg-slate-50 border border-slate-200 rounded-xl overflow-hidden h-[250px]">
                  
                  <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white">
                    {chatHistory.slice(1).map((msg, idx) => (
                      <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'ai' && (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}
                        <div className={`p-3 rounded-lg text-sm max-w-[85%] leading-relaxed ${
                          msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-br-none shadow-md' 
                            : 'bg-slate-50 border border-slate-200 text-slate-700 rounded-bl-none shadow-inner'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    
                    {isChatting && (
                      <div className="flex justify-start gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600"><Bot className="w-4 h-4"/></div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg rounded-bl-none flex items-center gap-1.5 shadow-inner">
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                        </div>
                      </div>
                    )}
                    
                    {chatHistory.length <= 1 && !isChatting && (
                      <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                        Type below to ask the AI about the results.
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Discuss these results with the AI..."
                      className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 placeholder-slate-400 shadow-inner"
                    />
                    <button 
                      disabled={isChatting || !chatInput.trim()} 
                      type="submit" 
                      className="bg-blue-600 text-white p-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 transition-colors flex items-center justify-center shadow"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}