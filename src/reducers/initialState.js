const initialState = {
  user: {
    
  },
  campaigns: {
    trendingCampaigns: [],
    featuredCampaigns: [],
    votedCampaigns: []
  }
}

const persistedState = {}
persistedState.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {}

export default {
  ...initialState,
  ...persistedState
}