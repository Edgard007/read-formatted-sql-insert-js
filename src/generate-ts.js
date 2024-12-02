const fs = require("fs");
const path = require("path");

// Define the directories for utilities and outputs
const UTILS_FOLDER = "utils";
const OUTPUTS_FOLDER = "outputs";

// Resolve the path to the input SQL file
const inputFile = path.resolve(__dirname, UTILS_FOLDER, "INSERTS.sql");
// Resolve the path to the output TypeScript file
const outputFile = path.resolve(__dirname, OUTPUTS_FOLDER, "dummy-inserts.ts");

// Read the content of the .sql file
const sqlContent = fs.readFileSync(inputFile, "utf-8");

// Split the content by semicolons to obtain individual statements
const statements = sqlContent
  .split(";")
  .map((stmt) => stmt.trim())
  .filter((stmt) => stmt.length > 0);

const tables = {}; // Object to group inserts by table
const insertNames = []; // Array to store the names of the constants

// Regular expression to extract data from an INSERT statement
const insertRegex =
  /^INSERT\s+INTO\s+`?(\w+)`?\s*\(([^)]+)\)\s*VALUES\s*(.*)$/i;

// Iterate over each statement
statements.forEach((statement) => {
  const match = statement.match(insertRegex);
  if (match) {
    const table = match[1]; // Name of the table
    const columns = match[2].replace(/\s+/g, " ").trim(); // Columns, cleaned up spaces
    let values = match[3].trim(); // Values

    // Initialize the table object if it doesn't exist
    if (!tables[table]) {
      tables[table] = { columns, values: [] };
    }

    // Replace "),(" with "),\n         (" to format the values
    const cleanedValues = values
      .replace(/\)\s*,\s*\(/g, "),\n         (") // Handle multiple tuples
      .replace(/\n/g, " "); // Remove newlines within the values

    tables[table].values.push(cleanedValues); // Add values to the corresponding table
  }
});

let outputContent = ""; // Content to write to the output file

// Iterate over each grouped table
for (const [table, data] of Object.entries(tables)) {
  const varName = `INSERT_${table.toUpperCase()}`; // Create a constant name in uppercase
  insertNames.push(varName); // Add the constant name to the array
  const values = data.values.join(",\n         "); // Join the values with newlines
  // Create the insertion string in the desired format
  outputContent += `export const ${varName} = \`\n  INSERT INTO ${table} (${data.columns}) VALUES\n         ${values}\n\`;\n\n`;
}

// Create the array that contains all the insert constants
outputContent += `// Export all inserts as a single array\nexport const INSERTS = [\n    ${insertNames.join(
  ",\n    "
)}\n];\n`;

// Write the generated content to the output file
fs.writeFileSync(outputFile, outputContent, "utf-8");
console.log(`Extracted inserts written to ${outputFile}`); // Confirmation message
