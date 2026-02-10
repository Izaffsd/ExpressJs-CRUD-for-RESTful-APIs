export const validMyKadNumber = (icNumber) => {
  // must be 12 digits
  if (!/^\d{12}$/.test(icNumber)) return false;

  const yy = icNumber.substring(0, 2);
  const mm = icNumber.substring(2, 4);
  const dd = icNumber.substring(4, 6);

  const month = parseInt(mm, 10);
  const day = parseInt(dd, 10);

  // validate month 01-12
  if (month < 1 || month > 12) return false;

  // validate day 01-31
  if (day < 1 || day > 31) return false;

  return true;
};


export const validEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const validId = (id) => {
  const num = Number(id)
  return Number.isInteger(num) && num > 0
}

export const validCourseCode = (code) => {
  return typeof code === 'string' && /^[A-Z]{2,4}$/.test(code)
}

export const validStudentNumber = (student_number) => {
  if (typeof student_number !== 'string') return false

  // 2–4 chars + 4 digits
  const regex = /^[A-Z]{2,4}[0-9]{4}$/

  return regex.test(student_number)
}
