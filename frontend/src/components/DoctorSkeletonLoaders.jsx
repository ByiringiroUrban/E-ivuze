import React from 'react';

// Doctor Role Skeleton Loading Components
// Matched to actual page layouts for seamless loading experience

const DoctorSkeletonLoaders = {

  // Doctor Dashboard Page Skeleton
  DashboardSkeleton: () => (
    <div className='flex-1 bg-gray-50 min-h-screen'>
      <div className='animate-pulse'>
        <div className='bg-[#006838] px-4 sm:px-8 lg:px-12 py-10 sm:py-14'>
          <div className='max-w-5xl space-y-4'>
            <div className='h-3 w-40 bg-white/20 rounded' />
            <div className='h-9 w-3/4 bg-white/20 rounded' />
            <div className='h-4 w-2/3 bg-white/20 rounded' />
          </div>
        </div>

        <div className='py-10 sm:py-12'>
          <div className='w-full px-4 sm:px-8 lg:px-12 space-y-10'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className='border border-border bg-white shadow-sm rounded-xl p-6'>
                  <div className='flex items-center gap-4'>
                    <div className='h-12 w-12 rounded-full bg-gray-200' />
                    <div className='flex-1 space-y-3'>
                      <div className='h-6 w-24 bg-gray-200 rounded' />
                      <div className='h-3 w-32 bg-gray-200 rounded' />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6'>
              <div className='border border-border bg-white shadow-sm rounded-xl p-6'>
                <div className='h-4 w-40 bg-gray-200 rounded mb-6' />
                <div className='h-56 w-full bg-gray-200 rounded' />
              </div>
              <div className='border border-border bg-white shadow-sm rounded-xl p-6'>
                <div className='h-4 w-32 bg-gray-200 rounded mb-6' />
                <div className='h-56 w-full bg-gray-200 rounded' />
              </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className='border border-border bg-white shadow-sm rounded-xl p-6'>
                  <div className='h-4 w-36 bg-gray-200 rounded mb-6' />
                  <div className='h-44 w-full bg-gray-200 rounded' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ),

  // My Appointments Page Skeleton
  AppointmentsSkeleton: () => (
    <div className='flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6'>
      <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
        {/* Header */}
        <div className='px-4 sm:px-6 py-3 sm:py-4 border-b bg-white'>
          <div className='h-6 w-48 bg-gray-200 rounded animate-pulse' />
        </div>

        {/* Table Header */}
        <div className='hidden lg:grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr_3fr_1fr_1.5fr] gap-1 py-3 sm:py-4 px-4 sm:px-6 bg-gray-50 border-b'>
          <div className='h-4 w-4 bg-gray-200 rounded animate-pulse' />
          <div className='h-4 w-32 bg-gray-200 rounded animate-pulse' />
          <div className='h-4 w-20 bg-gray-200 rounded animate-pulse' />
          <div className='h-4 w-16 bg-gray-200 rounded animate-pulse' />
          <div className='h-4 w-16 bg-gray-200 rounded animate-pulse' />
          <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
          <div className='h-4 w-16 bg-gray-200 rounded animate-pulse' />
          <div className='h-4 w-20 bg-gray-200 rounded animate-pulse' />
        </div>

        {/* Appointment Rows */}
        <div className='divide-y divide-gray-100'>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className='grid grid-cols-1 lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr_3fr_1fr_1.5fr] gap-1 py-3 sm:py-4 px-4 sm:px-6 hover:bg-gray-50 transition-colors'>
              {/* Number */}
              <div className='flex items-center'>
                <div className='h-4 w-6 bg-gray-200 rounded animate-pulse' />
              </div>

              {/* Patient Details */}
              <div className='flex items-center gap-3'>
                <div className='h-10 w-10 bg-gray-200 rounded-full animate-pulse' />
                <div className='space-y-2'>
                  <div className='h-4 w-32 bg-gray-200 rounded animate-pulse' />
                  <div className='h-3 w-24 bg-gray-200 rounded animate-pulse' />
                </div>
              </div>

              {/* Approval */}
              <div className='flex items-center'>
                <div className='h-6 w-16 bg-gray-200 rounded-full animate-pulse' />
              </div>

              {/* Age */}
              <div className='flex items-center'>
                <div className='h-4 w-8 bg-gray-200 rounded animate-pulse' />
              </div>

              {/* Gender */}
              <div className='flex items-center'>
                <div className='h-4 w-12 bg-gray-200 rounded animate-pulse' />
              </div>

              {/* Date & Time */}
              <div className='flex items-center'>
                <div className='space-y-1'>
                  <div className='h-4 w-28 bg-gray-200 rounded animate-pulse' />
                  <div className='h-3 w-20 bg-gray-200 rounded animate-pulse' />
                </div>
              </div>

              {/* Fees */}
              <div className='flex items-center'>
                <div className='h-4 w-16 bg-gray-200 rounded animate-pulse' />
              </div>

              {/* Actions */}
              <div className='flex items-center gap-2'>
                <div className='h-8 w-8 bg-gray-200 rounded animate-pulse' />
                <div className='h-8 w-8 bg-gray-200 rounded animate-pulse' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),

  // Doctor Calendar Page Skeleton
  CalendarSkeleton: () => (
    <div className='flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6'>
      <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
        {/* Header */}
        <div className='px-4 sm:px-6 py-3 sm:py-4 border-b bg-white flex items-center justify-between'>
          <div className='h-6 w-40 bg-gray-200 rounded animate-pulse' />
          <div className='flex items-center gap-2'>
            <div className='h-8 w-8 bg-gray-200 rounded animate-pulse' />
            <div className='h-8 w-8 bg-gray-200 rounded animate-pulse' />
          </div>
        </div>

        {/* Month Navigation */}
        <div className='px-4 sm:px-6 py-4 border-b bg-gray-50 flex items-center justify-between'>
          <div className='h-6 w-24 bg-gray-200 rounded animate-pulse' />
          <div className='flex items-center gap-2'>
            <div className='h-8 w-20 bg-gray-200 rounded animate-pulse' />
            <div className='h-8 w-20 bg-gray-200 rounded animate-pulse' />
          </div>
        </div>

        {/* Calendar Grid */}
        <div className='p-4 sm:p-6'>
          {/* Week Days */}
          <div className='grid grid-cols-7 gap-2 mb-2'>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className='h-8 flex items-center justify-center'>
                <div className='h-4 w-8 bg-gray-200 rounded animate-pulse' />
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className='grid grid-cols-7 gap-2'>
            {Array.from({ length: 35 }).map((_, index) => (
              <div key={index} className='aspect-square border border-gray-200 rounded-lg p-2'>
                <div className='h-4 w-4 bg-gray-200 rounded animate-pulse mb-1' />
                <div className='flex justify-center gap-0.5'>
                  <div className='h-1 w-1 bg-gray-200 rounded-full animate-pulse' />
                  <div className='h-1 w-1 bg-gray-200 rounded-full animate-pulse' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),

  // Doctor Profile Page Skeleton
  ProfileSkeleton: () => (
    <div className='flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
          {/* Header */}
          <div className='px-4 sm:px-6 py-3 sm:py-4 border-b bg-white flex items-center justify-between'>
            <div className='h-6 w-32 bg-gray-200 rounded animate-pulse' />
            <div className='flex items-center gap-2'>
              <div className='h-8 w-20 bg-gray-200 rounded animate-pulse' />
              <div className='h-8 w-24 bg-gray-200 rounded animate-pulse' />
            </div>
          </div>

          <div className='p-4 sm:p-6 space-y-6'>
            {/* Profile Image and Basic Info */}
            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-6'>
              <div className='h-24 w-24 bg-gray-200 rounded-full animate-pulse' />
              <div className='flex-1 space-y-3'>
                <div className='h-6 w-48 bg-gray-200 rounded animate-pulse' />
                <div className='h-4 w-32 bg-gray-200 rounded animate-pulse' />
                <div className='h-4 w-40 bg-gray-200 rounded animate-pulse' />
              </div>
            </div>

            {/* Form Sections */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Left Column */}
              <div className='space-y-4'>
                <div>
                  <div className='h-4 w-24 bg-gray-200 rounded animate-pulse mb-2' />
                  <div className='h-10 w-full bg-gray-200 rounded animate-pulse' />
                </div>
                <div>
                  <div className='h-4 w-20 bg-gray-200 rounded animate-pulse mb-2' />
                  <div className='h-10 w-full bg-gray-200 rounded animate-pulse' />
                </div>
                <div>
                  <div className='h-4 w-28 bg-gray-200 rounded animate-pulse mb-2' />
                  <div className='h-10 w-full bg-gray-200 rounded animate-pulse' />
                </div>
              </div>

              {/* Right Column */}
              <div className='space-y-4'>
                <div>
                  <div className='h-4 w-16 bg-gray-200 rounded animate-pulse mb-2' />
                  <div className='h-10 w-full bg-gray-200 rounded animate-pulse' />
                </div>
                <div>
                  <div className='h-4 w-32 bg-gray-200 rounded animate-pulse mb-2' />
                  <div className='h-10 w-full bg-gray-200 rounded animate-pulse' />
                </div>
                <div>
                  <div className='h-4 w-20 bg-gray-200 rounded animate-pulse mb-2' />
                  <div className='h-10 w-full bg-gray-200 rounded animate-pulse' />
                </div>
              </div>
            </div>

            {/* About Section */}
            <div>
              <div className='h-4 w-16 bg-gray-200 rounded animate-pulse mb-2' />
              <div className='h-24 w-full bg-gray-200 rounded animate-pulse' />
            </div>

            {/* Address Section */}
            <div>
              <div className='h-4 w-20 bg-gray-200 rounded animate-pulse mb-4' />
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='h-10 w-full bg-gray-200 rounded animate-pulse' />
                <div className='h-10 w-full bg-gray-200 rounded animate-pulse' />
                <div className='h-10 w-full bg-gray-200 rounded animate-pulse' />
                <div className='h-10 w-full bg-gray-200 rounded animate-pulse' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),

  // Prescriptions Page Skeleton
  PrescriptionsSkeleton: () => (
    <div className='flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6'>
      <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
        {/* Header */}
        <div className='px-4 sm:px-6 py-3 sm:py-4 border-b bg-white flex items-center justify-between'>
          <div className='h-6 w-40 bg-gray-200 rounded animate-pulse' />
          <div className='h-8 w-32 bg-gray-200 rounded animate-pulse' />
        </div>

        {/* Search and Filter */}
        <div className='p-4 sm:p-6 border-b bg-gray-50'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1 h-10 bg-gray-200 rounded animate-pulse' />
            <div className='h-10 w-32 bg-gray-200 rounded animate-pulse' />
            <div className='h-10 w-32 bg-gray-200 rounded animate-pulse' />
          </div>
        </div>

        {/* Prescription Cards */}
        <div className='p-4 sm:p-6 space-y-4'>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
              <div className='flex items-start justify-between mb-3'>
                <div className='space-y-2'>
                  <div className='h-5 w-32 bg-gray-200 rounded animate-pulse' />
                  <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
                </div>
                <div className='h-6 w-20 bg-gray-200 rounded-full animate-pulse' />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-3'>
                <div>
                  <div className='h-4 w-16 bg-gray-200 rounded animate-pulse mb-1' />
                  <div className='h-4 w-28 bg-gray-200 rounded animate-pulse' />
                </div>
                <div>
                  <div className='h-4 w-20 bg-gray-200 rounded animate-pulse mb-1' />
                  <div className='h-4 w-32 bg-gray-200 rounded animate-pulse' />
                </div>
              </div>

              <div className='mb-3'>
                <div className='h-4 w-24 bg-gray-200 rounded animate-pulse mb-2' />
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <div className='h-4 w-20 bg-gray-200 rounded animate-pulse' />
                    <div className='h-4 w-16 bg-gray-200 rounded animate-pulse' />
                    <div className='h-4 w-12 bg-gray-200 rounded animate-pulse' />
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
                    <div className='h-4 w-20 bg-gray-200 rounded animate-pulse' />
                    <div className='h-4 w-16 bg-gray-200 rounded animate-pulse' />
                  </div>
                </div>
              </div>

              <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
                <div className='h-4 w-32 bg-gray-200 rounded animate-pulse' />
                <div className='flex items-center gap-2'>
                  <div className='h-8 w-8 bg-gray-200 rounded animate-pulse' />
                  <div className='h-8 w-8 bg-gray-200 rounded animate-pulse' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),

  // Medical Records Page Skeleton
  RecordsSkeleton: () => (
    <div className='flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6'>
      <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
        {/* Header */}
        <div className='px-4 sm:px-6 py-3 sm:py-4 border-b bg-white flex items-center justify-between'>
          <div className='h-6 w-36 bg-gray-200 rounded animate-pulse' />
          <div className='flex items-center gap-2'>
            <div className='h-8 w-32 bg-gray-200 rounded animate-pulse' />
            <div className='h-8 w-24 bg-gray-200 rounded animate-pulse' />
          </div>
        </div>

        {/* Patient Search */}
        <div className='p-4 sm:p-6 border-b bg-gray-50'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1 h-10 bg-gray-200 rounded animate-pulse' />
            <div className='h-10 w-32 bg-gray-200 rounded animate-pulse' />
          </div>
        </div>

        {/* Records Timeline */}
        <div className='p-4 sm:p-6'>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className='relative pl-8 pb-8 border-l-2 border-gray-200 last:border-l-0'>
              {/* Timeline Dot */}
              <div className='absolute left-0 top-0 h-4 w-4 bg-gray-200 rounded-full -translate-x-1/2 animate-pulse' />

              {/* Record Card */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <div className='flex items-start justify-between mb-3'>
                  <div className='space-y-2'>
                    <div className='h-5 w-32 bg-gray-200 rounded animate-pulse' />
                    <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
                  </div>
                  <div className='h-4 w-28 bg-gray-200 rounded animate-pulse' />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-3'>
                  <div>
                    <div className='h-4 w-16 bg-gray-200 rounded animate-pulse mb-1' />
                    <div className='h-4 w-32 bg-gray-200 rounded animate-pulse' />
                  </div>
                  <div>
                    <div className='h-4 w-20 bg-gray-200 rounded animate-pulse mb-1' />
                    <div className='h-4 w-36 bg-gray-200 rounded animate-pulse' />
                  </div>
                </div>

                <div className='mb-3'>
                  <div className='h-4 w-20 bg-gray-200 rounded animate-pulse mb-2' />
                  <div className='h-16 w-full bg-gray-200 rounded animate-pulse' />
                </div>

                <div className='flex items-center gap-2'>
                  <div className='h-8 w-20 bg-gray-200 rounded animate-pulse' />
                  <div className='h-8 w-20 bg-gray-200 rounded animate-pulse' />
                  <div className='h-8 w-24 bg-gray-200 rounded animate-pulse' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),

  // Patients Page Skeleton
  PatientsSkeleton: () => (
    <div className='flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6'>
      <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
        {/* Header */}
        <div className='px-4 sm:px-6 py-3 sm:py-4 border-b bg-white flex items-center justify-between'>
          <div className='h-6 w-28 bg-gray-200 rounded animate-pulse' />
          <div className='h-8 w-32 bg-gray-200 rounded animate-pulse' />
        </div>

        {/* Search and Filters */}
        <div className='p-4 sm:p-6 border-b bg-gray-50'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1 h-10 bg-gray-200 rounded animate-pulse' />
            <div className='h-10 w-32 bg-gray-200 rounded animate-pulse' />
            <div className='h-10 w-32 bg-gray-200 rounded animate-pulse' />
          </div>
        </div>

        {/* Patient Grid */}
        <div className='p-4 sm:p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                {/* Patient Header */}
                <div className='flex items-center gap-3 mb-4'>
                  <div className='h-12 w-12 bg-gray-200 rounded-full animate-pulse' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-5 w-32 bg-gray-200 rounded animate-pulse' />
                    <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
                  </div>
                </div>

                {/* Patient Details */}
                <div className='space-y-3 mb-4'>
                  <div className='flex items-center gap-2'>
                    <div className='h-4 w-16 bg-gray-200 rounded animate-pulse' />
                    <div className='h-4 w-20 bg-gray-200 rounded animate-pulse' />
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='h-4 w-12 bg-gray-200 rounded animate-pulse' />
                    <div className='h-4 w-16 bg-gray-200 rounded animate-pulse' />
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='h-4 w-14 bg-gray-200 rounded animate-pulse' />
                    <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
                  </div>
                </div>

                {/* Actions */}
                <div className='flex items-center gap-2 pt-3 border-t border-gray-100'>
                  <div className='h-8 w-20 bg-gray-200 rounded animate-pulse' />
                  <div className='h-8 w-20 bg-gray-200 rounded animate-pulse' />
                  <div className='h-8 w-16 bg-gray-200 rounded animate-pulse' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),

  // Lab Results Page Skeleton
  LabResultsSkeleton: () => (
    <div className='flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6'>
      <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
        {/* Header */}
        <div className='px-4 sm:px-6 py-3 sm:py-4 border-b bg-white flex items-center justify-between'>
          <div className='h-6 w-32 bg-gray-200 rounded animate-pulse' />
          <div className='flex items-center gap-2'>
            <div className='h-8 w-32 bg-gray-200 rounded animate-pulse' />
            <div className='h-8 w-24 bg-gray-200 rounded animate-pulse' />
          </div>
        </div>

        {/* Search and Stats */}
        <div className='p-4 sm:p-6 border-b bg-gray-50'>
          <div className='flex flex-col sm:flex-row gap-4 mb-4'>
            <div className='flex-1 h-10 bg-gray-200 rounded animate-pulse' />
            <div className='h-10 w-32 bg-gray-200 rounded animate-pulse' />
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className='bg-white border border-gray-200 rounded-lg p-4'>
                <div className='flex items-center gap-3'>
                  <div className='h-10 w-10 bg-gray-200 rounded animate-pulse' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-6 w-16 bg-gray-200 rounded animate-pulse' />
                    <div className='h-4 w-20 bg-gray-200 rounded animate-pulse' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lab Results List */}
        <div className='p-4 sm:p-6 space-y-4'>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
              <div className='flex items-start justify-between mb-3'>
                <div className='space-y-2'>
                  <div className='h-5 w-32 bg-gray-200 rounded animate-pulse' />
                  <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
                </div>
                <div className='flex items-center gap-2'>
                  <div className='h-6 w-20 bg-gray-200 rounded-full animate-pulse' />
                  <div className='h-8 w-8 bg-gray-200 rounded animate-pulse' />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-3'>
                <div>
                  <div className='h-4 w-16 bg-gray-200 rounded animate-pulse mb-1' />
                  <div className='h-4 w-28 bg-gray-200 rounded animate-pulse' />
                </div>
                <div>
                  <div className='h-4 w-20 bg-gray-200 rounded animate-pulse mb-1' />
                  <div className='h-4 w-32 bg-gray-200 rounded animate-pulse' />
                </div>
                <div>
                  <div className='h-4 w-24 bg-gray-200 rounded animate-pulse mb-1' />
                  <div className='h-4 w-20 bg-gray-200 rounded animate-pulse' />
                </div>
              </div>

              <div className='mb-3'>
                <div className='h-4 w-20 bg-gray-200 rounded animate-pulse mb-2' />
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
                    <div className='h-4 w-16 bg-gray-200 rounded animate-pulse' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='h-4 w-28 bg-gray-200 rounded animate-pulse' />
                    <div className='h-4 w-16 bg-gray-200 rounded animate-pulse' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='h-4 w-20 bg-gray-200 rounded animate-pulse' />
                    <div className='h-4 w-16 bg-gray-200 rounded animate-pulse' />
                  </div>
                </div>
              </div>

              <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
                <div className='h-4 w-32 bg-gray-200 rounded animate-pulse' />
                <div className='flex items-center gap-2'>
                  <div className='h-8 w-20 bg-gray-200 rounded animate-pulse' />
                  <div className='h-8 w-16 bg-gray-200 rounded animate-pulse' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),

  // Reports Page Skeleton
  ReportsSkeleton: () => (
    <div className='flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6'>
      <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
        {/* Header */}
        <div className='px-4 sm:px-6 py-3 sm:py-4 border-b bg-white flex items-center justify-between'>
          <div className='h-6 w-28 bg-gray-200 rounded animate-pulse' />
          <div className='flex items-center gap-2'>
            <div className='h-8 w-32 bg-gray-200 rounded animate-pulse' />
            <div className='h-8 w-24 bg-gray-200 rounded animate-pulse' />
          </div>
        </div>

        {/* Date Range and Filters */}
        <div className='p-4 sm:p-6 border-b bg-gray-50'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
            <div className='h-10 w-full bg-gray-200 rounded animate-pulse' />
            <div className='h-10 w-full bg-gray-200 rounded animate-pulse' />
            <div className='h-10 w-full bg-gray-200 rounded animate-pulse' />
          </div>
        </div>

        {/* Report Content */}
        <div className='p-4 sm:p-6 space-y-6'>
          {/* Summary Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <div className='h-8 w-8 bg-blue-200 rounded animate-pulse' />
                  <div className='h-4 w-16 bg-blue-200 rounded animate-pulse' />
                </div>
                <div className='h-8 w-24 bg-blue-200 rounded animate-pulse mb-1' />
                <div className='h-4 w-20 bg-blue-200 rounded animate-pulse' />
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Chart 1 */}
            <div className='border border-gray-200 rounded-lg p-6'>
              <div className='h-5 w-32 bg-gray-200 rounded animate-pulse mb-4' />
              <div className='h-64 w-full bg-gray-200 rounded animate-pulse' />
            </div>

            {/* Chart 2 */}
            <div className='border border-gray-200 rounded-lg p-6'>
              <div className='h-5 w-36 bg-gray-200 rounded animate-pulse mb-4' />
              <div className='h-64 w-full bg-gray-200 rounded animate-pulse' />
            </div>
          </div>

          {/* Detailed Report Table */}
          <div className='border border-gray-200 rounded-lg overflow-hidden'>
            <div className='px-6 py-4 bg-gray-50 border-b border-gray-200'>
              <div className='h-5 w-40 bg-gray-200 rounded animate-pulse' />
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 border-b border-gray-200'>
                  <tr>
                    {['Date', 'Patient', 'Type', 'Amount', 'Status'].map((header) => (
                      <th key={header} className='px-6 py-3 text-left'>
                        <div className='h-4 w-16 bg-gray-200 rounded animate-pulse' />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <tr key={index} className='hover:bg-gray-50'>
                      <td className='px-6 py-4'>
                        <div className='h-4 w-20 bg-gray-200 rounded animate-pulse' />
                      </td>
                      <td className='px-6 py-4'>
                        <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
                      </td>
                      <td className='px-6 py-4'>
                        <div className='h-4 w-16 bg-gray-200 rounded animate-pulse' />
                      </td>
                      <td className='px-6 py-4'>
                        <div className='h-4 w-16 bg-gray-200 rounded animate-pulse' />
                      </td>
                      <td className='px-6 py-4'>
                        <div className='h-6 w-16 bg-gray-200 rounded-full animate-pulse' />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export default DoctorSkeletonLoaders;
