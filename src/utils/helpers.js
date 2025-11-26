export const calculateEligibility = (lastDonationDate) => {
  const lastDonation = new Date(lastDonationDate)
  const today = new Date()
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(today.getMonth() - 3)

  if (lastDonation > threeMonthsAgo) {
    const nextEligibleDate = new Date(lastDonation)
    nextEligibleDate.setMonth(lastDonation.getMonth() + 3)
    const daysLeft = Math.ceil((nextEligibleDate - today) / (1000 * 60 * 60 * 24))
    return {
      eligible: false,
      message: `তিনি এখনো ${daysLeft} দিন অপেক্ষা করতে হবে`,
      daysLeft
    }
  }

  return {
    eligible: true,
    message: 'তিনি এখন রক্ত দিতে পারবেন',
    daysLeft: 0
  }
}

export const formatPhoneNumber = (phone) => {
  return phone.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3')
}

export const districts = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Khulna', 'Rajshahi', 
  'Barisal', 'Rangpur', 'Mymensingh'
]

export const bloodTypes = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
]