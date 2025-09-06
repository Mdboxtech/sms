import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { EyeIcon, EyeSlashIcon, UserIcon, EnvelopeIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    // Password strength checker
    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '' };
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const levels = [
            { strength: 0, label: '', color: '' },
            { strength: 1, label: 'Very Weak', color: 'bg-red-500' },
            { strength: 2, label: 'Weak', color: 'bg-orange-500' },
            { strength: 3, label: 'Fair', color: 'bg-yellow-500' },
            { strength: 4, label: 'Good', color: 'bg-blue-500' },
            { strength: 5, label: 'Strong', color: 'bg-green-500' },
        ];

        return levels[strength];
    };

    const passwordStrength = getPasswordStrength(data.password);

    return (
        <GuestLayout>
            <Head title="Create Account" />

            {/* Welcome Message */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
                <p className="text-gray-600">Join our educational community today</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                    <InputLabel htmlFor="name" value="Full Name" className="text-sm font-semibold text-gray-700" />
                    
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="pl-10 mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>
                    <InputError message={errors.name} className="mt-2" />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                    <InputLabel htmlFor="email" value="Email Address" className="text-sm font-semibold text-gray-700" />
                    
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="pl-10 mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Enter your email address"
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <InputLabel htmlFor="password" value="Password" className="text-sm font-semibold text-gray-700" />
                    
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LockClosedIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="pl-10 pr-10 mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Create a strong password"
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                            ) : (
                                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                            )}
                        </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {data.password && (
                        <div className="mt-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-500">Password strength</span>
                                <span className={`text-xs font-medium ${
                                    passwordStrength.strength >= 4 ? 'text-green-600' : 
                                    passwordStrength.strength >= 3 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                    {passwordStrength.label}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                    
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                        className="text-sm font-semibold text-gray-700"
                    />
                    
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <TextInput
                            id="password_confirmation"
                            type={showPasswordConfirmation ? 'text' : 'password'}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="pl-10 pr-10 mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            placeholder="Confirm your password"
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                        >
                            {showPasswordConfirmation ? (
                                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                            ) : (
                                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                            )}
                        </button>
                    </div>

                    {/* Password Match Indicator */}
                    {data.password_confirmation && (
                        <div className="mt-2">
                            <div className={`flex items-center text-xs ${
                                data.password === data.password_confirmation ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {data.password === data.password_confirmation ? (
                                    <>
                                        <ShieldCheckIcon className="h-4 w-4 mr-1" />
                                        Passwords match
                                    </>
                                ) : (
                                    <>
                                        <LockClosedIcon className="h-4 w-4 mr-1" />
                                        Passwords do not match
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                {/* Terms and Conditions */}
                <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-600 leading-relaxed">
                        By creating an account, you agree to our{' '}
                        <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">
                            Privacy Policy
                        </a>
                        . Your personal information will be kept secure and never shared with third parties.
                    </p>
                </div>

                {/* Create Account Button */}
                <div className="pt-4">
                    <PrimaryButton 
                        className="w-full justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                        disabled={processing}
                    >
                        {processing ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating account...
                            </div>
                        ) : (
                            'Create Account'
                        )}
                    </PrimaryButton>
                </div>

                {/* Sign In Link */}
                <div className="text-center pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link
                            href={route('login')}
                            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                        >
                            Sign in instead
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
