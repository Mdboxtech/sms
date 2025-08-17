import { Head } from '@inertiajs/react';
import SubjectForm from './Form';

export default function Edit({ auth, subject, classrooms }) {
    return (
        <>
            <Head title="Edit Subject - SMS" />
            <SubjectForm auth={auth} subject={subject} classrooms={classrooms} />
        </>
    );
}