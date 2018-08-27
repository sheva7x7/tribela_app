import moment from 'moment'

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

export const calcTimeSince = date => {
  const now = moment()
  const creationTime = moment(date)
  const timeSince = now.diff(creationTime)
  if (moment.duration(timeSince)._milliseconds <= 0){
    return 'error'
  }
  if(moment.duration(timeSince).get('days') > 0){
    if (moment.duration(timeSince).get('days') === 1){
      return '1 day ago by'
    }
    return `${moment.duration(timeSince).get('days')} days ago by`
  }
  if(moment.duration(timeSince).get('hours') > 0){
    if (moment.duration(timeSince).get('hours') === 1){
      return '1 hour ago by'
    }
    return `${moment.duration(timeSince).get('hours')} hour ago by`
  }
  if(moment.duration(timeSince).get('minutes') > 0){
    if (moment.duration(timeSince).get('minutes') === 1){
      return '1 minute ago by'
    }
    return `${moment.duration(timeSince).get('minutes')} minutes ago by`
  }
  return `just now by`
}