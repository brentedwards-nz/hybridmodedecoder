const protobuf = require("protobufjs");
const path = require("path");

// Parse hex string to byte array
function parseHexString(hexStr) {
  return hexStr
    .trim()
    .split(/\s+/)
    .map(h => parseInt(h, 16));
}

// Convert number array to hex string array
function toHexArray(arr) {
  return arr.map(b => "0x" + b.toString(16).padStart(2, "0").toUpperCase());
}

// Strip SysEx (F0 .. F7) and header
function extractPayload(hexArray) {
  if (hexArray[0] !== 0xF0 || hexArray[hexArray.length - 1] !== 0xF7) {
    throw new Error("Missing SysEx start or end bytes (F0...F7)");
  }
  return hexArray.slice(6, hexArray.length - 1); // skip header + F0
}

// Decode 7-bit MIDI encoding
function decode7bit(data) {
  const out = [];
  let buffer = 0;
  let bits = 0;
  for (let byte of data) {
    buffer |= (byte & 0x7F) << bits;
    bits += 7;
    while (bits >= 8) {
      out.push(buffer & 0xFF);
      buffer >>= 8;
      bits -= 8;
    }
  }
  if (bits > 0 && buffer !== 0) {
    out.push(buffer);
  }
  return Buffer.from(out);
}

async function main() {
  const input = process.argv[2];
  if (!input) {
    console.error("Usage: node decode.js \"F0 70 00 00 01 00 ... F7\"");
    process.exit(1);
  }

  try {
    const hexArray = parseHexString(input);
    // console.log("Hex Array:           ", toHexArray(hexArray));
    const encodedPayload = extractPayload(hexArray);
    // console.log("Encoded Payload:     ", toHexArray(encodedPayload));
    const decodedBytes = decode7bit(encodedPayload);
    // console.log("Decoded Bytes:       ", toHexArray([...decodedBytes]));

    const protoPath = path.join(__dirname, "hybrid_mode.proto");
    const root = await protobuf.load(protoPath);
    const HybridModeMessage = root.lookupType("remotehostscreen.v1.HybridModeMessage");
    const msg = HybridModeMessage.decode(decodedBytes);
    const obj = HybridModeMessage.toObject(msg, { defaults: true });

    console.log("\n----------------------------------------------------------------");
    console.log("Input:");
    console.log(" - ", input, "\n");
    console.log("Message:");
    console.log(JSON.stringify(obj, null, 2));

    // Detect which message is present in oneof `data`
    const dataField = msg.$type.oneofs.data.oneof.find(f => msg[f] != null);
    if (!dataField) {
      console.log("\nMessage Type: UNKNOWN (no oneof field present)");
      return;
    }

    console.log("\nMessage Type:");
    console.log(" - ", dataField);
    const payload = msg[dataField];
    const messageType = HybridModeMessage.fields[dataField].resolvedType;
    const objPayload = obj[dataField];  // object with defaults

    console.log("Message Fields:");
    for (const key of Object.keys(messageType.fields)) {
      let value = payload ? payload[key] : undefined;
      if (value === undefined) {
        // Use default value from obj (which includes defaults)
        value = objPayload ? objPayload[key] : undefined;
      }

      const field = messageType.fields[key];
      if (field.resolvedType && field.resolvedType.valuesById && typeof value === "number") {
        const enumName = field.resolvedType.valuesById[value];
        console.log(" - ", `${key}: ${enumName} (${value})`);
      } else {
        console.log(" - ", `${key}: ${value}`);
      }
    }

    console.log('\n')
  } catch (err) {
    console.error("Error decoding message:", err.message);
  }
}

main();
