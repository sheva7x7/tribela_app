export const quantityFormat = num => {
  if (num < 1000) return num
  if (num < 1000000) return `${Math.floor(num / 1000)}K`
  if (num < 1000000000) return `${Math.floor(num / 1000000)}M`
  return `${Math.floor(num / 1000000000)}B`
}

export const thousandSeparator = num => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const validateEmail = mail => {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(mail)){
    return true
  }
  return false
}

export const validatePassword = password => {
  if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/.test(password)) {
    return true
  }
  return false
}