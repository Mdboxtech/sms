import { Head } from '@inertiajs/react';
import TeacherForm from './Form';

export default function Edit({ auth, teacher }) {
    return (
        <>
            <Head title="Edit Teacher - SMS" />
            <TeacherForm auth={auth} teacher={teacher} />
        </>
    );
}
