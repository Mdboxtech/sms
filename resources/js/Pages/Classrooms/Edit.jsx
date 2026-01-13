import { Head } from '@inertiajs/react';
import ClassroomForm from './Form';

export default function Edit({ auth, classroom }) {
    return (
        <>
            <Head title="Edit Classroom - SMS" />
            <ClassroomForm auth={auth} classroom={classroom} />
        </>
    );
}
