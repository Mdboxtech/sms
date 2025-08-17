import { usePage } from '@inertiajs/react';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function Header() {
    const { auth } = usePage().props;

    console.log(auth);

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            {route().current('dashboard') ? 'Dashboard' : document.title}
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 rounded-full hover:bg-gray-100">
                            <BellIcon className="w-6 h-6 text-gray-600" />
                        </button>

                        <Menu as="div" className="relative">
                            <Menu.Button className="flex items-center space-x-3 focus:outline-none">
                                <UserCircleIcon className="w-8 h-8 text-gray-600" />
                                <div className="text-left hidden sm:block">
                                    <p className="text-sm font-medium text-gray-700">{auth.user.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{auth.user.role.name}</p>
                                </div>
                            </Menu.Button>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <a
                                                href={route('profile.edit')}
                                                className={`${
                                                    active ? 'bg-gray-100' : ''
                                                } block px-4 py-2 text-sm text-gray-700`}
                                            >
                                                Profile Settings
                                            </a>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <form method="POST" action={route('logout')}>
                                                <button
                                                    type="submit"
                                                    className={`${
                                                        active ? 'bg-gray-100' : ''
                                                    } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                                                >
                                                    Sign out
                                                </button>
                                            </form>
                                        )}
                                    </Menu.Item>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                </div>
            </div>
        </header>
    );
}
