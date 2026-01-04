
export const LIMITS = {
  chat: 50,
  images: 5,
  videos: 1,
};

export const getUsage = () => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem('vedviarn_usage');
  if (stored) {
    const data = JSON.parse(stored);
    if (data.date === today) {
      return data.counts;
    }
  }
  return { chat: 0, images: 0, videos: 0 };
};

export const getUserPlan = () => {
  const stored = localStorage.getItem('vedviarn_user');
  if (stored) {
    const user = JSON.parse(stored);
    return user.plan || 'free';
  }
  return 'free';
};

export const incrementUsage = (type: keyof typeof LIMITS) => {
  const today = new Date().toDateString();
  const usage = getUsage();
  usage[type] += 1;
  localStorage.setItem('vedviarn_usage', JSON.stringify({
    date: today,
    counts: usage
  }));
  // Dispatch a custom event to notify components of usage changes
  window.dispatchEvent(new Event('usageUpdated'));
};

export const isLimitReached = (type: keyof typeof LIMITS) => {
  const plan = getUserPlan();
  if (plan === 'pro' || plan === 'enterprise') return false;
  
  const usage = getUsage();
  return usage[type] >= LIMITS[type];
};
