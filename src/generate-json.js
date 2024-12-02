const fs = require("fs");
const path = require("path");

// Define the directories for utilities and outputs
const UTILS_FOLDER = "utils";
const OUTPUTS_FOLDER = "outputs";

// Resolve the path to the input SQL file
const inputFile = path.resolve(__dirname, UTILS_FOLDER, "INSERTS.sql");
// Resolve the path to the output JSON file
const outputFile = path.resolve(__dirname, OUTPUTS_FOLDER, "dummy-inserts.json");

// Read the content of the .sql file
const sqlContent = fs.readFileSync(inputFile, "utf-8");

// Split the content by semicolons to obtain individual statements
const statements = sqlContent
  .split(";")
  .map((stmt) => stmt.trim())
  .filter((stmt) => stmt.length > 0);

const tables = {}; // Object to group inserts by table

// Regular expression to extract data from an INSERT statement
const insertRegex =
  /^INSERT\s+INTO\s+`?(\w+)`?\s*\(([^)]+)\)\s*VALUES\s*(.*)$/i;

// Iterate over each statement
statements.forEach((statement) => {
  const match = statement.match(insertRegex);
  if (match) {
    const table = match[1]; // Name of the table
    const columns = match[2]
      .replace(/\s+/g, " ")
      .trim()
      .split(","); // Split columns into an array
    let values = match[3].trim(); // Values

    // Replace "),(" with a placeholder to split tuples
    const cleanedValues = values
      .replace(/\)\s*,\s*\(/g, ")###(")
      .replace(/\n/g, " ")
      .split("###")
      .map((value) =>
        value.replace(/^\(|\)$/g, "").split(",").map((v) => v.trim())
      );

    // Initialize the table object if it doesn't exist
    if (!tables[table]) {
      tables[table] = { columns, registros: [] };
    }

    // Transform values into an array of objects
    cleanedValues.forEach((valueSet) => {
      const record = {};
      columns.forEach((column, index) => {
        record[column.trim()] = parseValue(valueSet[index]);
      });
      tables[table].registros.push(record);
    });
  }
});

const data = Object.entries(tables).map(([table, content]) => ({
  nombre_entidad: formatEntityName(table),
  tabla: table,
  total: content.registros.length,
  operacion: "INSERT",
  registros: content.registros,
}));

// Write the JSON content to the output file
fs.writeFileSync(outputFile, JSON.stringify({ data }, null, 2), "utf-8");
console.log(`JSON file written to ${outputFile}`);

// Helper function to format the table name as a title
function formatEntityName(tableName) {
  return tableName
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// Helper function to parse values to their appropriate type
function parseValue(value) {
  if (/^'.*'$/.test(value)) {
    // Remove quotes for string values
    return value.replace(/^'|'$/g, "");
  } else if (/^\d+$/.test(value)) {
    // Parse integers
    return parseInt(value, 10);
  } else if (/^\d+\.\d+$/.test(value)) {
    // Parse floats
    return parseFloat(value);
  } else if (/^null$/i.test(value)) {
    // Handle NULL values
    return null;
  }
  return value; // Fallback to the original value
}
