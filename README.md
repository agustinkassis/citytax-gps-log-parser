# citytax-gps-log-parser
Parser for GPS log data

## Usage

```js
const parser = require('./parser');
const filePath = './data/full.log';

parser.getRawData(filePath)
  .then(parser.parseRawData)
  // Filter location data only
  .then(data => data.filter(a =>  a.type === 'location'))
  .then(data => {
    console.info('Total gps points : ' + data.length);
    return parser.groupIds(data);
  })
  /*
  {
    date: 2017-05-23T03:00:19.000Z,
    ip: '171.117.138.208',
    type: 'location',
    data:
     {
      lat: -34.60429,
      lng: -58.40219,
      id: 9999,
      index: '2920',
      unknown: '*21<'
     }
   }
   */
  .then(index => {
    console.info('Total ids : ' + Object.keys(index).length);
  })
  .catch(err => {
    console.error(err);
  });
```
