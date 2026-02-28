import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const Confirmation = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="bg-white p-10 rounded-3xl shadow border text-center">
                <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-800 mb-3">
                    Verification Successful
                </h2>
                <button
                    onClick={() => navigate("/summary")}
                    className="mt-6 px-6 py-3 bg-teal-600 text-white rounded-xl"
                >
                    View Summary
                </button>
            </div>
        </div>
    );
};

export default Confirmation;