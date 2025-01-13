import { Client, Storage, ID } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6784703b0004f006b43f')
    .setKey('standard_712ce1f72b6bb727fc58d1da217c269f2c910328778d30813700a66e759501f02c6edd7da87e6ad986b97886d4cda6cee15756cf50407adb1eafe16262297ff49a786e5448242c96d8b8ce0ee2b8476ba26ab8366daff49b40b7a71a9319c1624e653a7bfcdd6634e6df4291c246295b86f466a4b34eeefe936c8d17032f3e25'); // Add a client API key with storage permissions

const storage = new Storage(client);

export { client, storage, ID };
