import mongoose, { Connection, Mongoose } from 'mongoose';

class MongoDBConnection {
  private static instance: MongoDBConnection;
  private mongooseInstance: Mongoose;
  private connection: Connection | null;

  private constructor() {
    this.mongooseInstance = mongoose;
    this.connection = null;
  }

  public static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection();
    }
    return MongoDBConnection.instance;
  }

  public async connect(): Promise<Connection> {
    if (this.connection === null) {
        try {
            await this.mongooseInstance.connect('mongodb+srv://test123:test123@cluster0.xrtpbue.mongodb.net/order-demo?retryWrites=true&w=majority');
            this.connection = this.mongooseInstance.connection;
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }
    return this.connection;
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.close();
        console.log('Disconnected from MongoDB');
        this.connection = null;
      } else {
        console.warn('No active connection to disconnect.');
      }
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }
}

export const db = {
  connect: async (): Promise<Connection> => {
    return await MongoDBConnection.getInstance().connect();
  },
  disconnect: async (): Promise<void> => {
    await MongoDBConnection.getInstance().disconnect();
  },
};

export const createSchemaFromType = function (type: any) {

}

