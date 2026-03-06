# Doctor Skeleton Loaders Integration Guide

## Overview
This guide provides comprehensive instructions for integrating skeleton loading components into doctor role pages. The skeleton loaders are designed to match the exact layout and structure of each page, providing a seamless loading experience.

## Available Skeleton Loaders

### 1. AppointmentsSkeleton
**Purpose**: Loading state for "My Appointments" page
**Features**:
- Table header skeleton matching appointment columns
- Patient row skeletons with avatar, name, age, gender, date/time, fees
- Action buttons skeleton
- Responsive grid layout

**Usage**:
```jsx
import DoctorSkeletonLoaders from './DoctorSkeletonLoaders';

// In your appointment component
if (loading) {
  return <DoctorSkeletonLoaders.AppointmentsSkeleton />;
}
```

### 2. CalendarSkeleton
**Purpose**: Loading state for "Doctor Calendar" page
**Features**:
- Calendar grid with month navigation
- Week day headers
- Date cells with appointment indicators
- Month/year navigation controls

**Usage**:
```jsx
if (loading) {
  return <DoctorSkeletonLoaders.CalendarSkeleton />;
}
```

### 3. ProfileSkeleton
**Purpose**: Loading state for "Doctor Profile" page
**Features**:
- Profile image and basic info section
- Form field skeletons for personal information
- Address section with multiple fields
- About section textarea

**Usage**:
```jsx
if (loading) {
  return <DoctorSkeletonLoaders.ProfileSkeleton />;
}
```

### 4. PrescriptionsSkeleton
**Purpose**: Loading state for "Prescriptions" page
**Features**:
- Search and filter controls
- Prescription cards with medication details
- Patient information and dosage information
- Status badges and action buttons

**Usage**:
```jsx
if (loading) {
  return <DoctorSkeletonLoaders.PrescriptionsSkeleton />;
}
```

### 5. RecordsSkeleton
**Purpose**: Loading state for "Medical Records" page
**Features**:
- Patient search interface
- Timeline layout with record cards
- Medical history and clinical notes
- Action buttons for viewing/editing records

**Usage**:
```jsx
if (loading) {
  return <DoctorSkeletonLoaders.RecordsSkeleton />;
}
```

### 6. PatientsSkeleton
**Purpose**: Loading state for "Patients" page
**Features**:
- Patient search and filters
- Grid layout of patient cards
- Patient avatars and basic information
- Quick action buttons

**Usage**:
```jsx
if (loading) {
  return <DoctorSkeletonLoaders.PatientsSkeleton />;
}
```

### 7. LabResultsSkeleton
**Purpose**: Loading state for "Lab Results" page
**Features**:
- Statistics cards with icons
- Search and filter controls
- Lab result cards with test details
- Status indicators and action buttons

**Usage**:
```jsx
if (loading) {
  return <DoctorSkeletonLoaders.LabResultsSkeleton />;
}
```

### 8. ReportsSkeleton
**Purpose**: Loading state for "Reports" page
**Features**:
- Date range selectors
- Summary statistics cards with gradients
- Chart placeholders
- Detailed report table

**Usage**:
```jsx
if (loading) {
  return <DoctorSkeletonLoaders.ReportsSkeleton />;
}
```

## Integration Steps

### Step 1: Import the Component
```jsx
import DoctorSkeletonLoaders from '../components/DoctorSkeletonLoaders';
```

### Step 2: Add Loading State
```jsx
const [loading, setLoading] = useState(true);
```

### Step 3: Implement Conditional Rendering
```jsx
const MyDoctorPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await yourApiCall();
        setData(result);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <DoctorSkeletonLoaders.AppointmentsSkeleton />;
  }

  return (
    // Your actual page content
  );
};
```

## Best Practices

### 1. Loading Duration
- Show skeleton for at least 800ms to avoid flickering
- Maximum loading time should not exceed 5 seconds
- Consider adding a timeout for slow connections

### 2. Error Handling
```jsx
if (error) {
  return <ErrorMessage error={error} />;
}

if (loading) {
  return <DoctorSkeletonLoaders.AppointmentsSkeleton />;
}
```

