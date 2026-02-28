import React from "react";
import { useNavigate } from "react-router-dom";
import { Copy, ArrowLeft, Share2, Download } from "lucide-react";

const Share = () => {
    const navigate = useNavigate();
    const data = JSON.parse(localStorage.getItem("verifiedData")) || [];

    const shareLink = window.location.origin + "/summary";

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink);
        alert("Link copied to clipboard!");
    };

    const handleWhatsApp = () => {
        const text = encodeURIComponent(
            "Here is my prescription summary: " + shareLink
        );
        window.open(`https://wa.me/?text=${text}`, "_blank");
    };

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => navigate("/summary")}
                        className="flex items-center gap-2 text-slate-600 hover:text-teal-600"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>

                    <h2 className="text-2xl font-bold text-slate-800">
                        Share Prescription
                    </h2>
                </div>

                {/* Share Card */}
                <div className="bg-white rounded-3xl shadow border border-slate-200 p-8 space-y-6">

                    {/* Preview */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Summary Preview</h3>

                        {data.length === 0 ? (
                            <p className="text-slate-500">No prescription data available.</p>
                        ) : (
                            data.map((med, idx) => (
                                <div
                                    key={idx}
                                    className="border border-slate-200 rounded-xl p-4 mb-4"
                                >
                                    <h4 className="font-semibold">{med.name}</h4>
                                    <p className="text-sm text-slate-600">
                                        {med.dosage} | {med.frequency} | {med.duration}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">

                        <button
                            onClick={handleCopy}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition"
                        >
                            <Copy className="w-4 h-4" /> Copy Link
                        </button>

                        <button
                            onClick={handleWhatsApp}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition"
                        >
                            <Share2 className="w-4 h-4" /> Share on WhatsApp
                        </button>

                        <button
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-black text-white rounded-xl transition"
                        >
                            <Download className="w-4 h-4" /> Download PDF
                        </button>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default Share;