export const formatAge = (birthDate) => {
  const birth = new Date(birthDate)
  const now = new Date()

  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()

  if (months < 0) {
    years--
    months += 12
  }

  return years > 0 ? `${years}y ${months}mo` : `${months}mo`
}
