const { MongoClient } = require("mongodb");

class MongoAdapter {
  db;
  listHistory = [];
  credentials = { dbUri: null, dbName: null };
  constructor(_credentials) {
    this.credentials = _credentials;
  }

  init = async () => {
    try {
      const client = new MongoClient(this.credentials.dbUri, {});
      await client.connect();
      console.log("🆗 Conexión Correcta DB");
      const db = client.db(this.credentials.dbName);
      this.db = db;
      return true;
    } catch (e) {
      console.log("Error", e);
      return;
    }
  };

  getPrevByNumber = async (from) => {
    const result = await this.db
      .collection("history")
      .find({ from })
      .sort({ _id: -1 })
      .limit(1)
      .toArray();
    return result[0];
  };

  save = async (ctx) => {
    const ctxWithDate = {
      ...ctx,
      date: new Date(),
    };
    await this.db.collection("history").insertOne(ctxWithDate);

    this.listHistory.push(ctx);
  };

  createIntent = async (ctxIntents) => {
    await this.db.collection("intents").insertOne(ctxIntents);
  };

  updateIntent = async (phone, status) => {
    await this.db
      .collection("intents")
      .findOneAndUpdate(
        { phone },
        { $set: { status } },
        { sort: { dateAt: -1 }, returnOriginal: false }
      );
  };

  findIntent = async (phone) => {
    return await this.db
      .collection("intents")
      .findOne({ phone }, { sort: { dateAt: -1 } });
  };

  getAgents = async () => {
    return await this.db.collection("agents").find({}).toArray();
  };
}

module.exports = MongoAdapter;
