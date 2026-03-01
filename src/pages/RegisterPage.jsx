import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../api/auth.api';
import { AlertCircle } from 'lucide-react';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'patient',
        phone: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsSubmitting(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setIsSubmitting(false);
            return;
        }

        try {
            const data = await registerUser(
                formData.name,
                formData.email,
                formData.password,
                formData.role,
                formData.phone
            );
            // Auto login on success
            login(data.user, data.token);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

                {/* Logo area */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                        <span className="text-3xl">🏥</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Prescripto</h1>
                    <p className="text-slate-500 font-medium">Create your account</p>
                </div>

                {error && (
                    <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Role Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">I am a...</label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`
                flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer font-bold transition-all
                ${formData.role === 'patient' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}
              `}>
                                <input type="radio" name="role" value="patient" className="hidden"
                                    checked={formData.role === 'patient'} onChange={handleChange} />
                                <span>👤 Patient</span>
                            </label>

                            <label className={`
                flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer font-bold transition-all
                ${formData.role === 'pharmacist' ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}
              `}>
                                <input type="radio" name="role" value="pharmacist" className="hidden"
                                    checked={formData.role === 'pharmacist'} onChange={handleChange} />
                                <span>💊 Pharmacist</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                        <input
                            type="text" name="name" value={formData.name} onChange={handleChange}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            placeholder="John Doe" required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                        <input
                            type="email" name="email" value={formData.email} onChange={handleChange}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            placeholder="you@example.com" required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number (Optional)</label>
                        <input
                            type="tel" name="phone" value={formData.phone} onChange={handleChange}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            placeholder="+1 234 567 8900"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                            <input
                                type="password" name="password" value={formData.password} onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                placeholder="••••••••" required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm</label>
                            <input
                                type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                placeholder="••••••••" required
                            />
                        </div>
                    </div>

                    <button
                        type="submit" disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex justify-center items-center mt-6 group"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            'Create Account →'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold ml-1">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
