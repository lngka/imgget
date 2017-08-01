module.exports.saveHistory = saveSearchHistory;
module.exports.loadHistory = loadSearchHistory;

// requirements
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

// CONSTANTS
const dbURI = process.env.dbURI;
const dbCollection = process.env.dbCollection;
const NUM_TO_LOAD = 10;

/*
* save user's query into DB with time stamp
* @param searchTerm: String
*/
function saveSearchHistory(searchTerm) {
  // connect to DB
  MongoClient.connect(dbURI, function(err, db) {
    if (err) throw err;
    
    // specify which collection (it's like a table in SQL)
    var collection = db.collection(dbCollection);
    
    // build new entry
    var newEntry = {
      "searchTerm": searchTerm,
      "timeStamp": new Date().toString()
    }
    
    // actually saving
    collection.insertOne(newEntry, function(err, result) {
      if (err) console.log(err);
    });
  });
}

/*
* load the latest 10 history entries
* @return history: JSON
*/
function loadSearchHistory(callback) {
  // connect to DB
  MongoClient.connect(dbURI, function(err, db) {
    if (err) {
      console.log(err);
      callback(err, null);
      return;
    }
    var collection = db.collection("searchHistory");
    var findOptions = {
      "limit": NUM_TO_LOAD,
      "sort": {"_id": -1}
    }
    
    collection.find({}, findOptions).toArray(function(err,data) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else {
        callback(null, data);
      }
    });
    
  })
}

