# 🖍️ Mark&Read - AI-Powered PDF Highlighter

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![Python](https://img.shields.io/badge/Backend-FastAPI-green)
![Gemini](https://img.shields.io/badge/AI-Gemini_1.5_Flash-purple)

**Mark&Read** is an intelligent study companion that transforms how you interact with documents. Instead of reading an entire PDF, simply upload it, state your learning goal, and let Google Gemini AI identify and highlight the 5 most critical sentences for you.

Includes a fully custom, canvas-based PDF editor for manual annotation and exporting.

## 🚀 Features

-   **🤖 AI Analysis:** Uses Google Gemini 1.5 Flash to scan documents and extract key insights based on your specific "Study Goal."
-   **🎨 Custom PDF Editor:** Built from scratch using HTML5 Canvas for pixel-perfect rendering.
-   **✍️ Annotation Tools:**
    -   **Line Marker:** For highlighting text.
    -   **Box Tool:** For highlighting diagrams or sections.
    -   **Color Picker:** 5 distinct colors for categorization.
-   **💾 Export:** Download your annotated PDF with all highlights burned in.
-   **⚡ High Performance:** Optimized for Next.js 16 with a Python FastAPI backend.

## 🛠️ Tech Stack

### Frontend
-   **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
-   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
-   **PDF Rendering:** `pdfjs-dist` (Custom Canvas Implementation)
-   **Icons:** Lucide React

### Backend
-   **Framework:** Python FastAPI
-   **Server:** Uvicorn
-   **AI Model:** Google Gemini 1.5 Flash via `google-generativeai`
-   **PDF Processing:** `PyMuPDF` (fitz)

---

## 📦 Installation & Setup

### Prerequisites
-   Node.js (v18+)
-   Python (v3.9+)
-   A Google Gemini API Key ([Get one here](https://aistudio.google.com/))

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/mark-read.git](https://github.com/your-username/mark-read.git)
cd mark-read

```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Run the development server (Webpack mode required for PDF.js)
npm run dev

```

*The frontend will run on `http://localhost:3000*`

### 3. Backend Setup

Navigate to the backend folder (or root if combined):

```bash
# Create a virtual environment (Optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
echo "GEMINI_API_KEY=your_actual_api_key_here" > .env

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

```

*The backend will run on `http://127.0.0.1:8000*`

---

## 🖥️ Usage Guide

1. **Upload:** Drag & Drop a PDF file onto the home page.
2. **Context:** Enter what the PDF is about (e.g., "History of Rome").
3. **Goal:** Enter what you want to learn (e.g., "Focus on military strategies").
4. **Analyze:** Click "Start Analysis". The AI will scan the text and highlight critical info.
5. **Edit:** You will be redirected to the Editor.
* Use the **Sidebar** to toggle tools and colors.
* **Click & Drag** to add manual highlights.
* **Click** an existing highlight to delete it.


6. **Export:** Click "Export PDF" to save your work.

---

## 🔧 Configuration (Next.js 16)

This project uses **Webpack** instead of Turbopack to ensure compatibility with `pdfjs-dist`.
The `next.config.ts` includes a custom webpack rule to handle the `canvas` dependency:

```typescript
const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  // ... rewrites for backend API
};

```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
Built with ❤️ by Shivansh Tiwari
</p>

```

```