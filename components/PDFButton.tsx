"use client";

import { Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function PDFButton() {
  const handleDownload = async () => {
    const element = document.getElementById("digest-content");
    if (!element) return;

    try {
      // Optimizing for high quality & dark theme
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0a0a0a",
        logging: false,
        onclone: (clonedDoc) => {
          // You can modify the cloned element before snapshotting if needed
          const el = clonedDoc.getElementById("digest-content");
          if (el) el.style.padding = "20px";
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Deep-Dive-Digest-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl active:scale-95 group"
    >
      <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
      <span>Download PDF</span>
    </button>
  );
}
