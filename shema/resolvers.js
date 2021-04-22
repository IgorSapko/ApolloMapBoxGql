const fetch = require("node-fetch");

const fetchData = async (fromPlace, toPlace, idFromPlace, idToPlace) => {
  !idFromPlace && !idToPlace && fromPlace
    ? (place = "fromPlace")
    : (place = "toPlace");

  idFromPlace ? (place = "fromPlace") : idToPlace && (place = "toPlace");

  const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
  let firstID = null;
  let firstName = null;
  let returnedObj = {};
  for (let i = 0; i <= 1; i += 1) {
    (idFromPlace || idToPlace) &&
      ((i += 1), (firstID = idFromPlace || idToPlace));
    let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${
      i === 0 ? fromPlace || toPlace : firstID
    }.json?access_token=${ACCESS_TOKEN}`;
    try {
      const result = await fetch(url);
      const { features } = await result.json();
      i === 0
        ? ((firstID = features[0].id),
          (returnedObj = {
            [place]: { id: `urn::mapbox:${firstID}` },
          }))
        : ((firstName = features[0].text),
          (returnedObj = {
            ...returnedObj,
            [place]: { name: firstName, id: `urn::mapbox:${firstID}` },
          }));
    } catch (error) {
      console.log(error);
      alert(error);
    }
  }
  return returnedObj;
};

const createTrip = async ({ fromPlaceName, toPlaceName }, context) => {
  const fromPlaceObj = await fetchData(fromPlaceName);
  const toPlaceObj = await fetchData(null, toPlaceName);
  const shortId = (id) => id.split("urn::mapbox:")[1];
  const totalObj = {
    fromPlace: { id: shortId(fromPlaceObj.fromPlace.id) },
    toPlace: { id: shortId(toPlaceObj.toPlace.id) },
  };
  let returnedObj = {};
  try {
    await context.db.insertOne({ ...totalObj });
    const data = await context.db.find().toArray();
    const foundObj = data.find(
      (elem) =>
        elem.fromPlace.id === shortId(fromPlaceObj.fromPlace.id) &&
        elem.toPlace.id === shortId(toPlaceObj.toPlace.id)
    );
    returnedObj = {
      id: `urn::trip:${foundObj._id}`,
      fromPlace: { ...fromPlaceObj.fromPlace },
      toPlace: { ...toPlaceObj.toPlace },
    };
  } catch (error) {
    console.log(error);
  }
  return returnedObj;
};

module.exports = {
  Query: {
    async trips(_, { offset, limit }, _context) {
      try {
        const data = await _context.db
          .find()
          .skip(offset)
          .limit(limit)
          .toArray();
        let results = [];
        for (let i = 0; i < data.length; i += 1) {
          const fromPlaceObj = await fetchData(
            null,
            null,
            data[i].fromPlace.id,
            null
          );
          const toPlaceObj = await fetchData(
            null,
            null,
            null,
            data[i].toPlace.id
          );
          results.push({
            fromPlace: { name: fromPlaceObj.fromPlace.name },
            toPlace: { name: toPlaceObj.toPlace.name },
            id: data[i]._id,
          });
        }
        return results;
      } catch (error) {
        console.log(error);
      }
    },
  },
  Mutation: {
    createTrip: async (_, { input }, context) => {
      return createTrip(input, context);
    },
  },
};
