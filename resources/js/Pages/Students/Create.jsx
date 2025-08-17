import { Head } from '@inertiajs/react';
import StudentForm from './Form';

export default function Create({ auth, classrooms }) {
    return (
        <>
            <Head title="Add Student - SMS" />
            <StudentForm auth={auth} classrooms={classrooms} />
        </>
    );
}