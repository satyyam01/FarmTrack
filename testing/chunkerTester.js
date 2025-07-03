const { chunkYieldRecord } = require('../backend/utils/chunker');

const fakeYield = {
  date: '2025-06-25',
  quantity: 5,
  unit_type: 'milk',
  animal_id: {
    name: 'Radha',
    tag_number: 'A100',
  }
};

console.log(chunkYieldRecord(fakeYield));
// Output: On 2025-07-02, Radha (Tag: A100) produced 5 liters of milk at Satya Dairy.
