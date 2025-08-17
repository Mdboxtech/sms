import { Head } from '@inertiajs/react';
import SubjectForm from './Form';

export default function Create({ auth, classrooms }) {
    return (
        <>
            <Head title="Add Subject - SMS" />
            <SubjectForm auth={auth} classrooms={classrooms} />
        </>
    );
}