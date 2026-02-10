'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-xl text-gray-600">
            Manage courses and students in your institution
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Courses Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-blue-600 h-32 flex items-center justify-center">
              <span className="text-6xl">📚</span>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Courses</h2>
              <p className="text-gray-600 mb-6">
                Create, read, update, and delete course information. Manage course codes and
                names.
              </p>
              <Link href="/dashboard/courses">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Go to Courses
                </Button>
              </Link>
            </div>
          </div>

          {/* Students Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-green-600 h-32 flex items-center justify-center">
              <span className="text-6xl">👥</span>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Students</h2>
              <p className="text-gray-600 mb-6">
                Manage student records including registration, enrollment, and personal
                information.
              </p>
              <Link href="/dashboard/students">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Go to Students
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Total Courses
            </div>
            <div className="mt-2 text-3xl font-extrabold text-gray-900">--</div>
            <p className="mt-2 text-sm text-gray-600">Refresh to see updated count</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Total Students
            </div>
            <div className="mt-2 text-3xl font-extrabold text-gray-900">--</div>
            <p className="mt-2 text-sm text-gray-600">Refresh to see updated count</p>
          </div>
        </div>
      </div>
    </div>
  )
}
