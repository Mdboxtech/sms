// Test script to verify optionsUtils functions work correctly
const { normalizeOptions, mapOptions, getCorrectAnswerText } = require('../resources/js/Utils/optionsUtils.js');

// Test data formats from database
const testCases = [
    // Format 1: Associative array with keys like 'A', 'B', 'C', 'D'
    {
        name: "Associative Array Format",
        options: {
            'A': 'Option A',
            'B': 'Option B', 
            'C': 'Option C',
            'D': 'Option D'
        },
        expected: [
            { text: 'Option A', is_correct: false },
            { text: 'Option B', is_correct: false },
            { text: 'Option C', is_correct: false },
            { text: 'Option D', is_correct: false }
        ]
    },
    
    // Format 2: Indexed array with string values
    {
        name: "Indexed Array Format",
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        expected: [
            { text: 'Option A', is_correct: false },
            { text: 'Option B', is_correct: false },
            { text: 'Option C', is_correct: false },
            { text: 'Option D', is_correct: false }
        ]
    },
    
    // Format 3: Array of objects with 'text' and 'is_correct' properties
    {
        name: "Object Array Format",
        options: [
            { text: 'testing 1', is_correct: false },
            { text: 'testin 2', is_correct: false },
            { text: 'testing 3', is_correct: false },
            { text: 'testing 4', is_correct: true }
        ],
        expected: [
            { text: 'testing 1', is_correct: false },
            { text: 'testin 2', is_correct: false },
            { text: 'testing 3', is_correct: false },
            { text: 'testing 4', is_correct: true }
        ]
    },
    
    // Edge cases
    {
        name: "Null/Undefined",
        options: null,
        expected: []
    },
    {
        name: "Empty Array",
        options: [],
        expected: []
    }
];

console.log("Testing optionsUtils functions...\n");

testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log("Input:", testCase.options);
    
    try {
        const result = normalizeOptions(testCase.options);
        console.log("Output:", result);
        
        // Test mapOptions as well
        const mapped = mapOptions(testCase.options, (option, index) => `${index}: ${option.text}`);
        console.log("Map result:", mapped);
        
        console.log("✓ Test passed\n");
    } catch (error) {
        console.log("✗ Test failed:", error.message);
        console.log("Stack:", error.stack);
        console.log("");
    }
});

console.log("All tests completed!");
