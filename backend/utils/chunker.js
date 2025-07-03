// utils/chunker.js

/**
 * Converts a populated Yield record to a human-readable sentence for RAG
 * @param {Object} yieldRecord - A Yield document with populated animal_id
 * @returns {string} - Chunk text like: "On 2025-07-02, Radha (Tag: A100) produced 5 liters of milk at Satya Dairy."
 */
function chunkYieldRecord(yieldRecord) {
    if (!yieldRecord || !yieldRecord.animal_id) return '';
  
    const date = yieldRecord.date;
    const name = yieldRecord.animal_id.name || 'Unknown';
    const tag = yieldRecord.animal_id.tag_number || 'Unknown';
    const quantity = yieldRecord.quantity;
    const unit = yieldRecord.unit_type;
    const farmName = 'Satya Dairy'; // optional: replace with dynamic if needed
  
    // unit label
    const label = unit === 'milk'
      ? (quantity === 1 ? 'liter of milk' : 'liters of milk')
      : (quantity === 1 ? 'egg' : 'eggs');
  
    return `On ${date}, ${name} (Tag: ${tag}) produced ${quantity} ${label} at ${farmName}.`;
  }
  
  module.exports = { chunkYieldRecord };
  