const fs = require('fs'),
      Promise = require('bluebird').Promise,
      async = require('async');


function getRawData (filePath, cb) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
}

function parseRawData (data) {
  data = data.split("\n");
  // TEMP
  //data = data.slice(0, 100);
  // 11105 Conflicto!

  return new Promise((resolve, reject) => {
    async.map(data, (a, cb) => {
      cb(null, parseLine(a));
    }, (err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res.filter(a => a !== null));
    });
  });
}

function parseLine (line) {
  if (line.length < 38) {
    return null;
  }
  line = line.split(' ');
  let payload = parsePayload(line.pop());
  let data = {
    date: parseDate(line[0]),
    ip: line[2] === '-' ? line[3] : line[2],
    type: payload.type,
    data: payload.data,
  }
  return data;
}

function parseDate(str) {
  let time = '';
  if (str.length === 19) {
    str = str.split('-');
    time = ' ' + str.pop();
    str = str[0];
  }
  return new Date(str.split('/').reverse().join('/') + time)
}

function parsePayload(str) {
  let type = 'unknown';
  if (str.indexOf('>RGP') === 0) { // GPS Type
    type = 'location';
    data = parseGPSPayload(str);
  } else { // Unkown type
    data = str;
  }
  return {
    type: type,
    data: data
  }
}

function parseGPSPayload(str) {
  str = str.split(';');
  return {
    lat: parseInt(str[0].slice(16, 24))/100000,
    lng: parseInt(str[0].slice(24, 33))/100000,
    id: parseInt(str[1].split('=').pop()),
    index: str[2].split('#').pop(),
    unknown: str[3].slice(0, -1)
  };
}

function groupIds(data) {
  let indexes = {};
  return new Promise((resolve, reject) => {
    async.each(data, (point, cb) => {
      if (indexes[point.data.id] === undefined) {
        indexes[point.data.id] = [];
      }
      indexes[point.data.id].push(point);
      cb();
    }, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(indexes);
    })
  });
}

module.exports = {
  getRawData: getRawData,
  parseRawData: parseRawData,
  parseLine: parseLine,
  groupIds: groupIds,
}
