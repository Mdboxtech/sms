import React from 'react';

export default function IdCardBack({ settings }) {
    const {
        layout = 'portrait',
        theme_color = '#2563eb',
        header_text = 'School Name',
        show_back = true,
        back_title = 'Terms & Conditions',
        back_content = '',
        back_contact = '',
        back_address = '',
    } = settings || {};

    const isPortrait = layout === 'portrait';
    const primaryColor = theme_color;

    if (!show_back) return null;

    return (
        <div
            className={`
                relative bg-white shadow-lg overflow-hidden print:shadow-none border border-gray-200 print:border-gray-400
                ${isPortrait ? 'w-[280px] h-[420px]' : 'w-[420px] h-[280px]'}
                flex flex-col
            `}
            style={{ borderRadius: '12px' }}
        >
            {/* Header bar */}
            <div
                className="relative z-10 p-3 text-center text-white"
                style={{ backgroundColor: primaryColor }}
            >
                <h1 className="font-bold text-sm uppercase tracking-wider">{header_text}</h1>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col justify-between">
                {/* Title & Content */}
                <div>
                    <h2 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">
                        {back_title}
                    </h2>
                    <div className="text-[10px] text-gray-600 leading-relaxed whitespace-pre-line">
                        {back_content}
                    </div>
                </div>

                {/* Contact Info */}
                <div className="mt-4 pt-3 border-t border-gray-200 space-y-1">
                    {back_address && (
                        <p className="text-[10px] text-gray-500 flex items-start">
                            <span className="font-semibold mr-1">📍</span>
                            <span>{back_address}</span>
                        </p>
                    )}
                    {back_contact && (
                        <p className="text-[10px] text-gray-500 flex items-center">
                            <span className="font-semibold mr-1">📞</span>
                            <span>{back_contact}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div
                className="p-2 text-center text-[9px] text-white"
                style={{ backgroundColor: primaryColor }}
            >
                If found, please return to the school office.
            </div>
        </div>
    );
}
