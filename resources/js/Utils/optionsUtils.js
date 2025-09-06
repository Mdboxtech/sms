/**
 * Utility functions for handling question options in various formats
 */

/**
 * Normalizes question options to a consistent format
 * Handles three input formats:
 * 1. Simple array: ['Option A', 'Option B']
 * 2. Associative array: {A: 'Option A', B: 'Option B'}  
 * 3. Array of objects: [{text: 'Option A', is_correct: false}]
 * 
 * @param {*} options - The options in any of the supported formats
 * @returns {Array} - Normalized array of objects with text and is_correct properties
 */
export const normalizeOptions = (options) => {
    if (!options) return [];
    
    // Handle null/undefined
    if (options === null || options === undefined) {
        return [];
    }
    
    // Handle array format
    if (Array.isArray(options)) {
        if (options.length === 0) return [];
        
        // Check if it's already in the target format (array of objects with 'text' property)
        if (typeof options[0] === 'object' && options[0] !== null && 'text' in options[0]) {
            return options.map(option => ({
                text: option.text || '',
                is_correct: option.is_correct || false
            }));
        }
        
        // Handle simple array of strings
        return options.map(text => ({
            text: String(text || ''),
            is_correct: false
        }));
    }
    
    // Handle object format (associative array)
    if (typeof options === 'object') {
        return Object.entries(options).map(([key, text]) => ({
            text: String(text || ''),
            is_correct: false
        }));
    }
    
    // Fallback for any other type
    return [];
};

/**
 * Gets the correct answer text from options based on various formats
 * @param {*} options - The options in any supported format
 * @param {*} correctAnswer - The correct answer (could be index, key, or text)
 * @returns {string} - The correct answer text
 */
export const getCorrectAnswerText = (options, correctAnswer) => {
    const normalizedOptions = normalizeOptions(options);
    
    if (!correctAnswer) return '';
    
    // Try to find by text match first
    const byText = normalizedOptions.find(opt => opt.text === correctAnswer);
    if (byText) return byText.text;
    
    // Try to find by index
    const index = parseInt(correctAnswer);
    if (!isNaN(index) && normalizedOptions[index]) {
        return normalizedOptions[index].text;
    }
    
    // Try to find by letter (A, B, C, D)
    const letterIndex = correctAnswer.charCodeAt(0) - 65; // Convert A=0, B=1, etc.
    if (letterIndex >= 0 && letterIndex < normalizedOptions.length) {
        return normalizedOptions[letterIndex].text;
    }
    
    return correctAnswer;
};

/**
 * Converts normalized options back to simple array format for storage
 * @param {Array} normalizedOptions - Normalized options array
 * @returns {Array} - Simple array of option texts
 */
export const optionsToSimpleArray = (normalizedOptions) => {
    if (!Array.isArray(normalizedOptions)) return [];
    return normalizedOptions.map(option => option.text || '');
};

/**
 * Safely maps over options with normalization
 * @param {*} options - The options in any supported format
 * @param {Function} mapFunction - Function to apply to each normalized option
 * @returns {Array} - Mapped array
 */
export const mapOptions = (options, mapFunction) => {
    const normalizedOptions = normalizeOptions(options);
    return normalizedOptions.map(mapFunction);
};
