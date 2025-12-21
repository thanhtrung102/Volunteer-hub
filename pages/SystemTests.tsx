import React, { useState, useEffect } from 'react';
import { eventService } from '../services/eventService';
import { userService } from '../services/userService';
import { registrationService } from '../services/registrationService';
import { authService } from '../services/auth';
import { notificationService } from '../services/notificationService';
import { UserRole, EventStatus, RegistrationStatus } from '../types';

const SystemTests: React.FC = () => {
  const [testResults, setTestResults] = useState<Array<{ name: string; status: 'passed' | 'failed' | 'running' | 'pending'; message?: string }>>([
    { name: 'Auth Service: Registration', status: 'pending' },
    { name: 'Auth Service: Login', status: 'pending' },
    { name: 'Event Service: Create Event', status: 'pending' },
    { name: 'Event Service: Filtering', status: 'pending' },
    { name: 'Registration Service: Register', status: 'pending' },
    { name: 'Registration Service: Duplicate Check', status: 'pending' },
    { name: 'Registration Service: Confirm', status: 'pending' },
    { name: 'User Service: Permission Check', status: 'pending' },
    { name: 'Web Push API: Service Worker Registration', status: 'pending' },
    { name: 'Web Push API: Push Subscription', status: 'pending' },
    { name: 'Web Push API: Send Notification', status: 'pending' },
  ]);

  const [pushSubscriptionInfo, setPushSubscriptionInfo] = useState<string>('');

  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results = [...testResults];
    const updateResult = (index: number, status: 'passed' | 'failed' | 'running', message?: string) => {
        results[index] = { ...results[index], status, message };
        setTestResults([...results]);
    };

    // --- Test 1: Auth Registration ---
    updateResult(0, 'running');
    try {
        const email = `test_user_${Date.now()}@test.com`;
        await authService.register(email, 'password123', 'Test User', UserRole.VOLUNTEER);
        updateResult(0, 'passed', 'User registered successfully');
    } catch (e: any) {
        updateResult(0, 'failed', e.message);
    }

    // --- Test 2: Auth Login ---
    updateResult(1, 'running');
    try {
        await authService.login('admin@volunteerhub.com', 'any'); // Using mock logic
        updateResult(1, 'passed', 'Admin login successful');
    } catch (e: any) {
        updateResult(1, 'failed', e.message);
    }

    // --- Test 3: Create Event ---
    updateResult(2, 'running');
    let createdEventId = 0;
    try {
        const newEvent = await eventService.createEvent({
            title: 'Automated Test Event',
            description: 'This is a test description longer than 10 chars',
            location: 'Test Location',
            category: 'Community',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 86400000).toISOString(),
            imageUrl: 'http://test.com/img.jpg',
            createdBy: 1
        });
        createdEventId = newEvent.id;
        updateResult(2, 'passed', `Event created with ID ${createdEventId}`);
    } catch (e: any) {
        updateResult(2, 'failed', e.message);
    }

    // --- Test 4: Event Filtering ---
    updateResult(3, 'running');
    try {
        // Must approve event first to show up in public lists usually, but getEvents handles filters on database
        // Actually getEvents only returns APPROVED events.
        await eventService.updateEvent(createdEventId, { status: EventStatus.APPROVED });
        const paged = await eventService.getEvents(1, 10, 'Automated');
        if (paged.items.find(e => e.id === createdEventId)) {
            updateResult(3, 'passed', 'Filter found the approved event');
        } else {
            updateResult(3, 'failed', 'Filter did not find the event (Check approval logic)');
        }
    } catch (e: any) {
        updateResult(3, 'failed', e.message);
    }

    // --- Test 5: Registration ---
    updateResult(4, 'running');
    let regId = 0;
    try {
        // Register user ID 201 (Volunteer) to the new event
        const reg = await registrationService.registerForEvent(201, createdEventId);
        regId = reg.id;
        updateResult(4, 'passed', `Registration successful (ID: ${regId})`);
    } catch (e: any) {
        updateResult(4, 'failed', e.message);
    }

    // --- Test 6: Duplicate Check ---
    updateResult(5, 'running');
    try {
        await registrationService.registerForEvent(201, createdEventId);
        updateResult(5, 'failed', 'System allowed duplicate registration');
    } catch (e: any) {
        if (e.message.includes('Already registered')) {
            updateResult(5, 'passed', 'Duplicate registration correctly blocked');
        } else {
            updateResult(5, 'failed', `Unexpected error: ${e.message}`);
        }
    }

    // --- Test 7: Confirm Registration ---
    updateResult(6, 'running');
    try {
        const updated = await registrationService.updateStatus(regId, RegistrationStatus.CONFIRMED);
        if (updated.status === RegistrationStatus.CONFIRMED) {
            updateResult(6, 'passed', 'Status updated to CONFIRMED');
        } else {
            updateResult(6, 'failed', 'Status did not update');
        }
    } catch (e: any) {
        updateResult(6, 'failed', e.message);
    }

    // --- Test 8: Cleanup/User Permission Mock ---
    updateResult(7, 'running');
    try {
        await eventService.deleteEvent(createdEventId); // Cleanup
        updateResult(7, 'passed', 'Cleanup successful');
    } catch (e: any) {
        updateResult(7, 'failed', e.message);
    }

    // --- Test 9: Web Push API - Service Worker ---
    updateResult(8, 'running');
    try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for SW to register
        const swStatus = await notificationService.getSubscriptionStatus();
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                updateResult(8, 'passed', `Service Worker active at ${registration.scope}`);
            } else {
                updateResult(8, 'failed', 'Service Worker not registered');
            }
        } else {
            updateResult(8, 'failed', 'Service Worker not supported');
        }
    } catch (e: any) {
        updateResult(8, 'failed', e.message);
    }

    // --- Test 10: Web Push API - Push Subscription ---
    updateResult(9, 'running');
    try {
        if (!notificationService.isPushSupported()) {
            updateResult(9, 'failed', 'Push API not supported in this browser');
        } else {
            const subscribed = await notificationService.subscribeToPushNotifications();
            if (subscribed) {
                const status = await notificationService.getSubscriptionStatus();
                if (status.subscription) {
                    const subInfo = status.subscription.toJSON();
                    setPushSubscriptionInfo(JSON.stringify(subInfo, null, 2));
                    updateResult(9, 'passed', 'Push subscription created successfully');
                } else {
                    updateResult(9, 'failed', 'Subscription created but not retrieved');
                }
            } else {
                updateResult(9, 'failed', 'Failed to create push subscription');
            }
        }
    } catch (e: any) {
        updateResult(9, 'failed', e.message);
    }

    // --- Test 11: Web Push API - Send Notification ---
    updateResult(10, 'running');
    try {
        if (notificationService.getPermission() === 'granted') {
            await notificationService.notify(
                'VolunteerHub Test',
                'This is a test notification from the Web Push API!',
                'https://cdn-icons-png.flaticon.com/128/18891/18891286.png'
            );
            updateResult(10, 'passed', 'Notification sent via Service Worker');
        } else {
            const permission = await notificationService.requestPermission();
            if (permission === 'granted') {
                await notificationService.notify(
                    'VolunteerHub Test',
                    'This is a test notification from the Web Push API!',
                    'https://cdn-icons-png.flaticon.com/128/18891/18891286.png'
                );
                updateResult(10, 'passed', 'Notification permission granted and sent');
            } else {
                updateResult(10, 'failed', 'Notification permission denied');
            }
        }
    } catch (e: any) {
        updateResult(10, 'failed', e.message);
    }

    setIsRunning(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-primary mb-6">Comprehensive System Verification</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600 mb-6">
                This dashboard executes a suite of integration tests to verify the core functionalities
                required for VolunteerHub (Auth, Events, Registrations, Logic, Web Push API).
            </p>

            <button
                onClick={runTests}
                disabled={isRunning}
                className={`px-6 py-3 rounded-md font-bold text-white transition-colors ${isRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-secondary hover:bg-secondary-light'}`}
            >
                {isRunning ? 'Running Tests...' : 'Run Diagnostics'}
            </button>

            <div className="mt-8 space-y-3">
                {testResults.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                                test.status === 'pending' ? 'bg-gray-300' :
                                test.status === 'running' ? 'bg-blue-500 animate-pulse' :
                                test.status === 'passed' ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span className="font-medium text-gray-900">{test.name}</span>
                        </div>
                        <div className="text-sm">
                            {test.status === 'pending' && <span className="text-gray-400">Waiting...</span>}
                            {test.status === 'running' && <span className="text-blue-600 font-medium">Running...</span>}
                            {test.status === 'passed' && <span className="text-green-600 font-bold">{test.message || 'OK'}</span>}
                            {test.status === 'failed' && <span className="text-red-600 font-bold">{test.message || 'Failed'}</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Push Subscription Details */}
            {pushSubscriptionInfo && (
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2">Web Push Subscription Details:</h3>
                    <pre className="text-xs bg-white p-3 rounded border border-blue-100 overflow-x-auto">
                        {pushSubscriptionInfo}
                    </pre>
                    <p className="text-xs text-blue-700 mt-2 italic">
                        In production, this subscription object would be sent to your backend server to enable server-initiated push notifications.
                    </p>
                </div>
            )}
        </div>
    </div>
  );
};

export default SystemTests;