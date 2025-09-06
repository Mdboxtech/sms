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
    TagIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon
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
    parseISO,
    addDays,
    startOfWeek,
    endOfWeek
} from 'date-fns';

export default function AdminCalendar({ 
    events = [], 
    currentDate = new Date().toISOString(), 
    viewType = 'month',
    currentSession,
    currentTerm,
    upcomingEvents = []
}) {
    const [selectedDate, setSelectedDate] = useState(parseISO(currentDate));
    const [view, setView] = useState(viewType);
    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        type: 'school_event',
        all_day: false,
        location: '',
        color: '#3b82f6'
    });

    // Get calendar days for current month view
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);
        
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }, [selectedDate]);

    // Get events for a specific date
    const getEventsForDate = (date) => {
        return events.filter(event => {
            const eventDate = parseISO(event.event_date);
            return isSameDay(eventDate, date);
        });
    };

    // Handle navigation
    const goToPreviousMonth = () => {
        setSelectedDate(subMonths(selectedDate, 1));
    };

    const goToNextMonth = () => {
        setSelectedDate(addMonths(selectedDate, 1));
    };

    const goToToday = () => {
        setSelectedDate(new Date());
    };

    // Handle event creation
    const handleCreateEvent = (e) => {
        e.preventDefault();
        post(route('calendar.store'), {
            onSuccess: () => {
                reset();
                setShowCreateModal(false);
            }
        });
    };

    // Handle event update
    const handleUpdateEvent = (e) => {
        e.preventDefault();
        put(route('calendar.update', selectedEvent.id), {
            onSuccess: () => {
                reset();
                setShowEventModal(false);
                setSelectedEvent(null);
            }
        });
    };

    // Handle event deletion
    const handleDeleteEvent = () => {
        if (confirm('Are you sure you want to delete this event?')) {
            destroy(route('calendar.destroy', selectedEvent.id), {
                onSuccess: () => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                }
            });
        }
    };

    // Open event details modal
    const openEventModal = (event) => {
        setSelectedEvent(event);
        setData({
            title: event.title,
            description: event.description || '',
            event_date: event.event_date,
            event_time: event.event_time || '',
            type: event.type,
            all_day: event.all_day || false,
            location: event.location || '',
            color: event.color || '#3b82f6'
        });
        setShowEventModal(true);
    };

    // Open create event modal
    const openCreateModal = (date = null) => {
        reset();
        if (date) {
            setData('event_date', format(date, 'yyyy-MM-dd'));
        }
        setShowCreateModal(true);
    };

    const eventTypeColors = {
        'school_event': 'bg-blue-100 text-blue-800 border-blue-200',
        'exam': 'bg-red-100 text-red-800 border-red-200',
        'holiday': 'bg-green-100 text-green-800 border-green-200',
        'meeting': 'bg-purple-100 text-purple-800 border-purple-200',
        'sports': 'bg-orange-100 text-orange-800 border-orange-200',
        'other': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
        <AuthenticatedLayout>
            <Head title="Admin Calendar" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <PageHeader 
                        title="School Calendar Management"
                        subtitle="Manage school events, holidays, and important dates"
                        actions={
                            <button
                                onClick={() => openCreateModal()}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Add Event
                            </button>
                        }
                    />

                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Calendar View */}
                        <div className="lg:col-span-3">
                            <Card>
                                {/* Calendar Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={goToPreviousMonth}
                                            className="p-2 rounded-lg hover:bg-gray-100"
                                        >
                                            <ChevronLeftIcon className="w-5 h-5" />
                                        </button>
                                        <h2 className="text-2xl font-semibold text-gray-900">
                                            {format(selectedDate, 'MMMM yyyy')}
                                        </h2>
                                        <button
                                            onClick={goToNextMonth}
                                            className="p-2 rounded-lg hover:bg-gray-100"
                                        >
                                            <ChevronRightIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={goToToday}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Today
                                    </button>
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                                    {/* Day headers */}
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                        <div key={day} className="bg-gray-50 py-2 px-3 text-center text-sm font-medium text-gray-700">
                                            {day}
                                        </div>
                                    ))}
                                    
                                    {/* Calendar days */}
                                    {calendarDays.map((day, dayIdx) => {
                                        const dayEvents = getEventsForDate(day);
                                        const isCurrentMonth = isSameMonth(day, selectedDate);
                                        const isCurrentDay = isToday(day);
                                        
                                        return (
                                            <div
                                                key={day.toString()}
                                                className={`
                                                    min-h-[120px] bg-white p-2 cursor-pointer hover:bg-gray-50
                                                    ${!isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''}
                                                    ${isCurrentDay ? 'bg-blue-50' : ''}
                                                `}
                                                onClick={() => openCreateModal(day)}
                                            >
                                                <div className={`
                                                    text-sm font-medium mb-1
                                                    ${isCurrentDay ? 'text-blue-600' : ''}
                                                `}>
                                                    {format(day, 'd')}
                                                </div>
                                                
                                                {/* Events for this day */}
                                                <div className="space-y-1">
                                                    {dayEvents.slice(0, 2).map((event) => (
                                                        <div
                                                            key={event.id}
                                                            className={`
                                                                text-xs px-2 py-1 rounded border cursor-pointer
                                                                ${eventTypeColors[event.type] || eventTypeColors.other}
                                                            `}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openEventModal(event);
                                                            }}
                                                        >
                                                            {event.title}
                                                        </div>
                                                    ))}
                                                    {dayEvents.length > 2 && (
                                                        <div className="text-xs text-gray-500 px-2">
                                                            +{dayEvents.length - 2} more
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <Card>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Total Events</span>
                                        <span className="text-sm font-medium">{events.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">This Month</span>
                                        <span className="text-sm font-medium">
                                            {events.filter(event => {
                                                const eventDate = parseISO(event.event_date);
                                                return isSameMonth(eventDate, selectedDate);
                                            }).length}
                                        </span>
                                    </div>
                                </div>
                            </Card>

                            {/* Upcoming Events */}
                            <Card>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Events</h3>
                                <div className="space-y-3">
                                    {upcomingEvents.slice(0, 5).map((event) => (
                                        <div key={event.id} className="border-l-4 border-blue-400 pl-3">
                                            <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                                            <p className="text-xs text-gray-600">
                                                {format(parseISO(event.event_date), 'MMM d, yyyy')}
                                                {event.event_time && ` at ${event.event_time}`}
                                            </p>
                                        </div>
                                    ))}
                                    {upcomingEvents.length === 0 && (
                                        <p className="text-sm text-gray-500">No upcoming events</p>
                                    )}
                                </div>
                            </Card>

                            {/* Event Legend */}
                            <Card>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Event Types</h3>
                                <div className="space-y-2">
                                    {Object.entries(eventTypeColors).map(([type, colorClass]) => (
                                        <div key={type} className="flex items-center space-x-2">
                                            <div className={`w-3 h-3 rounded border ${colorClass}`}></div>
                                            <span className="text-sm text-gray-700 capitalize">
                                                {type.replace('_', ' ')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Event Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Event</h3>
                            <form onSubmit={handleCreateEvent} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date</label>
                                    <input
                                        type="date"
                                        value={data.event_date}
                                        onChange={(e) => setData('event_date', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Time</label>
                                    <input
                                        type="time"
                                        value={data.event_time}
                                        onChange={(e) => setData('event_time', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="school_event">School Event</option>
                                        <option value="exam">Exam</option>
                                        <option value="holiday">Holiday</option>
                                        <option value="meeting">Meeting</option>
                                        <option value="sports">Sports</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                    >
                                        Create Event
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Details Modal */}
            {showEventModal && selectedEvent && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Edit Event</h3>
                                <button
                                    onClick={handleDeleteEvent}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleUpdateEvent} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date</label>
                                    <input
                                        type="date"
                                        value={data.event_date}
                                        onChange={(e) => setData('event_date', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Time</label>
                                    <input
                                        type="time"
                                        value={data.event_time}
                                        onChange={(e) => setData('event_time', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="school_event">School Event</option>
                                        <option value="exam">Exam</option>
                                        <option value="holiday">Holiday</option>
                                        <option value="meeting">Meeting</option>
                                        <option value="sports">Sports</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowEventModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                    >
                                        Update Event
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
