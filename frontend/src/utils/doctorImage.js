// High-quality, professional doctor placeholder images by gender
export const DOCTOR_PLACEHOLDER_FEMALE = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face&auto=format&q=80'; // Professional female doctor

export const DOCTOR_PLACEHOLDER_MALE = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face&auto=format&q=80'; // Professional male doctor

const BACKEND_DEFAULT_PLACEHOLDER_PREFIX = 'data:image/svg+xml;base64,';

export const getDoctorPlaceholderByGender = (gender) => {
  const normalized = String(gender || '').trim().toLowerCase();

  if (!normalized) return DOCTOR_PLACEHOLDER_MALE;

  const isFemale = normalized === 'female' || normalized === 'f' || normalized.includes('woman') || normalized.includes('girl');
  return isFemale ? DOCTOR_PLACEHOLDER_FEMALE : DOCTOR_PLACEHOLDER_MALE;
};

export const getDoctorImageSrc = (doctor) => {
  const image = doctor?.image;
  if (image && String(image).trim()) {
    const normalizedImage = String(image).trim();
    if (!normalizedImage.startsWith(BACKEND_DEFAULT_PLACEHOLDER_PREFIX)) return normalizedImage;
  }

  const gender = doctor?.gender || doctor?.sex;
  return getDoctorPlaceholderByGender(gender);
};
