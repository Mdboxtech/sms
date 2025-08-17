import { Head } from '@inertiajs/react';
import TeacherForm from './Form';

export default function Create({ auth }) {
    return (
        <>
            <Head title="Add Teacher - SMS" />
            <TeacherForm auth={auth} />
        </>
    );
}