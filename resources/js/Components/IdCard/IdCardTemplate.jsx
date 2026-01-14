import React from 'react';
import { BuildingLibraryIcon } from '@heroicons/react/24/solid';

export default function IdCardTemplate({ user, settings, type, schoolLogoUrl }) {
    // Default values if user or settings are missing properties
    const {
        layout = 'portrait',
        theme_color = '#2563eb',
        show_photo = true,
        show_name = true,
        show_id = true,
        show_role = true,
        show_expiry = false,
        header_text = 'School Name',
        sub_header_text = 'Identity Card',
        expiry_date = '',
        background_image = null,
    } = settings || {};

    const isPortrait = layout === 'portrait';

    // Derived values
    const primaryColor = theme_color;
    const lightPrimaryColor = `${primaryColor}10`;

    // User data handling - prioritize passport_photo from DB
    const userName = user?.name || user?.user?.name || 'Student Name';
    const userId = user?.admission_number || user?.student?.admission_number || user?.staff_id || 'ID-000000';
    const userRole = type === 'student'
        ? (user?.classroom?.name || user?.student?.classroom?.name || 'Class')
        : 'Staff Member';

    // Photo priority: passport_photo > fallback to initials
    const userPhoto = user?.passport_photo ||
        user?.student?.passport_photo ||
        null;

    // Generate initials for placeholder
    const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <div
            className={`
                relative bg-white shadow-lg overflow-hidden print:shadow-none border border-gray-200 print:border-gray-400
                ${isPortrait ? 'w-[280px] h-[420px]' : 'w-[420px] h-[280px]'}
                flex flex-col
            `}
            style={{
                borderRadius: '12px',
            }}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: background_image ? `url(${background_image})` : undefined,
                    backgroundColor: lightPrimaryColor,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            />

            {/* Header */}
            <div
                className={`relative z-10 p-3 flex flex-col items-center justify-center text-white space-y-2`}
                style={{ backgroundColor: primaryColor }}
            >
                {/* School Logo */}
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center p-1 backdrop-blur-sm">
                    {schoolLogoUrl ? (
                        <img
                            src={schoolLogoUrl}
                            alt="School Logo"
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <BuildingLibraryIcon className="w-6 h-6 text-white/90" />
                    )}
                </div>

                <div className="text-center">
                    <h1 className="font-bold text-sm uppercase tracking-wider leading-tight">{header_text}</h1>
                    <p className="text-[10px] opacity-90 uppercase tracking-widest">{sub_header_text}</p>
                </div>
            </div>

            {/* Content Module */}
            <div className={`
                relative z-10 flex-1 p-4 flex 
                ${isPortrait ? 'flex-col items-center justify-center space-y-3' : 'flex-row items-center justify-between space-x-4'}
            `}>
                {/* Photo Section */}
                {show_photo && (
                    <div className={`${isPortrait ? '' : 'flex-shrink-0'}`}>
                        <div
                            className="w-24 h-28 rounded-lg border-3 border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center"
                            style={{ borderColor: primaryColor }}
                        >
                            {userPhoto ? (
                                <img
                                    src={userPhoto}
                                    alt={userName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center text-white font-bold text-2xl"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {initials}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Info Section */}
                <div className={`text-center ${isPortrait ? '' : 'flex-1 text-left'}`}>
                    {show_name && (
                        <div className="mb-1">
                            <h2 className="text-base font-bold text-gray-900 leading-tight">{userName}</h2>
                        </div>
                    )}

                    {show_role && (
                        <div className="mb-2">
                            <span
                                className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase text-white"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {userRole}
                            </span>
                        </div>
                    )}

                    {show_id && (
                        <div className="space-y-0.5">
                            <p className="text-[10px] text-gray-500 uppercase font-semibold">ID Number</p>
                            <p className="text-sm font-mono font-bold text-gray-800 tracking-wider">{userId}</p>
                        </div>
                    )}

                    {show_expiry && expiry_date && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-[10px] text-gray-400 uppercase">Expires</p>
                            <p className="text-xs font-semibold text-gray-700">{expiry_date}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer / Barcode */}
            <div
                className="relative z-10 bg-gray-50 p-2 border-t border-gray-100 flex justify-center items-center"
            >
                <div className="h-6 flex space-x-0.5 items-end opacity-70">
                    {[...Array(25)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-black"
                            style={{
                                width: Math.random() > 0.5 ? '1px' : '3px',
                                height: Math.random() > 0.5 ? '100%' : '70%'
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
