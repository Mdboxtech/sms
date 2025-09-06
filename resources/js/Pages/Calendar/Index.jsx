import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import { useState, useMemo } from 'react';
import { 
    ChevronLeftIcon, 
    ChevronRightIcon,
    PlusIcon,
    CalendarDaysIcon,
    ClockIcon,
    MapPinIcon,
    TagIcon
} from '@heroicons/react/24/outline';
import { format, 
    startOfMonth, 
    endOfMonth, 
    eachDayOfInterval, 
    isSameMonth, 
    isSameDay, 
    addMonths, 
    subMonths,
    isToday,
    parseISO
} from 'date-fns';

export default function CalendarIndex({ 
    events, 
    currentDate, 
    viewType, 
    currentSession, 
    currentTerm, 
    upcomingEvents, 
    userRole 
}) {
    const [selectedDate, setSelectedDate] = useState(parseISO(currentDate));
    const [view, setView] = useState(viewType);
    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        type: 'school_event',
        all_day: false,
        location: '',
        color: '#3b82f6'
    });

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const start = startOfMonth(selectedDate);
        const end = endOfMonth(selectedDate);
        return eachDayOfInterval({ start, end });
    }, [selectedDate]);

    // Get events for a specific day
    const getEventsForDay = (day) => {
        return events.filter(event => 
            isSameDay(parseISO(event.date), day)
        );
    };

    // Navigate months
    const navigateMonth = (direction) => {
        if (direction === 'prev') {
            setSelectedDate(subMonths(selectedDate, 1));
        } else {
            setSelectedDate(addMonths(selectedDate, 1));
        }
    };

    // Handle event submission
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('calendar.store'), {
            onSuccess: () => {
                reset();
                setShowEventModal(false);
            }
        });
    };

    // Event type colors
    const getEventTypeColor = (type) => {
        const colors = {
            school_event: 'bg-blue-100 text-blue-800 border-blue-200',
            holiday: 'bg-green-100 text-green-800 border-green-200',
            exam: 'bg-red-100 text-red-800 border-red-200',
            meeting: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            assignment: 'bg-purple-100 text-purple-800 border-purple-200',
            assignment_due: 'bg-red-100 text-red-800 border-red-200',
            assignment_grading: 'bg-orange-100 text-orange-800 border-orange-200',
            term_start: 'bg-green-100 text-green-800 border-green-200',
            term_end: 'bg-red-100 text-red-800 border-red-200',
            other: 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return colors[type] || colors.other;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Calendar" />
            
            <div className="space-y-6">
                <PageHeader
                    title="Academic Calendar"
                    subtitle={`${currentSession?.name || 'No Session'} - ${currentTerm?.name || 'No Term'}`}
                    actions={
                        (userRole === 'admin' || userRole === 'teacher') && (
                            <button
                                onClick={() => setShowEventModal(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add Event
                            </button>
                        )
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Calendar */}
                    <div className="lg:col-span-3">
                        <Card>
                            {/* Calendar Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <div className="flex items-center space-x-4">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {format(selectedDate, 'MMMM yyyy')}
                                    </h2>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => navigateMonth('prev')}
                                            className="p-2 hover:bg-gray-100 rounded-md"
                                        >
                                            <ChevronLeftIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => navigateMonth('next')}
                                            className="p-2 hover:bg-gray-100 rounded-md"
                                        >
                                            <ChevronRightIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedDate(new Date())}
                                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                                >
                                    Today
                                </button>
                            </div>

                            {/* Calendar Grid */}
                            <div className="p-6">
                                {/* Day Headers */}
                                <div className="grid grid-cols-7 gap-1 mb-4">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Days */}
                                <div className="grid grid-cols-7 gap-1">
                                    {calendarDays.map(day => {
                                        const dayEvents = getEventsForDay(day);
                                        const isCurrentMonth = isSameMonth(day, selectedDate);
                                        const isCurrentDay = isToday(day);

                                        return (
                                            <div
                                                key={day.toString()}
                                                className={`
                                                    min-h-[120px] p-2 border border-gray-100 rounded-lg
                                                    ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                                                    ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}
                                                    hover:bg-gray-50 cursor-pointer
                                                `}
                                            >
                                                <div className={`
                                                    text-sm font-medium mb-1
                                                    ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                                                    ${isCurrentDay ? 'text-blue-600' : ''}
                                                `}>
                                                    {format(day, 'd')}
                                                </div>
                                                
                                                <div className="space-y-1">
                                                    {dayEvents.slice(0, 3).map((event, index) => (
                                                        <div
                                                            key={event.id}
                                                            className={`
                                                                text-xs p-1 rounded border truncate
                                                                ${getEventTypeColor(event.type)}
                                                                hover:shadow-sm cursor-pointer
                                                            `}
                                                            title={event.title}
                                                            onClick={() => setSelectedEvent(event)}
                                                        >
                                                            {event.title}
                                                        </div>
                                                    ))}
                                                    {dayEvents.length > 3 && (
                                                        <div className="text-xs text-gray-500 px-1">
                                                            +{dayEvents.length - 3} more
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Upcoming Events */}
                        <Card>
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Events</h3>
                                <div className="space-y-3">
                                    {upcomingEvents.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No upcoming events</p>
                                    ) : (
                                        upcomingEvents.map(event => (
                                            <div key={event.id} className="flex items-start space-x-3">
                                                <div className={`
                                                    w-3 h-3 rounded-full mt-1 flex-shrink-0
                                                `} style={{ backgroundColor: event.color }} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {event.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {format(parseISO(event.date), 'MMM d')}
                                                        {event.time && ` at ${event.time}`}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {event.category}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Event Legend */}
                        <Card>
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Event Types</h3>
                                <div className="space-y-2">
                                    {[
                                        { type: 'school_event', label: 'School Events' },
                                        { type: 'holiday', label: 'Holidays' },
                                        { type: 'exam', label: 'Exams' },
                                        { type: 'assignment', label: 'Assignments' },
                                        { type: 'meeting', label: 'Meetings' }
                                    ].map(item => (
                                        <div key={item.type} className="flex items-center space-x-2">
                                            <div className={`w-3 h-3 rounded border ${getEventTypeColor(item.type).replace('text-', 'bg-').split(' ')[0]}`} />
                                            <span className="text-sm text-gray-600">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Event Modal */}
            {showEventModal && (userRole === 'admin' || userRole === 'teacher') && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEventModal(false)} />
                        
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        Add New Event
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Title</label>
                                            <input
                                                type="text"
                                                value={data.title}
                                                onChange={e => setData('title', e.target.value)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Description</label>
                                            <textarea
                                                value={data.description}
                                                onChange={e => setData('description', e.target.value)}
                                                rows={3}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                                <input
                                                    type="date"
                                                    value={data.event_date}
                                                    onChange={e => setData('event_date', e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Time</label>
                                                <input
                                                    type="time"
                                                    value={data.event_time}
                                                    onChange={e => setData('event_time', e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    disabled={data.all_day}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.all_day}
                                                    onChange={e => setData('all_day', e.target.checked)}
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">All day event</span>
                                            </label>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Type</label>
                                            <select
                                                value={data.type}
                                                onChange={e => setData('type', e.target.value)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="school_event">School Event</option>
                                                <option value="holiday">Holiday</option>
                                                <option value="exam">Exam</option>
                                                <option value="meeting">Meeting</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                    >
                                        {processing ? 'Creating...' : 'Create Event'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowEventModal(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedEvent(null)} />
                        
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                                            {selectedEvent.title}
                                        </h3>
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <CalendarDaysIcon className="h-4 w-4 mr-2" />
                                                {format(parseISO(selectedEvent.date), 'EEEE, MMMM d, yyyy')}
                                            </div>
                                            {selectedEvent.time && (
                                                <div className="flex items-center">
                                                    <ClockIcon className="h-4 w-4 mr-2" />
                                                    {selectedEvent.time}
                                                </div>
                                            )}
                                            <div className="flex items-center">
                                                <TagIcon className="h-4 w-4 mr-2" />
                                                {selectedEvent.category}
                                            </div>
                                        </div>
                                        {selectedEvent.description && (
                                            <div className="mt-4">
                                                <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div 
                                        className="w-4 h-4 rounded-full flex-shrink-0 ml-4"
                                        style={{ backgroundColor: selectedEvent.color }}
                                    />
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
