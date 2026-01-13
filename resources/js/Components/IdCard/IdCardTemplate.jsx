import React from 'react';

export default function IdCardTemplate({ user, settings, type }) {
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
    // Lighter version of primary color for background accents
    const lightPrimaryColor = `${primaryColor}10`; // 10% opacity hex

    // User data handling
    const userName = user?.name || user?.user?.name || 'Student Name';
    const userId = user?.admission_number || user?.staff_id || 'ID-000000';
    const userRole = type === 'student' ? (user?.classroom?.name || 'Class') : 'Staff Member';
    const userPhoto = user?.photo_path || user?.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;

    return (
        <div
            className={`
                relative bg-white shadow-lg overflow-hidden print:shadow-none border border-gray-200 print:border-gray-900
                ${isPortrait ? 'w-[320px] h-[480px]' : 'w-[480px] h-[320px]'}
                flex flex-col
            `}
            style={{
                borderColor: 'rgba(0,0,0,0.1)'
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
                className={`relative z-10 p-4 text-center text-white`}
                style={{ backgroundColor: primaryColor }}
            >
                <h1 className="font-bold text-lg uppercase tracking-wider">{header_text}</h1>
                <p className="text-xs opacity-90 uppercase tracking-widest">{sub_header_text}</p>
            </div>

            {/* Content Module */}
            <div className={`
                relative z-10 flex-1 p-6 flex 
                ${isPortrait ? 'flex-col items-center justify-center space-y-4' : 'flex-row items-center justify-between space-x-6'}
            `}>
                {/* Photo Section */}
                {show_photo && (
                    <div className={`${isPortrait ? '' : 'flex-shrink-0'}`}>
                        <div
                            className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100"
                            style={{ borderColor: primaryColor }}
                        >
                            <img
                                src={userPhoto}
                                alt={userName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                )}

                {/* Info Section */}
                <div className={`text-center ${isPortrait ? '' : 'flex-1 text-left'}`}>
                    {show_name && (
                        <div className="mb-2">
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">{userName}</h2>
                        </div>
                    )}

                    {show_role && (
                        <div className="mb-3">
                            <span
                                className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase text-white"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {userRole}
                            </span>
                        </div>
                    )}

                    {show_id && (
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase font-semibold">ID Number</p>
                            <p className="text-lg font-mono font-bold text-gray-800 tracking-wider">{userId}</p>
                        </div>
                    )}

                    {show_expiry && expiry_date && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-400 uppercase">Expires</p>
                            <p className="text-sm font-semibold text-gray-700">{expiry_date}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer / Barcode Placeholder */}
            <div
                className="relative z-10 bg-gray-50 p-3 border-t border-gray-100 flex justify-center items-center"
            >
                {/* Simple Barcode visual representation */}
                <div className="h-8 flex space-x-0.5 items-end opacity-70">
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-black"
                            style={{
                                width: Math.random() > 0.5 ? '2px' : '4px',
                                height: Math.random() > 0.5 ? '100%' : '70%'
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
