import React, { useState } from 'react';
import { Card, Button, Input, Label } from './ui/UI';
import { Icons } from './ui/Icons';
import { useAuth } from '../context/AuthContext';
import { databaseService } from '../services/databaseService';
import { useToast } from '../context/ToastContext';

interface StudentProfileProps {
    student: any;
    onUpdate: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ student, onUpdate }) => {
    const { currentUser } = useAuth();
    const { success, error: showError } = useToast();

    const [isChangingPin, setIsChangingPin] = useState(false);
    const [pinForm, setPinForm] = useState({
        currentPin: '',
        newPin: '',
        confirmPin: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChangePIN = async () => {
        // Validate
        if (!pinForm.currentPin || !pinForm.newPin || !pinForm.confirmPin) {
            showError('Please fill in all fields');
            return;
        }

        if (pinForm.newPin !== pinForm.confirmPin) {
            showError('New PINs do not match');
            return;
        }

        if (pinForm.newPin.length < 4) {
            showError('PIN must be at least 4 characters');
            return;
        }

        setLoading(true);

        try {
            // In a real implementation, you would:
            // 1. Verify current PIN
            // 2. Hash new PIN
            // 3. Update in database

            // For now, we'll update directly (you should add PIN verification)
            await databaseService.updateUser(student.id, {
                ...student,
                pin: pinForm.newPin // In production, this should be hashed
            });

            success('PIN changed successfully');
            setIsChangingPin(false);
            setPinForm({ currentPin: '', newPin: '', confirmPin: '' });
            onUpdate();
        } catch (error: any) {
            showError(error.message || 'Failed to change PIN');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-brand-900">My Profile</h2>
                <p className="text-slate-500">Manage your personal information</p>
            </div>

            {/* Profile Information */}
            <Card className="p-6">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center">
                            {student.avatar ? (
                                <img
                                    src={student.avatar}
                                    alt={student.name}
                                    className="w-24 h-24 rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-3xl font-bold text-brand-600">
                                    {student.name?.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <Label>Full Name</Label>
                            <p className="text-lg font-semibold text-brand-900">{student.name}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Registration Number</Label>
                                <p className="text-slate-700">{student.reg_number}</p>
                            </div>

                            <div>
                                <Label>Grade/Class</Label>
                                <p className="text-slate-700">{student.grade || 'Not assigned'}</p>
                            </div>

                            <div>
                                <Label>Email</Label>
                                <p className="text-slate-700">{student.email || 'Not provided'}</p>
                            </div>

                            <div>
                                <Label>Phone</Label>
                                <p className="text-slate-700">{student.phone || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Security Section */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-brand-900">Security</h3>
                        <p className="text-sm text-slate-500">Manage your login credentials</p>
                    </div>

                    {!isChangingPin && (
                        <Button
                            variant="outline"
                            onClick={() => setIsChangingPin(true)}
                        >
                            <Icons.Lock className="w-4 h-4 mr-2" />
                            Change PIN
                        </Button>
                    )}
                </div>

                {isChangingPin && (
                    <div className="space-y-4 mt-4 p-4 bg-slate-50 rounded-lg">
                        <div>
                            <Label>Current PIN</Label>
                            <Input
                                type="password"
                                value={pinForm.currentPin}
                                onChange={(e) => setPinForm({ ...pinForm, currentPin: e.target.value })}
                                placeholder="Enter current PIN"
                            />
                        </div>

                        <div>
                            <Label>New PIN</Label>
                            <Input
                                type="password"
                                value={pinForm.newPin}
                                onChange={(e) => setPinForm({ ...pinForm, newPin: e.target.value })}
                                placeholder="Enter new PIN (min 4 characters)"
                            />
                        </div>

                        <div>
                            <Label>Confirm New PIN</Label>
                            <Input
                                type="password"
                                value={pinForm.confirmPin}
                                onChange={(e) => setPinForm({ ...pinForm, confirmPin: e.target.value })}
                                placeholder="Re-enter new PIN"
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setIsChangingPin(false);
                                    setPinForm({ currentPin: '', newPin: '', confirmPin: '' });
                                }}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleChangePIN}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Icons.Spinner className="w-4 h-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update PIN'
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Account Information */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-brand-900 mb-4">Account Information</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Account Created</span>
                        <span className="font-medium text-slate-900">
                            {new Date(student.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Account Status</span>
                        <span className="font-medium text-green-600">Active</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-slate-600">User ID</span>
                        <span className="font-mono text-xs text-slate-500">{student.id}</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};
