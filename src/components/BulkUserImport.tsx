import React, { useState, useRef } from 'react';
import { Card, Button, Badge } from './ui/UI';
import { Icons } from './ui/Icons';
import { databaseService } from '../services/databaseService';
import { useToast } from '../context/ToastContext';

interface ParsedUser {
    name: string;
    email: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    regNumber: string;
    pin: string;
    grade?: string;
    phone?: string;
}

interface ValidationError {
    row: number;
    field: string;
    message: string;
}

export const BulkUserImport: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedUsers, setParsedUsers] = useState<ParsedUser[]>([]);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [importing, setImporting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { success, error: showError } = useToast();

    const downloadTemplate = () => {
        const link = document.createElement('a');
        link.href = '/templates/bulk-users-template.csv';
        link.download = 'bulk-users-template.csv';
        link.click();
    };

    const parseCSV = (text: string): ParsedUser[] => {
        const lines = text.split('\n').filter(line => {
            const trimmed = line.trim();
            return trimmed && !trimmed.startsWith('#');
        });

        if (lines.length < 2) {
            throw new Error('CSV file must contain at least a header row and one data row');
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const users: ParsedUser[] = [];
        const validationErrors: ValidationError[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());

            if (values.length !== headers.length) {
                validationErrors.push({
                    row: i + 1,
                    field: 'general',
                    message: `Expected ${headers.length} columns, got ${values.length}`
                });
                continue;
            }

            const user: any = {};
            headers.forEach((header, index) => {
                const key = header.toLowerCase().replace(/[\/\s]/g, '');
                user[key] = values[index];
            });

            // Validate required fields
            if (!user.name) {
                validationErrors.push({ row: i + 1, field: 'Name', message: 'Name is required' });
            }
            if (!user.role || !['STUDENT', 'TEACHER', 'ADMIN'].includes(user.role.toUpperCase())) {
                validationErrors.push({ row: i + 1, field: 'Role', message: 'Role must be STUDENT, TEACHER, or ADMIN' });
            }
            if (!user.registrationnumber) {
                validationErrors.push({ row: i + 1, field: 'Registration Number', message: 'Registration Number is required' });
            }
            if (!user.pin || user.pin.length < 4) {
                validationErrors.push({ row: i + 1, field: 'PIN', message: 'PIN must be at least 4 characters' });
            }

            if (validationErrors.length === 0 || validationErrors[validationErrors.length - 1].row !== i + 1) {
                users.push({
                    name: user.name,
                    email: user.email || '',
                    role: user.role.toUpperCase(),
                    regNumber: user.registrationnumber,
                    pin: user.pin,
                    grade: user.gradeclass || '',
                    phone: user.phone || ''
                });
            }
        }

        setErrors(validationErrors);
        return users;
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith('.csv')) {
            showError('Please select a CSV file');
            return;
        }

        setFile(selectedFile);
        const text = await selectedFile.text();

        try {
            const users = parseCSV(text);
            setParsedUsers(users);
            setShowPreview(true);
        } catch (error: any) {
            showError(error.message || 'Failed to parse CSV file');
            setParsedUsers([]);
        }
    };

    const handleImport = async () => {
        if (parsedUsers.length === 0) {
            showError('No valid users to import');
            return;
        }

        if (errors.length > 0) {
            showError('Please fix all validation errors before importing');
            return;
        }

        setImporting(true);

        try {
            let successCount = 0;
            let failCount = 0;

            for (const user of parsedUsers) {
                try {
                    await databaseService.createUser({
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        regNumber: user.regNumber,
                        pin: user.pin, // In production, this should be hashed
                        grade: user.grade,
                        phone: user.phone
                    });
                    successCount++;
                } catch (error) {
                    console.error(`Failed to create user ${user.name}:`, error);
                    failCount++;
                }
            }

            success(`Successfully imported ${successCount} users${failCount > 0 ? `, ${failCount} failed` : ''}`);

            // Reset state
            setFile(null);
            setParsedUsers([]);
            setShowPreview(false);
            setErrors([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            onComplete();
        } catch (error: any) {
            showError(error.message || 'Failed to import users');
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-brand-900">Bulk User Import</h2>
                <p className="text-slate-500">Import multiple users at once using a CSV file</p>
            </div>

            {/* Download Template */}
            <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <Icons.BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-blue-900 mb-1">Step 1: Download Template</h3>
                        <p className="text-sm text-blue-700 mb-3">
                            Download the CSV template, fill in user details, and upload it below.
                        </p>
                        <Button variant="outline" size="sm" onClick={downloadTemplate}>
                            <Icons.Download className="w-4 h-4 mr-2" />
                            Download Template
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Upload Section */}
            <Card className="p-6">
                <h3 className="font-bold text-brand-900 mb-4">Step 2: Upload CSV File</h3>

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-brand-500 transition-colors"
                >
                    <Icons.Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                    <p className="text-sm text-slate-600 mb-1">
                        {file ? file.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-slate-500">CSV files only</p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </Card>

            {/* Validation Errors */}
            {errors.length > 0 && (
                <Card className="p-6 bg-red-50 border-red-200">
                    <div className="flex items-start gap-3 mb-4">
                        <Icons.ExclamationTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-red-900 mb-1">Validation Errors ({errors.length})</h3>
                            <p className="text-sm text-red-700">Please fix the following errors before importing:</p>
                        </div>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {errors.map((error, index) => (
                            <div key={index} className="text-sm bg-white p-3 rounded border border-red-200">
                                <span className="font-medium text-red-900">Row {error.row}:</span>{' '}
                                <span className="text-red-700">{error.field} - {error.message}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Preview */}
            {showPreview && parsedUsers.length > 0 && (
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="font-bold text-brand-900">Preview ({parsedUsers.length} users)</h3>
                            <p className="text-sm text-slate-500">Review the users before importing</p>
                        </div>
                        <Button
                            onClick={handleImport}
                            disabled={importing || errors.length > 0}
                        >
                            {importing ? (
                                <>
                                    <Icons.Spinner className="w-4 h-4 mr-2 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Icons.Upload className="w-4 h-4 mr-2" />
                                    Import {parsedUsers.length} Users
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left p-3 font-semibold text-slate-700">Name</th>
                                    <th className="text-left p-3 font-semibold text-slate-700">Email</th>
                                    <th className="text-left p-3 font-semibold text-slate-700">Role</th>
                                    <th className="text-left p-3 font-semibold text-slate-700">Reg Number</th>
                                    <th className="text-left p-3 font-semibold text-slate-700">Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parsedUsers.slice(0, 10).map((user, index) => (
                                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="p-3">{user.name}</td>
                                        <td className="p-3 text-slate-600">{user.email || '-'}</td>
                                        <td className="p-3">
                                            <Badge variant={user.role === 'STUDENT' ? 'default' : 'success'}>
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="p-3 font-mono text-xs">{user.regNumber}</td>
                                        <td className="p-3 text-slate-600">{user.grade || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {parsedUsers.length > 10 && (
                            <p className="text-center text-sm text-slate-500 mt-3">
                                ... and {parsedUsers.length - 10} more users
                            </p>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};
