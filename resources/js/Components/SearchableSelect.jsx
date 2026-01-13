import { Fragment, useState, useEffect } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

export default function SearchableSelect({
    value,
    onChange,
    options = [],
    placeholder = "Select an option",
    disabled = false,
    displayValue = (item) => item?.name || item?.label || item,
    className = "",
    error,
    isLoading = false
}) {
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState(null);

    // Sync internal state with external value prop
    useEffect(() => {
        if (!value) {
            setSelected(null);
            return;
        }
        const found = options.find(item => item.id == value);
        setSelected(found || null);
    }, [value, options]);

    const filteredOptions =
        query === ''
            ? options
            : options.filter((item) => {
                const text = displayValue(item);
                return text.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase().replace(/\s+/g, ''));
            });

    return (
        <div className={`w-full ${className}`}>
            <Combobox
                value={selected}
                onChange={(item) => {
                    setSelected(item);
                    onChange(item ? item.id : '');
                }}
                disabled={disabled}
                nullable
            >
                <div className="relative mt-1">
                    <div className="relative w-full cursor-default overflow-hidden rounded-md bg-white text-left shadow-sm focus:outline-none sm:text-sm border border-gray-300 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                        <Combobox.Input
                            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-500"
                            displayValue={(item) => item ? displayValue(item) : ''}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={isLoading ? "Loading..." : placeholder}
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </Combobox.Button>
                    </div>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setQuery('')}
                    >
                        <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {filteredOptions.length === 0 && query !== '' ? (
                                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                    Nothing found.
                                </div>
                            ) : (
                                filteredOptions.map((item) => (
                                    <Combobox.Option
                                        key={item.id}
                                        className={({ active }) =>
                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                                            }`
                                        }
                                        value={item}
                                    >
                                        {({ selected, active }) => (
                                            <>
                                                <span
                                                    className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                        }`}
                                                >
                                                    {displayValue(item)}
                                                </span>
                                                {selected ? (
                                                    <span
                                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-indigo-600'
                                                            }`}
                                                    >
                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </Combobox.Option>
                                ))
                            )}
                        </Combobox.Options>
                    </Transition>
                </div>
            </Combobox>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
}
