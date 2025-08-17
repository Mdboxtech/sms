import { Head } from '@inertiajs/react';
import ClassroomForm from './Form';

export default function Create({ auth }) {
    return (
        <>
            <Head title="Add Classroom - SMS" />
            <ClassroomForm auth={auth} />
        </>
    );
}