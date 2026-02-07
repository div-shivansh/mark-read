"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, Sparkles, Edit3, CheckCircle, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import { useFileContext } from "./context/FileContext";

export default function LandingPage() {
  const router = useRouter()

  const [isDragging, setIsDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [popup, setPopup] = useState(false)
  const [docContext, setDocContext] = useState("")
  const [studyGoal, setStudyGoal] = useState("General Summary")
  const [isCustom, setIsCustom] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const {setFile, setHighlights} = useFileContext()


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation()

    const item = e.dataTransfer.items[0]
    if (item && item.type !== "application/pdf") {
      e.dataTransfer.dropEffect = "none"
      setIsDragging(false)
      return;
    }

    e.dataTransfer.dropEffect = "copy"
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation()
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0]

    if (!file || file.type !== "application/pdf") {
      toast.warn("Invalid file type dropped.")
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFileSelection(file)
      toast.success("File selected successfully")
    }
  };

  const handleBrowseClick = () => {
    fileInput.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if(e.target.files[0].type !== "application/pdf") {
        toast.warn("Invalid file type dropped")
        return
      }
      processFileSelection(e.target.files[0])
      toast.success("File selected successfully")
    }
  }

  const processFileSelection = (file: File) => {
    setSelectedFile(file)
    setPopup(true)
    setDocContext("")
    setStudyGoal("General Summary")
    setIsCustom(false)
  }

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;
    setIsLoading(true)

    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("context", docContext || "General Study");
    formData.append("studyGoal", studyGoal)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/analyze-pdf`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error(response.statusText)
      const data = await response.json();

    setFile(selectedFile)
    setHighlights(data.highlights)
    
    const fileUrl = URL.createObjectURL(selectedFile)
    
    sessionStorage.setItem("currentPdfUrl", fileUrl)
    sessionStorage.setItem("currentHighlights", JSON.stringify(data.highlights))
    
    
    router.push("/editor")
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Something went wrong. Try again")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-yellow-200 selection:text-red-900">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="relative group cursor-pointer w-46">
            <Link href="/">
              <Image src="/markread.png" alt="logo" width={1000} height={1000} loading="eager" />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
            <Link href="/#how-it-works" className="hover:text-red-600 transition-colors">How it Works</Link>
            <Link href="#features" className="hover:text-red-600 transition-colors">Features</Link>
            <button onClick={handleBrowseClick} className="bg-gray-900 cursor-pointer text-white px-5 py-2 rounded-full hover:bg-red-600 transition-colors duration-300">
              Get Started
            </button>
          </div>
        </div>
      </nav>
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold mb-8 border border-red-100 uppercase tracking-wide">
          <Sparkles className="w-3 h-3" />
          <span>Powered by Gemini 3.0</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-gray-900">
          Your Personal AI <br className="hidden md:block" />
          <span className="relative inline-block px-2">
            <span className="absolute inset-0 bg-yellow-300 transform -skew-x-3 translate-y-2 opacity-60 rounded-sm"></span>
            <span className="relative">Research Assistant</span>
          </span>
        </h1>

        <p className="text-xl text-gray-500 max-w-2xl mb-12 leading-relaxed">
          Don&apos;t just read. <strong>Understand.</strong> Upload your PDF, let AI highlight the critical concepts, and edit the results to match your study style.
        </p>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          className={`
            w-full max-w-2xl bg-white rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl
            flex flex-col items-center justify-center p-12 group mb-10
            ${isDragging ? "border-red-500 bg-red-50 scale-[1.02]" : "border-gray-200 hover:border-yellow-400"}
          `}
        >
          <input
            type="file"
            ref={fileInput}
            onChange={handleFileChange}
            className="hidden"
            accept="application/pdf"
          />
          <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? "bg-red-100" : "bg-yellow-50 group-hover:bg-yellow-100"}`}>
            <Upload className={`w-8 h-8 ${isDragging ? "text-red-600" : "text-yellow-600"}`} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Upload your PDF
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Drag & drop your notes here, or click to browse.
          </p>
          <p className="mt-4 text-xs text-gray-400">Supported formats: PDF (Text-based)</p>
        </div>
      </section>
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Document Settings</h3>
              <button onClick={() => setPopup(false)} className="text-gray-400 cursor-pointer hover:text-red-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-sm">
                <FileText className="w-5 h-5" />
                <span className="font-medium truncate">{selectedFile?.name}</span>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Topic / Context
                </label>
                <input
                  type="text"
                  value={docContext}
                  onChange={(e) => setDocContext(e.target.value)}
                  placeholder="e.g. Electrostatics, History of Rome..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">Helping the AI understand the topic improves accuracy.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Study Goal (Difficulty)
                </label>
                <div className="relative">
                  <select
                    value={isCustom ? "Other" : studyGoal}
                    onChange={(e) => {
                      if (e.target.value === "Other") {
                        setIsCustom(true);
                        setStudyGoal("");
                      } else {
                        setIsCustom(false);
                        setStudyGoal(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none appearance-none bg-white transition-all cursor-pointer"
                  >
                    <option value="General Summary">General Summary (Standard)</option>
                    <option value="School Boards">CBSE / Boards (Definitions & Key Dates)</option>
                    <option value="JEE Mains">JEE Mains (Formulas & Concepts)</option>
                    <option value="NEET">NEET (Biology Facts & Exceptions)</option>
                    <option value="University">University / Research (Deep Analysis)</option>
                    <option value="Other">Other (Specify...)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                {isCustom && (
                  <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">
                      Specify your goal
                    </label>
                    <input
                      type="text"
                      value={studyGoal}
                      onChange={(e) => setStudyGoal(e.target.value)}
                      placeholder="e.g. UPSC History, Python Interview Prep..."
                      autoFocus
                      className="w-full px-4 py-2 rounded-lg border-2 border-red-100 focus:border-red-500 focus:ring-0 outline-none bg-red-50/30 transition-all placeholder:text-gray-400"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setPopup(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer hover:bg-neutral-200/60 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleStartAnalysis}
                disabled= {isLoading}
                className="px-6 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-md shadow-red-200 transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                  </>
                ): (
                  <>
                  <Sparkles className="w-4 h-4" />
                  Start Analysis
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
      <section id="how-it-works" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How <span className="text-red-600">Mark&Read</span> Works</h2>
            <p className="text-gray-500">From raw document to perfect summary in seconds.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Upload & Context"
              description="Upload your notes and tell us what you're looking for. Are you cramming for an exam or researching Link thesis?"
              icon={<FileText className="w-6 h-6 text-red-600" />}
            />
            <StepCard
              number="02"
              title="AI Analysis"
              description="Our 'Brain & Hand' engine uses Gemini 3 to read your file and identify the exact concepts that matter."
              icon={<Sparkles className="w-6 h-6 text-yellow-600" />}
            />
            <StepCard
              number="03"
              title="Edit & Perfect"
              description="Review the highlights. Add your own, remove the ones you know, and export your perfectly tailored study guide."
              icon={<Edit3 className="w-6 h-6 text-red-600" />}
            />
          </div>
        </div>
      </section>
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold leading-tight">
              It&apos;s not just highlighting.<br />
              It&apos;s <span className="bg-yellow-200 px-2">intelligent understanding.</span>
            </h2>
            <p className="text-lg text-gray-600">
              Most tools just summarize. We keep your original document intact but draw your attention to what matters, creating Link visual layer you can control.
            </p>

            <div className="space-y-4">
              <FeatureItem text="Editable Highlights: Click to delete, drag to add." />
              <FeatureItem text="Context Aware: Tell AI 'Highlight only definitions' or 'Highlight dates'." />
              <FeatureItem text="Visual Layering: Your original PDF is never damaged." />
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-linear-to-tr from-yellow-200 to-red-100 rounded-full opacity-30 blur-3xl"></div>
            <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                </div>
                <div className="text-xs font-mono text-gray-400">notes_final.pdf</div>
              </div>
              <div className="space-y-3 font-serif text-gray-800 leading-relaxed opacity-90">
                <p>The <span className="bg-yellow-300">mitochondria is the powerhouse of the cell</span>. It generates most of the chemical energy needed to power the cell&apos;s biochemical reactions.</p>
                <p>Chemical energy produced by the mitochondria is stored in Link small molecule called <span className="bg-yellow-300 cursor-pointer border-b-2 border-red-400 border-dashed" title="Click to edit">adenosine triphosphate (ATP)</span>.</p>
                <p className="text-gray-300 blur-[1px]">In addition to supplying cellular energy, mitochondria are involved in other tasks, such as signaling, cellular differentiation, and cell death...</p>
              </div>
              <div className="absolute top-24 right-10 bg-gray-900 text-white text-xs px-3 py-1 rounded shadow-lg">
                Highlighter Tool Active
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-6">Ready to upgrade your study workflow?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={handleBrowseClick} className="px-8 py-3 cursor-pointer bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors">
              Start Highlighting for Free
            </button>
            <button className="px-8 py-3 cursor-pointer bg-white text-gray-900 border border-gray-200 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              View Demo
            </button>
          </div>
          <p className="mt-8 text-gray-400 text-sm">
            © 2026 Mark&Read. Built with Next.js & Gemini.
          </p>
        </div>
      </section>

    </div>
  );
}

function StepCard({ number, title, description, icon }: { number: string, title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
        <span className="text-4xl font-bold text-gray-100">{number}</span>
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle className="w-4 h-4 text-green-600" />
      </div>
      <span className="text-gray-700">{text}</span>
    </div>
  );
}