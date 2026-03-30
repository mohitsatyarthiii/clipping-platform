import mongoose from 'mongoose';
import User from '@/models/User';
import Campaign from '@/models/Campaign';
import Submission from '@/models/Submission';
import CampaignJoinRequest from '@/models/CampaignJoinRequest';
import Notification from '@/models/Notification';
import SourceContent from '@/models/SourceContent';

/**
 * Verify MongoDB connection and collections
 */
const verifyMongoDB = async () => {
  try {
    console.log('\n📊 MongoDB Verification Starting...\n');

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 5,
      });
      console.log('✓ Connected to MongoDB Atlas');
    } else {
      console.log('✓ Already connected to MongoDB Atlas');
    }

    // Get database info
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`✓ Database: ${db.databaseName}`);
    console.log(`✓ Collections found: ${collections.length}\n`);

    // Check each collection
    const models = [
      { name: 'Users', model: User },
      { name: 'Campaigns', model: Campaign },
      { name: 'Submissions', model: Submission },
      { name: 'Campaign Join Requests', model: CampaignJoinRequest },
      { name: 'Notifications', model: Notification },
      { name: 'Source Content', model: SourceContent },
    ];

    console.log('📋 Collection Statistics:');
    console.log('━'.repeat(60));

    for (const { name, model } of models) {
      try {
        const count = await model.countDocuments();
        const indexes = await model.collection.getIndexes();
        console.log(`\n${name}:`);
        console.log(`  • Documents: ${count}`);
        console.log(`  • Indexes: ${Object.keys(indexes).length}`);
      } catch (error) {
        console.log(`\n${name}: ⚠️ Not initialized yet`);
      }
    }

    console.log('\n' + '━'.repeat(60));
    console.log('\n✅ MongoDB Verification Complete!\n');
    console.log('Data will be stored in MongoDB Atlas at:');
    console.log(`📌 ${process.env.MONGODB_URI.split('@')[1]}\n`);

    // Get collection info for Browse Data
    console.log('🔍 Collections Ready for Browse Data in MongoDB Atlas Atlas UI:');
    console.log('  1. users');
    console.log('  2. campaigns');
    console.log('  3. submissions');
    console.log('  4. campaignJoinRequests');
    console.log('  5. notifications');
    console.log('  6. sourceContents\n');

    return true;
  } catch (error) {
    console.error('❌ MongoDB Verification Failed:', error.message);
    return false;
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
};

export default verifyMongoDB;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyMongoDB();
}
