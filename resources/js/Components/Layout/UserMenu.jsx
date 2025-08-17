import { Menu } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import {
    BellIcon,
    ChevronDownIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';

export default function UserMenu({ user }) {
    const userNavigation = [
        { name: 'Your Profile', href: route('profile.edit') },
        { name: 'Settings', href: route('profile.edit') },
    ];

    return (
        <div className="flex items-center gap-4">
            <button className="p-1 rounded-full text-white hover:bg-indigo-700">
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" />
            </button>

            <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-x-2 text-sm text-white">
                    <UserCircleIcon className="h-8 w-8" />
                    <span className="hidden lg:flex lg:items-center">
                        <span className="ml-4 text-sm font-semibold leading-6" aria-hidden="true">
                            {user.name}
                        </span>
                        <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                </Menu.Button>

                <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                    {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                            {({ active }) => (
                                <Link
                                    href={item.href}
                                    className={`${active ? 'bg-gray-50' : ''} block px-3 py-1 text-sm leading-6 text-gray-900`}
                                >
                                    {item.name}
                                </Link>
                            )}
                        </Menu.Item>
                    ))}
                    <Menu.Item>
                        {({ active }) => (
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className={`${active ? 'bg-gray-50' : ''} block w-full text-left px-3 py-1 text-sm leading-6 text-gray-900`}
                            >
                                Sign out
                            </Link>
                        )}
                    </Menu.Item>
                </Menu.Items>
            </Menu>
        </div>
    );
}