### 3. Progressive Loading
For pages with multiple data sources, consider progressive loading:
```jsx
const [basicLoading, setBasicLoading] = useState(true);
const [detailedLoading, setDetailedLoading] = useState(true);

if (basicLoading) {
  return <DoctorSkeletonLoaders.BasicSkeleton />;
}

return (
  <div>
    {/* Basic content loaded */}
    {detailedLoading && <DoctorSkeletonLoaders.DetailedSkeleton />}
    {/* Detailed content */}
  </div>
);
```

### 4. Accessibility
Add ARIA labels for screen readers:
```jsx
<div role="status" aria-label="Loading appointments">
  <DoctorSkeletonLoaders.AppointmentsSkeleton />
</div>
```

## Customization

### Modifying Skeleton Colors
The skeleton loaders use Tailwind CSS classes. You can customize colors by modifying the gray shades:

```jsx
// Original: bg-gray-200
// Custom: bg-blue-100 (for medical theme)
<div className='h-4 w-32 bg-blue-100 rounded animate-pulse' />
```

### Adjusting Animation Speed
Modify the animation duration in your CSS:
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## Performance Considerations

### 1. Lazy Loading
For better performance, lazy load skeleton components:
```jsx
const DoctorSkeletonLoaders = React.lazy(() => import('./DoctorSkeletonLoaders'));

// Usage with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <DoctorSkeletonLoaders.AppointmentsSkeleton />
</Suspense>
```

### 2. Memoization
Memoize skeleton components to prevent unnecessary re-renders:
```jsx
const MemoizedAppointmentsSkeleton = React.memo(DoctorSkeletonLoaders.AppointmentsSkeleton);
```

## Testing

### Unit Testing
```jsx
import { render } from '@testing-library/react';
import DoctorSkeletonLoaders from './DoctorSkeletonLoaders';

test('renders appointments skeleton', () => {
  const { container } = render(<DoctorSkeletonLoaders.AppointmentsSkeleton />);
  expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
});
```

### Accessibility Testing
Ensure skeleton loaders are accessible:
```jsx
test('skeleton has proper ARIA attributes', () => {
  const { getByRole } = render(
    <div role="status" aria-label="Loading">
      <DoctorSkeletonLoaders.AppointmentsSkeleton />
    </div>
  );
  expect(getByRole('status')).toHaveAttribute('aria-label', 'Loading');
});
```

## Troubleshooting

### Common Issues

1. **Skeleton not showing**: Check if loading state is properly set to `true`
2. **Layout mismatch**: Ensure skeleton structure matches actual page layout
3. **Performance issues**: Consider reducing the number of skeleton elements
4. **Animation not working**: Verify Tailwind CSS animation classes are included

### Debug Tips
```jsx
// Add debug logging
useEffect(() => {
  console.log('Loading state:', loading);
}, [loading]);

// Add visual indicator during development
{loading && (
  <div className="fixed top-4 right-4 bg-red-500 text-white px-2 py-1 rounded">
    LOADING
  </div>
)}
```

## Migration Guide

### From Simple Loading Spinners
Replace existing loading spinners:
```jsx
// Before
{loading && <div className="spinner">Loading...</div>}

// After
{loading && <DoctorSkeletonLoaders.AppointmentsSkeleton />}
```

### From Generic Skeletons
Replace generic skeletons with page-specific ones:
```jsx
// Before
{loading && <GenericSkeleton />}

// After
{loading && <DoctorSkeletonLoaders.ProfileSkeleton />}
```

## Support

For issues or questions about the skeleton loaders:
1. Check this integration guide
2. Review the example implementations
3. Test with different data loading scenarios
4. Verify responsive behavior across devices

## Future Enhancements

Potential improvements to consider:
1. **Themed Skeletons**: Add medical-themed skeleton variations
2. **Dynamic Skeletons**: Skeletons that adapt to data structure
3. **Micro-interactions**: Subtle animations during loading
4. **Progress Indicators**: Show loading progress for long operations
5. **Offline Support**: Skeletons for offline/error states
