// scheduler/expirePosts.js
const cron = require('node-cron');
const Post = require('../models/Post');

// Determine cron schedule based on environment
const cronSchedule = process.env.TEST_MODE === 'EXPIRATION' ? '*/1 * * * * *' : '* * * * *';

cron.schedule(cronSchedule, async () => {
  try {
    const now = new Date();
    const result = await Post.updateMany(
      { expiration_time: { $lte: now }, status: 'Live' },
      { status: 'Expired' }
    );
    if (result.nModified > 0) {
      console.log(`Cron Job: Updated ${result.nModified} posts to 'Expired' status.`);
    }
  } catch (err) {
    console.error('Cron Job Error: Error updating expired posts:', err);
  }
});

