import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function ResultCommentsModal({ show, onClose, termResult, userRole }) {
    const canEditTeacherComment = userRole === 'teacher' || userRole === 'admin';
    const canEditPrincipalComment = userRole === 'admin';
    const { data, setData, patch, processing, errors, reset } = useForm({
        teacher_comment: termResult?.teacher_comment || '',
        principal_comment: termResult?.principal_comment || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('admin.term-results.comments.update', termResult.id), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    Update Comments
                </h2>

                <div className="mt-6">
                    {canEditTeacherComment && (
                        <div className="mb-4">
                            <InputLabel htmlFor="teacher_comment" value="Class Teacher's Comment" />
                            <textarea
                                id="teacher_comment"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                rows="4"
                                value={data.teacher_comment}
                                onChange={(e) => setData('teacher_comment', e.target.value)}
                            />
                            {errors.teacher_comment && <div className="text-red-600">{errors.teacher_comment}</div>}
                        </div>
                    )}

                    {canEditPrincipalComment && (
                        <div>
                            <InputLabel htmlFor="principal_comment" value="Principal's Comment" />
                            <textarea
                                id="principal_comment"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                rows="4"
                                value={data.principal_comment}
                                onChange={(e) => setData('principal_comment', e.target.value)}
                            />
                            {errors.principal_comment && <div className="text-red-600">{errors.principal_comment}</div>}
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing}>Save Changes</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
