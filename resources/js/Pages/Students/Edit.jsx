import { Head } from '@inertiajs/react';
import StudentForm from './Form';

export default function Edit({ auth, student, classrooms }) {
    return <StudentForm auth={auth} student={student} classrooms={classrooms} />;
}
